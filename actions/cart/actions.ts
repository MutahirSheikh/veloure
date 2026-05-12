"use server";

import { revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/constants";
import { requireUserProfile } from "@/lib/auth/profile";
import { getSupabaseAdminClient } from "@/lib/db/admin";
import type { CartSnapshot } from "@/lib/db/types";
import { sendCartAlertEmail } from "@/lib/email/events";
import { getCartSnapshot, getOrCreateCart, resolveActiveVariant } from "@/lib/queries/cart";
import { addToCartSchema, cartQuantitySchema, mergeGuestCartSchema } from "@/lib/validators/cart";
import { fail, getErrorMessage, ok, type ActionResult } from "@/lib/utils";

export async function getCartSnapshotAction(): Promise<ActionResult<CartSnapshot>> {
  try {
    const profile = await requireUserProfile();
    return ok(await getCartSnapshot(profile.id));
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}

export async function addToCartAction(input: unknown): Promise<ActionResult<CartSnapshot>> {
  try {
    const parsed = addToCartSchema.parse(input);
    const profile = await requireUserProfile();
    const variant = await resolveActiveVariant(parsed.productId, parsed.variantId);

    if (!variant || variant.product.status !== "published" || variant.product.archived_at) {
      return fail("This product is not available.");
    }

    if (variant.stock_quantity < parsed.quantity) {
      return fail("There is not enough stock available for that quantity.");
    }

    const cart = await getOrCreateCart(profile.id);
    const supabase = getSupabaseAdminClient();
    const unitPrice = Number(variant.price ?? variant.product.base_price);

    const { data: existing, error: existingError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id)
      .eq("variant_id", parsed.variantId)
      .maybeSingle();

    if (existingError) throw existingError;

    const existingItem = existing as { id: string; quantity: number } | null;

    if (existingItem) {
      const nextQuantity = Math.min(99, Number(existingItem.quantity) + parsed.quantity);
      if (variant.stock_quantity < nextQuantity) return fail("There is not enough stock available for that quantity.");
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: nextQuantity, unit_price_snapshot: unitPrice })
        .eq("id", existingItem.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("cart_items").insert({
        cart_id: cart.id,
        product_id: parsed.productId,
        variant_id: parsed.variantId,
        quantity: parsed.quantity,
        unit_price_snapshot: unitPrice
      });
      if (error) throw error;
    }

    const snapshot = await getCartSnapshot(profile.id);
    const line = snapshot.lines.find((item) => item.variant_id === parsed.variantId);
    if (line) {
      sendCartAlertEmail(profile, line).catch((error: unknown) => {
        console.error("Cart alert email failed", error);
      });
    }

    revalidateTag(CACHE_TAGS.cart);
    return ok(snapshot, "Added to cart.");
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}

export async function updateCartItemQuantityAction(input: unknown): Promise<ActionResult<CartSnapshot>> {
  try {
    const parsed = cartQuantitySchema.parse(input);
    const profile = await requireUserProfile();
    const cart = await getOrCreateCart(profile.id);
    const supabase = getSupabaseAdminClient();

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: parsed.quantity })
      .eq("id", parsed.itemId)
      .eq("cart_id", cart.id);

    if (error) throw error;
    revalidateTag(CACHE_TAGS.cart);
    return ok(await getCartSnapshot(profile.id), "Cart updated.");
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}

export async function removeCartItemAction(itemId: string): Promise<ActionResult<CartSnapshot>> {
  try {
    const profile = await requireUserProfile();
    const cart = await getOrCreateCart(profile.id);
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId).eq("cart_id", cart.id);

    if (error) throw error;
    revalidateTag(CACHE_TAGS.cart);
    return ok(await getCartSnapshot(profile.id), "Item removed.");
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}

export async function clearCartAction(): Promise<ActionResult<CartSnapshot>> {
  try {
    const profile = await requireUserProfile();
    const cart = await getOrCreateCart(profile.id);
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("cart_items").delete().eq("cart_id", cart.id);

    if (error) throw error;
    revalidateTag(CACHE_TAGS.cart);
    return ok(await getCartSnapshot(profile.id), "Cart cleared.");
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}

export async function mergeGuestCartAction(input: unknown): Promise<ActionResult<CartSnapshot>> {
  try {
    const parsed = mergeGuestCartSchema.parse(input);
    let latest: CartSnapshot | null = null;

    for (const line of parsed.lines) {
      const result = await addToCartAction(line);
      if (result.ok) latest = result.data;
    }

    if (!latest) {
      const profile = await requireUserProfile();
      latest = await getCartSnapshot(profile.id);
    }

    return ok(latest, "Cart synced.");
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}
