// ============================================================================
// ResiliaMap API — src/db.ts
// ----------------------------------------------------------------------------
// Single postgres (porsager) client built from DATABASE_URL.
//
// Read-only access pattern: this API never writes. All metric truth (distances,
// scores) is computed server-side in EPSG:2154 by the DB / materialized view;
// the API only reads mv_resilience_score and critical_poi and re-projects geom
// to 4326 on the way out for MapLibre.
//
// SECURITY: every query in routes/* uses tagged-template parameterisation
//   sql`... WHERE id = ${id}`
// so user input is NEVER string-concatenated into SQL.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import postgres from "postgres";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgres://resiliamap:changeme_local_only@localhost:5440/resiliamap";

/**
 * Shared connection pool. porsager/postgres lazily connects on first query and
 * pools automatically. `max` kept small: this API is read-only and low-write.
 */
export const sql = postgres(DATABASE_URL, {
  max: Number(process.env.DB_POOL_MAX ?? 10),
  idle_timeout: 30, // seconds before an idle connection is closed
  connect_timeout: 10, // seconds to wait for a connection
  // We never want surprise type coercion of bigint -> JS number losing
  // precision, but operator codes (MCC-MNC like 20801) and poi ids fit safely
  // in a JS number. porsager returns bigint columns as strings by default;
  // routes coerce explicitly with Number(...) where a JS number is expected.
  prepare: true,
  onnotice: () => {}, // silence NOTICE spam in logs
});

/**
 * Liveness ping for /api/health. Returns true if a trivial SELECT succeeds.
 * Never throws — folds any error into `false` so health can return 503 cleanly.
 */
export async function pingDb(): Promise<boolean> {
  try {
    const rows = await sql<{ ok: number }[]>`SELECT 1 AS ok`;
    return rows.length === 1 && rows[0]?.ok === 1;
  } catch {
    return false;
  }
}

/** Graceful shutdown helper (used on SIGINT/SIGTERM). */
export async function closeDb(): Promise<void> {
  await sql.end({ timeout: 5 });
}
