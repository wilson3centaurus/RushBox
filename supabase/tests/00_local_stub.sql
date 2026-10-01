-- Minimal stand-in for the pieces Supabase provides, so the migrations and the
-- RLS suite can be run against a plain local Postgres.
--
--   createdb rbx_test
--   psql -d rbx_test -f supabase/tests/00_local_stub.sql
--   psql -d rbx_test -f supabase/migrations/0001_schema.sql
--   psql -d rbx_test -f supabase/migrations/0002_policies.sql
--   psql -d rbx_test -f supabase/migrations/0004_accounts_pricing.sql
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

-- Supabase Storage keeps file metadata in storage.objects and enforces access
-- with policies on that table. Just enough of it for the policies in 0004.
create schema if not exists storage;

create table if not exists storage.buckets (
  id                 text primary key,
  name               text not null,
  public             boolean not null default false,
  file_size_limit    bigint,
  allowed_mime_types text[],
  created_at         timestamptz not null default now()
);

create table if not exists storage.objects (
  id         uuid primary key default gen_random_uuid(),
  bucket_id  text references storage.buckets(id),
  name       text not null,
  owner      uuid,
  created_at timestamptz not null default now()
);

alter table storage.objects enable row level security;

-- 'a/b/c.jpg' -> {a,b}, as Supabase's own helper does.
create or replace function storage.foldername(name text) returns text[]
  language sql immutable as $$
  select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1]
$$;

grant usage on schema storage to anon, authenticated;
grant select, insert, update, delete on storage.objects to anon, authenticated;
grant select on storage.buckets to anon, authenticated;
