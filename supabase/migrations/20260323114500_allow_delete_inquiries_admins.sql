-- Allow admins to delete inquiries (for the Enquiries admin UI)
-- Note: PostgreSQL does not support `CREATE POLICY IF NOT EXISTS`, so we conditionally create it.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'inquiries'
      and policyname = 'Admins can delete inquiries'
  ) then
    create policy "Admins can delete inquiries"
    on public.inquiries
    for delete
    using (public.has_role(auth.uid(), 'admin'));
  end if;
end $$;

