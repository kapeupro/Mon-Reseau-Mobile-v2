// ============================================================================
// ResiliaMap — ingest/index.ts   (ingest:all  /  `bun run all`)
// ----------------------------------------------------------------------------
// Orchestrates a FULL ingestion run, then refreshes the resilience score MV.
//
// Order:
//   1. sites   — load ANFR active 4G sites into network_site (idempotent upsert)
//   2. poi     — load FINESS (hospitals) + police + gendarmerie into critical_poi
//   3. pannes  — historise TODAY's sites-indisponibles snapshot into site_outage
//   4. REFRESH MATERIALIZED VIEW (via refresh_resilience_score()) ONCE at the end
//
// We pass --no-refresh to each loader so the MV is refreshed exactly once here,
// not after every step (the MV uses CURRENT_DATE; one refresh at the end is
// correct and far cheaper).
//
// Exit code: non-zero if any step throws, so a cron/CI run fails loudly.
//
// NOTE: the optional theoretical-coverage .gpkg loader (operator_coverage) is
// NOT part of ingest:all — it is pluggable and the score works without it.
// See ingest/README.md for the documented ogr2ogr loader recipe.
//
// License: AGPL-3.0-or-later (ResiliaMap new code). See README.ResiliaMap.md.
// ============================================================================

import { closeDb, refreshScore, snapshotScore, recordIngestRun } from "./db.ts";
import { getPickWarnings, resetPickWarnings } from "./pick.ts";
import { runSites } from "./sites.ts";
import { runPoi } from "./poi.ts";
import { runPannes } from "./pannes.ts";

async function main(): Promise<void> {
  const t0 = Date.now();
  console.log("[ingest:all] starting full ingestion run …");
  // Clean slate so unrecognized-column warnings recorded below belong to THIS run.
  resetPickWarnings();
  // Track whether any source failed so the 'all' summary + exit code stay truthful.
  let anyError = false;

  // sites — runSites returns the upserted count. Wrap so a failure is recorded
  // (status=error + detail) and surfaced, not silently swallowed.
  console.log("\n[ingest:all] step 1/3 — sites (ANFR active 4G)");
  {
    const started = new Date();
    try {
      const inserted = await runSites(["--no-refresh"]);
      await recordIngestRun({
        source: "sites", startedAt: started, finishedAt: new Date(),
        status: "ok", rowsInserted: inserted,
      });
    } catch (err) {
      anyError = true;
      await recordIngestRun({
        source: "sites", startedAt: started, finishedAt: new Date(),
        status: "error", errorDetail: String(err instanceof Error ? err.message : err),
      });
      throw err;
    }
  }

  console.log("\n[ingest:all] step 2/3 — POI (finess + police + gendarmerie)");
  {
    const started = new Date();
    try {
      const inserted = await runPoi(["--no-refresh"]);
      await recordIngestRun({
        source: "poi", startedAt: started, finishedAt: new Date(),
        status: "ok", rowsInserted: inserted,
      });
    } catch (err) {
      anyError = true;
      await recordIngestRun({
        source: "poi", startedAt: started, finishedAt: new Date(),
        status: "error", errorDetail: String(err instanceof Error ? err.message : err),
      });
      throw err;
    }
  }

  console.log("\n[ingest:all] step 3/3 — pannes (today's sites-indisponibles)");
  {
    const started = new Date();
    try {
      const days = await runPannes(["--no-refresh"]);
      const fetched = days.reduce((a, d) => a + d.fetched, 0);
      const inserted = days.reduce((a, d) => a + d.inserted, 0);
      const ignored = days.reduce((a, d) => a + d.skippedNoGeom, 0);
      // A 404/error for the day must be visible even when older days are fine.
      const status = days.some((d) => d.status === "error")
        ? "error"
        : days.some((d) => d.status === "missing")
          ? "partial"
          : "ok";
      if (status === "error") anyError = true;
      await recordIngestRun({
        source: "pannes", startedAt: started, finishedAt: new Date(),
        status, rowsFetched: fetched, rowsInserted: inserted, rowsIgnored: ignored,
      });
    } catch (err) {
      anyError = true;
      await recordIngestRun({
        source: "pannes", startedAt: started, finishedAt: new Date(),
        status: "error", errorDetail: String(err instanceof Error ? err.message : err),
      });
      throw err;
    }
  }

  console.log("\n[ingest:all] refreshing score MV …");
  await refreshScore();
  // Daily history: snapshot the freshly-refreshed scores. This is the canonical
  // once-per-day call (pannes runs with --no-refresh above, so it won't double).
  await snapshotScore();

  // One summary row for the whole run. finished_at here is the canonical "last
  // successful full ingest" timestamp that /api/health reads for MV freshness.
  await recordIngestRun({
    source: "all", startedAt: new Date(t0), finishedAt: new Date(),
    status: anyError ? "partial" : "ok",
    unrecognizedColumns: getPickWarnings(),
  });

  console.log(`\n[ingest:all] DONE in ${((Date.now() - t0) / 1000).toFixed(1)}s.`);
}

main()
  .then(() => closeDb().then(() => process.exit(0)))
  .catch(async (err) => {
    console.error("[ingest:all] FATAL:", err);
    await closeDb().catch(() => {});
    process.exit(1);
  });
