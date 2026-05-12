alter table public.site_settings
add column if not exists storefront_content jsonb not null default '{}'::jsonb;

update public.site_settings
set storefront_content = coalesce(storefront_content, '{}'::jsonb)
where id = 1;
