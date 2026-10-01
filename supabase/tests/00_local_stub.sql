-- Minimal stand-in for the pieces Supabase provides, so the migrations and the
-- RLS suite can be run against a plain local Postgres.
--
--   createdb rbx_test
--   psql -d rbx_test -f supabase/tests/00_local_stub.sql
--   psql -d rbx_test -f supabase/migrations/0001_schema.sql
--   psql -d rbx_test -f supabase/migrations/0002_policies.sql
--   psql -d rbx_test -f supabase/tests/rls_test.sql
--
-- Never run this against a real Supabase project — it already has all of it.

create schema if not exists auth;

create table if not exists auth.users (
  id                 uuid primary key default gen_random_uuid(),
  phone              text,
  email              text,
  raw_user_meta_data jsonb default '{}'::jsonb
);

-- Supabase reads the signed-in user's id out of the request JWT. Locally the
-- tests set that claim by hand with set_config().
create or replace function auth.uid() returns uuid
  language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role;
  end if;
end;
$$;
