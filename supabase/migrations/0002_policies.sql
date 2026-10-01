-- Row-level security for every table.
--
-- The anon key ships inside the browser bundle — anyone can read it out of
-- devtools. These policies, not the key, are what protect the data. Run this
-- immediately after 0001_schema.sql and never leave a table with RLS disabled.

-- ------------------------------------------------- helpers
--
-- security definer + a pinned search_path: these run with the owner's rights so
-- a policy on `profiles` can read `profiles` without recursing into itself.
--
-- They live in `private`, not `public`, for a reason worth keeping: PostgREST
-- publishes every function in an exposed schema as an RPC endpoint, so in
-- `public` these were callable at /rest/v1/rpc/<name> by anyone holding the
-- anon key — job_customer(uuid) would hand back the owner of any job id,
-- straight past the policy meant to guard it.
--
-- Revoking EXECUTE is NOT the fix: RLS expressions are evaluated as the
-- querying role, so taking EXECUTE away from anon/authenticated makes every
-- policy that calls them fail and takes the app down. Moving them out of the
-- exposed schema closes the endpoints while leaving the grants intact.

create function private.current_role_name()
returns user_role language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create function private.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from profiles where id = auth.uid()), false)
$$;

create function private.my_store()
returns uuid language sql stable security definer set search_path = public as $$
  select store_id from profiles where id = auth.uid()
$$;

create function private.is_verified_transporter()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select status = 'verified' from transporters where id = auth.uid()), false)
$$;

-- `bids` and `move_jobs` each need to consult the other, which Postgres rejects
-- as infinite recursion if the policies query the tables directly. These read
-- the rows with the owner's rights, so no policy is re-entered.

create function private.job_customer(job uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select customer_id from move_jobs where id = job
$$;

create function private.job_is_open(job uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select status = 'collecting_bids' from move_jobs where id = job), false)
$$;

create function private.is_assigned_transporter(job uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from move_jobs j
    join bids b on b.id = j.accepted_bid_id
    where j.id = job and b.transporter_id = auth.uid()
  )
$$;

-- Needs private.is_admin(), so it is attached here rather than in 0001.
create trigger profiles_guard_role
  before update on profiles
  for each row execute function private.guard_role_change();

alter table profiles             enable row level security;
alter table dark_stores          enable row level security;
alter table categories           enable row level security;
alter table products             enable row level security;
alter table addresses            enable row level security;
alter table orders               enable row level security;
alter table order_items          enable row level security;
alter table transporters         enable row level security;
alter table transporter_earnings enable row level security;
alter table move_jobs            enable row level security;
alter table job_items            enable row level security;
alter table bids                 enable row level security;
alter table wallet_transactions  enable row level security;
alter table disputes             enable row level security;

-- ------------------------------------------------- profiles

create policy profiles_read_own on profiles
  for select using (id = auth.uid() or private.is_admin());

create policy profiles_update_own on profiles
  for update using (id = auth.uid() or private.is_admin());

-- ------------------------------------------------- catalogue (public read)

create policy stores_read on dark_stores
  for select using (true);

create policy stores_write on dark_stores
  for all using (private.is_admin()) with check (private.is_admin());

create policy categories_read on categories
  for select using (true);

create policy categories_write on categories
  for all using (private.is_admin()) with check (private.is_admin());

create policy products_read on products
  for select using (active or private.is_admin() or store_id = private.my_store());

-- Ops staff maintain stock for their own store; admins for any store.
create policy products_write on products
  for all
  using (private.is_admin() or store_id = private.my_store())
  with check (private.is_admin() or store_id = private.my_store());

-- ------------------------------------------------- addresses

create policy addresses_own on addresses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ------------------------------------------------- orders

create policy orders_read on orders
  for select using (
    user_id = auth.uid()
    or rider_id = auth.uid()
    or store_id = private.my_store()
    or private.is_admin()
  );

create policy orders_insert on orders
  for insert with check (user_id = auth.uid());

-- Customers do not move their own order through the pipeline; staff do.
create policy orders_update on orders
  for update using (
    rider_id = auth.uid() or store_id = private.my_store() or private.is_admin()
  );

create policy order_items_read on order_items
  for select using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or o.rider_id = auth.uid()
             or o.store_id = private.my_store() or private.is_admin())
    )
  );

create policy order_items_insert on order_items
  for insert with check (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- ------------------------------------------------- transporters

-- Verified transporters are publicly listed so customers can weigh up bids.
create policy transporters_read on transporters
  for select using (status = 'verified' or id = auth.uid() or private.is_admin());

create policy transporters_insert on transporters
  for insert with check (id = auth.uid());

create policy transporters_update_own on transporters
  for update using (id = auth.uid() or private.is_admin());

create policy earnings_read on transporter_earnings
  for select using (id = auth.uid() or private.is_admin());

-- Balances move through server-side logic under the service role, never the
-- browser, so there is deliberately no insert or update policy here.

-- ------------------------------------------------- move jobs

create policy jobs_read on move_jobs
  for select using (
    customer_id = auth.uid()
    or private.is_admin()
    -- The open marketplace: verified transporters see jobs taking bids.
    or (status = 'collecting_bids' and private.is_verified_transporter())
    -- Once assigned, only the winning transporter keeps seeing it.
    or private.is_assigned_transporter(id)
  );

create policy jobs_insert on move_jobs
  for insert with check (customer_id = auth.uid());

create policy jobs_update on move_jobs
  for update using (
    customer_id = auth.uid() or private.is_admin() or private.is_assigned_transporter(id)
  );

create policy job_items_read on job_items
  for select using (
    private.job_customer(job_id) = auth.uid()
    or private.is_admin()
    or (private.job_is_open(job_id) and private.is_verified_transporter())
    or private.is_assigned_transporter(job_id)
  );

create policy job_items_write on job_items
  for all
  using (private.job_customer(job_id) = auth.uid())
  with check (private.job_customer(job_id) = auth.uid());

-- ------------------------------------------------- bids

-- A transporter must not see what rivals bid — that would turn an open auction
-- into undercutting. Only the customer sees the full set.
create policy bids_read on bids
  for select using (
    transporter_id = auth.uid()
    or private.is_admin()
    or private.job_customer(job_id) = auth.uid()
  );

create policy bids_insert on bids
  for insert with check (
    transporter_id = auth.uid()
    and private.is_verified_transporter()
    and private.job_is_open(job_id)
  );

create policy bids_update_own on bids
  for update using (
    transporter_id = auth.uid() and private.job_is_open(job_id)
  );

create policy bids_delete_own on bids
  for delete using (transporter_id = auth.uid());

-- ------------------------------------------------- money and disputes

create policy wallet_read_own on wallet_transactions
  for select using (user_id = auth.uid() or private.is_admin());

-- No insert or update policy: the ledger is written server-side only.

create policy disputes_read on disputes
  for select using (
    raised_by = auth.uid() or against = auth.uid() or private.is_admin()
  );

create policy disputes_insert on disputes
  for insert with check (raised_by = auth.uid());

create policy disputes_update on disputes
  for update using (private.is_admin());
