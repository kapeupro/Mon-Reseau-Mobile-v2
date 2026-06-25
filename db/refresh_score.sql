-- ============================================================================
-- ResiliaMap — db/refresh_score.sql
-- ----------------------------------------------------------------------------
-- Refresh the canonical resilience score materialized view.
-- Called by the ingest pipeline after each load (and by `make refresh-score`).
--
-- The MV uses CURRENT_DATE for the 90-day outage window + decay, so it MUST be
-- refreshed daily (after the outages load) or scores drift / go stale.
--
-- REFRESH ... CONCURRENTLY requires the UNIQUE index ux_mv_resilience_score_poi
-- (created in db/resilience.sql) and a previously-populated MV. We use the
-- refresh_resilience_score() helper which falls back to a plain REFRESH on the
-- first build.
--
-- License: AGPL-3.0-or-later (ResiliaMap new code). See README.ResiliaMap.md.
-- ============================================================================

SELECT refresh_resilience_score();
