import "server-only";

import { unstable_cache } from "next/cache";

import { CACHE_TAGS } from "@/lib/constants";
import { getSupabaseAdminClient } from "@/lib/db/admin";
import { isRecoverableSupabaseReadError, logSupabaseFallback } from "@/lib/db/errors";
import type {
  Category,
  Product,
  ProductVariant,
  ProductWithRelations,
  SearchProductRow
} from "@/lib/db/types";

export type ProductListFilters = {
  query?: string;
  categorySlug?: string;
  color?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  newArrival?: boolean;
  sort?: string;
  page?: number;
  pageSize?: number;
};

export type ProductListResult = {
  products: SearchProductRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getCategories(includeInactive = false) {
  return unstable_cache(
    async () => {
      const supabase = getSupabaseAdminClient();
      let query = supabase
        .from("categories")
        .select("*")
        .is("archived_at", null)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (!includeInactive) query = query.eq("is_active", true);

      const { data, error } = await query;
      if (error) {
        if (isRecoverableSupabaseReadError(error)) {
          logSupabaseFallback("getCategories", error);
          return [];
        }
        throw error;
      }
      return (data ?? []) as Category[];
    },
    ["categories", includeInactive ? "all" : "active"],
    { tags: [CACHE_TAGS.categories, CACHE_TAGS.catalog], revalidate: 300 }
  )();
}

export async function getCategoryBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .is("archived_at", null)
        .maybeSingle();

      if (error) {
        if (isRecoverableSupabaseReadError(error)) {
          logSupabaseFallback("getCategoryBySlug", error);
          return null;
        }
        throw error;
      }
      return data as Category | null;
    },
    ["category", slug],
    { tags: [CACHE_TAGS.categories, CACHE_TAGS.catalog], revalidate: 300 }
  )();
}

export async function listProducts(filters: ProductListFilters = {}): Promise<ProductListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(60, Math.max(1, filters.pageSize ?? 24));
  const offset = (page - 1) * pageSize;
  const key = JSON.stringify({ ...filters, page, pageSize });

  return unstable_cache(
    async () => {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase.rpc("search_products", {
        p_query: filters.query || null,
        p_category_slug: filters.categorySlug || null,
        p_color: filters.color || null,
        p_size: filters.size || null,
        p_min_price: filters.minPrice ?? null,
        p_max_price: filters.maxPrice ?? null,
        p_in_stock: filters.inStock ?? null,
        p_featured: filters.featured ?? null,
        p_new_arrival: filters.newArrival ?? null,
        p_sort: filters.sort || "newest",
        p_limit: pageSize,
        p_offset: offset
      });

      if (error) {
        if (isRecoverableSupabaseReadError(error)) {
          logSupabaseFallback("listProducts", error);
          return {
            products: [],
            total: 0,
            page,
            pageSize,
            totalPages: 1
          };
        }
        throw error;
      }
      const products = (data ?? []) as SearchProductRow[];
      const total = products[0]?.total_count ?? 0;
      return {
        products,
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize))
      };
    },
    ["products", key],
    { tags: [CACHE_TAGS.products, CACHE_TAGS.catalog], revalidate: 180 }
  )();
}

export async function getProductBySlug(slug: string, publishedOnly = true) {
  return unstable_cache(
    async () => {
      const supabase = getSupabaseAdminClient();
      let query = supabase
        .from("products")
        .select("*, category:categories(*), variants:product_variants(*), images:product_images(*)")
        .eq("slug", slug)
        .is("archived_at", null)
        .order("sort_order", { foreignTable: "product_variants", ascending: true })
        .order("sort_order", { foreignTable: "product_images", ascending: true });

      if (publishedOnly) query = query.eq("status", "published");

      const { data, error } = await query.maybeSingle();
      if (error) {
        if (isRecoverableSupabaseReadError(error)) {
          logSupabaseFallback("getProductBySlug", error);
          return null;
        }
        throw error;
      }
      return data as ProductWithRelations | null;
    },
    ["product-by-slug", slug, publishedOnly ? "published" : "any"],
    { tags: [CACHE_TAGS.products, CACHE_TAGS.catalog], revalidate: 180 }
  )();
}

export async function getProductById(id: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), variants:product_variants(*), images:product_images(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isRecoverableSupabaseReadError(error)) {
      logSupabaseFallback("getProductById", error);
      return null;
    }
    throw error;
  }
  return data as ProductWithRelations | null;
}

export async function getFeaturedProducts(limit = 8) {
  const result = await listProducts({ featured: true, pageSize: limit, sort: "newest" });
  return result.products;
}

export async function getNewArrivals(limit = 8) {
  const result = await listProducts({ newArrival: true, pageSize: limit, sort: "newest" });
  return result.products;
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const result = await listProducts({
    categorySlug: undefined,
    pageSize: limit + 1,
    sort: "newest"
  });
  return result.products.filter((item) => item.id !== product.id).slice(0, limit);
}

export async function getFilterOptions() {
  return unstable_cache(
    async () => {
      const supabase = getSupabaseAdminClient();
      const [{ data: variants, error: variantsError }, categories] = await Promise.all([
        supabase
          .from("product_variants")
          .select("color,size")
          .eq("is_active", true)
          .order("color", { ascending: true }),
        getCategories(false)
      ]);

      if (variantsError) {
        if (isRecoverableSupabaseReadError(variantsError)) {
          logSupabaseFallback("getFilterOptions", variantsError);
          return { colors: [], sizes: [], categories };
        }
        throw variantsError;
      }

      const rows = (variants ?? []) as Pick<ProductVariant, "color" | "size">[];
      const colors = [...new Set(rows.map((row) => row.color).filter(Boolean))].sort();
      const sizes = [...new Set(rows.map((row) => row.size).filter(Boolean))].sort();
      return { colors, sizes, categories };
    },
    ["filter-options"],
    { tags: [CACHE_TAGS.products, CACHE_TAGS.categories, CACHE_TAGS.catalog], revalidate: 300 }
  )();
}

export async function listAdminProducts(params: { query?: string; status?: string; page?: number; pageSize?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(60, Math.max(1, params.pageSize ?? 20));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const supabase = getSupabaseAdminClient();

  let query = supabase
    .from("products")
    .select("*, category:categories(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.status) query = query.eq("status", params.status);
  if (params.query) {
    query = query.or(`name.ilike.%${params.query}%,base_sku.ilike.%${params.query}%,slug.ilike.%${params.query}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    if (isRecoverableSupabaseReadError(error)) {
      logSupabaseFallback("listAdminProducts", error);
      return {
        products: [],
        total: 0,
        page,
        pageSize,
        totalPages: 1
      };
    }
    throw error;
  }
  return {
    products: (data ?? []) as Array<Product & { category: Category | null }>,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize))
  };
}
