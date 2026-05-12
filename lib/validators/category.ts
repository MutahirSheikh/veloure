import { z } from "zod";

import { optionalStringSchema, slugSchema } from "@/lib/validators/shared";

export const categoryUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  parent_id: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.string().uuid().nullable()
  ),
  name: z.string().trim().min(2, "Category name is required."),
  slug: slugSchema,
  description: optionalStringSchema,
  image_url: optionalStringSchema,
  sort_order: z.coerce.number().int().min(0),
  is_active: z.coerce.boolean(),
  seo_title: optionalStringSchema,
  seo_description: optionalStringSchema
});

export type CategoryUpsertInput = z.infer<typeof categoryUpsertSchema>;
