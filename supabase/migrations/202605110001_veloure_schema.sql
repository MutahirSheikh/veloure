create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('customer', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.product_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_status as enum ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'paid', 'cancelled', 'refunded');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.fulfillment_status as enum ('unfulfilled', 'processing', 'shipped', 'delivered', 'returned');
exception when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  email text not null unique,
  full_name text,
  avatar_url text,
  phone text,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint categories_parent_not_self check (parent_id is null or parent_id <> id)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  short_description text,
  description_markdown text,
  base_sku text not null unique,
  brand text,
  tags text[] not null default '{}',
  status public.product_status not null default 'draft',
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  base_price numeric(12,2) not null,
  compare_at_price numeric(12,2),
  cost_price numeric(12,2),
  seo_title text,
  seo_description text,
  custom_attributes jsonb not null default '{}'::jsonb,
  main_image_url text,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint products_base_price_nonnegative check (base_price >= 0),
  constraint products_compare_price_nonnegative check (compare_at_price is null or compare_at_price >= 0),
  constraint products_cost_price_nonnegative check (cost_price is null or cost_price >= 0)
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  color text not null,
  size text not null,
  price numeric(12,2),
  compare_at_price numeric(12,2),
  stock_quantity integer not null default 0,
  low_stock_threshold integer not null default 5,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_unique_option unique (product_id, color, size),
  constraint product_variants_price_nonnegative check (price is null or price >= 0),
  constraint product_variants_compare_price_nonnegative check (compare_at_price is null or compare_at_price >= 0),
  constraint product_variants_stock_nonnegative check (stock_quantity >= 0),
  constraint product_variants_low_stock_nonnegative check (low_stock_threshold >= 0)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  image_url text not null,
  storage_path text,
  alt_text text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null,
  unit_price_snapshot numeric(12,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_items_quantity_positive check (quantity > 0),
  constraint cart_items_unit_price_nonnegative check (unit_price_snapshot >= 0),
  constraint cart_items_unique_variant unique (cart_id, variant_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  profile_id uuid references public.profiles(id) on delete set null,
  customer_email text not null,
  customer_name text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  subtotal_amount numeric(12,2) not null,
  shipping_amount numeric(12,2) not null,
  total_amount numeric(12,2) not null,
  payment_method text not null default 'cod',
  order_status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  fulfillment_status public.fulfillment_status not null default 'unfulfilled',
  customer_note text,
  admin_note text,
  placed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,
  delivered_at timestamptz,
  constraint orders_payment_method_cod check (payment_method = 'cod'),
  constraint orders_amounts_nonnegative check (subtotal_amount >= 0 and shipping_amount >= 0 and total_amount >= 0)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name_snapshot text not null,
  variant_name_snapshot text not null,
  sku_snapshot text not null,
  image_url_snapshot text,
  unit_price numeric(12,2) not null,
  quantity integer not null,
  line_total numeric(12,2) not null,
  created_at timestamptz not null default now(),
  constraint order_items_unit_price_nonnegative check (unit_price >= 0),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_line_total_nonnegative check (line_total >= 0)
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  actor_clerk_user_id text,
  actor_type text not null default 'system',
  from_order_status public.order_status,
  to_order_status public.order_status,
  from_payment_status public.payment_status,
  to_payment_status public.payment_status,
  from_fulfillment_status public.fulfillment_status,
  to_fulfillment_status public.fulfillment_status,
  note text,
  created_at timestamptz not null default now(),
  constraint order_status_history_actor_type check (actor_type in ('system', 'admin', 'customer'))
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  change_amount integer not null,
  reason text not null,
  reference_type text,
  reference_id uuid,
  actor_clerk_user_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id integer primary key default 1,
  store_name text not null default 'Veloure',
  support_email text not null default 'support@example.com',
  contact_phone text,
  currency_code text not null default 'USD',
  currency_symbol text not null default '$',
  flat_shipping_charge numeric(12,2) not null default 7.00,
  free_shipping_threshold numeric(12,2),
  cod_instructions text not null default 'Pay with cash when your Veloure order arrives. Our team will confirm your order before dispatch.',
  admin_notification_emails text[] not null default '{}',
  default_seo_title text not null default 'Veloure - Luxury Fashion and Lifestyle',
  default_seo_description text not null default 'Shop refined fashion and lifestyle pieces from Veloure.',
  cart_alert_customer_enabled boolean not null default true,
  cart_alert_admin_enabled boolean not null default true,
  homepage_heading text not null default 'Elevate Your Everyday Rituals',
  homepage_subheading text not null default 'Minimal, tactile pieces for a more considered home and wardrobe.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1),
  constraint site_settings_shipping_nonnegative check (flat_shipping_charge >= 0),
  constraint site_settings_free_shipping_nonnegative check (free_shipping_threshold is null or free_shipping_threshold >= 0)
);

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  order_id uuid references public.orders(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  recipient_email text not null,
  subject text not null,
  status text not null,
  provider text not null default 'resend',
  provider_message_id text,
  payload_summary jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  constraint email_logs_status check (status in ('sent', 'failed', 'skipped'))
);

create table if not exists public.checkout_idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  idempotency_key text not null,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint checkout_idempotency_unique unique (profile_id, idempotency_key)
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_clerk_user_id text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.refresh_product_search_vector()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.short_description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.description_markdown, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.base_sku, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.tags, ' '), '')), 'B');
  return new;
