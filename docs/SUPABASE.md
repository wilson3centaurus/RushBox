# Supabase setup

Two parts: put HTTPS in front of the API, then apply the schema.

Everything here runs on your server or in the Supabase SQL editor — the sandbox
this was written in has no route to `api.robokorda.duckdns.org`, so none of it
could be run for you.

---

## 1. Rotate credentials first

Before anything else, on the server:

```bash
passwd root          # the root password was shared in a chat log
```

Then in Supabase, rotate the **service role key**. It bypasses row-level
security completely — a leaked one is equivalent to handing over the database.

While you're there, consider turning off password SSH entirely:

```bash
ssh-copy-id root@api.robokorda.duckdns.org          # from your laptop, first
sudo sed -i 's/^#\?PasswordAuthentication .*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart ssh
```

A root password on a public host gets brute-forced within hours. Keys don't.

---

## 2. HTTPS on the API

The API currently answers on plain `http://`. Browsers block plain-http requests
from an https page as mixed content, so **the deployed app cannot talk to it at
all** until this is done. Caddy is the shortest path — it gets and renews the
certificate on its own.

```bash
# Install Caddy (Debian/Ubuntu)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

Replace `/etc/caddy/Caddyfile` with:

```caddyfile
api.robokorda.duckdns.org {
    # Supabase's gateway. Change the port if your stack uses a different one.
    reverse_proxy 127.0.0.1:8000
}
```

Ports 80 and 443 must be open — Let's Encrypt verifies over port 80:

```bash
sudo ufw allow 80,443/tcp
sudo systemctl reload caddy
sudo journalctl -u caddy -n 30 --no-pager     # watch the certificate be issued
```

Verify from your laptop, not the server:

```bash
curl -I https://api.robokorda.duckdns.org
```

A `200` or `401` means TLS is working. A certificate error means Let's Encrypt
couldn't reach port 80 — check the firewall and that DuckDNS points at this box.

### Close the plain-http port

Caddy now reaches Supabase over localhost, so nothing else should:

```bash
sudo ufw deny 8000/tcp
```

### Tell Supabase its own URL

In your Supabase `.env`, set the external URL to the https one, then restart —
otherwise magic links and auth redirects still point at `http://` and break the
same way:

```env
API_EXTERNAL_URL=https://api.robokorda.duckdns.org
SITE_URL=https://rushbox.vercel.app
```

---

## 3. Apply the schema

In order. `0001` and `0002` are required; `0003` is demo data.

| File | What it does |
|---|---|
| `supabase/migrations/0001_schema.sql` | Tables, enums, triggers |
| `supabase/migrations/0002_policies.sql` | Row-level security — **not optional** |
| `supabase/migrations/0003_seed.sql` | Categories, stores and 43 products |

Paste each into the Supabase SQL editor, or:

```bash
psql "$DATABASE_URL" -f supabase/migrations/0001_schema.sql
psql "$DATABASE_URL" -f supabase/migrations/0002_policies.sql
psql "$DATABASE_URL" -f supabase/migrations/0003_seed.sql   # optional
```

The seed is an upsert — re-running it updates prices and stock rather than
duplicating products.

### Make yourself an admin

Every new signup is a `customer`. Users cannot change their own role (a trigger
reverts it), so promote yourself from the SQL editor, which runs as the service
role:

```sql
update profiles set role = 'admin' where phone = '+263771234567';
```

---

## 4. Check the policies hold

`supabase/tests/rls_test.sql` asserts 18 security properties — that one customer
cannot read another's orders, that a transporter cannot see rival bids or bid
while unverified, that nobody can promote themselves to admin, and that an
anonymous visitor can browse the catalogue but reach no customer data.

Run it against a scratch database, never production — it writes fixture rows:

```bash
createdb rbx_test
psql -d rbx_test -f supabase/migrations/0001_schema.sql
psql -d rbx_test -f supabase/migrations/0002_policies.sql
psql -d rbx_test -f supabase/tests/rls_test.sql
```

It prints `ALL RLS TESTS PASSED`, or raises on the first property that breaks.
Re-run it whenever you touch a policy.

---

## 5. Turn on phone auth

**Authentication → Providers → Phone.** You need an SMS provider — Twilio,
Vonage, or MessageBird. Until one is connected, the app's login screen stays in
demo mode and accepts any six digits.

Zimbabwe numbers are `+263`; the login screen already formats them.

---

## 6. Point the app at it

In Vercel (or `.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://api.robokorda.duckdns.org
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
NEXT_PUBLIC_USE_MOCK_DATA=false
SUPABASE_SERVICE_ROLE_KEY=<rotated key — server only, never NEXT_PUBLIC_>
```

Flipping `NEXT_PUBLIC_USE_MOCK_DATA` to `false` makes `getSupabase()` return a
real client. The screens still read from `lib/mock/` — swapping those reads for
Supabase queries, table by table, is the next piece of work. Do it one surface
at a time and keep the mock flag working, so the team can keep building UI while
the backend lands.

The anon key is *designed* to be public — it ships in the browser bundle. The
policies in `0002` are what protect the data, which is why step 4 matters.
