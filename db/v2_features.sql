-- ============================================================================
-- ResiliaMap — db/v2_features.sql
-- ----------------------------------------------------------------------------
-- v2 FEATURE OBJECTS layered on top of db/resilience.sql (the canonical schema).
-- Run AFTER db/resilience.sql so mv_resilience_score / critical_poi / site_outage
-- already exist.
--
-- Adds:
--   F2 TEMPORAL/RELIABILITY
--      * score_snapshot               — daily history of per-POI scores.
--      * snapshot_resilience_score()  — upserts today's MV scores (cron-driven).
--   F3 TERRITORIAL
--      * v_department_resilience      — per-département aggregate of the MV.
--      * v_commune_outage_hotspots    — communes with the most recent outages.
--
-- GEO LAW (NON-NEGOTIABLE, same as db/resilience.sql):
--   * ALL metric computation is in Lambert 93 = EPSG:2154 (metres).
--   * NEVER compute distances/lengths in EPSG:4326.
--   These v2 objects only read pre-computed scores / aggregate by INSEE code, so
--   they introduce NO new distance math — the spatial work stays in the MV (2154).
--
-- IDEMPOTENT: safe to re-run. Uses CREATE TABLE IF NOT EXISTS,
-- CREATE OR REPLACE VIEW and CREATE OR REPLACE FUNCTION everywhere. No DROP of
-- the historical score_snapshot data on re-run.
--
-- License: AGPL-3.0-or-later (ResiliaMap new code). See README.ResiliaMap.md.
-- ============================================================================

-- ===========================================================================
-- F2a. score_snapshot  (daily archive of per-POI scores)
-- ---------------------------------------------------------------------------
-- One row per (captured_date, poi_id). Lets the API/UI draw a score-history
-- sparkline and lets us watch resilience DRIFT as sites/outages evolve.
-- The score itself is computed in mv_resilience_score (all metric math in 2154);
-- here we only persist the resulting smallint, so there is no geometry column.
-- ===========================================================================
CREATE TABLE IF NOT EXISTS score_snapshot (
    captured_date date     NOT NULL,                 -- snapshot day (Europe/Paris)
    poi_id        bigint   NOT NULL,                 -- -> critical_poi.id / mv_resilience_score.poi_id
    score         smallint NOT NULL,                 -- mv_resilience_score.score (0..100) that day
    PRIMARY KEY (captured_date, poi_id)
);

-- History lookups for a single POI scan by poi_id; the date-ordered index also
-- serves "all scores for a given day" aggregations.
CREATE INDEX IF NOT EXISTS ix_score_snapshot_date
    ON score_snapshot (captured_date);
CREATE INDEX IF NOT EXISTS ix_score_snapshot_poi
    ON score_snapshot (poi_id);