end;
$$;

drop trigger if exists trg_products_search_vector on public.products;
create trigger trg_products_search_vector
before insert or update on public.products
for each row execute function public.refresh_product_search_vector();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists trg_addresses_updated_at on public.addresses;
create trigger trg_addresses_updated_at before update on public.addresses for each row execute function public.set_updated_at();
drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists trg_product_variants_updated_at on public.product_variants;
create trigger trg_product_variants_updated_at before update on public.product_variants for each row execute function public.set_updated_at();
drop trigger if exists trg_carts_updated_at on public.carts;
create trigger trg_carts_updated_at before update on public.carts for each row execute function public.set_updated_at();
drop trigger if exists trg_cart_items_updated_at on public.cart_items;
create trigger trg_cart_items_updated_at before update on public.cart_items for each row execute function public.set_updated_at();
drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

create index if not exists idx_profiles_clerk_user_id on public.profiles(clerk_user_id);
create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_categories_parent_id on public.categories(parent_id);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_featured on public.products(is_featured) where status = 'published';
create index if not exists idx_products_new_arrival on public.products(is_new_arrival) where status = 'published';
create index if not exists idx_products_search_vector on public.products using gin(search_vector);
create index if not exists idx_product_variants_sku on public.product_variants(sku);
create index if not exists idx_product_variants_product_id on public.product_variants(product_id);
create index if not exists idx_orders_order_number on public.orders(order_number);
create index if not exists idx_orders_profile_id on public.orders(profile_id);
create index if not exists idx_orders_placed_at on public.orders(placed_at desc);
create index if not exists idx_orders_statuses on public.orders(order_status, payment_status, fulfillment_status);
create index if not exists idx_email_logs_event_profile_created on public.email_logs(event_type, profile_id, created_at desc);

