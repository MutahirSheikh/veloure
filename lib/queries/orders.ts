import "server-only";

import { getSupabaseAdminClient } from "@/lib/db/admin";
import { isRecoverableSupabaseReadError, logSupabaseFallback } from "@/lib/db/errors";
import type { Order, OrderWithItems } from "@/lib/db/types";

const orderSelect = "*, items:order_items(*), history:order_status_history(*)";

export async function getOrderByNumberForProfile(orderNumber: string, profileId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .eq("order_number", orderNumber)
    .eq("profile_id", profileId)
    .order("created_at", { foreignTable: "order_status_history", ascending: true })
    .maybeSingle();

  if (error) {
    if (isRecoverableSupabaseReadError(error)) {
      logSupabaseFallback("getOrderByNumberForProfile", error);
      return null;
    }
    throw error;
  }
  return data as OrderWithItems | null;
}

export async function getOrderByIdAdmin(id: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, profile:profiles(*), items:order_items(*), history:order_status_history(*)")
    .eq("id", id)
    .order("created_at", { foreignTable: "order_status_history", ascending: true })
    .maybeSingle();

  if (error) {
    if (isRecoverableSupabaseReadError(error)) {
      logSupabaseFallback("getOrderByIdAdmin", error);
      return null;
    }
    throw error;
  }
  return data as OrderWithItems | null;
}

export async function listCustomerOrders(profileId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("profile_id", profileId)
    .order("placed_at", { ascending: false });

  if (error) {
    if (isRecoverableSupabaseReadError(error)) {
      logSupabaseFallback("listCustomerOrders", error);
      return [];
    }
    throw error;
  }
  return (data ?? []) as Order[];
}

export async function listAdminOrders(params: {
  query?: string;
  orderStatus?: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(60, Math.max(1, params.pageSize ?? 20));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const supabase = getSupabaseAdminClient();

  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("placed_at", { ascending: false })
    .range(from, to);

  if (params.query) {
    query = query.or(
      `order_number.ilike.%${params.query}%,customer_email.ilike.%${params.query}%,customer_name.ilike.%${params.query}%`
    );
  }
  if (params.orderStatus) query = query.eq("order_status", params.orderStatus);
  if (params.paymentStatus) query = query.eq("payment_status", params.paymentStatus);
  if (params.fulfillmentStatus) query = query.eq("fulfillment_status", params.fulfillmentStatus);
  if (params.from) query = query.gte("placed_at", params.from);
  if (params.to) query = query.lte("placed_at", params.to);

  const { data, error, count } = await query;
  if (error) {
    if (isRecoverableSupabaseReadError(error)) {
      logSupabaseFallback("listAdminOrders", error);
      return {
        orders: [],
        total: 0,
        page,
        pageSize,
        totalPages: 1
      };
    }
    throw error;
  }

  return {
    orders: (data ?? []) as Order[],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize))
  };
}
