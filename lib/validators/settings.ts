import { z } from "zod";

import { storefrontContentSchema } from "@/lib/storefront";
import { optionalMoneySchema, optionalStringSchema } from "@/lib/validators/shared";

export const settingsSchema = z.object({
  store_name: z.string().trim().min(2, "Store name is required."),
  support_email: z.string().trim().email("Use a valid support email."),
  contact_phone: optionalStringSchema,
  currency_code: z.string().trim().min(3).max(3).transform((value) => value.toUpperCase()),
  currency_symbol: z.string().trim().min(1).max(5),
  flat_shipping_charge: z.coerce.number().min(0, "Shipping cannot be negative."),
  free_shipping_threshold: optionalMoneySchema,
  cod_instructions: z.string().trim().min(12, "COD instructions are required."),
  admin_notification_emails: z.array(z.string().trim().email()).default([]),
  default_seo_title: z.string().trim().min(3, "Default SEO title is required."),
  default_seo_description: z.string().trim().min(12, "Default SEO description is required."),
  cart_alert_customer_enabled: z.coerce.boolean(),
  cart_alert_admin_enabled: z.coerce.boolean(),
  homepage_heading: z.string().trim().min(3, "Homepage heading is required."),
  homepage_subheading: z.string().trim().min(8, "Homepage subheading is required."),
  storefront_content: storefrontContentSchema
});

export type SettingsInput = z.infer<typeof settingsSchema>;
