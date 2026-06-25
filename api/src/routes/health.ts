// ============================================================================
// ResiliaMap API — src/routes/health.ts
// ----------------------------------------------------------------------------
// GET /api/health
//   Liveness + readiness: DB ping, MV row count / freshness, outage archive
//   depth, and whether the optional coverage layer is loaded.
//
// Contract (Health in schema.ts):
//   200 { status, ok, db, mv_resilience_score:{rows,last_refresh},
//         outages:{latest_observed_date,days_in_archive},
//         coverage_layer_loaded, version }
//   503 with db:false (and best-effort zeros) if the DB ping fails.
//
// The task's minimum is { ok, db }. We keep `ok` and `db` as top-level booleans
// (so the simple contract holds) AND add the richer blueprint fields.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { Elysia } from "elysia";
import { sql, pingDb } from "../db.ts";
import { API_VERSION } from "../constants.ts";
import type { Health } from "../schema.ts";

export const healthRoutes = new Elysia().get("/api/health", async ({ set }) => {
  const db = await pingDb();

  if (!db) {
    set.status = 503;
    const body: Health = {
      status: "degraded",
      ok: false,
      db: false,
      mv_resilience_score: { rows: 0, last_refresh: null },
      outages: { latest_observed_date: null, days_in_archive: 0 },
      coverage_layer_loaded: false,
      version: API_VERSION,
    };
    return body;
  }

  // All read-only. Wrapped so a transient query error degrades gracefully to a
  // 503 rather than a 500 stack trace.
  try {
    const [mvRow] = await sql<{ rows: number }[]>`
      SELECT count(*)::int AS rows FROM mv_resilience_score
    `;

    // pg_stat_all_tables.last_* are for tables; a materialized view's last
    // refresh is best surfaced via pg_class relfilenode mtime is not portable,
    // so we expose the freshest signal we actually control: the most recent
    // ingest of outages. We also try stats for the MV relation.
    const [refreshRow] = await sql<{ last_refresh: string | null }[]>`
      SELECT to_char(
               greatest(
                 coalesce(s.last_analyze, s.last_autoanalyze),
                 coalesce(s.last_vacuum,  s.last_autovacuum)
               ) AT TIME ZONE 'UTC',
               'YYYY-MM-DD"T"HH24:MI:SS"Z"'
             ) AS last_refresh
      FROM pg_stat_all_tables s
      JOIN pg_class c ON c.oid = s.relid
      WHERE c.relname = 'mv_resilience_score'
    `;

    const [outRow] = await sql<{
      latest_observed_date: string | null;
      days_in_archive: number;
    }[]>`
      SELECT to_char(max(observed_date), 'YYYY-MM-DD') AS latest_observed_date,
             count(DISTINCT observed_date)::int        AS days_in_archive
      FROM site_outage
    `;

    const [covRow] = await sql<{ loaded: boolean }[]>`
      SELECT EXISTS (SELECT 1 FROM operator_coverage) AS loaded
    `;

    const body: Health = {
      status: "ok",
      ok: true,
      db: true,
      mv_resilience_score: {
        rows: mvRow?.rows ?? 0,
        last_refresh: refreshRow?.last_refresh ?? null,
      },
      outages: {
        latest_observed_date: outRow?.latest_observed_date ?? null,
        days_in_archive: outRow?.days_in_archive ?? 0,
      },
      coverage_layer_loaded: covRow?.loaded ?? false,
      version: API_VERSION,
    };
    return body;
  } catch {
    set.status = 503;
    const body: Health = {
      status: "degraded",
      ok: false,
      db: true, // ping passed but a follow-up query failed
      mv_resilience_score: { rows: 0, last_refresh: null },
      outages: { latest_observed_date: null, days_in_archive: 0 },
      coverage_layer_loaded: false,
      version: API_VERSION,
    };
    return body;
  }
});
