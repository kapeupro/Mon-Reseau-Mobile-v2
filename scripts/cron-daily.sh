#!/usr/bin/env bash
# ============================================================================
# ResiliaMap — scripts/cron-daily.sh
# ----------------------------------------------------------------------------
# Daily ingest trigger for the production VPS. Runs the one-shot ingest container
# (today's outages -> MV refresh -> score snapshot -> alerts evaluate+deliver).
# The compose `ingest` service is in the "tools" profile, so it is NOT started by
# `up`; this wrapper runs it once and exits.
#
# Install on the VPS as a host crontab entry (runs ~06:15 Europe/Paris):
#   15 6 * * *  /opt/resiliamap/scripts/cron-daily.sh >> /var/log/resiliamap-ingest.log 2>&1
#
# (Adjust the repo path. Use `cron_outages.ts` for the light daily path, or the
# default CMD `index.ts` for a full re-ingest — see below.)
#
# License: AGPL-3.0-or-later. See DEPLOY.ResiliaMap.md.
# ============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

COMPOSE=(docker compose -f docker-compose.resiliamap.yml -f docker-compose.prod.yml --env-file .env.prod)

echo "[cron-daily] $(date -u +%FT%TZ) starting daily outage ingest + alerts"
# Daily path: today's outages, refresh MV, snapshot scores, evaluate+deliver alerts.
"${COMPOSE[@]}" run --rm ingest bun run src/cron_outages.ts
echo "[cron-daily] $(date -u +%FT%TZ) done"
