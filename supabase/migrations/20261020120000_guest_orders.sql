-- Guest orders: customers no longer create accounts / sign in.
-- Login is Admin-only, so print orders (Xerox and Prints) must be placeable
-- by anonymous visitors.
--
-- IMPORTANT — DEPLOY ORDER:
--   Apply this migration to Supabase BEFORE (or together with) deploying the
--   frontend build that removes the customer sign-in step from /order/:slug.
--   If the new frontend is deployed first, guest order inserts/uploads will
--   be rejected by the old RLS policies until this migration is applied.
--
-- What this does:
--   1. Allows INSERT on public.orders when user_id IS NULL (guest order).
--      Signed-in users keep the existing "Authenticated users can insert
--      orders" policy (auth.uid() = user_id). Admin policies are unchanged.
--   2. Allows anonymous uploads to the private `order-files` bucket ONLY
--      under the `guest/` prefix (the frontend uploads guest files to
--      `guest/...`). Signed-in uploads keep the existing policy.
--   Reads are NOT opened up: guests cannot list/read order files or orders.
--   Admins keep full access via the existing admin policies.
--
-- Note: PostgreSQL does not support CREATE POLICY IF NOT EXISTS, so each
-- policy is created conditionally (same pattern as earlier migrations).

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'Guests can insert orders'
  ) then
    create policy "Guests can insert orders"
    on public.orders
    for insert
    with check (user_id is null);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Guests can upload order files'
  ) then
    create policy "Guests can upload order files"
    on storage.objects
    for insert
    with check (
      bucket_id = 'order-files'
      and (storage.foldername(name))[1] = 'guest'
    );
  end if;
end $$;
