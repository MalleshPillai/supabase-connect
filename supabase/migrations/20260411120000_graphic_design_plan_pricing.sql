-- Graphic design weekly / monthly plan prices (admin-editable; public page reads from pricing)
insert into public.pricing (key, label, value) values
  ('gd_weekly_plan_price', 'Graphic design — Weekly plan (price per week)', 0),
  ('gd_monthly_plan_price', 'Graphic design — Monthly plan (price per month)', 0)
on conflict (key) do nothing;
