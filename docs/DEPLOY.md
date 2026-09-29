# Deploying RushBox

No config files needed — Vercel detects Next.js automatically. This is the
whole process.

## 1. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Import **wilson3centaurus/RushBox**.
3. Pick the branch you want to deploy (`main`, or a feature branch for a preview).
4. Leave the build settings alone — framework preset is Next.js, build command
   `npm run build`, output handled automatically.
5. Add environment variables (below), then **Deploy**.

You get an `https://rushbox-*.vercel.app` URL in about two minutes. Every push
to that branch redeploys; every other branch gets its own preview URL, which is
how the team should review each other's features.

### Environment variables

Set these in **Project → Settings → Environment Variables**:

| Name | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_USE_MOCK_DATA` | `true` | Keep `true` until Supabase is reachable |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://eyslfrpacrkklwqpsqll.supabase.co` | Supabase Cloud project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the publishable key | Public by design — safe in the browser *if* RLS is on |
| `SUPABASE_SERVICE_ROLE_KEY` | your rotated key | Server-side only. Never prefix `NEXT_PUBLIC_` |

With `NEXT_PUBLIC_USE_MOCK_DATA=true` the app never calls Supabase, so you can
deploy and test the whole UI before the backend exists.

### Latency

Vercel defaults functions to Washington DC, which is a slow round trip from
Zimbabwe. In **Settings → Functions**, change the region to the closest
available one — Cape Town if your plan offers it, otherwise Frankfurt or Paris.
Most pages are static and served from the CDN edge regardless, so this only
affects the dynamic routes.

## 2. Install it as an app

Once deployed, on an Android phone:

1. Open the URL in Chrome.
2. Menu (⋮) → **Add to Home screen** — or take the install prompt Chrome offers.

It launches fullscreen with the RushBox icon, no browser chrome, and works
offline for pages already visited. On iOS it's Share → Add to Home Screen
(Safari only).

## 3. APK, later

A packaged APK wraps the deployed PWA — it does not replace it, so step 1 has
to happen first. Once you have a live https URL:

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest=https://<your-url>/manifest.webmanifest
bubblewrap build
```

That needs the Android SDK and a signing keystore on the machine you run it on.
For Play Store distribution you also need to host
`.well-known/assetlinks.json` so the app opens without a browser address bar —
Bubblewrap prints the file for you.

Worth saying plainly: for testing, the installed PWA and the APK look and behave
the same. The APK only matters when you want a Play Store listing.

## Before real data flows

1. **Apply the row-level security policies** (`supabase/migrations/0002_policies.sql`).
   Without them the anon key — which ships in the browser bundle — reads and
   writes every table.
2. **Rotate the service role key** if it has ever been pasted into a chat,
   ticket or screenshot. It bypasses row-level security completely.
3. **Turn on RLS on every table.** The anon key is public by design — it ships
   in the browser bundle. RLS is the only thing protecting the data behind it.
4. Flip `NEXT_PUBLIC_USE_MOCK_DATA` to `false` and replace the reads in
   `lib/mock/` with Supabase queries.
