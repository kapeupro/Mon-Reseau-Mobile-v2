-- ============================================================================
-- ResiliaMap — db/resilience.sql
-- ----------------------------------------------------------------------------
-- COMPLETE canonical schema: PostgreSQL 16 + PostGIS.
--
-- Civic-tech map scoring NETWORK RESILIENCE (0..100) of critical places
-- (hospitals, gendarmeries, police stations) from real Arcep/data.gouv layers.
--
-- GEO LAW (NON-NEGOTIABLE):
--   * ALL metric computation is in Lambert 93 = EPSG:2154 (metres).
--   * NEVER compute distances/lengths in EPSG:4326.
--   * WGS84 (4326) inputs are reprojected at ingestion:
--       ST_Transform(ST_SetSRID(ST_MakePoint(lon,lat),4326),2154)
--   * The existing Arcep "site" table stores geometry in EPSG:3857; when read
--     it is reprojected to 2154: ST_Transform(geometry,2154).
--   * Large coverage polygons are ST_Subdivide'd + GIST-indexed at ingestion.
--   * Every geom column is fixed to a typed SRID so a missing ST_Transform
--     fails LOUD at insert time instead of producing silently wrong distances.
--
-- IDEMPOTENT: safe to re-run. Uses CREATE ... IF NOT EXISTS everywhere and
-- DROP MATERIALIZED VIEW IF EXISTS at the top before recreating the MV.
--
-- This file does NOT touch the existing Arcep `site` table (read-only source).
--
-- License: AGPL-3.0-or-later (ResiliaMap new code). See README.ResiliaMap.md.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS postgis;

-- ===========================================================================
-- 1. operator  (PK = MCC-MNC, matches existing site.code_op)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS operator (
    code         bigint PRIMARY KEY,             -- MCC-MNC, e.g. 20801
    name_display text   NOT NULL,                -- Orange, SFR, Bouygues, Free
    name_full    text,
    color        text   NOT NULL                 -- hex from operateurs.json
);

-- Seed the 4 métropole operators with EXACT colors from
-- back_mrm/data/operateurs.json (verified). Free Mobile is #4be1bb (NOT red).
INSERT INTO operator (code, name_display, name_full, color) VALUES
    (20801, 'Orange',   'Orange France',                                   '#ff8700'),
    (20810, 'SFR',      'Société Française du radiotéléphone',              '#b54241'),
    (20820, 'Bouygues', 'Bouygues Telecom',                                '#3dd0ff'),
    (20815, 'Free',     'Free Mobile',                                      '#4be1bb')
ON CONFLICT (code) DO UPDATE
    SET name_display = EXCLUDED.name_display,
        name_full    = EXCLUDED.name_full,
        color        = EXCLUDED.color;

-- ===========================================================================
-- 2. critical_poi  (source-agnostic critical places; geom EPSG:2154)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS critical_poi (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source      text   NOT NULL,                  -- finess | police | gendarmerie
    source_id   text   NOT NULL,                  -- stable id from source file
    name        text   NOT NULL,
    category    text   NOT NULL
        CHECK (category IN ('sante','securite')),
    subcategory text,                             -- hopital|urgences|police|gendarmerie
    address     text,
    insee_com   text,                             -- commune INSEE if available
    geom        geometry(Point, 2154) NOT NULL,   -- Lambert 93. GIST indexed.
    created_at  timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_critical_poi_source UNIQUE (source, source_id)
);

CREATE INDEX IF NOT EXISTS ix_critical_poi_geom
    ON critical_poi USING GIST (geom);
CREATE INDEX IF NOT EXISTS ix_critical_poi_category
    ON critical_poi (category);

-- ===========================================================================
-- 3. network_site  (active 4G-capable Arcep/ANFR sites; geom EPSG:2154)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS network_site (
    id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source_site_id text,                          -- ANFR id_station_anfr / num_site / fid
    operator_code  bigint NOT NULL REFERENCES operator(code),
    has_4g         boolean NOT NULL DEFAULT true, -- from site_4g; only 4G counts for redundancy
    is_active      boolean NOT NULL DEFAULT true, -- outage status is separate (site_outage)
    geom           geometry(Point, 2154) NOT NULL,-- reprojected 3857->2154 or 4326->2154
    loaded_at      timestamptz NOT NULL DEFAULT now()
);