-- ===========================================================================
-- F2a. snapshot_resilience_score()  (upsert today's MV scores)
-- ---------------------------------------------------------------------------
-- Captures the CURRENT mv_resilience_score values under captured_date =
-- CURRENT_DATE. Re-running the same day overwrites the day's rows (idempotent).
--
-- OPERATIONS: a DAILY CRON should call this once, AFTER the daily ingest +
-- refresh_resilience_score(), e.g.:  SELECT snapshot_resilience_score();
-- so each day's archived score reflects that day's freshly-refreshed MV.
-- ===========================================================================
CREATE OR REPLACE FUNCTION snapshot_resilience_score()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO score_snapshot (captured_date, poi_id, score)
    SELECT CURRENT_DATE, m.poi_id, m.score
    FROM mv_resilience_score m
    ON CONFLICT (captured_date, poi_id) DO UPDATE
        SET score = EXCLUDED.score;
END;
$$;

-- ===========================================================================
-- F3a. v_department_resilience  (per-département aggregate of the MV)
-- ---------------------------------------------------------------------------
-- Aggregates mv_resilience_score (joined to critical_poi for the INSEE code)
-- by département = left(insee_com, 2). Powers the "most fragile départements"
-- list and the /api/departments endpoint. NO choropleth polygons are needed —
-- consumers render CSS bars, not geometry — so this view emits no geom.
--
-- CAVEAT (Corsica / DOM), métropole-first:
--   * Métropole départements are the first 2 chars of the 5-char INSEE commune
--     code (e.g. '75' Paris, '13' Bouches-du-Rhône).
--   * CORSICA uses alphanumeric codes '2A' / '2B'; left(insee_com,2) yields
--     '2A' / '2B' correctly because Corsican INSEE communes start '2A###'/'2B###'.
--   * DOM/COM use a 3-CHAR département prefix (971 Guadeloupe, 972 Martinique,
--     973 Guyane, 974 La Réunion, 976 Mayotte). left(insee_com,2) collapses ALL
--     of them into a single bucket '97', which is WRONG at the département grain.
--     This is acceptable for a métropole-first MVP; a future revision should use
--     CASE WHEN left(insee_com,2) = '97' THEN left(insee_com,3) ELSE left(insee_com,2)
--     once DOM POIs are ingested. Documented here so the limitation is explicit.
--   * POIs with NULL insee_com are EXCLUDED (cannot be attributed to a dept).
-- ===========================================================================
CREATE OR REPLACE VIEW v_department_resilience AS
SELECT
    left(p.insee_com, 2)                                          AS dept,
    COUNT(*)                                                      AS n_poi,
    COUNT(*) FILTER (WHERE m.category = 'sante')                  AS n_sante,
    COUNT(*) FILTER (WHERE m.category = 'securite')               AS n_securite,
    ROUND(AVG(m.score)::numeric, 1)::numeric(5,1)                 AS avg_score,
    COUNT(*) FILTER (WHERE m.score < 40)                          AS n_fragile,
    COUNT(*) FILTER (WHERE m.is_uncovered)                        AS n_uncovered,
    COUNT(*) FILTER (WHERE m.comp_spof_malus > 0)                 AS n_spof
FROM mv_resilience_score m
JOIN critical_poi p ON p.id = m.poi_id
WHERE p.insee_com IS NOT NULL
  AND length(p.insee_com) >= 2          -- guard against malformed short codes
GROUP BY left(p.insee_com, 2);

-- ===========================================================================
-- F3 (optional). v_commune_outage_hotspots  (communes with the most outages)
-- ---------------------------------------------------------------------------
-- Communes with the most archived outages over the last OUTAGE_WINDOW_DAYS,
-- read straight from site_outage.raw_props (the original feature props, whose
-- column names are unstable — we defensively pull 'code_insee' and 'commune').
-- The window length is taken from score_constants so it stays in lockstep with
-- the MV's outage window. observed_date filtering is date math only (no geom).
--
-- Rows where code_insee is absent are bucketed under a NULL insee and skipped
-- by the WHERE so the hotspot list stays meaningful.
-- ===========================================================================
CREATE OR REPLACE VIEW v_commune_outage_hotspots AS
WITH c AS (
    SELECT (SELECT value FROM score_constants WHERE key = 'OUTAGE_WINDOW_DAYS') AS win_days
)
SELECT
    o.raw_props->>'code_insee'                       AS insee_com,
    MAX(o.raw_props->>'commune')                     AS commune,
    left(o.raw_props->>'code_insee', 2)              AS dept,
    COUNT(*)                                          AS n_outages,
    COUNT(DISTINCT o.operator_code)                   AS n_operators_affected,
    MAX(o.observed_date)                              AS last_outage_date
FROM site_outage o
CROSS JOIN c
WHERE o.observed_date >= CURRENT_DATE - (c.win_days || ' days')::interval
  AND o.raw_props->>'code_insee' IS NOT NULL
GROUP BY o.raw_props->>'code_insee', left(o.raw_props->>'code_insee', 2);
