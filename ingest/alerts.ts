// ============================================================================
// ResiliaMap — ingest/alerts.ts (E3)
// ----------------------------------------------------------------------------
// Two passes, run from the daily pipeline AFTER refreshScore() + snapshotScore():
//
//   evaluateAlerts()  — for every active+confirmed subscription, test the three
//                       conditions against the freshly-refreshed MV + yesterday's
//                       score_snapshot + today's new outages, and INSERT one
//                       alert_event per (subscription, kind, today) ON CONFLICT
//                       DO NOTHING (the dedup guarantee lives in the DB UNIQUE).
//
//   deliverAlerts()   — see deliver.ts; called separately so evaluation stays a
//                       pure DB step that never blocks on network I/O.
//
// All distance math is in EPSG:2154 metres, R from score_constants — same
// contract as the API (api/src/routes/poi.ts). Score is an UNCALIBRATED
// indicator; the disclaimer travels in the event payload.
//
// License: AGPL-3.0-or-later (ResiliaMap new code). See README.ResiliaMap.md.
// ============================================================================
import { sql } from "./db.ts";

/** Arcep methodology disclaimer carried in every alert payload (mirrors api). */
const DISCLAIMER =
  "Indicateur dérivé de données ouvertes factuelles (ANFR + pannes opérateurs). " +
  "La présence d'une antenne ne garantit pas la réception réelle. ResiliaMap " +
  "n'est pas un produit officiel de l'Arcep.";

export interface EvalResult {
  threshold: number;
  degradation: number;
  outage: number;
}

/**
 * Evaluate all active+confirmed subscriptions and record fired events.
 * Returns how many NEW events were inserted per kind (idempotent: a second run
 * the same day inserts nothing more thanks to the UNIQUE constraint).
 */
export async function evaluateAlerts(): Promise<EvalResult> {
  const today = (await sql<{ d: string }[]>`SELECT CURRENT_DATE::text AS d`)[0]!.d;

  // --- threshold: score crossed BELOW threshold today (edge-trigger) ----------
  // Fire only when today's score < threshold AND yesterday's snapshot was >=
  // threshold (or there is no yesterday row — first observation under threshold).
  const [thr] = await sql<{ n: number }[]>`
    WITH fired AS (
      INSERT INTO alert_event (subscription_id, kind, fired_for_date, payload)
      SELECT s.id, 'threshold', CURRENT_DATE,
             jsonb_build_object(
               'poi_id', p.id, 'poi_name', p.name,
               'score', m.score, 'threshold', s.threshold,
               'disclaimer', ${DISCLAIMER}::text)
      FROM alert_subscription s
      JOIN critical_poi p        ON p.id = s.poi_id
      JOIN mv_resilience_score m ON m.poi_id = s.poi_id
      LEFT JOIN score_snapshot y ON y.poi_id = s.poi_id
                                AND y.captured_date = CURRENT_DATE - 1
      WHERE s.active AND s.confirmed AND s.notify_threshold
        AND m.score < s.threshold
        AND (y.score IS NULL OR y.score >= s.threshold)
      ON CONFLICT (subscription_id, kind, fired_for_date) DO NOTHING
      RETURNING 1)
    SELECT count(*)::int AS n FROM fired`;

  // --- degradation: today's score dropped >= delta vs yesterday ---------------
  const [deg] = await sql<{ n: number }[]>`
    WITH fired AS (
      INSERT INTO alert_event (subscription_id, kind, fired_for_date, payload)
      SELECT s.id, 'degradation', CURRENT_DATE,
             jsonb_build_object(
               'poi_id', p.id, 'poi_name', p.name,
               'score', m.score, 'previous_score', y.score,
               'delta', y.score - m.score, 'disclaimer', ${DISCLAIMER}::text)
      FROM alert_subscription s
      JOIN critical_poi p        ON p.id = s.poi_id
      JOIN mv_resilience_score m ON m.poi_id = s.poi_id
      JOIN score_snapshot y      ON y.poi_id = s.poi_id
                                AND y.captured_date = CURRENT_DATE - 1
      WHERE s.active AND s.confirmed AND s.notify_degradation
        AND m.score <= y.score - s.degradation_delta
      ON CONFLICT (subscription_id, kind, fired_for_date) DO NOTHING
      RETURNING 1)
    SELECT count(*)::int AS n FROM fired`;

  // --- outage: a NEW outage appeared today within R_METERS of the POI ---------
  const [out] = await sql<{ n: number }[]>`
    WITH r AS (
      SELECT COALESCE(
        (SELECT value::float FROM score_constants WHERE key = 'R_METERS'), 3000
      ) AS meters
    ),
    fired AS (
      INSERT INTO alert_event (subscription_id, kind, fired_for_date, payload)
      SELECT s.id, 'outage', CURRENT_DATE,
             jsonb_build_object(
               'poi_id', p.id, 'poi_name', p.name,
               'n_outages_today', cnt.n, 'disclaimer', ${DISCLAIMER}::text)
      FROM alert_subscription s
      JOIN critical_poi p ON p.id = s.poi_id
      CROSS JOIN r
      JOIN LATERAL (
        SELECT count(*)::int AS n
        FROM site_outage o
        WHERE o.observed_date = CURRENT_DATE
          AND ST_DWithin(o.geom, p.geom, r.meters)
      ) cnt ON cnt.n > 0
      WHERE s.active AND s.confirmed AND s.notify_outage
      ON CONFLICT (subscription_id, kind, fired_for_date) DO NOTHING
      RETURNING 1)
    SELECT count(*)::int AS n FROM fired`;

  const result: EvalResult = {
    threshold: thr?.n ?? 0,
    degradation: deg?.n ?? 0,
    outage: out?.n ?? 0,
  };
  console.log(
    `[alerts] evaluated for ${today}: ${result.threshold} threshold, ` +
      `${result.degradation} degradation, ${result.outage} outage events fired.`
  );
  return result;
}
