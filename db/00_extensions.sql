-- ============================================================================
-- ResiliaMap — 00_extensions.sql
-- ----------------------------------------------------------------------------
-- PostGIS extension bootstrap. Idempotent. Applied before db/resilience.sql.
-- This file is OPTIONAL: db/resilience.sql also ensures the extension itself,
-- so the schema can be applied with a single psql call. Splitting is provided
-- for operators who prefer a dedicated extension migration (e.g. when the DB
-- role applying the schema is not a superuser and extensions are pre-created).
--
-- License: AGPL-3.0-or-later (ResiliaMap new code). See README.ResiliaMap.md.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;
-- postgis_topology is NOT required by ResiliaMap. Enable only if you extend
-- the schema with topology features:
-- CREATE EXTENSION IF NOT EXISTS postgis_topology;
