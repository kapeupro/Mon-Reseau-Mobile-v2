// ============================================================================
// ResiliaMap API — src/routes/stats.ts
// ----------------------------------------------------------------------------
// GET /api/stats?category=sante|securite (optional)
//   -> National headline aggregates for shareable numbers:
//      total POI, by-category counts, score mean/median/min/max, a 5-bucket
//      score distribution, count of uncovered POI, count of single-point-of-
//      failure POI, total outages in the window, whether the optional coverage
//      layer is loaded, the score constants in effect, and the Arcep disclaimer.
//
// All numbers come from mv_resilience_score (the canonical score) joined to
// critical_poi for the optional category filter. Constants come from the DB
// score_constants table so the reported thresholds match what produced the MV.
//
// SECURITY: category filter is bound via porsager tagged template.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { Elysia } from "elysia";
import { sql } from "../db.ts";
import { ARCEP_DISCLAIMER } from "../constants.ts";
import {
  parseCategory,
  type Stats,
  type ScoreBucket,
  type CategoryValue,
} from "../schema.ts";

export const statsRoutes = new Elysia().get("/api/stats", async ({ query, set }) => {
  const catParsed = parseCategory(query.category as string | undefined);
  if (!catParsed.ok) {
    set.status = 400;
    return { error: catParsed.error };
  }
  const category: CategoryValue | null = catParsed.value;

  try {
    // -- Headline aggregates over the (optionally category-filtered) MV. -------
    const [agg] = await sql<
      {
        poi_total: number;
        sante: number;
        securite: number;
        mean: number | null;
        median: number | null;
        min: number | null;
        max: number | null;
        uncovered_poi: number;
        spof_poi: number;
      }[]
    >`
      SELECT
        count(*)::int                                                   AS poi_total,
        count(*) FILTER (WHERE m.category = 'sante')::int               AS sante,
        count(*) FILTER (WHERE m.category = 'securite')::int            AS securite,
        round(avg(m.score)::numeric, 1)                                 AS mean,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY m.score)            AS median,
        min(m.score)                                                    AS min,
        max(m.score)                                                    AS max,
        count(*) FILTER (WHERE m.is_uncovered)::int                     AS uncovered_poi,
        count(*) FILTER (WHERE m.comp_spof_malus > 0)::int              AS spof_poi
      FROM mv_resilience_score m
      WHERE (${category}::text IS NULL OR m.category = ${category})
    `;

    // -- 5-bucket score distribution. -----------------------------------------
    const bucketRows = await sql<{ bucket: ScoreBucket["bucket"]; count: number }[]>`
      SELECT bucket, count(*)::int AS count
      FROM (
        SELECT CASE
                 WHEN m.score BETWEEN 0  AND 19  THEN '0-19'
                 WHEN m.score BETWEEN 20 AND 39  THEN '20-39'
                 WHEN m.score BETWEEN 40 AND 59  THEN '40-59'
                 WHEN m.score BETWEEN 60 AND 79  THEN '60-79'
                 ELSE '80-100'
               END AS bucket
        FROM mv_resilience_score m
        WHERE (${category}::text IS NULL OR m.category = ${category})
      ) t
      GROUP BY bucket
    `;

    // Ensure all five buckets are present (zero-fill missing ones, stable order).
    const order: ScoreBucket["bucket"][] = ["0-19", "20-39", "40-59", "60-79", "80-100"];
    const counts = new Map(bucketRows.map((r) => [r.bucket, Number(r.count)]));
    const score_distribution: ScoreBucket[] = order.map((b) => ({
      bucket: b,
      count: counts.get(b) ?? 0,
    }));

    // -- Outages within the window (independent of category; they are network
    //    events, not POI). Uses OUTAGE_WINDOW_DAYS from score_constants. --------
    const [outRow] = await sql<{ outages_window_total: number }[]>`
      SELECT count(*)::int AS outages_window_total
      FROM site_outage o
      WHERE o.observed_date >= CURRENT_DATE
            - ((SELECT value FROM score_constants WHERE key = 'OUTAGE_WINDOW_DAYS')::int
               || ' days')::interval
    `;

    // -- Coverage layer presence. ---------------------------------------------
    const [covRow] = await sql<{ loaded: boolean }[]>`
      SELECT EXISTS (SELECT 1 FROM operator_coverage) AS loaded
    `;

    // -- Constants in effect (the thresholds that produced this MV). -----------
    const constRows = await sql<{ key: string; value: string }[]>`
      SELECT key, value::text AS value FROM score_constants
    `;
    const cmap = new Map(constRows.map((r) => [r.key, Number(r.value)]));
    const num = (k: string, fallback: number) => cmap.get(k) ?? fallback;

    const body: Stats = {
      poi_total: agg?.poi_total ?? 0,
      by_category: {
        sante: agg?.sante ?? 0,
        securite: agg?.securite ?? 0,
      },
      score: {
        mean: agg?.mean == null ? 0 : Number(agg.mean),
        median: agg?.median == null ? 0 : Math.round(Number(agg.median)),
        min: agg?.min == null ? 0 : Number(agg.min),
        max: agg?.max == null ? 0 : Number(agg.max),
      },
      score_distribution,
      uncovered_poi: agg?.uncovered_poi ?? 0,
      spof_poi: agg?.spof_poi ?? 0,
      outages_90d_total: outRow?.outages_window_total ?? 0,
      coverage_layer_loaded: covRow?.loaded ?? false,
      constants: {
        R_METERS: num("R_METERS", 3000),
        OUTAGE_WINDOW_DAYS: num("OUTAGE_WINDOW_DAYS", 90),
        REDUNDANCY_FULL_OPERATORS: num("REDUNDANCY_FULL_OPERATORS", 4),
        W_REDUNDANCY: num("W_REDUNDANCY", 1.0),
        W_SPOF_MALUS: num("W_SPOF_MALUS", 0.25),
        W_OUTAGE: num("W_OUTAGE", 0.35),
        OUTAGE_DECAY_HALFLIFE_DAYS: num("OUTAGE_DECAY_HALFLIFE_DAYS", 30),
      },
      disclaimer: ARCEP_DISCLAIMER,
    };
    return body;
  } catch (err) {
    // Log server-side; do not expose internal/DB error details to clients.
    console.error("[stats] error:", err);
    set.status = 500;
    return { error: "internal_error" };
  }
});
