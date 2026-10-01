-- Account photos, identity verification, admin-set pricing, and catalogue
-- photos. Run after 0003_seed.sql.
--
-- Also closes a hole in 0002: transporters could insert or update their own
-- row with status = 'verified' and start bidding without any checks.

-- ---------------------------------------------------------------- pricing

-- Small key/value store for settings the admin edits. World-readable because
-- the cart quotes delivery before anyone signs in — never put secrets here.
create table app_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references profiles(id) on delete set null
);

create function private.stamp_settings()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create trigger app_settings_stamp
  before insert or update on app_settings
  for each row execute function private.stamp_settings();

alter table app_settings enable row level security;

create policy settings_read on app_settings
  for select using (true);

create policy settings_write on app_settings
  for all using (private.is_admin()) with check (private.is_admin());

-- Mirrors DEFAULT_PRICING in lib/pricing.ts. The app fills any missing field
-- from its own defaults, so adding a field there does not need a migration.
insert into app_settings (key, value) values ('pricing', '{
  "delivery": {
    "baseFee": 1.5,
    "freeOverEnabled": true,
    "freeThreshold": 20,
    "firstOrderFree": true,
    "promoFreeUntil": null,
    "minimumOrder": 2,
    "smallBasketThreshold": 5,
    "smallBasketFee": 0.5,
    "nightFeeEnabled": true,
    "nightFee": 1,
    "nightStart": 21,
    "nightEnd": 6,
    "includedKm": 3,
    "perKmFee": 0.3,
    "maxRadiusKm": 7
  },
  "move": { "commissionPct": 12, "errandFeePct": 10 }
}'::jsonb)
on conflict (key) do nothing;

-- ---------------------------------------------------------------- catalogue photos

alter table categories add column if not exists image text;

-- Bundled with the web app under public/photos (CC BY 2.0, credited in-app).
-- Only fills blanks or replaces our own bundled photos, never an uploaded one.
update categories c set image = '/photos/categories/' || c.slug || '.webp'
where c.slug in ('fruit-veg', 'dairy-eggs', 'bakery', 'meat-fish', 'drinks',
                 'snacks', 'pantry', 'household', 'baby', 'pharmacy')
  and (c.image is null or c.image like '/photos/%');

update products p set image = '/photos/products/' || v.file || '.webp'
from (values
  ('Tomatoes', 'tomatoes'), ('Bananas', 'bananas'), ('Onions', 'onions'),
  ('Rape / Covo Bundle', 'covo'), ('Potatoes', 'potatoes'), ('Apples', 'apples'),
  ('Eggs', 'eggs'), ('Cheddar Cheese', 'cheese'), ('White Bread', 'white-bread'),
  ('Brown Bread', 'brown-bread'), ('Buns', 'buns'), ('Kapenta', 'kapenta'),
  ('Boerewors', 'boerewors'), ('Still Water', 'water'),
  ('Mealie Meal (Roller)', 'mealie-meal'), ('White Rice', 'rice'), ('Sugar', 'sugar'),
  ('Salt', 'salt'), ('Toilet Paper', 'toilet-paper'), ('Plasters', 'plasters')
) as v(name, file)
where p.name = v.name
  and (p.image is null or p.image like '/photos/%');

-- ---------------------------------------------------------------- transporters

-- Only staff decide whether a transporter is verified, and trips and rating
-- come from completed jobs, not from the transporter.
create function private.guard_transporter()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or private.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.rating := 5.00;
    new.trips  := 0;
  else
    new.rating := old.rating;
    new.trips  := old.trips;
    -- A different vehicle has to be inspected again before it carries jobs.
    new.status := case
      when old.status = 'verified'
       and (new.vehicle is distinct from old.vehicle or new.plate is distinct from old.plate)
        then 'pending'::verify_status
      else old.status
    end;
  end if;
  return new;
end;
$$;

create trigger transporters_guard
  before insert or update on transporters
  for each row execute function private.guard_transporter();

-- ---------------------------------------------------------------- profiles

