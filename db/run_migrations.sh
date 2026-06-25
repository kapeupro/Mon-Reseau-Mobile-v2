#!/usr/bin/env bash
# ============================================================================
# ResiliaMap — db/run_migrations.sh
# ----------------------------------------------------------------------------
# Applies the ResiliaMap schema against DATABASE_URL (or PSQL_URL) using psql.
# Idempotent: db/resilience.sql is safe to re-run (CREATE ... IF NOT EXISTS,
# DROP MATERIALIZED VIEW IF EXISTS). Used by CI and as a manual fallback to the
# compose docker-entrypoint-initdb.d bootstrap.
#
# Usage:
#   DATABASE_URL=postgres://user:pass@host:5440/resiliamap ./db/run_migrations.sh
#
# License: AGPL-3.0-or-later (ResiliaMap new code). See README.ResiliaMap.md.
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_URL="${DATABASE_URL:-${PSQL_URL:-}}"

if [[ -z "${DB_URL}" ]]; then
  echo "ERROR: set DATABASE_URL (or PSQL_URL) before running." >&2
  exit 1
fi

echo "ResiliaMap: applying schema to ${DB_URL%%@*}@<redacted>"

# Apply in lexical order. 00_extensions.sql first (optional split), then the
# full schema. Any additional db/*.sql migrations are picked up automatically.
shopt -s nullglob
for f in "${SCRIPT_DIR}"/00_extensions.sql "${SCRIPT_DIR}"/resilience.sql; do
  echo ">> psql -f ${f}"
  psql "${DB_URL}" -v ON_ERROR_STOP=1 -f "${f}"
done

echo "ResiliaMap: schema applied OK."
