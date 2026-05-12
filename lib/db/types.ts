import type { StorefrontContent } from "@/lib/storefront";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = "customer" | "admin";
export type ProductStatus = "draft" | "published" | "archived";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";
export type PaymentStatus = "pending" | "paid" | "cancelled" | "refunded";
export type FulfillmentStatus =
  | "unfulfilled"
  | "processing"
  | "shipped"
  | "delivered"
  | "returned";

export type Profile = {
  id: string;
  clerk_user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: AppRole;
  created_at: string;
  updated_at: string;
};

export type Address = {
  id: string;
  profile_id: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type Product = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description_markdown: string | null;
  base_sku: string;
  brand: string | null;
  tags: string[];
  status: ProductStatus;
  is_featured: boolean;
  is_new_arrival: boolean;
  base_price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  seo_title: string | null;
  seo_description: string | null;
  custom_attributes: Json;
  main_image_url: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string;
  color: string;
  size: string;
  price: number | null;
  compare_at_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  variant_id: string | null;
  image_url: string;
  storage_path: string | null;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
};

export type ProductWithRelations = Product & {
  category: Category | null;
  variants: ProductVariant[];
  images: ProductImage[];
};

export type Cart = {
  id: string;
  profile_id: string;
  created_at: string;
  updated_at: string;
};

export type CartItem = {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  unit_price_snapshot: number;
  created_at: string;
  updated_at: string;
};

export type CartLine = CartItem & {
  product: Pick<Product, "id" | "name" | "slug" | "main_image_url" | "base_price">;
  variant: ProductVariant;
  line_total: number;
};

export type CartSnapshot = {
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  total: number;
};

export type Order = {
  id: string;
  order_number: string;
  profile_id: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: Json;
  subtotal_amount: number;
  shipping_amount: number;
  total_amount: number;
  payment_method: "cod";
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  customer_note: string | null;
  admin_note: string | null;
  placed_at: string;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
  delivered_at: string | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name_snapshot: string;
  variant_name_snapshot: string;
  sku_snapshot: string;
  image_url_snapshot: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  created_at: string;
};

export type OrderStatusHistory = {
  id: string;
  order_id: string;
  actor_clerk_user_id: string | null;
  actor_type: "system" | "admin" | "customer";
  from_order_status: OrderStatus | null;
  to_order_status: OrderStatus | null;
  from_payment_status: PaymentStatus | null;
  to_payment_status: PaymentStatus | null;
  from_fulfillment_status: FulfillmentStatus | null;
  to_fulfillment_status: FulfillmentStatus | null;
  note: string | null;
  created_at: string;
};

export type OrderWithItems = Order & {
  items: OrderItem[];
  history: OrderStatusHistory[];
  profile?: Profile | null;
};

export type InventoryMovement = {
  id: string;
  variant_id: string;
  change_amount: number;
  reason: string;
  reference_type: string | null;
  reference_id: string | null;
  actor_clerk_user_id: string | null;
  created_at: string;
};

export type SiteSettings = {
  id: number;
  store_name: string;
  support_email: string;
  contact_phone: string | null;
  currency_code: string;
  currency_symbol: string;
  flat_shipping_charge: number;
  free_shipping_threshold: number | null;
  cod_instructions: string;
  admin_notification_emails: string[];
  default_seo_title: string;
  default_seo_description: string;
  cart_alert_customer_enabled: boolean;
  cart_alert_admin_enabled: boolean;
  homepage_heading: string;
  homepage_subheading: string;
  storefront_content: StorefrontContent;
  created_at: string;
  updated_at: string;
};

export type EmailLog = {
  id: string;
  event_type: string;
  order_id: string | null;
  profile_id: string | null;
  recipient_email: string;
  subject: string;
  status: "sent" | "failed" | "skipped";
  provider: string;
  provider_message_id: string | null;
  payload_summary: Json;
  error_message: string | null;
  created_at: string;
};

export type SearchProductRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  base_price: number;
  compare_at_price: number | null;
  main_image_url: string | null;
  brand: string | null;
  tags: string[];
  is_featured: boolean;
  is_new_arrival: boolean;
  category_slug: string;
  category_name: string;
  min_price: number;
  total_stock: number;
  created_at: string;
  total_count: number;
};

export type AdminDashboardStats = {
  totalOrders: number;
  paidRevenue: number;
  pendingCodOrders: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockVariants: Array<ProductVariant & { product_name: string }>;
  recentOrders: Order[];
};
