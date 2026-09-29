-- RushBox schema.
-- Run this first, then 0002_policies.sql, then 0003_seed.sql.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- people

create type user_role as enum ('customer', 'transporter', 'ops', 'admin');

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  phone       text,
  email       text,
  role        user_role not null default 'customer',
  -- Which dark store an 'ops' user works at. Null for everyone else.
  store_id    uuid,
  created_at  timestamptz not null default now()
);

-- A profile row for every new auth user, so the app never sees a null profile.
create function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, phone, email, name)
  values (
    new.id,
    new.phone,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Role is assigned by an admin, never by the user. Without this, anyone could
-- PATCH their own row to 'admin' and the rest of the policies would honour it.
--
-- A null auth.uid() means the caller is not an end user — it is the service
-- role or a direct connection, which is how the first admin gets promoted and
-- how server-side code assigns staff. That path is unreachable from the
-- browser: with no session, the profiles policies match no rows at all, so an
-- anon request is stopped before the trigger ever runs.
create function guard_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  caller_may_set_role boolean := auth.uid() is null or is_admin();
begin
  if not caller_may_set_role then
    new.role := old.role;
    new.store_id := old.store_id;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------- catalogue

create table dark_stores (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  area        text not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table profiles
  add constraint profiles_store_fk
  foreign key (store_id) references dark_stores(id) on delete set null;

create table categories (
  slug        text primary key,
  name        text not null,
  emoji       text not null default '',
  tile        text not null default 'from-ink-50 to-ink-100',
  sort        int  not null default 0
);

create table products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null references categories(slug),
  price       numeric(10,2) not null check (price >= 0),
  was_price   numeric(10,2) check (was_price >= 0),
  unit        text not null default '',
  emoji       text not null default '',
  image       text,
  store_id    uuid not null references dark_stores(id) on delete cascade,
  stock       int not null default 0 check (stock >= 0),
  tags        text[] not null default '{}',
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  -- A store stocks one line per product name. Also gives the seed something to
  -- upsert on, so re-running it updates prices instead of duplicating rows.
  unique (store_id, name)
);

create index products_category_idx on products (category);
create index products_store_idx on products (store_id);

-- ---------------------------------------------------------------- groceries

create type order_status as enum
  ('placed', 'packing', 'out_for_delivery', 'delivered', 'cancelled');

create table addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  label       text not null default 'Home',
  line        text not null,
  note        text,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index addresses_user_idx on addresses (user_id);

create table orders (
  id            uuid primary key default gen_random_uuid(),
  ref           text not null unique default 'RB-' || lpad((floor(random() * 9000) + 1000)::text, 4, '0'),
  user_id       uuid not null references profiles(id) on delete cascade,
  store_id      uuid not null references dark_stores(id),
  rider_id      uuid references profiles(id),
  -- Snapshotted on dispatch so the customer can see and call their rider
  -- without being granted read access to the rider's profile row.
  rider_name    text,
  rider_phone   text,
  status        order_status not null default 'placed',
  address       text not null,
  subtotal      numeric(10,2) not null default 0,
  delivery_fee  numeric(10,2) not null default 0,
  total         numeric(10,2) not null default 0,
  eta_mins      int not null default 30,
  placed_at     timestamptz not null default now()
);

create index orders_user_idx on orders (user_id);
create index orders_store_idx on orders (store_id, status);

create table order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  product_id  uuid not null references products(id),
  qty         int not null check (qty > 0),
  -- Copied at purchase time: the catalogue price moves, the receipt must not.
  unit_price  numeric(10,2) not null
);

create index order_items_order_idx on order_items (order_id);

-- ---------------------------------------------------------------- move

create type job_type    as enum ('cargo', 'parcel', 'errand');
create type job_status  as enum
  ('collecting_bids', 'assigned', 'in_transit', 'delivered', 'cancelled');
create type vehicle_type as enum ('bike', 'car', 'van', 'bakkie', 'truck');
create type verify_status as enum ('pending', 'verified', 'suspended');

-- Customers comparing bids need to see who is bidding, so verified rows here
-- are world-readable. Only put public information in this table — the name is
-- duplicated rather than joined from profiles so that phone and email stay
-- private (row-level security grants whole rows, not columns).
create table transporters (
  id             uuid primary key references profiles(id) on delete cascade,
  display_name   text not null default '',
  vehicle        vehicle_type not null,
  vehicle_label  text not null default '',
  plate          text,
  rating         numeric(3,2) not null default 5.00 check (rating between 0 and 5),
  trips          int not null default 0,
  status         verify_status not null default 'pending',
  created_at     timestamptz not null default now()
);

-- Kept apart from `transporters` so the public directory cannot expose it.
create table transporter_earnings (
  id       uuid primary key references transporters(id) on delete cascade,
  total    numeric(12,2) not null default 0,
  paid_out numeric(12,2) not null default 0
);

create table move_jobs (
  id               uuid primary key default gen_random_uuid(),
  ref              text not null unique default 'RB-J' || lpad((floor(random() * 900) + 100)::text, 3, '0'),
  customer_id      uuid not null references profiles(id) on delete cascade,
  type             job_type not null,
  pickup           text not null,
  dropoff          text not null,
  description      text not null default '',
  vehicle          vehicle_type not null,
  offer            numeric(10,2) not null check (offer > 0),
  status           job_status not null default 'collecting_bids',
  -- Buy-for-me only.
  shop             text,
  shopping_budget  numeric(10,2) check (shopping_budget >= 0),
  receipt_url      text,
  accepted_bid_id  uuid,
  created_at       timestamptz not null default now()
);

create index move_jobs_customer_idx on move_jobs (customer_id);
create index move_jobs_open_idx on move_jobs (status, created_at desc);

create table job_items (
  id       uuid primary key default gen_random_uuid(),
  job_id   uuid not null references move_jobs(id) on delete cascade,
  name     text not null,
  qty      int not null default 1 check (qty > 0),
  note     text
);

create index job_items_job_idx on job_items (job_id);

create table bids (
  id              uuid primary key default gen_random_uuid(),
  job_id          uuid not null references move_jobs(id) on delete cascade,
  transporter_id  uuid not null references transporters(id) on delete cascade,
  price           numeric(10,2) not null check (price > 0),
  eta_mins        int not null default 15,
  distance_km     numeric(6,2),
  created_at      timestamptz not null default now(),
  -- One live bid per transporter per job; they update it rather than stack bids.
  unique (job_id, transporter_id)
);

create index bids_job_idx on bids (job_id);

alter table move_jobs
  add constraint move_jobs_accepted_bid_fk
  foreign key (accepted_bid_id) references bids(id) on delete set null;

-- ---------------------------------------------------------------- money

create table wallet_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  label       text not null,
  detail      text,
  -- Positive credits the user, negative debits them.
  amount      numeric(12,2) not null,
  created_at  timestamptz not null default now()
);

create index wallet_user_idx on wallet_transactions (user_id, created_at desc);

create type dispute_status as enum ('open', 'resolved');

create table disputes (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid references orders(id) on delete cascade,
  job_id      uuid references move_jobs(id) on delete cascade,
  raised_by   uuid not null references profiles(id) on delete cascade,
  against     uuid references profiles(id) on delete set null,
  amount      numeric(10,2) not null default 0,
  summary     text not null,
  status      dispute_status not null default 'open',
  created_at  timestamptz not null default now(),
  -- A dispute is about an order or a job, never both and never neither.
  constraint dispute_target check (num_nonnulls(order_id, job_id) = 1)
);