-- Upsert key. COALESCE so a NULL source_site_id still dedupes on re-run (NULLs
-- are distinct in a plain UNIQUE). sites.ts ON CONFLICT restates this expression.
CREATE UNIQUE INDEX IF NOT EXISTS uq_network_site
    ON network_site (operator_code, COALESCE(source_site_id, ''));

CREATE INDEX IF NOT EXISTS ix_network_site_geom
    ON network_site USING GIST (geom);
CREATE INDEX IF NOT EXISTS ix_network_site_op_4g
    ON network_site (operator_code, has_4g);

-- ===========================================================================
-- 4. site_outage  (historised daily sites-indisponibles; geom EPSG:2154)
--    >>> THE ARCHIVAL CORE: nobody archives the daily snapshot. <<<
-- ===========================================================================
CREATE TABLE IF NOT EXISTS site_outage (
    id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    observed_date  date   NOT NULL,               -- dated snapshot day (Europe/Paris)
    source_site_id text,                          -- site id from feature props (defensive pick)
    operator_code  bigint REFERENCES operator(code), -- nullable if unmappable (logged)
    raw_props      jsonb,                         -- full original props (column names unstable)
    geom           geometry(Point, 2154) NOT NULL,-- feature geom 4326 -> 2154. GIST indexed.
    ingested_at    timestamptz NOT NULL DEFAULT now()
);

-- Daily idempotency. Postgres treats NULLs as DISTINCT in a plain UNIQUE, so a
-- NULL source_site_id / operator_code would re-insert on every re-run. Dedupe on
-- COALESCE'd keys so re-running a day is a true no-op even when the operator
-- could not be mapped. CAVEAT: rows where BOTH ids are NULL collapse to one per
-- day (acceptable: unidentifiable; at least one is kept). pannes.ts ON CONFLICT
-- restates this exact expression.
CREATE UNIQUE INDEX IF NOT EXISTS uq_site_outage
    ON site_outage (observed_date, COALESCE(source_site_id, ''), COALESCE(operator_code, -1));

CREATE INDEX IF NOT EXISTS ix_site_outage_geom
    ON site_outage USING GIST (geom);
CREATE INDEX IF NOT EXISTS ix_site_outage_date
    ON site_outage (observed_date);
CREATE INDEX IF NOT EXISTS ix_site_outage_operator
    ON site_outage (operator_code);

