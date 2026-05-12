insert into public.site_settings (
  id,
  store_name,
  support_email,
  contact_phone,
  currency_code,
  currency_symbol,
  flat_shipping_charge,
  free_shipping_threshold,
  cod_instructions,
  admin_notification_emails,
  default_seo_title,
  default_seo_description,
  cart_alert_customer_enabled,
  cart_alert_admin_enabled,
  homepage_heading,
  homepage_subheading
)
values (
  1,
  'Veloure',
  'support@veloure.example',
  '+1 555 0184',
  'USD',
  '$',
  7.00,
  150.00,
  'Cash on delivery is available for every Veloure order. Keep the exact amount ready; our concierge team will call before dispatch.',
  '{}',
  'Veloure - Luxury Fashion and Lifestyle',
  'Discover polished fashion, home, and lifestyle pieces from Veloure.',
  true,
  true,
  'Elevate Your Everyday Rituals',
  'Fashion-forward lifestyle pieces with quiet texture, warm neutrals, and polished silhouettes.'
)
on conflict (id) do update set
  store_name = excluded.store_name,
  support_email = excluded.support_email,
  contact_phone = excluded.contact_phone,
  currency_code = excluded.currency_code,
  currency_symbol = excluded.currency_symbol,
  flat_shipping_charge = excluded.flat_shipping_charge,
  free_shipping_threshold = excluded.free_shipping_threshold,
  cod_instructions = excluded.cod_instructions,
  default_seo_title = excluded.default_seo_title,
  default_seo_description = excluded.default_seo_description,
  cart_alert_customer_enabled = excluded.cart_alert_customer_enabled,
  cart_alert_admin_enabled = excluded.cart_alert_admin_enabled,
  homepage_heading = excluded.homepage_heading,
  homepage_subheading = excluded.homepage_subheading;

insert into public.categories (name, slug, description, sort_order, is_active, seo_title, seo_description)
values
  ('Atelier Seating', 'atelier-seating', 'Sculptural seating and refined lounge silhouettes.', 10, true, 'Atelier Seating by Veloure', 'Shop refined chairs, benches, and lounge silhouettes.'),
  ('Textural Living', 'textural-living', 'Quiet home pieces with tactile surfaces and clean lines.', 20, true, 'Textural Living by Veloure', 'Discover warm, minimal lifestyle objects for considered spaces.'),
  ('Essentials', 'essentials', 'Everyday fashion and lifestyle foundations.', 30, true, 'Veloure Essentials', 'Build a thoughtful wardrobe and home with Veloure essentials.')
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-media',
  'product-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view product media" on storage.objects;
create policy "Public can view product media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-media');
