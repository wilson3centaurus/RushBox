# RushBox

**Live: https://rushbox-three.vercel.app**

Two products, one app:

- **RushBox Groceries** — Blinkit-style dark store model. We own the inventory and the warehouses; groceries and medicine in ~30 minutes.
- **RushBox Move** — inDrive-style marketplace. Post a job, nearby transporters bid, you pick the price. Three job types: **Cargo**, **Parcel**, and **Buy-For-Me** (a runner buys from a shop you name and delivers it).

See [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md) for the full feature list, and
[`docs/OPERATING_MODEL.md`](docs/OPERATING_MODEL.md) for how the business runs — who
delivers, how Move is priced, cash on delivery, and how everyone gets paid. The
same thing is an interactive 3D map in the admin dashboard.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · Supabase · installable PWA.

## Running it

```bash
npm install
cp .env.example .env.local   # fill in your values
npm run dev                  # http://localhost:3000
```

The app ships with `NEXT_PUBLIC_USE_MOCK_DATA=true`, so it runs entirely on local
mock data with no backend. Set it to `false` once Supabase is reachable.

## Surfaces

| Route | Who it's for |
|---|---|
| `/` `/login` `/verify` | Welcome and phone + OTP sign-in |
| `/home` `/groceries` `/product/[id]` `/cart` `/checkout` `/orders` | Customer — groceries |
| `/move` `/move/new/[type]` `/move/[id]` | Customer — cargo, parcels, Buy-For-Me |
| `/profile` `/profile/edit` `/profile/phone` `/profile/verify` | Customer — name, photo, number, optional ID check |
| `/wallet` `/addresses` `/support` `/credits` | Customer — account and photo credits |
| `/driver` | Transporter — job feed, bidding, active job, earnings, required ID/licence/vehicle checks |
| `/ops` | Dark store — fulfilment queue, inventory, riders |
| `/admin` | HQ — 3D system map, analytics, orders, transporters, ID verifications, customers, inventory, pricing & delivery rules, disputes |

The login screen has demo shortcuts into the transporter, ops and admin surfaces.
In production these are gated by role and never shown to a customer.

## Where things live

```
app/          routes, grouped by surface
components/   shared UI (ui.tsx, icons, charts, DashShell, MapView)
lib/
  types.ts    domain model
  mock/       seed data — swap for Supabase queries
  store.tsx   client state (session, cart, jobs) in localStorage
  supabase.ts client factory, returns null while in mock mode
legacy/       the original vanilla HTML/Firebase scaffold, kept for reference
```

## Current state

Front end is complete across all five surfaces. Backend is deliberately light:

- **Auth is mocked.** Any 6-digit code signs you in. Real phone OTP is not wired up.
- **The catalogue and pricing come from Supabase** when
  `NEXT_PUBLIC_USE_MOCK_DATA=false`. Everything else — orders, jobs, profile
  edits, ID photos, and pricing changes made without an admin session — lives
  in `localStorage` on the device until auth is wired.
- **Bids are simulated.** Posting a Move job schedules fake offers a few seconds
  later so the bidding screen behaves realistically. Replace with a Supabase
  realtime subscription.
- **Maps are a stylised placeholder** (`components/MapView.tsx`), not a real map.

## Before going live

1. **Apply `supabase/migrations/0002_policies.sql`.** The anon key is public by
   design — it ships in the browser bundle. Row-level security is the only thing
   protecting the data behind it.
2. **Rotate the service role key** if it has ever been shared. It bypasses RLS
   entirely. Server-side env vars only — never in the browser, never prefixed
   `NEXT_PUBLIC_`, never committed.

## Backend

Supabase Cloud. The schema, row-level security policies and seed live in
`supabase/`, with a test suite asserting 18 security properties. See
[`docs/SUPABASE.md`](docs/SUPABASE.md).

## Deploying

See [`docs/DEPLOY.md`](docs/DEPLOY.md) — Vercel takes the repo with no config,
and the same doc covers installing it as an app on Android and wrapping it into
an APK afterwards.
