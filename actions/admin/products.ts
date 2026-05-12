"use server";

import { revalidateTag } from "next/cache";

import { CACHE_TAGS, PRODUCT_MEDIA_BUCKET } from "@/lib/constants";
import { requireAdminProfile } from "@/lib/auth/profile";
import { getSupabaseAdminClient } from "@/lib/db/admin";
import { uploadProductImage } from "@/lib/storage/product-media";
import { productUpsertSchema } from "@/lib/validators/product";
import { fail, getErrorMessage, ok, type ActionResult } from "@/lib/utils";

function parsePayload(formData: FormData) {
  const raw = formData.get("payload");
  if (typeof raw !== "string") throw new Error("Product payload is missing.");
  return productUpsertSchema.parse(JSON.parse(raw));
}

function fileFromForm(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function validateVariants(input: ReturnType<typeof parsePayload>) {
  const skuSet = new Set<string>();
  const optionSet = new Set<string>();

  for (const variant of input.variants) {
    const normalizedSku = variant.sku.trim().toLowerCase();
    const optionKey = `${variant.color.trim().toLowerCase()}::${variant.size.trim().toLowerCase()}`;

    if (skuSet.has(normalizedSku)) {
      throw new Error(`Variant SKU "${variant.sku}" is duplicated in this product.`);
    }
    if (optionSet.has(optionKey)) {
      throw new Error(`Variant combination "${variant.color} / ${variant.size}" is duplicated in this product.`);
    }

    skuSet.add(normalizedSku);
    optionSet.add(optionKey);
  }
}

export async function upsertProductAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  let createdProductId: string | null = null;
  let createdMainImageStoragePath: string | null = null;
  const createdGalleryStoragePaths: string[] = [];
  const createdVariantStoragePaths: string[] = [];

  try {
    const admin = await requireAdminProfile();
    const input = parsePayload(formData);
    validateVariants(input);
    const supabase = getSupabaseAdminClient();

    const [{ data: slugConflict, error: slugError }, { data: skuConflict, error: skuError }] = await Promise.all([
      supabase.from("products").select("id").eq("slug", input.slug).maybeSingle(),
      supabase.from("products").select("id").eq("base_sku", input.base_sku).maybeSingle()
    ]);

    if (slugError) throw slugError;
    if (skuError) throw skuError;
    if (slugConflict && slugConflict.id !== input.id) return fail("A product with this slug already exists.");
    if (skuConflict && skuConflict.id !== input.id) return fail("A product with this base SKU already exists.");

    const mainImage = await uploadProductImage(fileFromForm(formData, "main_image"), input.slug);
    createdMainImageStoragePath = mainImage?.storagePath ?? null;
    const productPayload: Record<string, unknown> = {
      category_id: input.category_id,
      name: input.name,
      slug: input.slug,
      short_description: input.short_description,
      description_markdown: input.description_markdown,
      base_sku: input.base_sku,
      brand: input.brand,
      tags: input.tags,
      status: input.status,
      is_featured: input.is_featured,
      is_new_arrival: input.is_new_arrival,
      base_price: input.base_price,
      compare_at_price: input.compare_at_price,
      cost_price: input.cost_price,
      seo_title: input.seo_title,
      seo_description: input.seo_description,
      custom_attributes: input.custom_attributes
    };
    if (mainImage) productPayload.main_image_url = mainImage.publicUrl;

    const productMutation = input.id
      ? supabase
          .from("products")
          .update(productPayload)
          .eq("id", input.id)
          .select("id")
          .single()
      : supabase.from("products").insert(productPayload).select("id").single();

    const { data: productRow, error: productError } = await productMutation;
    if (productError) throw productError;
    const productId = productRow.id as string;
    if (!input.id) createdProductId = productId;

    if (mainImage) {
      await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
      const { error } = await supabase.from("product_images").insert({
        product_id: productId,
        image_url: mainImage.publicUrl,
        storage_path: mainImage.storagePath,
        alt_text: input.name,
        is_primary: true,
        sort_order: 0
      });
      if (error) throw error;
    }

    const galleryFiles = formData.getAll("gallery_images").filter((value): value is File => value instanceof File && value.size > 0);
    for (let index = 0; index < galleryFiles.length; index += 1) {
      const uploaded = await uploadProductImage(galleryFiles[index] ?? null, input.slug);
      if (uploaded) {
        createdGalleryStoragePaths.push(uploaded.storagePath);
        const { error } = await supabase.from("product_images").insert({
          product_id: productId,
          image_url: uploaded.publicUrl,
          storage_path: uploaded.storagePath,
          alt_text: `${input.name} gallery ${index + 1}`,
          is_primary: false,
          sort_order: index + 1
        });
        if (error) throw error;
      }
    }

    const existingIds = input.variants.map((variant) => variant.id).filter((id): id is string => Boolean(id));
    if (input.id) {
      const { error } = await supabase
        .from("product_variants")
        .update({ is_active: false })
        .eq("product_id", productId)
        .not("id", "in", `(${existingIds.join(",") || "00000000-0000-0000-0000-000000000000"})`);
      if (error) throw error;
    }

    for (let index = 0; index < input.variants.length; index += 1) {
      const variant = input.variants[index];
      const uploadedVariantImage = await uploadProductImage(fileFromForm(formData, `variant_image_${index}`), input.slug);
      if (uploadedVariantImage) {
        createdVariantStoragePaths.push(uploadedVariantImage.storagePath);
      }
      const payload = {
        product_id: productId,
        sku: variant.sku,
        color: variant.color,
        size: variant.size,
        price: variant.price,
        compare_at_price: variant.compare_at_price,
        stock_quantity: variant.stock_quantity,
        low_stock_threshold: variant.low_stock_threshold,
        image_url: uploadedVariantImage?.publicUrl ?? variant.image_url,
        is_active: variant.is_active,
        sort_order: variant.sort_order
      };

      const { error } = variant.id
        ? await supabase.from("product_variants").update(payload).eq("id", variant.id).eq("product_id", productId)
        : await supabase.from("product_variants").insert(payload);
      if (error) throw error;
    }

    const { error: auditError } = await supabase.from("admin_audit_logs").insert({
      actor_clerk_user_id: admin.clerk_user_id,
      action: input.id ? "product.updated" : "product.created",
      entity_type: "product",
      entity_id: productId,
      payload: { slug: input.slug }
    });
    if (auditError) {
      console.warn("[veloure] Failed to write product audit log.", auditError);
    }

    revalidateTag(CACHE_TAGS.products);
    revalidateTag(CACHE_TAGS.catalog);
    revalidateTag(CACHE_TAGS.inventory);

    const successMessage = input.id
      ? input.status === "draft"
        ? "Product updated and kept as draft."
        : "Product updated."
      : input.status === "draft"
        ? "Product created as draft. Publish it to show it on the storefront."
        : "Product created.";

    return ok({ id: productId }, successMessage);
  } catch (error) {
    const supabase = getSupabaseAdminClient();

    if (createdProductId) {
      const { error: cleanupError } = await supabase.from("products").delete().eq("id", createdProductId);
      if (cleanupError) {
        console.warn("[veloure] Failed to clean up partially created product.", cleanupError);
      }
    }

    const storagePaths = [createdMainImageStoragePath, ...createdGalleryStoragePaths, ...createdVariantStoragePaths].filter(
      (path): path is string => Boolean(path)
    );
    if (storagePaths.length) {
      const { error: storageCleanupError } = await supabase.storage.from(PRODUCT_MEDIA_BUCKET).remove(storagePaths);
      if (storageCleanupError) {
        console.warn("[veloure] Failed to clean up uploaded product media.", storageCleanupError);
      }
    }

    return fail(getErrorMessage(error));
  }
}

export async function archiveProductAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const admin = await requireAdminProfile();
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("products")
      .update({ status: "archived", archived_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    await supabase.from("admin_audit_logs").insert({
      actor_clerk_user_id: admin.clerk_user_id,
      action: "product.archived",
      entity_type: "product",
      entity_id: id
    });
    revalidateTag(CACHE_TAGS.products);
    revalidateTag(CACHE_TAGS.catalog);
    return ok({ id }, "Product archived.");
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}
