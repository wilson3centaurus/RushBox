# RushBox

Two products, one app:

- **RushBox Groceries** — Blinkit-style dark store model. We own the inventory and the warehouses; groceries and medicine in ~30 minutes.
- **RushBox Move** — inDrive-style marketplace. Post a job, nearby transporters bid, you pick the price. Three job types: **Cargo**, **Parcel**, and **Buy-For-Me** (a runner buys from a shop you name and delivers it).

See [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md) for the full feature list.

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
| `/profile` `/wallet` `/addresses` `/support` | Customer — account |
| `/driver` | Transporter — job feed, bidding, active job, earnings, verification |
| `/ops` | Dark store — fulfilment queue, inventory, riders |
| `/admin` | HQ — analytics, orders, transporters, customers, inventory, pricing, disputes |

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
- **Data is mocked.** Everything reads from `lib/mock/` and persists to
  `localStorage`. No Supabase calls are made.
- **Bids are simulated.** Posting a Move job schedules fake offers a few seconds
  later so the bidding screen behaves realistically. Replace with a Supabase
  realtime subscription.
- **Maps are a stylised placeholder** (`components/MapView.tsx`), not a real map.

## Before going live

1. **Put TLS on the Supabase host.** The API is currently plain `http://`, and
   browsers block plain-http calls from an https page as mixed content — the
   deployed app cannot talk to it until this is fixed.
2. **Rotate the service role key** if it has ever been shared. It bypasses row-level
   security entirely. It belongs in server-side env vars only — never in the
   browser, never prefixed `NEXT_PUBLIC_`, never committed.
3. Turn on row-level security on every table before the anon key touches real data.

## Backend

The schema, row-level security policies and seed live in `supabase/`, with a
test suite asserting 18 security properties. See
[`docs/SUPABASE.md`](docs/SUPABASE.md) for applying them and for putting TLS in
front of the API — which has to happen before any deployed frontend can reach
it.

## Deploying

See [`docs/DEPLOY.md`](docs/DEPLOY.md) — Vercel takes the repo with no config,
and the same doc covers installing it as an app on Android and wrapping it into
an APK afterwards.
