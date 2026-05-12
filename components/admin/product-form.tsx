"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { Plus, Trash2, Wand2 } from "lucide-react";

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
  const [customAttributesText, setCustomAttributesText] = React.useState(
    JSON.stringify(defaults(product).custom_attributes, null, 2)
  );
  const [colorsText, setColorsText] = React.useState("Natural, Black");
  const [sizesText, setSizesText] = React.useState("S, M, L");
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
    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <section className="rounded-md border border-border bg-card p-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Name" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <Field label="Slug" error={form.formState.errors.slug?.message}>
            <div className="flex gap-2">
              <Input {...form.register("slug")} />
              <Button type="button" variant="outline" onClick={generateSlug}>
                <Wand2 className="h-4 w-4" />
              </Button>
            </div>
          </Field>
          <Field label="Base SKU" error={form.formState.errors.base_sku?.message}>
            <Input {...form.register("base_sku")} />
          </Field>
          <Field label="Brand">
            <Input {...form.register("brand")} />
          </Field>
          <Field label="Category" error={form.formState.errors.category_id?.message}>
            <select {...form.register("category_id")} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.parent_id ? "— " : ""}
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select {...form.register("status")} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          <Field label="Base price" error={form.formState.errors.base_price?.message}>
            <Input type="number" step="0.01" min="0" {...form.register("base_price")} />
          </Field>
          <Field label="Compare-at price">
            <Input type="number" step="0.01" min="0" {...form.register("compare_at_price")} />
          </Field>
          <Field label="Cost price">
            <Input type="number" step="0.01" min="0" {...form.register("cost_price")} />
          </Field>
          <Field label="Tags">
            <Input value={tagsText} onChange={(event) => setTagsText(event.target.value)} placeholder="linen, lounge, editorial" />
          </Field>
          <div className="flex items-center gap-5">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register("is_featured")} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register("is_new_arrival")} />
              New arrival
            </label>
          </div>
        </div>
        <Field label="Short description" className="mt-5">
          <Textarea {...form.register("short_description")} />
        </Field>
      </section>

      <section className="rounded-md border border-border bg-card p-6">
        <h2 className="font-serif text-2xl font-semibold">Description</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Textarea className="min-h-72" {...form.register("description_markdown")} />
          <div className="rounded-md border border-border bg-background p-5">
            <MarkdownPreview value={description} />
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-6">
        <h2 className="font-serif text-2xl font-semibold">Media</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Field label="Main image">
            <Input type="file" name="main_image" accept="image/jpeg,image/png,image/webp,image/gif" />
          </Field>
          <Field label="Gallery images">
            <Input type="file" name="gallery_images" multiple accept="image/jpeg,image/png,image/webp,image/gif" />
          </Field>
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold">Variants</h2>
            <p className="mt-1 text-sm text-muted-foreground">Generate color x size combinations, then edit stock and SKU values.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => variants.append(defaults(null).variants[0])}>
            <Plus className="h-4 w-4" />
            Add variant
          </Button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Input value={colorsText} onChange={(event) => setColorsText(event.target.value)} placeholder="Natural, Black" />
          <Input value={sizesText} onChange={(event) => setSizesText(event.target.value)} placeholder="S, M, L" />
          <Button type="button" variant="secondary" onClick={generateVariantMatrix}>
            Generate matrix
          </Button>
        </div>
        <div className="mt-6 space-y-4">
          {variants.fields.map((field, index) => (
            <div key={field.fieldId} className="rounded-md border border-border p-4">
              <div className="grid gap-3 md:grid-cols-4">
                <Input placeholder="SKU" {...form.register(`variants.${index}.sku`)} />
                <Input placeholder="Color" {...form.register(`variants.${index}.color`)} />
                <Input placeholder="Size" {...form.register(`variants.${index}.size`)} />
                <Input type="number" min="0" step="0.01" placeholder="Price override" {...form.register(`variants.${index}.price`)} />
                <Input type="number" min="0" step="0.01" placeholder="Compare override" {...form.register(`variants.${index}.compare_at_price`)} />
                <Input type="number" min="0" placeholder="Stock" {...form.register(`variants.${index}.stock_quantity`)} />
                <Input type="number" min="0" placeholder="Low stock" {...form.register(`variants.${index}.low_stock_threshold`)} />
                <Input type="file" name={`variant_image_${index}`} accept="image/jpeg,image/png,image/webp,image/gif" />
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
      </section>

      <section className="rounded-md border border-border bg-card p-6">
        <h2 className="font-serif text-2xl font-semibold">SEO and attributes</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Field label="SEO title">
            <Input {...form.register("seo_title")} />
          </Field>
          <Field label="SEO description">
            <Input {...form.register("seo_description")} />
          </Field>
          <Field label="Custom attributes JSON" className="lg:col-span-2">
            <Textarea className="font-mono" value={customAttributesText} onChange={(event) => setCustomAttributesText(event.target.value)} />
          </Field>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
        <Button disabled={isPending}>{isPending ? "Saving..." : "Save product"}</Button>
      </div>
    </form>
  );
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
