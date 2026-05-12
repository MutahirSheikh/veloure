export const APP_NAME = "Veloure";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const PRODUCT_MEDIA_BUCKET = "product-media";

export const CACHE_TAGS = {
  settings: "settings",
  catalog: "catalog",
  products: "products",
  categories: "categories",
  orders: "orders",
  customers: "customers",
  inventory: "inventory",
  cart: "cart"
} as const;

export const PRODUCT_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price low to high" },
  { value: "price_desc", label: "Price high to low" },
  { value: "az", label: "Alphabetical A-Z" },
  { value: "za", label: "Alphabetical Z-A" }
] as const;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned"
] as const;

export const PAYMENT_STATUSES = ["pending", "paid", "cancelled", "refunded"] as const;

export const FULFILLMENT_STATUSES = [
  "unfulfilled",
  "processing",
  "shipped",
  "delivered",
  "returned"
] as const;

export const FALLBACK_PRODUCT_IMAGE = "/images/1.png";

export const HERO_IMAGE = "/images/4.png";

export const PAGE_BANNER_IMAGE = "/images/lady-2.png";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
