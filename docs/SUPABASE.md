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

All three migrations are live on the project. Current state:

- 14 tables, **row-level security enabled on all 14**, 31 policies
- 3 dark stores, 10 categories, 43 products seeded
- RLS helpers in a `private` schema, none reachable as RPC endpoints

Supabase's own security advisors report no outstanding issues from our schema.

If you ever rebuild from scratch, run them in order:

| File | What it does |
|---|---|
| `supabase/migrations/0001_schema.sql` | Tables, enums, triggers |
| `supabase/migrations/0002_policies.sql` | Row-level security — **not optional** |
| `supabase/migrations/0003_seed.sql` | Categories, 3 stores, 43 products |

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

## 3. Check the policies hold

`supabase/tests/rls_test.sql` asserts 18 security properties: that one customer
cannot read another's orders or wallet, that a transporter cannot see rival
bids or bid while unverified, that nobody can promote themselves to admin, and
that an anonymous visitor can browse the catalogue but reach no customer data.

It writes fixture rows, so **never run it against production**. Use a branch
database (Supabase → Branches) or a local Postgres — `00_local_stub.sql`
supplies the `auth` schema and the three Supabase roles:

```bash
createdb rbx_test
psql -d rbx_test -f supabase/tests/00_local_stub.sql
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
