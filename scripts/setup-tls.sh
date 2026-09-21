#!/usr/bin/env bash
#
# Puts HTTPS in front of a self-hosted Supabase using Caddy, which obtains and
# renews the certificate by itself.
#
# Run as root on the Supabase host:
#   curl -fsSL https://raw.githubusercontent.com/wilson3centaurus/RushBox/main/scripts/setup-tls.sh | bash
# or, having cloned the repo:
#   sudo bash scripts/setup-tls.sh
#
# Safe to re-run. It backs up an existing Caddyfile rather than overwriting it,
# and never enables a firewall that is currently off (that is how people lock
# themselves out of a box they can only reach over SSH).

set -euo pipefail

DOMAIN="${DOMAIN:-api.robokorda.duckdns.org}"
UPSTREAM_PORT="${UPSTREAM_PORT:-}"

say()  { printf '\n\033[1;33m==>\033[0m %s\n' "$*"; }
fail() { printf '\n\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || fail "Run this as root (sudo bash scripts/setup-tls.sh)."

# ---------------------------------------------------------------- upstream

if [ -z "$UPSTREAM_PORT" ]; then
  say "Looking for the Supabase gateway"
  for p in 8000 8443 54321 3000; do
    if ss -ltn 2>/dev/null | grep -q ":$p\b"; then
      UPSTREAM_PORT="$p"
      echo "    found something listening on :$p"
      break
    fi
  done
fi

[ -n "$UPSTREAM_PORT" ] || fail \
  "Couldn't find the Supabase gateway. Check it is running ('docker ps'), then
  re-run with the port set explicitly:  UPSTREAM_PORT=8000 sudo bash $0"

curl -fsS -o /dev/null -m 5 "http://127.0.0.1:${UPSTREAM_PORT}/" 2>/dev/null \
  || echo "    note: :${UPSTREAM_PORT} did not return 200 — continuing anyway,
    since Supabase's gateway answers 401 without a key."

# ---------------------------------------------------------------- caddy

if ! command -v caddy >/dev/null 2>&1; then
  say "Installing Caddy"
  apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https curl gnupg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -qq
  apt-get install -y -qq caddy
else
  say "Caddy already installed"
fi

# ---------------------------------------------------------------- firewall

if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q "Status: active"; then
  say "Opening 80 and 443"
  # 80 is not optional: Let's Encrypt validates over it.
  ufw allow 22/tcp    >/dev/null 2>&1 || true   # never fence off SSH
  ufw allow 80/tcp    >/dev/null 2>&1
  ufw allow 443/tcp   >/dev/null 2>&1
  echo "    done"
else
  say "ufw is not active — skipping firewall rules"
  echo "    Make sure your provider's firewall allows 80 and 443 inbound."
fi

# ---------------------------------------------------------------- config

say "Writing the Caddyfile for ${DOMAIN}"

if [ -f /etc/caddy/Caddyfile ] && ! grep -q "$DOMAIN" /etc/caddy/Caddyfile; then
  backup="/etc/caddy/Caddyfile.bak.$(date +%s)"
  cp /etc/caddy/Caddyfile "$backup"
  echo "    existing config backed up to $backup"
fi

cat > /etc/caddy/Caddyfile <<EOF
# RushBox — TLS termination in front of self-hosted Supabase.
${DOMAIN} {
    reverse_proxy 127.0.0.1:${UPSTREAM_PORT}

    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
    }
}
EOF

caddy validate --config /etc/caddy/Caddyfile >/dev/null 2>&1 \
  || fail "Caddyfile failed validation — check /etc/caddy/Caddyfile."

systemctl enable caddy >/dev/null 2>&1 || true
systemctl reload caddy 2>/dev/null || systemctl restart caddy

# ---------------------------------------------------------------- verify

say "Waiting for the certificate (this can take up to a minute)"

ok=""
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w '%{http_code}' -m 5 "https://${DOMAIN}/" 2>/dev/null || echo 000)
  # 401 is a pass: Supabase answers that to an unauthenticated request.
  case "$code" in
    200|401|404) ok="$code"; break ;;
  esac
  sleep 3
done

if [ -n "$ok" ]; then
  say "HTTPS is live on https://${DOMAIN} (returned ${ok})"
  cat <<EOF

Next:
  1. Lock the plain-http port down, now that Caddy proxies over localhost:
       ufw deny ${UPSTREAM_PORT}/tcp

  2. Tell Supabase its own URL, in its .env, then restart it —
     otherwise auth links still point at http:// and break the same way:
       API_EXTERNAL_URL=https://${DOMAIN}

  3. Point the app at it (in Vercel, or .env.local):
       NEXT_PUBLIC_SUPABASE_URL=https://${DOMAIN}
       NEXT_PUBLIC_USE_MOCK_DATA=false

  4. Apply the schema — see docs/SUPABASE.md.
EOF
else
  fail "No certificate yet. Almost always one of:
  - port 80 is closed at your provider's firewall (Let's Encrypt validates over it)
  - ${DOMAIN} does not point at this machine
  Check the log:  journalctl -u caddy -n 40 --no-pager"
fi
