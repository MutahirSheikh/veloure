"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { Plus, Trash2, UploadCloud, Wand2 } from "lucide-react";

import { upsertProductAction } from "@/actions/admin/products";
import { MarkdownPreview } from "@/components/common/markdown-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { Category, ProductWithRelations } from "@/lib/db/types";
import { ensureSlug } from "@/lib/slug";
import { withToastQuery } from "@/lib/toast-query";
import { productUpsertSchema, type ProductUpsertInput } from "@/lib/validators/product";

function defaults(product?: ProductWithRelations | null): ProductUpsertInput {
  return {
    id: product?.id,
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    short_description: product?.short_description ?? "",
    description_markdown: product?.description_markdown ?? "### Details\n\nDescribe the material, fit, styling notes, and care guidance.",
    base_sku: product?.base_sku ?? "",
    brand: product?.brand ?? "Veloure",
    tags: product?.tags ?? [],
    category_id: product?.category_id ?? "",
    status: product?.status ?? "draft",
    is_featured: product?.is_featured ?? false,
    is_new_arrival: product?.is_new_arrival ?? false,
    base_price: product?.base_price ?? 0,
    compare_at_price: product?.compare_at_price ?? null,
    cost_price: product?.cost_price ?? null,
    seo_title: product?.seo_title ?? "",
    seo_description: product?.seo_description ?? "",
    custom_attributes:
      product?.custom_attributes && typeof product.custom_attributes === "object" && !Array.isArray(product.custom_attributes)
        ? product.custom_attributes
        : {},
    variants:
      product?.variants.length
        ? product.variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            color: variant.color,
            size: variant.size,
            price: variant.price,
            compare_at_price: variant.compare_at_price,
            stock_quantity: variant.stock_quantity,
            low_stock_threshold: variant.low_stock_threshold,
            image_url: variant.image_url,
            is_active: variant.is_active,
            sort_order: variant.sort_order
          }))
        : [
            {
              sku: "",
              color: "Natural",
              size: "One Size",
              price: null,
              compare_at_price: null,
              stock_quantity: 0,
              low_stock_threshold: 5,
              image_url: null,
              is_active: true,
              sort_order: 0
            }
          ]
  };
}

