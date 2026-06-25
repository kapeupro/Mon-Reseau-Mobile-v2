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

import { closeDb, refreshScore } from "./db.ts";
import { runSites } from "./sites.ts";
import { runPoi } from "./poi.ts";
import { runPannes } from "./pannes.ts";

async function main(): Promise<void> {
  const t0 = Date.now();
  console.log("[ingest:all] starting full ingestion run …");

  // Each step runs with --no-refresh; we refresh once at the end. Steps are
  // wrapped so a single source failure is reported but does not silently pass.
  console.log("\n[ingest:all] step 1/3 — sites (ANFR active 4G)");
  await runSites(["--no-refresh"]);

  console.log("\n[ingest:all] step 2/3 — POI (finess + police + gendarmerie)");
  await runPoi(["--no-refresh"]);

  console.log("\n[ingest:all] step 3/3 — pannes (today's sites-indisponibles)");
  await runPannes(["--no-refresh"]);

  console.log("\n[ingest:all] refreshing score MV …");
  await refreshScore();

  console.log(`\n[ingest:all] DONE in ${((Date.now() - t0) / 1000).toFixed(1)}s.`);
}

main()
  .then(() => closeDb().then(() => process.exit(0)))
  .catch(async (err) => {
    console.error("[ingest:all] FATAL:", err);
    await closeDb().catch(() => {});
    process.exit(1);
  });
