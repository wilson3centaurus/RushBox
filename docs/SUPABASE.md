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

## 2. Apply the schema

**SQL Editor → New query**, then paste and run each in order:

| File | What it does |
|---|---|
| `supabase/migrations/0001_schema.sql` | Tables, enums, triggers |
| `supabase/migrations/0002_policies.sql` | Row-level security — **not optional** |
| `supabase/migrations/0003_seed.sql` | Categories, 3 stores, 43 products |

`0002` is the one that matters. Without it every table is wide open to anyone
holding the anon key, which is everyone.

The seed is an upsert — re-run it to update prices and stock rather than
duplicating rows.

### Make yourself an admin

Every signup is a `customer`, and users cannot change their own role (a trigger
reverts it). Promote yourself from the SQL editor, which runs as the service
role:

```sql
update profiles set role = 'admin' where phone = '+263771234567';
```

---

## 3. Check the policies hold

`supabase/tests/rls_test.sql` asserts 18 security properties: that one customer
cannot read another's orders or wallet, that a transporter cannot see rival
bids or bid while unverified, that nobody can promote themselves to admin, and
that an anonymous visitor can browse the catalogue but reach no customer data.

It writes fixture rows, so **never run it against production**. Use a branch
database (Supabase → Branches) or a local Postgres:

```bash
createdb rbx_test
psql -d rbx_test -f supabase/migrations/0001_schema.sql
psql -d rbx_test -f supabase/migrations/0002_policies.sql
psql -d rbx_test -f supabase/tests/rls_test.sql
```

It prints `ALL RLS TESTS PASSED`, or raises on the first property that breaks.
Re-run it whenever you touch a policy — it has already caught two real bugs.

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

The screens still read from `lib/mock/`. Swapping those for Supabase queries is
the next piece of work — do it one surface at a time and keep the mock flag
working, so the team can keep building UI while the backend lands.
