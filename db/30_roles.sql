-- ============================================================================
-- ResiliaMap — read-only DB role (least privilege for API + pg_tileserv)
-- ----------------------------------------------------------------------------
-- The API (api/src/db.ts) and pg_tileserv are strictly read-only. This file
-- creates a SELECT-only login role `resiliamap_ro` and grants it read access to
-- exactly the relations they consume. Point DATABASE_URL / TILESERV_DATABASE_URL
-- at this role in any shared/production environment; keep the owner role
-- (resiliamap) for ingest + migrations only.
--
-- MUST run LAST, after resilience.sql + v2_features.sql: db/resilience.sql:192
-- does `DROP MATERIALIZED VIEW IF EXISTS mv_resilience_score CASCADE`, which also
-- drops v_poi_tiles, then both are recreated by the owner. Any GRANT issued
-- before that drop is destroyed. We therefore (a) re-run this file after every
-- schema apply (it is idempotent) AND (b) set ALTER DEFAULT PRIVILEGES so any
-- object the owner creates later automatically grants SELECT to resiliamap_ro.
--
-- DEV password is the local-only default below. In production, override it and
-- keep it equal to the value baked into TILESERV_DATABASE_URL / DATABASE_URL:
--   ALTER ROLE resiliamap_ro PASSWORD '<secret>';
--
-- License: AGPL-3.0-or-later. See README.ResiliaMap.md.
-- ============================================================================

-- Idempotent role create (CREATE ROLE lacks IF NOT EXISTS).
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'resiliamap_ro') THEN
    CREATE ROLE resiliamap_ro LOGIN PASSWORD 'changeme_local_only';
  END IF;
END
$$;

-- Connect + schema usage (idempotent).
GRANT CONNECT ON DATABASE resiliamap TO resiliamap_ro;
GRANT USAGE ON SCHEMA public TO resiliamap_ro;

-- Explicit SELECT on every relation the API + tileserv read today.
GRANT SELECT ON
  critical_poi,
  network_site,
  operator,
  operator_coverage,
  score_constants,
  score_snapshot,
  site_outage,
  mv_resilience_score,
  v_poi_tiles,
  v_department_resilience,
  v_commune_outage_hotspots
TO resiliamap_ro;

-- Belt-and-braces against the CASCADE drop + recreate in resilience.sql: any
-- table/view/matview the owner creates from now on auto-grants SELECT to the RO
-- role, so the recreated mv_resilience_score / v_poi_tiles stay readable.
ALTER DEFAULT PRIVILEGES FOR ROLE resiliamap IN SCHEMA public
  GRANT SELECT ON TABLES TO resiliamap_ro;

-- Deliberately NO INSERT/UPDATE/DELETE and NO sequence grants: this role must
-- never write and never REFRESH the materialized view.