create or replace function public.search_products(
  p_query text default null,
  p_category_slug text default null,
  p_color text default null,
  p_size text default null,
  p_min_price numeric default null,
  p_max_price numeric default null,
  p_in_stock boolean default null,
  p_featured boolean default null,
  p_new_arrival boolean default null,
  p_sort text default 'newest',
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (
  id uuid,
  slug text,
  name text,
  short_description text,
  base_price numeric,
  compare_at_price numeric,
  main_image_url text,
  brand text,
  tags text[],
  is_featured boolean,
  is_new_arrival boolean,
  category_slug text,
  category_name text,
  min_price numeric,
  total_stock integer,
  created_at timestamptz,
  total_count bigint
)
language plpgsql
stable
as $$
begin
  return query
  with variant_rollup as (
    select
      pv.product_id,
      min(coalesce(pv.price, p.base_price)) as min_price,
      coalesce(sum(case when pv.is_active then pv.stock_quantity else 0 end), 0)::integer as total_stock
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    group by pv.product_id
  ),
  filtered as (
    select
      p.id,
      p.slug,
      p.name,
      p.short_description,
      p.base_price,
      p.compare_at_price,
      p.main_image_url,
      p.brand,
      p.tags,
      p.is_featured,
      p.is_new_arrival,
      c.slug as category_slug,
      c.name as category_name,
      coalesce(vr.min_price, p.base_price) as min_price,
      coalesce(vr.total_stock, 0) as total_stock,
      p.created_at
    from public.products p
    join public.categories c on c.id = p.category_id
    left join public.categories pc on pc.id = c.parent_id
    left join variant_rollup vr on vr.product_id = p.id
    where p.status = 'published'
      and p.archived_at is null
      and c.archived_at is null
      and c.is_active = true
      and (p_category_slug is null or c.slug = p_category_slug or pc.slug = p_category_slug)
      and (p_featured is null or p.is_featured = p_featured)
      and (p_new_arrival is null or p.is_new_arrival = p_new_arrival)
      and (
        p_in_stock is null
        or (p_in_stock = true and coalesce(vr.total_stock, 0) > 0)
        or (p_in_stock = false and coalesce(vr.total_stock, 0) = 0)
      )
      and (p_min_price is null or coalesce(vr.min_price, p.base_price) >= p_min_price)
      and (p_max_price is null or coalesce(vr.min_price, p.base_price) <= p_max_price)
      and (
        p_color is null
        or exists (
          select 1 from public.product_variants pv
          where pv.product_id = p.id and pv.is_active = true and lower(pv.color) = lower(p_color)
        )
      )
      and (
        p_size is null
        or exists (
          select 1 from public.product_variants pv
          where pv.product_id = p.id and pv.is_active = true and lower(pv.size) = lower(p_size)
        )
      )
      and (
        nullif(trim(coalesce(p_query, '')), '') is null
        or p.search_vector @@ websearch_to_tsquery('english', p_query)
        or lower(c.name) like '%' || lower(p_query) || '%'
        or lower(coalesce(pc.name, '')) like '%' || lower(p_query) || '%'
        or exists (
          select 1 from public.product_variants pv
          where pv.product_id = p.id
            and (
              lower(pv.sku) like '%' || lower(p_query) || '%'
              or lower(pv.color) like '%' || lower(p_query) || '%'
              or lower(pv.size) like '%' || lower(p_query) || '%'
            )
        )
      )
  )
  select
    filtered.*,
    count(*) over() as total_count
  from filtered
  order by
    case when p_sort = 'price_asc' then filtered.min_price end asc nulls last,
    case when p_sort = 'price_desc' then filtered.min_price end desc nulls last,
    case when p_sort = 'az' then filtered.name end asc nulls last,
    case when p_sort = 'za' then filtered.name end desc nulls last,
    filtered.created_at desc
  limit greatest(1, least(coalesce(p_limit, 24), 60))
  offset greatest(0, coalesce(p_offset, 0));
end;
$$;

create or replace function public.place_cod_order(
  p_profile_id uuid,
  p_idempotency_key text,
  p_customer_email text,
  p_customer_name text,
  p_customer_phone text,
  p_shipping_address jsonb,
  p_customer_note text default null
)
returns table(order_id uuid, order_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key_id uuid;
  v_existing_order_id uuid;
  v_existing_order_number text;
  v_cart_id uuid;
  v_item record;
  v_settings public.site_settings%rowtype;
  v_subtotal numeric(12,2) := 0;
  v_shipping numeric(12,2) := 0;
  v_total numeric(12,2) := 0;
  v_order_id uuid := gen_random_uuid();
  v_order_number text;
  v_line_count integer := 0;
begin
  if nullif(trim(p_idempotency_key), '') is null then
    raise exception 'A checkout idempotency key is required.';
  end if;

  insert into public.checkout_idempotency_keys(profile_id, idempotency_key)
  values (p_profile_id, p_idempotency_key)
  on conflict (profile_id, idempotency_key) do nothing
  returning id into v_key_id;

  if v_key_id is null then
    select cik.order_id, o.order_number
      into v_existing_order_id, v_existing_order_number
    from public.checkout_idempotency_keys cik
    left join public.orders o on o.id = cik.order_id
    where cik.profile_id = p_profile_id and cik.idempotency_key = p_idempotency_key;

    if v_existing_order_id is not null then
      order_id := v_existing_order_id;
      order_number := v_existing_order_number;
      return next;
      return;
    end if;

    raise exception 'Checkout is already being processed.';
  end if;

  select * into v_settings from public.site_settings where id = 1;
  if not found then
    raise exception 'Site settings are not configured.';
  end if;

  select id into v_cart_id from public.carts where profile_id = p_profile_id for update;
  if v_cart_id is null then
    raise exception 'Your cart is empty.';
  end if;

  for v_item in
    select
      ci.quantity,
      p.id as product_id,
      p.name as product_name,
      p.status as product_status,
      p.main_image_url,
      pv.id as variant_id,
      pv.sku,
      pv.color,
      pv.size,
      pv.price,
      pv.compare_at_price,
      pv.stock_quantity,
      pv.is_active,
      coalesce(pv.price, p.base_price) as resolved_price
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    join public.product_variants pv on pv.id = ci.variant_id
    where ci.cart_id = v_cart_id
    order by ci.created_at
    for update of pv
  loop
    v_line_count := v_line_count + 1;

    if v_item.product_status <> 'published' or v_item.is_active is distinct from true then
      raise exception 'An item in your cart is no longer available.';
    end if;

    if v_item.stock_quantity < v_item.quantity then
      raise exception 'Insufficient stock for %.', v_item.product_name;
    end if;

    v_subtotal := v_subtotal + (v_item.resolved_price * v_item.quantity);
  end loop;

  if v_line_count = 0 then
    raise exception 'Your cart is empty.';
  end if;

  v_shipping := case
    when v_settings.free_shipping_threshold is not null and v_subtotal >= v_settings.free_shipping_threshold then 0
    else v_settings.flat_shipping_charge
  end;
  v_total := v_subtotal + v_shipping;
  v_order_number := 'VEL-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.orders(
    id,
    order_number,
    profile_id,
    customer_email,
    customer_name,
    customer_phone,
    shipping_address,
    subtotal_amount,
    shipping_amount,
    total_amount,
    payment_method,
    order_status,
    payment_status,
    fulfillment_status,
    customer_note
  )
  values (
    v_order_id,
    v_order_number,
    p_profile_id,
    p_customer_email,
    p_customer_name,
    p_customer_phone,
    p_shipping_address,
    v_subtotal,
    v_shipping,
    v_total,
    'cod',
    'pending',
    'pending',
    'unfulfilled',
    nullif(trim(coalesce(p_customer_note, '')), '')
  );

  for v_item in
    select
      ci.quantity,
      p.id as product_id,
      p.name as product_name,
      p.main_image_url,
      pv.id as variant_id,
      pv.sku,
      pv.color,
      pv.size,
      coalesce(pv.image_url, p.main_image_url) as image_url,
      coalesce(pv.price, p.base_price) as resolved_price
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    join public.product_variants pv on pv.id = ci.variant_id
    where ci.cart_id = v_cart_id
    order by ci.created_at
  loop
    insert into public.order_items(
      order_id,
      product_id,
      variant_id,
      product_name_snapshot,
      variant_name_snapshot,
      sku_snapshot,
      image_url_snapshot,
      unit_price,
      quantity,
      line_total
    )
    values (
      v_order_id,
      v_item.product_id,
      v_item.variant_id,
      v_item.product_name,
      trim(v_item.color || ' / ' || v_item.size),
      v_item.sku,
      v_item.image_url,
      v_item.resolved_price,
      v_item.quantity,
      v_item.resolved_price * v_item.quantity
    );

    update public.product_variants
    set stock_quantity = stock_quantity - v_item.quantity
    where id = v_item.variant_id;

    insert into public.inventory_movements(
      variant_id,
      change_amount,
      reason,
      reference_type,
      reference_id,
      actor_clerk_user_id
    )
    values (
      v_item.variant_id,
      -v_item.quantity,
      'Order placed',
      'order',
      v_order_id,
      null
    );
  end loop;

  insert into public.order_status_history(
    order_id,
    actor_type,
    to_order_status,
    to_payment_status,
    to_fulfillment_status,
    note
  )
  values (
    v_order_id,
    'customer',
    'pending',
    'pending',
    'unfulfilled',
    'Cash-on-delivery order placed.'
  );

  delete from public.cart_items where cart_id = v_cart_id;
  update public.checkout_idempotency_keys set order_id = v_order_id where id = v_key_id;

  order_id := v_order_id;
  order_number := v_order_number;
  return next;
end;
$$;

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.site_settings enable row level security;
alter table public.email_logs enable row level security;
alter table public.checkout_idempotency_keys enable row level security;
alter table public.admin_audit_logs enable row level security;

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories"
on public.categories for select
to anon, authenticated
using (is_active = true and archived_at is null);

drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products"
on public.products for select
to anon, authenticated
using (status = 'published' and archived_at is null);

drop policy if exists "Public can read active variants" on public.product_variants;
create policy "Public can read active variants"
on public.product_variants for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1 from public.products p
    where p.id = product_variants.product_id
      and p.status = 'published'
      and p.archived_at is null
  )
);

drop policy if exists "Public can read product images" on public.product_images;
create policy "Public can read product images"
on public.product_images for select
to anon, authenticated
using (
  exists (
    select 1 from public.products p
    where p.id = product_images.product_id
      and p.status = 'published'
      and p.archived_at is null
  )
);

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings for select
to anon, authenticated
using (id = 1);
