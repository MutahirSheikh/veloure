import { z } from "zod";

import { optionalMoneySchema, optionalStringSchema, slugSchema, uuidSchema } from "@/lib/validators/shared";

export const productStatusSchema = z.enum(["draft", "published", "archived"]);

export const productVariantInputSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().trim().min(2, "Variant SKU is required."),
  color: z.string().trim().min(1, "Color is required."),
  size: z.string().trim().min(1, "Size is required."),
  price: optionalMoneySchema,
  compare_at_price: optionalMoneySchema,
  stock_quantity: z.coerce.number().int().min(0, "Stock cannot be negative."),
  low_stock_threshold: z.coerce.number().int().min(0, "Low stock threshold cannot be negative."),
  image_url: optionalStringSchema,
  is_active: z.coerce.boolean(),
  sort_order: z.coerce.number().int().min(0)
});

export const productUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Product name is required."),
  slug: slugSchema,
  short_description: optionalStringSchema,
  description_markdown: z.string().trim().min(12, "Add a helpful product description."),
  base_sku: z.string().trim().min(2, "Base SKU is required."),
  brand: optionalStringSchema,
  tags: z.array(z.string().trim().min(1)).default([]),
  category_id: uuidSchema,
  status: productStatusSchema,
  is_featured: z.coerce.boolean(),
  is_new_arrival: z.coerce.boolean(),
  base_price: z.coerce.number().min(0, "Base price cannot be negative."),
  compare_at_price: optionalMoneySchema,
  cost_price: optionalMoneySchema,
  seo_title: optionalStringSchema,
  seo_description: optionalStringSchema,
  custom_attributes: z.record(z.unknown()).default({}),
  variants: z.array(productVariantInputSchema).min(1, "Add at least one variant.")
});

export const productImageMetadataSchema = z.object({
  alt_text: optionalStringSchema,
  is_primary: z.coerce.boolean().default(false),
  sort_order: z.coerce.number().int().min(0).default(0)
});

export type ProductUpsertInput = z.infer<typeof productUpsertSchema>;
export type ProductVariantInput = z.infer<typeof productVariantInputSchema>;
