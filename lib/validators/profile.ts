import { z } from "zod";

import { optionalStringSchema } from "@/lib/validators/shared";

export const profileUpdateSchema = z.object({
  full_name: z.string().trim().min(2, "Full name is required."),
  phone: optionalStringSchema
});

export const addressSchema = z.object({
  id: z.string().uuid().optional(),
  full_name: z.string().trim().min(2, "Full name is required."),
  phone: z.string().trim().min(7, "Phone number is required."),
  address_line_1: z.string().trim().min(4, "Address line 1 is required."),
  address_line_2: optionalStringSchema,
  city: z.string().trim().min(2, "City is required."),
  state: z.string().trim().min(2, "State or province is required."),
  postal_code: z.string().trim().min(3, "Postal code is required."),
  country: z.string().trim().min(2, "Country is required."),
  is_default: z.coerce.boolean().default(false)
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
