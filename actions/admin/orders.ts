"use server";

import { revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/constants";
import { requireAdminProfile } from "@/lib/auth/profile";
import { getSupabaseAdminClient } from "@/lib/db/admin";
import type { Order } from "@/lib/db/types";
import { sendOrderStatusEmail } from "@/lib/email/events";
import { getOrderByIdAdmin } from "@/lib/queries/orders";
import { orderUpdateSchema } from "@/lib/validators/order";
import { fail, getErrorMessage, ok, type ActionResult } from "@/lib/utils";

export async function updateOrderAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const admin = await requireAdminProfile();
    const parsed = orderUpdateSchema.parse(input);
    const supabase = getSupabaseAdminClient();

    const { data: currentData, error: currentError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", parsed.order_id)
      .single();

    if (currentError) throw currentError;
    const current = currentData as Order;

    const patch: Record<string, string | null> = {
      admin_note: parsed.admin_note ?? current.admin_note
    };
    if (parsed.order_status) patch.order_status = parsed.order_status;
    if (parsed.payment_status) patch.payment_status = parsed.payment_status;
    if (parsed.fulfillment_status) patch.fulfillment_status = parsed.fulfillment_status;
    if (parsed.order_status === "cancelled") patch.cancelled_at = new Date().toISOString();
    if (parsed.fulfillment_status === "delivered" || parsed.order_status === "delivered") {
      patch.delivered_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase.from("orders").update(patch).eq("id", parsed.order_id);
    if (updateError) throw updateError;

    const { error: historyError } = await supabase.from("order_status_history").insert({
      order_id: parsed.order_id,
      actor_clerk_user_id: admin.clerk_user_id,
      actor_type: "admin",
      from_order_status: current.order_status,
      to_order_status: parsed.order_status ?? current.order_status,
      from_payment_status: current.payment_status,
      to_payment_status: parsed.payment_status ?? current.payment_status,
      from_fulfillment_status: current.fulfillment_status,
      to_fulfillment_status: parsed.fulfillment_status ?? current.fulfillment_status,
      note: parsed.history_note ?? "Order updated by admin."
    });

    if (historyError) throw historyError;

    const updated = await getOrderByIdAdmin(parsed.order_id);
    const shouldEmail =
      updated &&
      (parsed.order_status === "shipped" ||
        parsed.order_status === "delivered" ||
        parsed.fulfillment_status === "shipped" ||
        parsed.fulfillment_status === "delivered");

    if (updated && shouldEmail) {
      sendOrderStatusEmail(updated, parsed.order_status ?? parsed.fulfillment_status ?? "updated").catch(
        (error: unknown) => {
          console.error("Order status email failed", error);
        }
      );
    }

    revalidateTag(CACHE_TAGS.orders);
    revalidateTag(CACHE_TAGS.customers);
    return ok({ id: parsed.order_id }, "Order updated.");
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}
