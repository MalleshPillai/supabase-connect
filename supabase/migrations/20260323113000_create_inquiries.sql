-- Inquiries (contact form submissions)
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  message text not null,
  source text not null default 'contact',
  created_at timestamptz default now()
);

alter table public.inquiries enable row level security;

-- Anyone can submit inquiries (no auth required).
create policy "Public can insert inquiries"
on public.inquiries
for insert
with check (true);

-- Only admins can view inquiries.
create policy "Admins can view inquiries"
on public.inquiries
for select
using (public.has_role(auth.uid(), 'admin'));

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);

