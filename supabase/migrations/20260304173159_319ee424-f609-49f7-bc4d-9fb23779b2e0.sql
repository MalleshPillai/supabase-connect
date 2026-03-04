
-- Create app_role enum
create type public.app_role as enum ('admin', 'user');

-- User roles table (created first so has_role function can reference it)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- Security definer function for role checking
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- RLS for user_roles
create policy "Users can view own roles" on public.user_roles for select using (auth.uid() = user_id);
create policy "Admins can manage all roles" on public.user_roles for all using (public.has_role(auth.uid(), 'admin'));

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  address text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Services table
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);
alter table public.services enable row level security;

create policy "Anyone can view services" on public.services for select using (true);
create policy "Admins can manage services" on public.services for all using (public.has_role(auth.uid(), 'admin'));

-- Pricing table
create table public.pricing (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  value numeric not null default 0,
  updated_at timestamptz default now()
);
alter table public.pricing enable row level security;

create policy "Anyone can view pricing" on public.pricing for select using (true);
create policy "Admins can manage pricing" on public.pricing for all using (public.has_role(auth.uid(), 'admin'));

-- Orders table
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id),
  service_slug text not null,
  file_url text,
  file_name text,
  print_all_pages boolean default true,
  page_range text,
  num_pages int not null default 1,
  num_copies int not null default 1,
  color_mode text not null default 'bw',
  first_page_color boolean default false,
  first_page_photo_sheet boolean default false,
  glass_white_sheet boolean default false,
  spiral_color text,
  page_color text,
  full_name text not null,
  phone text not null,
  email text not null,
  delivery_address text not null,
  preferred_timing text,
  subtotal numeric not null default 0,
  binding_charges numeric default 0,
  special_charges numeric default 0,
  total_amount numeric not null default 0,
  status text not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.orders enable row level security;

create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Authenticated users can insert orders" on public.orders for insert to authenticated with check (auth.uid() = user_id);
create policy "Admins can view all orders" on public.orders for select using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update orders" on public.orders for update using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete orders" on public.orders for delete using (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for order files
insert into storage.buckets (id, name, public) values ('order-files', 'order-files', false);

create policy "Auth users can upload order files" on storage.objects for insert to authenticated with check (bucket_id = 'order-files');
create policy "Auth users can view order files" on storage.objects for select to authenticated using (bucket_id = 'order-files');
create policy "Admins can view all order files" on storage.objects for select using (bucket_id = 'order-files' and public.has_role(auth.uid(), 'admin'));

-- Generate order number function
create or replace function public.generate_order_number()
returns text
language plpgsql
as $$
begin
  return 'PSH-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
end;
$$;

-- Seed services
insert into public.services (name, slug, description, icon, sort_order) values
  ('Paper Projects', 'paper-projects', 'Custom paper projects for all your academic and professional needs', 'FileText', 1),
  ('A4 Sheet Print', 'a4-sheet-print', 'High-quality A4 sheet printing services', 'Printer', 2),
  ('Normal Xerox', 'normal-xerox', 'Quick and affordable xerox copy services', 'Copy', 3),
  ('Black & White Print', 'bw-print', 'Crisp and clear black & white printing', 'FileText', 4),
  ('Hard Binding', 'hard-binding', 'Professional hard binding for documents and books', 'BookOpen', 5),
  ('Soft Binding', 'soft-binding', 'Elegant and affordable soft binding solutions', 'Book', 6),
  ('Book Binding', 'book-binding', 'Traditional book binding for lasting quality', 'BookOpen', 7),
  ('Spiral Binding', 'spiral-binding', 'Durable and flexible spiral binding', 'Disc', 8),
  ('School Manual', 'school-manual', 'Complete school manual printing and binding', 'GraduationCap', 9),
  ('College Manual', 'college-manual', 'Professional college manual preparation', 'School', 10);

-- Seed pricing
insert into public.pricing (key, label, value) values
  ('price_per_page_bw', 'Price per page (B/W)', 0.90),
  ('price_per_page_color', 'Price per page (Color)', 3.00),
  ('hard_binding', 'Hard Binding Charges', 50.00),
  ('soft_binding', 'Soft Binding Charges', 30.00),
  ('book_binding', 'Book Binding Charges', 60.00),
  ('spiral_binding', 'Spiral Binding Charges', 25.00),
  ('first_page_color', 'First Page Color Charge', 5.00),
  ('photo_sheet', 'Photo Sheet Charge', 10.00),
  ('glass_white_sheet', 'Glass White Sheet Charge', 5.00);
