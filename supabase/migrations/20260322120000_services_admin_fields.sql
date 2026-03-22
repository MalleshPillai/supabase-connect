-- Services: category, price; rename is_active -> status, sort_order -> display_order; public icons bucket

alter table public.services add column if not exists category text;
alter table public.services add column if not exists price numeric;

alter table public.services rename column is_active to status;
alter table public.services rename column sort_order to display_order;

update public.services set category = 'Binding' where slug in (
  'hard-binding', 'soft-binding', 'book-binding', 'spiral-binding'
);
update public.services set category = 'Manuals' where slug in ('school-manual', 'college-manual');
update public.services set category = 'Printing' where category is null;

alter table public.services alter column category set default 'Printing';

insert into storage.buckets (id, name, public)
values ('service-icons', 'service-icons', true)
on conflict (id) do nothing;

create policy "Anyone can view service icons"
on storage.objects for select
using (bucket_id = 'service-icons');

create policy "Admins can upload service icons"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'service-icons'
  and public.has_role(auth.uid(), 'admin')
);

create policy "Admins can update service icons"
on storage.objects for update to authenticated
using (
  bucket_id = 'service-icons'
  and public.has_role(auth.uid(), 'admin')
);

create policy "Admins can delete service icons"
on storage.objects for delete to authenticated
using (
  bucket_id = 'service-icons'
  and public.has_role(auth.uid(), 'admin')
);