export function ProductForm({ categories, product }: { categories: Category[]; product?: ProductWithRelations | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [tagsText, setTagsText] = React.useState((product?.tags ?? []).join(", "));
  const [customAttributesText, setCustomAttributesText] = React.useState(JSON.stringify(defaults(product).custom_attributes, null, 2));
  const [colorsText, setColorsText] = React.useState("Natural, Black");
  const [sizesText, setSizesText] = React.useState("S, M, L");
  const [mainPreviewUrl, setMainPreviewUrl] = React.useState<string | null>(null);
  const [galleryPreviewUrls, setGalleryPreviewUrls] = React.useState<string[]>([]);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = React.useState<string | null>(null);
  const form = useForm<ProductUpsertInput>({
    resolver: zodResolver(productUpsertSchema) as unknown as Resolver<ProductUpsertInput>,
    defaultValues: defaults(product)
  });
  const variants = useFieldArray({
    control: form.control,
    name: "variants",
    keyName: "fieldId"
  });
  const description = form.watch("description_markdown");
  const name = form.watch("name");
  const basePrice = form.watch("base_price");
  const compareAtPrice = form.watch("compare_at_price");
  const categoryId = form.watch("category_id");
  const watchedVariants = form.watch("variants");
  const selectedCategory = categories.find((category) => category.id === categoryId);
  const existingGalleryUrls = product?.images?.map((image) => image.image_url).filter(Boolean) ?? [];
  const previewSrc = selectedPreviewUrl || mainPreviewUrl || product?.main_image_url || existingGalleryUrls[0] || "/images/1.png";
  const displayedGalleryUrls = galleryPreviewUrls.length ? galleryPreviewUrls : existingGalleryUrls;
  const displaySizes = uniqueValues(watchedVariants.map((variant) => variant.size)).slice(0, 6);
  const displayColors = uniqueValues(watchedVariants.map((variant) => variant.color)).slice(0, 8);
  const discountPercent =
    Number(compareAtPrice) > Number(basePrice) && Number(compareAtPrice) > 0
      ? Math.round(((Number(compareAtPrice) - Number(basePrice)) / Number(compareAtPrice)) * 100)
      : null;

  React.useEffect(() => {
    return () => {
      if (mainPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(mainPreviewUrl);
    };
  }, [mainPreviewUrl]);

  React.useEffect(() => {
    return () => {
      galleryPreviewUrls.filter((url) => url.startsWith("blob:")).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [galleryPreviewUrls]);

  function handleMainImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedPreviewUrl(null);
    setMainPreviewUrl((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  function handleGalleryImagesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setSelectedPreviewUrl(null);
    setGalleryPreviewUrls((current) => {
      current.filter((url) => url.startsWith("blob:")).forEach((url) => URL.revokeObjectURL(url));
      return files.map((file) => URL.createObjectURL(file));
    });
  }

  function generateSlug() {
    form.setValue("slug", ensureSlug(name || "veloure-product"), { shouldValidate: true });
  }

  function generateVariantMatrix() {
    const colors = colorsText.split(",").map((item) => item.trim()).filter(Boolean);
    const sizes = sizesText.split(",").map((item) => item.trim()).filter(Boolean);
    const baseSku = form.getValues("base_sku") || ensureSlug(name || "VEL");
    const rows = colors.flatMap((color, colorIndex) =>
      sizes.map((size, sizeIndex) => ({
        sku: `${baseSku}-${ensureSlug(color).toUpperCase()}-${ensureSlug(size).toUpperCase()}`,
        color,
        size,
        price: null,
        compare_at_price: null,
        stock_quantity: 0,
        low_stock_threshold: 5,
        image_url: null,
        is_active: true,
        sort_order: colorIndex * sizes.length + sizeIndex
      }))
    );
    variants.replace(rows);
  }

  function onSubmit(values: ProductUpsertInput) {
    let attributes: Record<string, unknown>;
    try {
      attributes = JSON.parse(customAttributesText || "{}") as Record<string, unknown>;
    } catch {
      toast({ title: "Invalid attributes", description: "Custom attributes must be valid JSON.", variant: "destructive" });
      return;
    }

    const payload: ProductUpsertInput = {
      ...values,
      tags: tagsText.split(",").map((tag) => tag.trim()).filter(Boolean),
      custom_attributes: attributes
    };

    const formData = new FormData(formRef.current ?? undefined);
    formData.set("payload", JSON.stringify(payload));

    startTransition(async () => {
      const result = await upsertProductAction(formData);
      if (result.ok) {
        router.push(
          withToastQuery("/admin/products", {
            title: "Product saved",
            description: result.message ?? "Your product was saved successfully."
          })
        );
        return;
      }

      toast({
        title: "Product failed",
        description: result.error,
        variant: "destructive"
      });
    });
  }

  return (
    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="grid min-w-0 gap-7 2xl:grid-cols-[minmax(280px,390px)_minmax(0,1fr)]">
      <aside className="admin-card h-fit min-w-0 p-5 sm:p-7 2xl:sticky 2xl:top-[110px]">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-[#eef3f8]">
          <Image
            src={previewSrc}
            alt={name || "Product preview"}
            fill
            className="object-contain p-8"
            unoptimized={previewSrc.startsWith("blob:")}
            sizes="390px"
          />
        </div>
        <h2 className="mt-7 text-lg font-bold text-[#142044]">
          {name || "Men Black Slim Fit T-shirt"} <span className="text-sm font-medium text-[#53627d]">({selectedCategory?.name ?? "Fashion"})</span>
        </h2>
        <p className="mt-6 font-bold">Price :</p>
        <div className="mt-2 flex items-center gap-3">
          {Number(compareAtPrice) > 0 ? <span className="text-lg text-[#53627d] line-through">${Number(compareAtPrice).toFixed(0)}</span> : null}
          <span className="text-xl font-bold">${Number(basePrice || 0).toFixed(0)}</span>
          {discountPercent ? <span className="text-sm font-bold text-[#53627d]">({discountPercent}% Off)</span> : null}
        </div>
        <p className="mt-7 font-bold">Size :</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {(displaySizes.length ? displaySizes : ["One Size"]).map((size) => (
            <span key={size} className="rounded-lg bg-[#eef3f8] px-4 py-3 text-sm font-bold">{size}</span>
          ))}
        </div>
        <p className="mt-7 font-bold">Colors :</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {(displayColors.length ? displayColors : ["Natural"]).map((color) => (
            <span key={color} className="grid h-9 w-9 place-items-center rounded-lg bg-[#eef3f8]">
              <span className="h-4 w-4 rounded-full border border-[#dfe5ee]" style={{ backgroundColor: colorToHex(color) }} />
            </span>
          ))}
        </div>
        {displayedGalleryUrls.length ? (
          <>
            <p className="mt-7 font-bold">Gallery :</p>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {displayedGalleryUrls.slice(0, 8).map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setSelectedPreviewUrl(url)}
                  className="relative aspect-square overflow-hidden rounded-lg bg-[#eef3f8]"
                >
                  <Image src={url} alt="" fill className="object-cover" unoptimized={url.startsWith("blob:")} sizes="80px" />
                </button>
              ))}
            </div>
          </>
        ) : null}
        <div className="mt-10 grid grid-cols-2 gap-3">
          <Button type="submit" variant="outline" disabled={isPending}>{isPending ? "Saving..." : "Save Product"}</Button>
          <Button type="button" className="bg-[#ff6c2f] hover:bg-[#ec5c20]" onClick={() => router.push("/admin/products")}>Cancel</Button>
        </div>
      </aside>

      <div className="min-w-0 space-y-7">
        <section className="admin-card overflow-hidden">
          <div className="border-b border-[#e9edf2] px-6 py-5">
            <h2 className="text-lg font-bold">Add Product Photo</h2>
          </div>
          <div className="grid min-w-0 gap-5 p-5 sm:p-7 xl:grid-cols-2">
            <UploadBox title="Main image" subtitle="PNG, JPG, WEBP and GIF files are allowed">
              <Input
                type="file"
                name="main_image"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={handleMainImageChange}
              />
              <UploadPreview url={previewSrc} alt="Selected main product preview" />
            </UploadBox>
            <UploadBox title="Gallery images" subtitle="Upload multiple product photos">
              <Input
                type="file"
                name="gallery_images"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={handleGalleryImagesChange}
              />
              {displayedGalleryUrls.length ? (
                <div className="mb-5 grid w-full grid-cols-4 gap-3">
                  {displayedGalleryUrls.slice(0, 8).map((url) => (
                    <div key={url} className="relative aspect-square overflow-hidden rounded-lg bg-[#eef3f8]">
                      <Image src={url} alt="" fill className="object-cover" unoptimized={url.startsWith("blob:")} sizes="90px" />
                    </div>
                  ))}
                </div>
              ) : null}
            </UploadBox>
          </div>
        </section>

        <section className="admin-card overflow-hidden">
          <div className="border-b border-[#e9edf2] px-6 py-5">
            <h2 className="text-lg font-bold">Product Information</h2>
          </div>
          <div className="grid min-w-0 gap-6 p-5 sm:p-7">
            <div className="grid min-w-0 gap-5 xl:grid-cols-2">
              <Field label="Product Name" error={form.formState.errors.name?.message}>
                <Input className="admin-input" placeholder="Items Name" {...form.register("name")} />
              </Field>
              <Field label="Slug" error={form.formState.errors.slug?.message}>
                <div className="flex gap-2">
                  <Input className="admin-input" {...form.register("slug")} />
                  <Button type="button" variant="outline" onClick={generateSlug}>
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </div>
              </Field>
              <Field label="Tag Number" error={form.formState.errors.base_sku?.message}>
                <Input className="admin-input" placeholder="#******" {...form.register("base_sku")} />
              </Field>
              <Field label="Brand">
                <Input className="admin-input" placeholder="Brand Name" {...form.register("brand")} />
              </Field>
              <Field label="Product Categories" error={form.formState.errors.category_id?.message}>
                <select {...form.register("category_id")} className="admin-input">
                  <option value="">Choose a categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.parent_id ? "- " : ""}
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select {...form.register("status")} className="admin-input">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </Field>
              <Field label="Base price" error={form.formState.errors.base_price?.message}>
                <Input className="admin-input" type="number" step="0.01" min="0" placeholder="000" {...form.register("base_price")} />
              </Field>
              <Field label="Compare-at price">
                <Input className="admin-input" type="number" step="0.01" min="0" placeholder="000" {...form.register("compare_at_price")} />
              </Field>
              <Field label="Cost price">
                <Input className="admin-input" type="number" step="0.01" min="0" placeholder="000" {...form.register("cost_price")} />
              </Field>
              <Field label="Tags">
                <Input className="admin-input" value={tagsText} onChange={(event) => setTagsText(event.target.value)} placeholder="linen, lounge, editorial" />
              </Field>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" {...form.register("is_featured")} />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" {...form.register("is_new_arrival")} />
                New arrival
              </label>
            </div>
            <Field label="Short description">
              <Textarea className="min-h-24 rounded-md border-[#d9e0ea]" {...form.register("short_description")} />
            </Field>
          </div>
        </section>

        <section className="admin-card overflow-hidden">
          <div className="border-b border-[#e9edf2] px-6 py-5">
            <h2 className="text-lg font-bold">Description</h2>
          </div>
          <div className="grid min-w-0 gap-5 p-5 sm:p-7 xl:grid-cols-2">
            <Textarea className="min-h-72 rounded-md border-[#d9e0ea]" {...form.register("description_markdown")} />
            <div className="rounded-md border border-[#e9edf2] bg-white p-5">
              <MarkdownPreview value={description} />
            </div>
          </div>
        </section>

        <section className="admin-card overflow-hidden">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e9edf2] px-6 py-5">
            <div>
              <h2 className="text-lg font-bold">Variants</h2>
              <p className="mt-1 text-sm text-[#53627d]">Generate color x size combinations, then edit stock and SKU values.</p>
            </div>
            <Button type="button" variant="outline" onClick={() => variants.append(defaults(null).variants[0])}>
              <Plus className="h-4 w-4" />
              Add variant
            </Button>
          </div>
          <div className="p-5 sm:p-7">
            <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <Input className="admin-input" value={colorsText} onChange={(event) => setColorsText(event.target.value)} placeholder="Natural, Black" />
              <Input className="admin-input" value={sizesText} onChange={(event) => setSizesText(event.target.value)} placeholder="S, M, L" />
              <Button type="button" variant="secondary" onClick={generateVariantMatrix}>Generate matrix</Button>
            </div>
            <div className="mt-6 space-y-4">
              {variants.fields.map((field, index) => (
                <div key={field.fieldId} className="rounded-lg border border-[#e4eaf2] bg-white p-4">
                  <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Input className="admin-input" placeholder="SKU" {...form.register(`variants.${index}.sku`)} />
                    <Input className="admin-input" placeholder="Color" {...form.register(`variants.${index}.color`)} />
                    <Input className="admin-input" placeholder="Size" {...form.register(`variants.${index}.size`)} />
                    <Input className="admin-input" type="number" min="0" step="0.01" placeholder="Price override" {...form.register(`variants.${index}.price`)} />
                    <Input className="admin-input" type="number" min="0" step="0.01" placeholder="Compare override" {...form.register(`variants.${index}.compare_at_price`)} />
                    <Input className="admin-input" type="number" min="0" placeholder="Stock" {...form.register(`variants.${index}.stock_quantity`)} />
                    <Input className="admin-input" type="number" min="0" placeholder="Low stock" {...form.register(`variants.${index}.low_stock_threshold`)} />
                    <Input className="admin-input py-2" type="file" name={`variant_image_${index}`} accept="image/jpeg,image/png,image/webp,image/gif" />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" {...form.register(`variants.${index}.is_active`)} />
                      Active
                    </label>
                    <Button type="button" size="sm" variant="destructive" onClick={() => variants.remove(index)}>
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-card overflow-hidden">
          <div className="border-b border-[#e9edf2] px-6 py-5">
            <h2 className="text-lg font-bold">SEO and Attributes</h2>
          </div>
          <div className="grid min-w-0 gap-5 p-5 sm:p-7 xl:grid-cols-2">
            <Field label="SEO title">
              <Input className="admin-input" {...form.register("seo_title")} />
            </Field>
            <Field label="SEO description">
              <Input className="admin-input" {...form.register("seo_description")} />
            </Field>
            <Field label="Custom attributes JSON" className="lg:col-span-2">
              <Textarea
                className="min-h-36 rounded-md border-[#d9e0ea] font-mono"
                value={customAttributesText}
                onChange={(event) => setCustomAttributesText(event.target.value)}
              />
            </Field>
          </div>
        </section>

        <div className="admin-card admin-muted-panel flex justify-end gap-3 p-6">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>Cancel</Button>
          <Button className="bg-[#ff6c2f] hover:bg-[#ec5c20]" disabled={isPending}>{isPending ? "Saving..." : "Save product"}</Button>
        </div>
      </div>
    </form>
  );
}

function UploadBox({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <label className="grid min-h-[220px] cursor-pointer place-items-center rounded border-2 border-dashed border-[#cdd9e8] p-4 text-center">
      {children}
      <span>
        <UploadCloud className="mx-auto h-10 w-10 text-[#ff6c2f]" />
        <span className="mt-6 block text-xl font-bold">{title}, <span className="text-[#ff6c2f]">click to browse</span></span>
        <span className="mt-2 block text-sm text-[#53627d]">{subtitle}</span>
      </span>
    </label>
  );
}

function UploadPreview({ url, alt }: { url: string; alt: string }) {
  return (
    <span className="relative mb-5 block h-28 w-28 overflow-hidden rounded-lg bg-[#eef3f8]">
      <Image src={url} alt={alt} fill className="object-cover" unoptimized={url.startsWith("blob:")} sizes="112px" />
    </span>
  );
}

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))));
}

function colorToHex(color: string) {
  const normalized = color.trim().toLowerCase();
  const palette: Record<string, string> = {
    black: "#22395d",
    navy: "#22395d",
    blue: "#3b82f6",
    green: "#18bd68",
    yellow: "#fbb83f",
    orange: "#ff6c2f",
    red: "#f05b61",
    pink: "#f472b6",
    white: "#ffffff",
    natural: "#f1ece4",
    brown: "#8b5e3c",
    gray: "#66788f",
    grey: "#66788f"
  };

  if (normalized.startsWith("#") || normalized.startsWith("rgb")) return color;
  return palette[normalized] ?? "#66788f";
}

function Field({
  label,
  error,
  className,
  children
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
