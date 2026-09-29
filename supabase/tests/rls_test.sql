-- Security tests for the row-level policies.
--
-- Run against a scratch database that has 0001 and 0002 applied. The seed is
-- optional: every assertion is scoped to this file's own fixture rows, so the
-- result does not change with whatever else is in the tables.
--
--   createdb rbx_test
--   psql -d rbx_test -f supabase/migrations/0001_schema.sql
--   psql -d rbx_test -f supabase/migrations/0002_policies.sql
--   psql -d rbx_test -f supabase/tests/rls_test.sql
--
-- Every block asserts a property that, if it broke, would leak customer data.
-- Any failure raises an exception and aborts.

\set ON_ERROR_STOP on

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

-- ---------------------------------------------------------------- fixtures

insert into auth.users (id, phone) values
  ('11111111-1111-1111-1111-111111111111', '+263771111111'), -- customer A
  ('22222222-2222-2222-2222-222222222222', '+263772222222'), -- customer B
  ('33333333-3333-3333-3333-333333333333', '+263773333333'), -- transporter (verified)
  ('44444444-4444-4444-4444-444444444444', '+263774444444'), -- transporter (pending)
  ('55555555-5555-5555-5555-555555555555', '+263775555555'); -- admin

update profiles set role = 'admin'
  where id = '55555555-5555-5555-5555-555555555555';
update profiles set role = 'transporter'
  where id in ('33333333-3333-3333-3333-333333333333',
               '44444444-4444-4444-4444-444444444444');

insert into transporters (id, display_name, vehicle, status) values
  ('33333333-3333-3333-3333-333333333333', 'Verified Vee', 'bakkie', 'verified'),
  ('44444444-4444-4444-4444-444444444444', 'Pending Pete', 'car', 'pending');

insert into transporter_earnings (id, total) values
  ('33333333-3333-3333-3333-333333333333', 4200);

insert into dark_stores (id, name, area) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'RushBox Msasa', 'Msasa');

insert into categories (slug, name) values ('rls-test-cat', 'RLS Test Category')
  on conflict (slug) do nothing;

insert into products (id, name, category, price, store_id, stock) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'RLS Test Tomatoes', 'rls-test-cat', 1.20,
   'aaaaaaaa-0000-0000-0000-000000000001', 40);

insert into orders (id, user_id, store_id, address, total) values
  ('cccccccc-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111',
   'aaaaaaaa-0000-0000-0000-000000000001', '14 Fife Ave', 12.40);

insert into move_jobs (id, customer_id, type, pickup, dropoff, vehicle, offer) values
  ('dddddddd-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111',
   'cargo', 'Msasa', 'Subway City', 'bakkie', 18);

insert into bids (id, job_id, transporter_id, price) values
  ('eeeeeeee-0000-0000-0000-000000000001',
   'dddddddd-0000-0000-0000-000000000001',
   '33333333-3333-3333-3333-333333333333', 20);

insert into wallet_transactions (user_id, label, amount) values
  ('11111111-1111-1111-1111-111111111111', 'Top up', 100);

-- ---------------------------------------------------------------- helper

create or replace function assert(ok boolean, what text)
returns void language plpgsql as $$
begin
  if not ok then raise exception 'FAILED: %', what; end if;
  raise notice 'ok: %', what;
end;
$$;

-- is_local = false: psql commits each statement, so a transaction-local
-- setting would be gone before the next query runs.
create or replace function act_as(who uuid)
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', who::text, false);
end;
$$;

-- ---------------------------------------------------------------- tests

set role authenticated;

-- Customer A sees their own order; customer B must not.
select act_as('11111111-1111-1111-1111-111111111111');
select assert((select count(*) from orders where id = 'cccccccc-0000-0000-0000-000000000001') = 1, 'customer sees own order');

select act_as('22222222-2222-2222-2222-222222222222');
select assert((select count(*) from orders where id = 'cccccccc-0000-0000-0000-000000000001') = 0,
              'customer CANNOT see another customer''s order');