-- A path inside the public `avatars` bucket, not a URL: a free-form URL would
-- let anyone point their photo at a tracking pixel on another host.
alter table profiles add column if not exists avatar_path text;
-- Set by staff when a customer's ID checks out. Optional for customers;
-- transporters additionally need transporters.status = 'verified'.
alter table profiles add column if not exists id_verified_at timestamptz;

-- Same function as 0001, now also protecting id_verified_at and keeping each
-- user's photo inside their own folder.
create or replace function private.guard_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  caller_is_staff boolean := auth.uid() is null or private.is_admin();
begin
  if not caller_is_staff then
    new.role := old.role;
    new.store_id := old.store_id;
    new.id_verified_at := old.id_verified_at;

    if new.avatar_path is distinct from old.avatar_path
       and new.avatar_path is not null
       and split_part(new.avatar_path, '/', 1) <> auth.uid()::text then
      raise exception 'avatar_path must be inside your own folder'
        using errcode = 'insufficient_privilege';
    end if;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------- verification

create type doc_kind as enum
  ('id_front', 'id_back', 'licence', 'vehicle_photo', 'vehicle_reg', 'insurance');
create type doc_status as enum ('pending', 'verified', 'rejected');

-- One row per document. The file itself sits in the private `verification`
-- bucket at <user id>/<kind>-<timestamp>.jpg; this row is what staff review.
create table verification_documents (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  kind         doc_kind not null,
  path         text not null,
  status       doc_status not null default 'pending',
  -- Why it was rejected, shown to the user so they can fix it.
  note         text,
  reviewed_by  uuid references profiles(id) on delete set null,
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now(),
  unique (user_id, kind)
);

create index verification_documents_queue_idx
  on verification_documents (status, created_at);

-- Users upload and replace their own documents; every upload goes back to the
-- queue. Only staff can approve or reject.
create function private.guard_verification_document()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or private.is_admin() then
    if new.status = 'pending' then
      new.reviewed_by := null;
      new.reviewed_at := null;
    elsif tg_op = 'INSERT' or new.status is distinct from old.status then
      new.reviewed_by := auth.uid();
      new.reviewed_at := now();
    end if;
    return new;
  end if;

  new.status := 'pending';
  new.note := null;
  new.reviewed_by := null;
  new.reviewed_at := null;
  return new;
end;
$$;

create trigger verification_documents_guard
  before insert or update on verification_documents
  for each row execute function private.guard_verification_document();

alter table verification_documents enable row level security;

create policy documents_read on verification_documents
  for select using (user_id = auth.uid() or private.is_admin());

-- The path must sit in the uploader's own folder, so nobody can point a row
-- at someone else's ID.
create policy documents_insert on verification_documents
  for insert with check (
    user_id = auth.uid() and split_part(path, '/', 1) = auth.uid()::text
  );

create policy documents_update on verification_documents
  for update
  using (user_id = auth.uid() or private.is_admin())
  with check (
    private.is_admin()
    or (user_id = auth.uid() and split_part(path, '/', 1) = auth.uid()::text)
  );

create policy documents_delete on verification_documents
  for delete using (user_id = auth.uid() or private.is_admin());

-- ---------------------------------------------------------------- storage

-- Profile photos are public. ID documents are not: the bucket is private and
-- files are only reachable through short-lived signed URLs, which storage
-- issues only to callers who pass the select policy below.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('verification', 'verification', false, 5242880,
   array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

-- Files live under a folder named after the owner's user id.
create policy rushbox_avatars_read_own on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy rushbox_avatars_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy rushbox_avatars_update on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy rushbox_avatars_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy rushbox_verification_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'verification'
    and ((storage.foldername(name))[1] = auth.uid()::text or private.is_admin())
  );

create policy rushbox_verification_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'verification' and (storage.foldername(name))[1] = auth.uid()::text);

create policy rushbox_verification_update on storage.objects
  for update to authenticated
  using (bucket_id = 'verification' and (storage.foldername(name))[1] = auth.uid()::text);

create policy rushbox_verification_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'verification'
    and ((storage.foldername(name))[1] = auth.uid()::text or private.is_admin())
  );
