-- ============================================================================
-- ResiliaMap — data-quality run log (E4)
-- ----------------------------------------------------------------------------
-- Per-ingest-run metrics. The loaders already COMPUTE fetched/inserted/ignored
-- + unrecognized columns but only console.log them; this table PERSISTS them so
-- the API (/api/admin/data-quality) and /api/health can report real freshness +
-- failures instead of inferring them from domain tables.
--
-- Idempotent (CREATE ... IF NOT EXISTS), like v2_features.sql. Apply after the
-- core schema. Written by the OWNER role from ingest/; the read-only role gets
-- SELECT via db/30_roles.sql default privileges.
--
-- License: AGPL-3.0-or-later. See README.ResiliaMap.md.
-- ============================================================================

CREATE TABLE IF NOT EXISTS ingest_run (
  id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source              text NOT NULL,            -- 'sites' | 'poi' | 'pannes' | 'all'
  started_at          timestamptz NOT NULL DEFAULT now(),
  finished_at         timestamptz,
  status              text NOT NULL DEFAULT 'ok', -- 'ok' | 'partial' | 'error'
  rows_fetched        integer,                  -- null when a loader doesn't report it
  rows_inserted       integer,
  rows_ignored        integer,
  error_detail        text,
  unrecognized_columns jsonb NOT NULL DEFAULT '[]'::jsonb,
  extra               jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT ingest_run_source_chk CHECK (source IN ('sites', 'poi', 'pannes', 'all')),
  CONSTRAINT ingest_run_status_chk CHECK (status IN ('ok', 'partial', 'error'))
);

-- Fast "latest run per source" lookups for the dashboard + health freshness.
CREATE INDEX IF NOT EXISTS ingest_run_source_started_idx
  ON ingest_run (source, started_at DESC);

-- The read-only API role must be able to read the log (in case 30_roles.sql ran
-- before this table existed). Harmless if the role/grant already covers it.
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'resiliamap_ro') THEN
    GRANT SELECT ON ingest_run TO resiliamap_ro;
  END IF;
END
$$;
