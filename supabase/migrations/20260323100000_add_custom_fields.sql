-- Dynamic custom fields for services

alter table public.services
add column if not exists custom_fields jsonb not null default '[]'::jsonb;

-- Store submitted custom field values per order
alter table public.orders
add column if not exists custom_field_values jsonb not null default '{}'::jsonb;

