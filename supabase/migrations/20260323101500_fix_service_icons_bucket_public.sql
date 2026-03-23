-- Ensure service icons are truly public for publicUrl usage
insert into storage.buckets (id, name, public)
values ('service-icons', 'service-icons', true)
on conflict (id) do nothing;

update storage.buckets
set public = true
where id = 'service-icons';

