import { z } from "zod";

export const checkoutSchema = z.object({
  idempotency_key: z.string().trim().min(12, "Checkout token is invalid."),
  full_name: z.string().trim().min(2, "Full name is required."),
  email: z.string().trim().email("Use a valid email address."),
  phone: z.string().trim().min(7, "Phone number is required."),
  address_line_1: z.string().trim().min(4, "Address line 1 is required."),
  address_line_2: z.string().trim().optional().nullable(),
  city: z.string().trim().min(2, "City is required."),
  state: z.string().trim().min(2, "State or province is required."),
  postal_code: z.string().trim().min(3, "Postal code is required."),
  country: z.string().trim().min(2, "Country is required."),
  delivery_notes: z.string().trim().max(700).optional().nullable()
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
