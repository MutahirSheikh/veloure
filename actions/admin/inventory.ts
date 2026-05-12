"use server";

import { revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/constants";
import { requireAdminProfile } from "@/lib/auth/profile";
import { getSupabaseAdminClient } from "@/lib/db/admin";
import { inventoryAdjustmentSchema } from "@/lib/validators/order";
import { fail, getErrorMessage, ok, type ActionResult } from "@/lib/utils";

export async function adjustInventoryAction(input: unknown): Promise<ActionResult<{ stock: number }>> {
  try {
    const admin = await requireAdminProfile();
    const parsed = inventoryAdjustmentSchema.parse(input);
    const supabase = getSupabaseAdminClient();

    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .select("stock_quantity")
      .eq("id", parsed.variant_id)
      .single();

    if (variantError) throw variantError;
    const nextStock = Number(variant.stock_quantity) + parsed.change_amount;
    if (nextStock < 0) return fail("Inventory cannot be adjusted below zero.");

    const { error: updateError } = await supabase
      .from("product_variants")
      .update({ stock_quantity: nextStock })
      .eq("id", parsed.variant_id);

    if (updateError) throw updateError;

    const { error: movementError } = await supabase.from("inventory_movements").insert({
      variant_id: parsed.variant_id,
      change_amount: parsed.change_amount,
      reason: parsed.reason,
      reference_type: "manual",
      actor_clerk_user_id: admin.clerk_user_id
    });

    if (movementError) throw movementError;

    revalidateTag(CACHE_TAGS.inventory);
    revalidateTag(CACHE_TAGS.products);
    revalidateTag(CACHE_TAGS.catalog);
    return ok({ stock: nextStock }, "Inventory adjusted.");
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}
