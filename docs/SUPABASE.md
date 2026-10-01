# Supabase setup

RushBox runs on **Supabase Cloud**. Nothing to host, and `*.supabase.co` is
HTTPS by default — which is what made self-hosting painful, since a deployed
app on https cannot call a plain-http API at all.

Project: `eyslfrpacrkklwqpsqll` → `https://eyslfrpacrkklwqpsqll.supabase.co`

---

## 1. Rotate the service role key

It was pasted into a chat log. It bypasses row-level security completely — with
it, RLS may as well not exist.

**Project Settings → API → Service role → Rotate.**

Then put the new one only where a server can read it — Vercel's environment
variables, or `.env.local`. Never with a `NEXT_PUBLIC_` prefix, which would
compile it into the browser bundle.

The **publishable / anon key needs no protection**. It is designed to be
public and ships in the bundle; the policies in `0002_policies.sql` are the
actual protection.

---

## 2. The schema — already applied

All four migrations are live on the project. Current state:

- 16 tables, **row-level security enabled on all 16**
- 3 dark stores, 10 categories, 43 products seeded; category and produce photos set
- RLS helpers in a `private` schema, none reachable as RPC endpoints
- Two storage buckets: `avatars` (public) and `verification` (private)

Supabase's security advisor flags one function, `public.rls_auto_enable()`. It
is Supabase's own (it switches RLS on for new tables) and returns
`event_trigger`, so it cannot be called as an endpoint. Nothing from our schema
is flagged.

If you ever rebuild from scratch, run them in order:

| File | What it does |
|---|---|
| `supabase/migrations/0001_schema.sql` | Tables, enums, triggers |
| `supabase/migrations/0002_policies.sql` | Row-level security — **not optional** |
| `supabase/migrations/0003_seed.sql` | Categories, 3 stores, 43 products |
| `supabase/migrations/0004_accounts_pricing.sql` | Pricing settings, ID verification, profile photos, storage buckets, catalogue photos |

`0002` is the one that matters. Without it every table is wide open to anyone
holding the anon key, which is everyone.

The seed is an upsert — re-run it to update prices and stock rather than
duplicating rows.

### Why the helpers live in `private`

PostgREST publishes every function in an exposed schema as an RPC endpoint. In
`public`, the RLS helpers were callable at `/rest/v1/rpc/<name>` by anyone with
the anon key — and because they are `SECURITY DEFINER`, they answered. The worst
was `job_customer(uuid)`, which returned the owner of *any* job id, bypassing
the policy that exists to prevent exactly that.

Revoking `EXECUTE` looks like the fix and is not: RLS expressions are evaluated
as the querying role, so removing it makes every policy that calls a helper fail
and takes the whole app down. (Confirmed the hard way — the catalogue went to
permission errors until the grants went back.) Moving them to a schema PostgREST
does not expose closes the endpoints and leaves the grants, and therefore the
policies, intact.

**So: never add an RLS helper to `public`.** Put it in `private`.

### Make yourself an admin

Every signup is a `customer`, and users cannot change their own role (a trigger
reverts it). Promote yourself from the SQL editor, which runs as the service
role:

```sql
update profiles set role = 'admin' where phone = '+263771234567';
```

---

### What 0004 adds

**Pricing** lives in `app_settings` under the key `pricing` — the delivery fee,
when delivery is free, small-basket and late-night fees, the delivery radius,
and the Move commission. Everyone can read it (the cart quotes delivery before
sign-in); only admins can write it, and each change records who made it.

**ID verification.** Documents are rows in `verification_documents`, pointing
at files in the private `verification` bucket under `<user id>/`. A user can
upload and replace their own; every upload goes back to `pending`, and only an
admin can approve or reject. Nobody can register a file in someone else's
folder. Admins approve a customer by setting `profiles.id_verified_at`, and a
driver by setting `transporters.status = 'verified'`.

**It also fixed a hole in 0002**: a transporter could insert or update their own
row as `verified` (with any trip count) and start bidding unchecked. A trigger
now lets only staff change status, rating and trips, and sends a verified
driver back to `pending` if they change vehicle or plate.

**Profile photos** go in the public `avatars` bucket. `profiles.avatar_path`
holds a path in that bucket, not a URL, so nobody can point their photo at a
tracking pixel on another site.

### Wiring the app to it

Until phone sign-in is live there is no Supabase session, so the app keeps
profile edits, ID photos and pricing changes on the device and says so. Once
auth works:

- **Pricing**: already done — `publishPricing()` writes `app_settings` when an
  admin session exists.
- **ID photos**: upload with
  `` storage.from("verification").upload(`${uid}/${kind}-${Date.now()}.jpg`, blob) ``,
  then upsert a `verification_documents` row with that path. Staff view them
  with `createSignedUrl(path, 300)` — never make the bucket public.
- **Profile photo**: upload to `avatars/${uid}/avatar.jpg`, set
  `profiles.avatar_path`.
- **Delivery fee**: recompute it in a database function from `app_settings`
  when the order is written. The browser's number is for display only.

## 3. Check the policies hold

`supabase/tests/rls_test.sql` asserts 38 security properties, including: one
customer cannot read another's orders, wallet or ID documents; a transporter
cannot see rival bids, bid while unverified, or mark themselves verified;
nobody can promote themselves to admin or change pricing; uploads cannot land
in someone else's folder; and an anonymous visitor can browse the catalogue but
reach no customer data.

It writes fixture rows, so **never run it against production**. Use a branch
database (Supabase → Branches) or a local Postgres — `00_local_stub.sql`
supplies the `auth` and `storage` schemas and the three Supabase roles:

```bash
createdb rbx_test
psql -d rbx_test -f supabase/tests/00_local_stub.sql
psql -d rbx_test -f supabase/migrations/0001_schema.sql
psql -d rbx_test -f supabase/migrations/0002_policies.sql
psql -d rbx_test -f supabase/migrations/0004_accounts_pricing.sql
psql -d rbx_test -f supabase/tests/rls_test.sql
```

It prints `ALL RLS TESTS PASSED`, or raises on the first property that breaks.
Re-run it whenever you touch a policy — it has already caught three real bugs.

---

## 4. Turn on phone auth

**Authentication → Providers → Phone.** Needs an SMS provider — Twilio, Vonage
or MessageBird. Until one is connected the login screen stays in demo mode and
accepts any six digits.

Zimbabwe numbers are `+263`; the login screen already formats them.

Set **Authentication → URL Configuration → Site URL** to the deployed Vercel
URL, otherwise auth redirects bounce to localhost.

---

## 5. Point the app at it

In Vercel (Settings → Environment Variables) and in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://eyslfrpacrkklwqpsqll.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_USE_MOCK_DATA=false
SUPABASE_SERVICE_ROLE_KEY=<the rotated one>
```

Flipping `NEXT_PUBLIC_USE_MOCK_DATA` to `false` makes `getSupabase()` return a
real client instead of null.

With the flag off, the catalogue and pricing come from Supabase; orders, jobs
and accounts still live on the device until auth is wired. Move them over one
surface at a time and keep the mock flag working, so the team can keep building
UI while the backend lands.
