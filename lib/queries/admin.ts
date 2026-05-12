import "server-only";

import { getSupabaseAdminClient } from "@/lib/db/admin";
import { isRecoverableSupabaseReadError, logSupabaseFallback } from "@/lib/db/errors";
import type { AdminDashboardStats, InventoryMovement, ProductVariant, Profile } from "@/lib/db/types";

export type InventoryRow = ProductVariant & {
  product: {
    id: string;
    name: string;
    slug: string;
  };
};

const emptyDashboardStats: AdminDashboardStats = {
  totalOrders: 0,
  paidRevenue: 0,
  pendingCodOrders: 0,
  totalProducts: 0,
  totalCustomers: 0,
  lowStockVariants: [],
  recentOrders: []
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = getSupabaseAdminClient();
  const [
    ordersResult,
    paidOrdersResult,
    pendingOrdersResult,
    productsResult,
    customersResult,
    lowStockResult,
    recentOrdersResult
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("total_amount").eq("payment_status", "paid"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("payment_status", "pending"),
    supabase.from("products").select("id", { count: "exact", head: true }).neq("status", "archived"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("product_variants")
      .select("*, product:products(name)")
      .eq("is_active", true)
      .lte("stock_quantity", 10)
      .order("stock_quantity", { ascending: true })
      .limit(8),
    supabase.from("orders").select("*").order("placed_at", { ascending: false }).limit(6)
  ]);

  const errors = [
    ordersResult.error,
    paidOrdersResult.error,
    pendingOrdersResult.error,
    productsResult.error,
    customersResult.error,
    lowStockResult.error,
    recentOrdersResult.error
  ].filter(Boolean);
  if (errors[0]) {
    if (isRecoverableSupabaseReadError(errors[0])) {
      logSupabaseFallback("getAdminDashboardStats", errors[0]);
      return emptyDashboardStats;
    }
    throw errors[0];
  }

  const paidRevenue = ((paidOrdersResult.data ?? []) as Array<{ total_amount: number }>).reduce(
    (sum, order) => sum + Number(order.total_amount),
    0
  );

  const lowStockRows = (lowStockResult.data ?? []) as Array<ProductVariant & { product: { name: string } }>;

  return {
    totalOrders: ordersResult.count ?? 0,
    paidRevenue,
    pendingCodOrders: pendingOrdersResult.count ?? 0,
    totalProducts: productsResult.count ?? 0,
    totalCustomers: customersResult.count ?? 0,
    lowStockVariants: lowStockRows.map((row) => ({
      ...row,
      product_name: row.product.name
    })),
    recentOrders: (recentOrdersResult.data ?? []) as AdminDashboardStats["recentOrders"]
  };
}

export async function listInventory(params: { lowStock?: boolean; query?: string } = {}) {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("product_variants")
    .select("*, product:products(id,name,slug)")
    .order("stock_quantity", { ascending: true });

  if (params.lowStock) query = query.lte("stock_quantity", 10);
  if (params.query) query = query.or(`sku.ilike.%${params.query}%,color.ilike.%${params.query}%,size.ilike.%${params.query}%`);

  const { data, error } = await query;
  if (error) {
    if (isRecoverableSupabaseReadError(error)) {
      logSupabaseFallback("listInventory", error);
      return [];
    }
    throw error;
  }
  return (data ?? []) as InventoryRow[];
}

export async function getInventoryMovements(variantId?: string) {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("inventory_movements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (variantId) query = query.eq("variant_id", variantId);

  const { data, error } = await query;
  if (error) {
    if (isRecoverableSupabaseReadError(error)) {
      logSupabaseFallback("getInventoryMovements", error);
      return [];
    }
    throw error;
  }
  return (data ?? []) as InventoryMovement[];
}

export async function listCustomers() {
  const supabase = getSupabaseAdminClient();
  const [{ data: profiles, error: profilesError }, { data: orders, error: ordersError }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("profile_id,total_amount,payment_status,placed_at")
  ]);

  if (profilesError || ordersError) {
    const error = profilesError ?? ordersError;
    if (isRecoverableSupabaseReadError(error)) {
      logSupabaseFallback("listCustomers", error);
      return [];
    }
    throw error;
  }

  const orderRows = (orders ?? []) as Array<{
    profile_id: string | null;
    total_amount: number;
    payment_status: string;
    placed_at: string;
  }>;

  return ((profiles ?? []) as Profile[]).map((profile) => {
    const profileOrders = orderRows.filter((order) => order.profile_id === profile.id);
    const paidOrders = profileOrders.filter((order) => order.payment_status === "paid");
    const lastOrder = profileOrders.sort((a, b) => +new Date(b.placed_at) - +new Date(a.placed_at))[0];

    return {
      profile,
      orderCount: profileOrders.length,
      totalSpend: paidOrders.reduce((sum, order) => sum + Number(order.total_amount), 0),
      lastOrderDate: lastOrder?.placed_at ?? null
    };
  });
}
