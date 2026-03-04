
create or replace function public.generate_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  return 'PSH-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
end;
$$;
