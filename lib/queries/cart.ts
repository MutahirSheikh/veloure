import "server-only";

import { getSupabaseAdminClient } from "@/lib/db/admin";
import { isRecoverableSupabaseReadError, logSupabaseFallback } from "@/lib/db/errors";
import type { Cart, CartLine, CartSnapshot, Product, ProductVariant, SiteSettings } from "@/lib/db/types";
import { getSiteSettings } from "@/lib/queries/settings";

export async function getOrCreateCart(profileId: string) {
  const supabase = getSupabaseAdminClient();
  const { data: existing, error: existingError } = await supabase
    .from("carts")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (existingError) {
    if (isRecoverableSupabaseReadError(existingError)) {
      logSupabaseFallback("getOrCreateCart", existingError);
      return {
        id: `local-cart-${profileId}`,
        profile_id: profileId,
        created_at: new Date(0).toISOString(),
        updated_at: new Date(0).toISOString()
      };
    }
    throw existingError;
  }
  if (existing) return existing as Cart;

  const { data, error } = await supabase
    .from("carts")
    .insert({ profile_id: profileId })
    .select("*")
    .single();

  if (error) {
    if (isRecoverableSupabaseReadError(error)) {
      logSupabaseFallback("getOrCreateCart", error);
      return {
        id: `local-cart-${profileId}`,
        profile_id: profileId,
        created_at: new Date(0).toISOString(),
        updated_at: new Date(0).toISOString()
      };
    }
    throw error;
  }
  return data as Cart;
}

function estimateShipping(subtotal: number, settings: SiteSettings) {
  if (subtotal <= 0) return 0;
  if (settings.free_shipping_threshold !== null && subtotal >= settings.free_shipping_threshold) return 0;
  return Number(settings.flat_shipping_charge);
}

export async function getCartSnapshot(profileId: string): Promise<CartSnapshot> {
  const cart = await getOrCreateCart(profileId);
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("cart_items")
    .select("*, product:products(id,name,slug,main_image_url,base_price), variant:product_variants(*)")
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: true });

  if (error) {
    if (isRecoverableSupabaseReadError(error)) {
      logSupabaseFallback("getCartSnapshot", error);
      return {
        lines: [],
        subtotal: 0,
        shipping: 0,
        total: 0
      };
    }
    throw error;
  }

  const rows = (data ?? []) as Array<{
    id: string;
    cart_id: string;
    product_id: string;
    variant_id: string;
    quantity: number;
    unit_price_snapshot: number;
    created_at: string;
    updated_at: string;
    product: Pick<Product, "id" | "name" | "slug" | "main_image_url" | "base_price">;
    variant: ProductVariant;
  }>;

  const lines: CartLine[] = rows.map((row) => ({
    ...row,
    line_total: Number(row.unit_price_snapshot) * row.quantity
  }));
  const subtotal = lines.reduce((sum, line) => sum + line.line_total, 0);
  const settings = await getSiteSettings();
  const shipping = estimateShipping(subtotal, settings);

  return {
    lines,
    subtotal,
    shipping,
    total: subtotal + shipping
  };
}

export async function resolveActiveVariant(productId: string, variantId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select("*, product:products(*)")
    .eq("id", variantId)
    .eq("product_id", productId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    if (isRecoverableSupabaseReadError(error)) {
      logSupabaseFallback("resolveActiveVariant", error);
      return null;
    }
    throw error;
  }
  return data as (ProductVariant & { product: Product }) | null;
}
