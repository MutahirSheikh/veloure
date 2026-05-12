import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(99)
});

export const cartQuantitySchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(99)
});

export const guestCartLineSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(99)
});

export const mergeGuestCartSchema = z.object({
  lines: z.array(guestCartLineSchema).max(100)
});

export type GuestCartLineInput = z.infer<typeof guestCartLineSchema>;
