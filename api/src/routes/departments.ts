// ============================================================================
// ResiliaMap API — src/routes/departments.ts
// ----------------------------------------------------------------------------
// GET /api/departments
//   -> Per-département resilience aggregate, sorted by avg_score ASC (most
//      fragile first), wrapped as { departments:[...], disclaimer }.
//
// Reads v_department_resilience (db/v2_features.sql), which aggregates
// mv_resilience_score joined to critical_poi by dept = left(insee_com,2).
//
// GEO LAW: this endpoint does NO distance math — it only aggregates pre-computed
//   scores by INSEE prefix, so there is no SRID concern here. (The metric work
//   stayed in the materialized view, all in EPSG:2154.)
//
// CAVEATS (carried from the view, surfaced to clients via `disclaimer`):
//   * Métropole-first: dept = first 2 chars of the INSEE commune code.
//   * Corsica '2A'/'2B' resolve correctly.
//   * DOM (971..976) collapse into a single '97' bucket — wrong at the dept
//     grain; documented limitation until DOM POIs are ingested.
//
// SECURITY: no user input -> no parameters; still a plain tagged template.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { Elysia } from "elysia";
import { sql } from "../db.ts";
import { ARCEP_DISCLAIMER } from "../constants.ts";
import type {
  DepartmentResilience,
  DepartmentsResponse,
} from "../schema.ts";

export const departmentsRoutes = new Elysia().get(
  "/api/departments",
  async ({ set }) => {
    try {
      // porsager returns bigint COUNT(*) columns as strings and numeric(5,1)
      // (avg_score) as a string too -> parse each to a JS number below.
      const rows = await sql<
        {
          dept: string;
          n_poi: string;
          n_sante: string;
          n_securite: string;
          avg_score: string | null;
          n_fragile: string;
          n_uncovered: string;
          n_spof: string;
        }[]
      >`
        SELECT
          dept,
          n_poi,
          n_sante,
          n_securite,
          avg_score,
          n_fragile,
          n_uncovered,
          n_spof
        FROM v_department_resilience
        ORDER BY avg_score ASC NULLS LAST, dept ASC
      `;

      const departments: DepartmentResilience[] = rows.map((r) => ({
        dept: r.dept,
        n_poi: Number(r.n_poi),
        n_sante: Number(r.n_sante),
        n_securite: Number(r.n_securite),
        avg_score: r.avg_score == null ? 0 : Number(r.avg_score),
        n_fragile: Number(r.n_fragile),
        n_uncovered: Number(r.n_uncovered),
        n_spof: Number(r.n_spof),
      }));

      const body: DepartmentsResponse = {
        departments,
        disclaimer: ARCEP_DISCLAIMER,
      };
      return body;
    } catch (err) {
      // Log server-side; never leak internal/DB error details to clients.
      console.error("[departments] error:", err);
      set.status = 500;
      return { error: "internal_error" };
    }
  }
);
