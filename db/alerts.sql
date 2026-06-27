-- ============================================================================
-- ResiliaMap — alerts (E3): subscriptions + fired events
-- ----------------------------------------------------------------------------
-- Lets a watcher subscribe to a critical POI and be notified when:
--   * its score crosses BELOW a threshold (edge-trigger, not continuous spam),
--   * its score DEGRADES vs yesterday by >= degradation_delta (needs the
--     score_snapshot history that A1 now populates daily),
--   * a NEW outage appears today within R_METERS of the POI.
--
-- Evaluation + delivery run in the ingest layer (ingest/alerts.ts), invoked from
-- the daily pipeline AFTER the MV refresh + snapshot. The score is an UNCALIBRATED
-- indicator (see README disclaimers) — every delivered message must carry the
-- ARCEP disclaimer.
--
-- Idempotent (CREATE ... IF NOT EXISTS), applied after the core schema.
-- License: AGPL-3.0-or-later. See README.ResiliaMap.md.
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_subscription (
  id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  poi_id            bigint NOT NULL REFERENCES critical_poi(id) ON DELETE CASCADE,
  channel           text   NOT NULL,            -- 'webhook' | 'email'
  target            text   NOT NULL,            -- webhook URL or email address
  -- What to fire on (a subscription can enable several):
  notify_threshold  boolean NOT NULL DEFAULT false,
  threshold         smallint,                   -- required iff notify_threshold
  notify_degradation boolean NOT NULL DEFAULT false,
  -- Default delta kept generous: the MV decays daily (90-day window) so scores
  -- drift down even with no new data — a small delta would be pure decay noise.
  degradation_delta smallint NOT NULL DEFAULT 15,
  notify_outage     boolean NOT NULL DEFAULT false,
  -- Double opt-in + revocation (used by the deferred subscribe API; webhooks
  -- created by an operator can be inserted pre-confirmed).
  confirmed         boolean NOT NULL DEFAULT false,
  confirm_token     text,
  unsubscribe_token text,
  -- Per-subscription HMAC secret for webhook signing (NULL -> use global env).
  signing_secret    text,
  active            boolean NOT NULL DEFAULT true,
  last_notified_at  timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT alert_sub_channel_chk CHECK (channel IN ('webhook', 'email')),
  CONSTRAINT alert_sub_threshold_chk
    CHECK (NOT notify_threshold OR threshold IS NOT NULL),
  CONSTRAINT alert_sub_threshold_range_chk
    CHECK (threshold IS NULL OR (threshold BETWEEN 0 AND 100)),
  CONSTRAINT alert_sub_something_chk
    CHECK (notify_threshold OR notify_degradation OR notify_outage)
);

CREATE INDEX IF NOT EXISTS ix_alert_subscription_poi
  ON alert_subscription (poi_id);
CREATE INDEX IF NOT EXISTS ix_alert_subscription_active
  ON alert_subscription (active, confirmed) WHERE active AND confirmed;

CREATE TABLE IF NOT EXISTS alert_event (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subscription_id bigint NOT NULL REFERENCES alert_subscription(id) ON DELETE CASCADE,
  kind            text   NOT NULL,              -- 'threshold' | 'degradation' | 'outage'
  fired_for_date  date   NOT NULL,
  payload         jsonb  NOT NULL DEFAULT '{}'::jsonb,
  delivered_at    timestamptz,
  attempts        integer NOT NULL DEFAULT 0,
  last_error      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT alert_event_kind_chk CHECK (kind IN ('threshold', 'degradation', 'outage')),
  -- Dedup guarantee: at most ONE event per (subscription, kind, day).
  CONSTRAINT uq_alert_event UNIQUE (subscription_id, kind, fired_for_date)
);

CREATE INDEX IF NOT EXISTS ix_alert_event_undelivered
  ON alert_event (created_at) WHERE delivered_at IS NULL;

-- The read-only API role may read subscriptions/events (the deferred read views);
-- it never writes — evaluation + delivery run as the owner from ingest/.
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'resiliamap_ro') THEN
    GRANT SELECT ON alert_subscription, alert_event TO resiliamap_ro;
  END IF;
END
$$;
