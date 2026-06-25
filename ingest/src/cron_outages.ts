// ============================================================================
// ResiliaMap — ingest/src/cron_outages.ts
// ----------------------------------------------------------------------------
// Daily cron entrypoint. Runs ONLY today's outages loader (Europe/Paris) then
// refreshes the resilience score MV. This is the schedule that captures the
// daily sites-indisponibles snapshot before it is overwritten — the archival
// core of ResiliaMap. Mirrors the Arcep cron_update_site.py URL/date logic.
//
// It is a thin delegate to ../pannes.ts so there is a SINGLE source of truth
// for the outage download/upsert logic. Referenced by:
//   - Makefile target `ingest-outages` (bun run src/cron_outages.ts)
//   - docker-compose.resiliamap.yml ingest service comment
//
// USAGE:
//   bun run src/cron_outages.ts                 # today
//   bun run src/cron_outages.ts --date 2026-06-20
//
// License: AGPL-3.0-or-later (ResiliaMap new code). See README.ResiliaMap.md.
// ============================================================================

import { closeDb } from "../db.ts";
import { runPannes } from "../pannes.ts";

// Forward any CLI args (e.g. --date) straight through to the pannes loader.
// runPannes refreshes the MV itself unless --no-refresh is passed.
runPannes(process.argv.slice(2))
  .then((results) => {
    const hadError = results.some((r) => r.status === "error");
    return closeDb().then(() => process.exit(hadError ? 1 : 0));
  })
  .catch(async (err) => {
    console.error("[cron_outages] FATAL:", err);
    await closeDb().catch(() => {});
    process.exit(1);
  });
