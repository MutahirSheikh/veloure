import { z } from "zod";

import { FULFILLMENT_STATUSES, ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";

export const orderUpdateSchema = z.object({
  order_id: z.string().uuid(),
  order_status: z.enum(ORDER_STATUSES).optional(),
  payment_status: z.enum(PAYMENT_STATUSES).optional(),
  fulfillment_status: z.enum(FULFILLMENT_STATUSES).optional(),
  admin_note: z.string().trim().max(1200).optional().nullable(),
  history_note: z.string().trim().max(700).optional().nullable()
});

export const inventoryAdjustmentSchema = z.object({
  variant_id: z.string().uuid(),
  change_amount: z.coerce.number().int().refine((value) => value !== 0, "Change amount cannot be zero."),
  reason: z.string().trim().min(3, "Reason is required.")
});
