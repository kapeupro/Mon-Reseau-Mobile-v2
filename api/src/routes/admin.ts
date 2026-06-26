// ============================================================================
// ResiliaMap API — src/routes/admin.ts
// ----------------------------------------------------------------------------
// GET /api/admin/data-quality
//   The data-quality dashboard backend (E4). Reads ingest_run (db/data_quality.sql)
//   — the persisted per-run metrics the loaders already compute — and reports, per
//   source, the latest run's freshness/status/counts/unrecognized-columns, plus a
//   separate "did today's outage fetch actually work" signal.
//
//   Why a dedicated freshness field: max(observed_date) in site_outage looks
//   healthy even if today's fetch 404'd (the archive still holds yesterday). The
//   newest pannes ingest_run row exposes that failure directly.
//
//   Read-only. Internal-only view today (no auth). If exposed on a public
//   deployment, gate it (shared-secret header / network ACL) — see README.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { Elysia } from "elysia";
import { sql, pingDb } from "../db.ts";
import type { DataQuality, DataQualitySource } from "../schema.ts";

const SOURCES = ["sites", "poi", "pannes", "all"] as const;

interface RunRow {
  source: string;
  last_run_at: string | null;
  status: "ok" | "partial" | "error";
  rows_fetched: number | null;
  rows_inserted: number | null;
  rows_ignored: number | null;
  error_detail: string | null;
  unrecognized_columns: string[];
}

export const adminRoutes = new Elysia().get(
  "/api/admin/data-quality",
  async ({ set }) => {
    if (!(await pingDb())) {
      set.status = 503;
      return { error: "db_unavailable" };
    }
    try {
      // Newest run per source via DISTINCT ON (source) ORDER BY started_at DESC.
      const rows = await sql<RunRow[]>`
        SELECT DISTINCT ON (source)
          source,
          to_char(finished_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS last_run_at,
          status,
          rows_fetched,
          rows_inserted,
          rows_ignored,
          error_detail,
          unrecognized_columns
        FROM ingest_run
        ORDER BY source, started_at DESC
      `;
      const bySource = new Map(rows.map((r) => [r.source, r]));

      const sources: DataQualitySource[] = SOURCES.map((s) => {
        const r = bySource.get(s);
        if (!r) {
          return {
            source: s, last_run_at: null, status: "never",
            rows_fetched: null, rows_inserted: null, rows_ignored: null,
            error_detail: null, unrecognized_columns: [],
          };
        }
        return {
          source: s,
          last_run_at: r.last_run_at,
          status: r.status,
          rows_fetched: r.rows_fetched,
          rows_inserted: r.rows_inserted,
          rows_ignored: r.rows_ignored,
          error_detail: r.error_detail,
          unrecognized_columns: r.unrecognized_columns ?? [],
        };
      });

      const [outRow] = await sql<{
        latest_observed_date: string | null;
        days_in_archive: number;
      }[]>`
        SELECT to_char(max(observed_date), 'YYYY-MM-DD') AS latest_observed_date,
               count(DISTINCT observed_date)::int        AS days_in_archive
        FROM site_outage
      `;

      const pannes = bySource.get("pannes");
      const body: DataQuality = {
        generated_at: new Date().toISOString(),
        sources,
        outage_freshness: {
          latest_observed_date: outRow?.latest_observed_date ?? null,
          days_in_archive: outRow?.days_in_archive ?? 0,
          last_fetch_status: pannes?.status ?? "never",
          last_fetch_at: pannes?.last_run_at ?? null,
        },
      };
      return body;
    } catch (err) {
      console.error("[api] data-quality query failed:", err);
      set.status = 503;
      return { error: "data_quality_unavailable" };
    }
  }
);
