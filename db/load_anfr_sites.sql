-- ============================================================================
-- ResiliaMap — db/load_anfr_sites.sql
-- ----------------------------------------------------------------------------
-- Load the per-operator 4G sites produced by ingest/anfr_sites.py
-- (ingest/data/raw/network_sites.csv: operator_code, source_site_id, lon, lat
-- in WGS84) into network_site, reprojecting WGS84 -> Lambert 93 (EPSG:2154).
--
-- Run from the repo ROOT (the \copy path is repo-relative):
--   psql "$PSQL_URL" -v ON_ERROR_STOP=1 -f db/load_anfr_sites.sql
-- or simply: make sites-anfr
--
-- License: AGPL-3.0-or-later. See README.ResiliaMap.md.
-- ============================================================================
CREATE TEMP TABLE stg_anfr (
    operator_code  bigint,
    source_site_id text,
    lon            double precision,
    lat            double precision,
    first_4g_date  date,
    bands          text
);

\copy stg_anfr FROM 'ingest/data/raw/network_sites.csv' WITH (FORMAT csv, NULL '')

INSERT INTO network_site (source_site_id, operator_code, has_4g, is_active, geom, first_4g_date, bands)
SELECT source_site_id, operator_code, true, true,
       ST_Transform(ST_SetSRID(ST_MakePoint(lon, lat), 4326), 2154),
       first_4g_date, bands
FROM stg_anfr
ON CONFLICT (operator_code, COALESCE(source_site_id, '')) DO UPDATE
  SET has_4g = true, is_active = true, geom = EXCLUDED.geom,
      first_4g_date = EXCLUDED.first_4g_date, bands = EXCLUDED.bands;

DROP TABLE stg_anfr;