-- ===========================================================================
-- 5. operator_coverage  (OPTIONAL / PLUGGABLE theoretical coverage; EPSG:2154)
--    Empty by default. Populated only if the .gpkg loader runs.
--    Score works WITHOUT it and degrades gracefully.
-- ===========================================================================
CREATE TABLE IF NOT EXISTS operator_coverage (
    id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    operator_code bigint NOT NULL REFERENCES operator(code), -- from operateur_commercial
    techno        text,                                 -- e.g. 4g; optional dimension
    geom          geometry(MultiPolygon, 2154) NOT NULL,-- ST_Subdivide'd, reprojected. GIST.
    loaded_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_operator_coverage_geom
    ON operator_coverage USING GIST (geom);
CREATE INDEX IF NOT EXISTS ix_operator_coverage_op
    ON operator_coverage (operator_code);

-- ===========================================================================
-- 6. score_constants  (named tunable constants; read by the MV via subquery)
--    Recalibration needs NO MV redefinition — just UPDATE a row + REFRESH.
--    >>> ALL thresholds are ARBITRARY defaults. They are NOT a validated
--    >>> reliability metric until calibrated on a pilot department. <<<
-- ===========================================================================
CREATE TABLE IF NOT EXISTS score_constants (
    key       text    PRIMARY KEY,
    value     numeric NOT NULL,
    rationale text    NOT NULL
);

INSERT INTO score_constants (key, value, rationale) VALUES
    ('R_METERS', 3000,
     'Service/neighbourhood radius in metres (EPSG:2154) for counting serving sites and nearby outages. Arbitrary default; calibrate per pilot department (urban density).'),
    ('OUTAGE_WINDOW_DAYS', 90,
     'Look-back window (days) for recent outages from the archived daily feed. 90 days = recent operational reliability without ancient noise.'),
    ('REDUNDANCY_FULL_OPERATORS', 4,
     'Distinct operators at which redundancy saturates to 1.0 (the four métropole MNOs). All four nearby = maximal redundancy.'),
    ('W_REDUNDANCY', 1.0,
     'Weight of the positive redundancy term; dominates so a well-served POI scores high.'),
    ('W_SPOF_MALUS', 0.15,
     'Penalty when a SINGLE operator serves the POI (its outage isolates the place). CALIBRATED 2026-06-26 on metropole: a 1-operator POI lands ~10/100, a 2-operator ~50 — fragile but not zeroed.'),
    ('W_OUTAGE', 0.25,
     'Weight of the recent-outage penalty (a DENSITY-NORMALISED rate, see OUTAGE_SATURATION). Modest: a fully-redundant POI in an outage-prone area still scores ~75. W_SPOF+W_OUTAGE (0.40) < W_REDUNDANCY (1.0).'),
    ('OUTAGE_DECAY_HALFLIFE_DAYS', 30,
     'Half-life (days) for outage time-decay: an outage 30 days ago weighs half of one today. Recent outages matter more.'),
    ('OUTAGE_SATURATION', 1.0,
     'Saturation of the outage RATE = decayed_outages / nearby_sites. CALIBRATED 2026-06-26 (the rate p95 is ~0.67): a rate of 1 (about one decayed outage per nearby site) maxes the malus. Normalising by site count removes the dense-urban bias where many antennas mechanically imply many nearby outages.')
ON CONFLICT (key) DO NOTHING;  -- do NOT clobber operator-tuned values on re-run

-- ===========================================================================
-- 7. mv_resilience_score  (per-POI score 0..100 with breakdown)
-- ---------------------------------------------------------------------------
-- redundancy (positive) - SPOF malus - time-decayed outage malus.
-- ALL within/distance tests in EPSG:2154 via ST_DWithin (GIST-accelerated).
-- The canonical score field is mv_resilience_score.score (smallint 0..100).
--
-- DROP first so re-running picks up any DDL change. CASCADE drops dependent
-- objects (e.g. v_poi_tiles) which are recreated below.
-- ===========================================================================
DROP MATERIALIZED VIEW IF EXISTS mv_resilience_score CASCADE;

CREATE MATERIALIZED VIEW mv_resilience_score AS
WITH c AS (
    SELECT
        (SELECT value FROM score_constants WHERE key = 'R_METERS')                  AS r_m,
        (SELECT value FROM score_constants WHERE key = 'OUTAGE_WINDOW_DAYS')        AS win_days,
        (SELECT value FROM score_constants WHERE key = 'W_REDUNDANCY')              AS w_red,
        (SELECT value FROM score_constants WHERE key = 'W_SPOF_MALUS')              AS w_spof,
        (SELECT value FROM score_constants WHERE key = 'W_OUTAGE')                  AS w_out,
        (SELECT value FROM score_constants WHERE key = 'OUTAGE_DECAY_HALFLIFE_DAYS')AS hl,
        (SELECT value FROM score_constants WHERE key = 'REDUNDANCY_FULL_OPERATORS') AS full_ops,
        (SELECT value FROM score_constants WHERE key = 'OUTAGE_SATURATION')         AS out_sat
),
-- distinct operators with an ACTIVE 4G site within R of the POI (geom 2154).
-- OPTIONAL coverage refinement: if operator_coverage is non-empty, an operator
-- ALSO counts as serving when its ST_Subdivide'd polygon ST_Intersects the POI.
-- (Refinement is documented; the default below uses sites only so the score
-- works WITHOUT any coverage layer. See README "Optional coverage refinement".)
serving AS (
    SELECT p.id AS poi_id,
           COUNT(DISTINCT s.operator_code) AS n_operators,
           COUNT(s.id)                     AS n_sites
    FROM critical_poi p
    CROSS JOIN c
    LEFT JOIN network_site s
           ON s.has_4g AND s.is_active
          AND ST_DWithin(p.geom, s.geom, c.r_m)   -- 2154 metres, GIST-accelerated
    GROUP BY p.id
),
-- recent nearby outages, time-decayed by half-life within the window
outages AS (
    SELECT p.id AS poi_id,
           COUNT(o.id) AS n_outages,
           COALESCE(
               SUM( POWER(0.5, (CURRENT_DATE - o.observed_date)::numeric / NULLIF(c.hl, 0)) ),
               0
           ) AS decayed_outages
    FROM critical_poi p
    CROSS JOIN c
    LEFT JOIN site_outage o
           ON o.observed_date >= CURRENT_DATE - (c.win_days || ' days')::interval
          AND ST_DWithin(p.geom, o.geom, c.r_m)
    GROUP BY p.id
),
parts AS (
    SELECT p.id AS poi_id, p.category, p.subcategory, p.name,
           sv.n_operators, sv.n_sites,
           ou.n_outages, ou.decayed_outages,
           c.w_red, c.w_spof, c.w_out,
           -- redundancy 0..1 (saturates at full_ops distinct operators)
           LEAST(sv.n_operators::numeric / NULLIF(c.full_ops, 0), 1.0) AS redundancy_norm,
           -- SPOF: 1 when a SINGLE operator serves the POI — its outage isolates
           -- the place. Calibrated to operator-level (not site-level) fragility.
           (CASE WHEN sv.n_operators = 1 THEN 1 ELSE 0 END)           AS spof_flag,
           -- outage penalty 0..1: DENSITY-NORMALISED rate = decayed outages per
           -- nearby site, saturating at OUTAGE_SATURATION. Normalising by n_sites
           -- stops dense areas being penalised merely for hosting many antennas.
           LEAST((ou.decayed_outages / GREATEST(sv.n_sites, 1)) / NULLIF(c.out_sat, 0), 1.0) AS outage_norm
    FROM critical_poi p
    JOIN serving sv ON sv.poi_id = p.id
    JOIN outages ou ON ou.poi_id = p.id
    CROSS JOIN c
)
SELECT
    poi_id,
    category, subcategory, name,
    n_operators, n_sites, n_outages,
    -- final score 0..100, clamped
    GREATEST(0, LEAST(100, ROUND(
        100.0 * (
              w_red  * redundancy_norm
            - w_spof * spof_flag
            - w_out  * outage_norm
        )
    )))::smallint AS score,
    -- breakdown components (0..1 normalized, *100 for display)
    ROUND(100.0 * w_red  * redundancy_norm)::smallint AS comp_redundancy,
    ROUND(100.0 * w_spof * spof_flag)::smallint        AS comp_spof_malus,
    ROUND(100.0 * w_out  * outage_norm)::smallint      AS comp_outage_malus,
    (n_sites = 0)                                       AS is_uncovered
FROM parts;

-- UNIQUE index required for REFRESH ... CONCURRENTLY + tile/api point lookups.
CREATE UNIQUE INDEX IF NOT EXISTS ux_mv_resilience_score_poi
    ON mv_resilience_score (poi_id);
CREATE INDEX IF NOT EXISTS ix_mv_resilience_score_cat
    ON mv_resilience_score (category);

-- NOTE on weights (calibrated 2026-06-26): w_red dominates the positive term and
-- (w_spof + w_out) cannot exceed it (1.0 vs 0.40), so a fully-redundant POI is
-- never driven negative by malus alone. Resulting ramp by operator count:
-- 0 ops -> 0 (uncovered), 1 -> ~10, 2 -> ~50, 3 -> ~75, 4 -> 85..100 (minus the
-- density-normalised outage malus). Tune in score_constants, NEVER here.

-- ===========================================================================
-- 8. v_poi_tiles  (thin read-only view for pg_tileserv; geom emitted as 4326)
-- ---------------------------------------------------------------------------
-- pg_tileserv reprojects from the SOURCE geom SRID. We expose geometry in 4326
-- to match the OSM raster basemap. All metric scoring stays server-side in 2154.
-- ===========================================================================
CREATE OR REPLACE VIEW v_poi_tiles AS
SELECT
    p.id,
    p.name,
    p.category,
    p.subcategory,
    p.insee_com,
    m.score,
    m.comp_redundancy,
    m.comp_spof_malus,
    m.comp_outage_malus,
    m.n_operators,
    m.n_sites,
    m.n_outages,
    m.is_uncovered,
    ST_Transform(p.geom, 4326) AS geom   -- 4326 for MapLibre / OSM basemap
FROM critical_poi p
JOIN mv_resilience_score m ON m.poi_id = p.id;

-- ===========================================================================
-- 9. REFRESH helper (function). Call after each ingest load.
--    Falls back to non-concurrent refresh on the very first build (when the MV
--    has never been populated, CONCURRENTLY is not allowed).
-- ===========================================================================
CREATE OR REPLACE FUNCTION refresh_resilience_score()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_resilience_score;
    EXCEPTION WHEN OTHERS THEN
        -- first populate (CONCURRENTLY needs a prior non-concurrent populate)
        REFRESH MATERIALIZED VIEW mv_resilience_score;
    END;
END;
$$;

-- Populate once at install so the MV is queryable immediately.
REFRESH MATERIALIZED VIEW mv_resilience_score;
