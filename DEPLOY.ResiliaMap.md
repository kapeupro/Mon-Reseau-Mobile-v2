# ResiliaMap — Production deployment (VPS + Docker Compose)

Single-VPS deployment. The base stack (`docker-compose.resiliamap.yml`) plus the
production override (`docker-compose.prod.yml`) bring up PostGIS, the read-only
API, pg_tileserv, the web SPA, and a **Caddy** TLS front. Only Caddy is exposed
(80/443); everything else stays on the internal Docker network.

> **License:** AGPL-3.0-or-later. The score is an *uncalibrated indicator* — the
> Arcep disclaimer must remain visible. Calibrate on a pilot département before
> implying any reliability guarantee.

## 0. Prerequisites

- A VPS in the EU (e.g. Hetzner CX22, Scaleway DEV1-S) with **Docker Engine +
  Compose v2.24+** (the override uses the `!override` merge tag).
- A domain with an **A/AAAA record** pointing at the VPS IP (Caddy needs it to
  issue the Let's Encrypt cert).
- Ports **80** and **443** open.

## 1. Get the code

```bash
sudo mkdir -p /opt/resiliamap && sudo chown "$USER" /opt/resiliamap
git clone https://github.com/kapeupro/Mon-Reseau-Mobile-v2.git /opt/resiliamap
cd /opt/resiliamap
```

## 2. Secrets

```bash
bash scripts/gen-secrets.sh        # writes .env.prod (mode 600) with random secrets
```

Then edit `.env.prod` and set:

- `DOMAIN` — your domain (e.g. `resiliamap.fr`)
- `ACME_EMAIL` — contact for Let's Encrypt
- `VITE_BASEMAP_STYLE_URL` — a **licensed** MapLibre style (MapTiler/Stadia). The
  public OSM CDN is **not** allowed for production traffic. Restrict the key by
  domain in the provider dashboard.

`.env.prod` is gitignored — never commit it.

## 3. First boot (DB + schema)

```bash
COMPOSE="docker compose -f docker-compose.resiliamap.yml -f docker-compose.prod.yml --env-file .env.prod"
$COMPOSE up -d db          # first boot applies db/*.sql via the initdb entrypoint
```

**Rotate the read-only role password** (it ships with a dev default in
`db/30_roles.sql`). Use the `POSTGRES_RO_PASSWORD` value from `.env.prod`:

```bash
$COMPOSE exec db psql -U resiliamap -d resiliamap \
  -c "ALTER ROLE resiliamap_ro PASSWORD '<POSTGRES_RO_PASSWORD from .env.prod>';"
```

## 4. Load the data

```bash
$COMPOSE run --rm ingest          # full ingest: sites + POI + outages, refresh, snapshot
```

Verify: `$COMPOSE run --rm ingest psql "$DATABASE_URL" -c "SELECT count(*) FROM critical_poi;"`

## 5. Bring up the app

```bash
$COMPOSE up -d --build api tileserv web caddy
```

Caddy obtains the TLS cert automatically on first request. Check:

```bash
curl -s https://$DOMAIN/api/health | jq .ok        # true
curl -s https://$DOMAIN/openapi -o /dev/null -w '%{http_code}\n'   # 200
```

## 6. Daily ingestion (cron)

Add a host crontab entry (06:15 Europe/Paris) — the daily path archives today's
outages, refreshes the score, snapshots history, and evaluates+delivers alerts:

```cron
15 6 * * *  /opt/resiliamap/scripts/cron-daily.sh >> /var/log/resiliamap-ingest.log 2>&1
```

## 7. Updates

```bash
cd /opt/resiliamap && git pull
$COMPOSE up -d --build            # rebuild changed images
$COMPOSE run --rm ingest bun run db/run_migrations.sh   # if db/*.sql changed
```

CI (`.github/workflows/ci.yml`) runs typecheck + unit tests + web build on every
PR, so `main` stays green.

---

## Pre-launch checklist (hard gates)

- [ ] **Rotate the leaked `NEXT_PUBLIC_TOKEN_ALERT_ARCEP`** out-of-band with Arcep.
- [ ] `gen-secrets.sh` run; no `changeme`/`__CHANGE_ME__` left in `.env.prod`.
- [ ] `resiliamap_ro` password rotated (step 3).
- [ ] `VITE_BASEMAP_STYLE_URL` set to a licensed style, key domain-restricted.
- [ ] DNS A/AAAA -> VPS; 80/443 open; `https://$DOMAIN/api/health` returns `ok:true`.
- [ ] DB volume on a backed-up disk; a `pg_dump` cron is recommended.

## Deferred (need a decision)

- **Email alerts** — set SMTP and wire email delivery (webhook works today).
- **Public `POST /api/alerts`** subscribe endpoint (write path + double opt-in /
  GDPR). Until then, create subscriptions via SQL (see README "Alerts").