select assert((select count(*) from wallet_transactions where user_id = '11111111-1111-1111-1111-111111111111') = 0,
              'customer CANNOT see another customer''s wallet');

-- Privilege escalation: writing role = admin must be silently reverted.
select act_as('22222222-2222-2222-2222-222222222222');
update profiles set role = 'admin' where id = '22222222-2222-2222-2222-222222222222';
reset role;
select assert(
  (select role from profiles where id = '22222222-2222-2222-2222-222222222222') = 'customer',
  'customer CANNOT escalate their own role to admin');
set role authenticated;

-- Bids: the customer who posted the job sees them, rival transporters do not.
select act_as('11111111-1111-1111-1111-111111111111');
select assert((select count(*) from bids where job_id = 'dddddddd-0000-0000-0000-000000000001') = 1, 'job owner sees bids on their job');

select act_as('44444444-4444-4444-4444-444444444444');
select assert((select count(*) from bids where job_id = 'dddddddd-0000-0000-0000-000000000001') = 0,
              'transporter CANNOT see a rival''s bid');

-- An unverified transporter must not be able to bid at all.
select act_as('44444444-4444-4444-4444-444444444444');
do $$
begin
  insert into bids (job_id, transporter_id, price)
  values ('dddddddd-0000-0000-0000-000000000001',
          '44444444-4444-4444-4444-444444444444', 15);
  raise exception 'FAILED: unverified transporter WAS able to bid';
exception
  when insufficient_privilege then
    raise notice 'ok: unverified transporter cannot bid';
end;
$$;

-- A transporter cannot bid on someone else's behalf.
select act_as('33333333-3333-3333-3333-333333333333');
do $$
begin
  insert into bids (job_id, transporter_id, price)
  values ('dddddddd-0000-0000-0000-000000000001',
          '44444444-4444-4444-4444-444444444444', 15);
  raise exception 'FAILED: transporter WAS able to bid as someone else';
exception
  when insufficient_privilege then
    raise notice 'ok: transporter cannot bid as another transporter';
end;
$$;

-- Verified transporters see the open marketplace.
select act_as('33333333-3333-3333-3333-333333333333');
select assert((select count(*) from move_jobs where id = 'dddddddd-0000-0000-0000-000000000001') = 1,
              'verified transporter sees open jobs');

-- Earnings are never public, even for a verified transporter's own row.
select act_as('22222222-2222-2222-2222-222222222222');
select assert((select count(*) from transporter_earnings where id = '33333333-3333-3333-3333-333333333333') = 0,
              'earnings are NOT readable by other users');

select act_as('33333333-3333-3333-3333-333333333333');
select assert((select count(*) from transporter_earnings where id = '33333333-3333-3333-3333-333333333333') = 1,
              'transporter sees their own earnings');

-- Admin sees everything.
select act_as('55555555-5555-5555-5555-555555555555');
select assert((select count(*) from orders where id = 'cccccccc-0000-0000-0000-000000000001') = 1, 'admin sees all orders');
select assert(
  (select count(*) from profiles where id in (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555')) = 5,
  'admin sees all profiles');

-- Anonymous visitors browse the catalogue but reach no customer data.
reset role;
set role anon;
select set_config('request.jwt.claim.sub', '', false);
select assert((select count(*) from products where id = 'bbbbbbbb-0000-0000-0000-000000000001') = 1, 'anon can browse products');
select assert((select count(*) from orders where id = 'cccccccc-0000-0000-0000-000000000001') = 0, 'anon CANNOT read orders');
select assert((select count(*) from profiles where id = '11111111-1111-1111-1111-111111111111') = 0, 'anon CANNOT read profiles');
select assert((select count(*) from move_jobs where id = 'dddddddd-0000-0000-0000-000000000001') = 0, 'anon CANNOT read jobs');
select assert((select count(*) from wallet_transactions where user_id = '11111111-1111-1111-1111-111111111111') = 0,
              'anon CANNOT read the wallet ledger');

reset role;
select 'ALL RLS TESTS PASSED' as result;
