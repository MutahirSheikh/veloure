"use server";

import { revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/constants";
import { requireUserProfile } from "@/lib/auth/profile";
import { getSupabaseAdminClient } from "@/lib/db/admin";
import { sendOrderPlacedEmails } from "@/lib/email/events";
import { getOrderByIdAdmin } from "@/lib/queries/orders";
import { checkoutSchema } from "@/lib/validators/checkout";
import { fail, getErrorMessage, ok, type ActionResult } from "@/lib/utils";

export async function placeOrderAction(input: unknown): Promise<ActionResult<{ orderNumber: string }>> {
  try {
    const parsed = checkoutSchema.parse(input);
    const profile = await requireUserProfile();
    const supabase = getSupabaseAdminClient();
    const shippingAddress = {
      full_name: parsed.full_name,
      phone: parsed.phone,
      address_line_1: parsed.address_line_1,
      address_line_2: parsed.address_line_2 ?? null,
      city: parsed.city,
      state: parsed.state,
      postal_code: parsed.postal_code,
      country: parsed.country
    };

    const { data, error } = await supabase.rpc("place_cod_order", {
      p_profile_id: profile.id,
      p_idempotency_key: parsed.idempotency_key,
      p_customer_email: parsed.email,
      p_customer_name: parsed.full_name,
      p_customer_phone: parsed.phone,
      p_shipping_address: shippingAddress,
      p_customer_note: parsed.delivery_notes ?? null
    });

    if (error) throw error;

    const row = (data as Array<{ order_id: string; order_number: string }>)[0];
    if (!row) throw new Error("Order placement did not return an order number.");

    const order = await getOrderByIdAdmin(row.order_id);
    if (order) {
      sendOrderPlacedEmails(order).catch((emailError: unknown) => {
        console.error("Order email failed", emailError);
      });
    }

    revalidateTag(CACHE_TAGS.cart);
    revalidateTag(CACHE_TAGS.orders);
    revalidateTag(CACHE_TAGS.inventory);
    revalidateTag(CACHE_TAGS.products);
    revalidateTag(CACHE_TAGS.catalog);

    return ok({ orderNumber: row.order_number }, "Order placed.");
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}
