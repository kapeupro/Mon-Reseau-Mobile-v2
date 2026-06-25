// ============================================================================
// ResiliaMap — ingest/db.ts
// ----------------------------------------------------------------------------
// Shared PostgreSQL client for the ingestion layer.
//
// Uses porsager's `postgres` driver. The connection string comes from the
// environment (DATABASE_URL), matching docker-compose.resiliamap.yml and
// .env.resiliamap.example. No secrets are hardcoded.
//
// GEO LAW reminder (see db/resilience.sql): every geom column in the schema is
// fixed to EPSG:2154. The loaders MUST build geometries with
//   ST_Transform(ST_SetSRID(ST_MakePoint(lon,lat),4326),2154)
// for WGS84 inputs, or ST_Transform(geom,2154) for 3857 inputs. A missing
// transform fails LOUD at insert time thanks to the typed SRID constraint.
//
// License: AGPL-3.0-or-later (ResiliaMap new code). See README.ResiliaMap.md.
// ============================================================================

import postgres from "postgres";

/**
 * Resolve the connection string. When run on the host (outside compose) the
 * `db` hostname is not resolvable — use the host-mapped URL from
 * .env.resiliamap (postgres://...@localhost:5440/resiliamap) in that case.
 */
function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url || url.trim() === "") {
    throw new Error(
      "[ingest] DATABASE_URL is not set. Copy .env.resiliamap.example to " +
        ".env.resiliamap and export it, e.g.:\n" +
        "  set -a && source .env.resiliamap && set +a\n" +
        "or run inside the compose `ingest` service which injects it.",
    );
  }
  return url;
}

/**
 * Lazily-constructed singleton sql client. We do NOT build the pool at module
 * import time so that pure helpers (e.g. mapOperatorLabelToCode) can be imported
 * without DATABASE_URL set. The env check fails LOUD on first real DB use.
 *
 * Bun loads `.env*` automatically; when running via the Makefile we
 * `set -a && source .env.resiliamap` first. Keep the pool small — ingestion is
 * sequential and batch-oriented.
 */
let _sql: postgres.Sql | undefined;

function getSql(): postgres.Sql {
  if (_sql === undefined) {
    _sql = postgres(resolveDatabaseUrl(), {
      max: Number(process.env.PG_POOL_MAX ?? 4),
      idle_timeout: 30,
      connect_timeout: 30,
      // We send timestamps/dates as plain strings; let PG parse them.
      transform: { undefined: null },
      onnotice: () => {}, // suppress NOTICE spam (e.g. "table already exists")
    });
  }
  return _sql;
}

/**
 * Tagged-template proxy so loaders keep the ergonomic `sql\`…\`` call style
 * while the underlying pool is created lazily on first use. Also forwards
 * `sql.begin(...)` for transactions.
 */
export const sql: postgres.Sql = new Proxy((() => {}) as unknown as postgres.Sql, {
  apply(_target, _thisArg, args: unknown[]) {
    // Tagged template call: sql`...` -> (strings, ...values)
    return (getSql() as unknown as (...a: unknown[]) => unknown)(...args);
  },
  get(_target, prop, receiver) {
    const real = getSql() as unknown as Record<PropertyKey, unknown>;
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

/** Close the pool (if it was ever opened) so the process can exit. */
export async function closeDb(): Promise<void> {
  if (_sql !== undefined) await _sql.end({ timeout: 5 });
}

/**
 * Refresh the canonical resilience score materialized view via the DB helper
 * function refresh_resilience_score() (defined in db/resilience.sql). The
 * helper does CONCURRENTLY when possible and falls back to a plain REFRESH on
 * the very first build. The MV uses CURRENT_DATE, so it MUST be refreshed after
 * every load or the 90-day outage window + decay drift.
 */
export async function refreshScore(): Promise<void> {
  console.log("[ingest] refreshing mv_resilience_score …");
  await sql`SELECT refresh_resilience_score()`;
  console.log("[ingest] mv_resilience_score refreshed.");
}

/**
 * Map a free-text operator label (from the outages feed or ANFR CSV) to its
 * MCC-MNC code. The four métropole MNOs only; returns null when unmappable so
 * the caller can keep the row with operator_code = NULL + raw_props for audit
 * (NEVER silently guess — see risks in the blueprint).
 *
 * The match is intentionally loose (lowercase, accent-insensitive substring)
 * because the public feeds use inconsistent free-text names.
 */
const OPERATOR_LABEL_PATTERNS: Array<{ code: number; needles: string[] }> = [
  { code: 20801, needles: ["orange"] },
  // SFR appears as "SFR", "Société Française du Radiotéléphone", sometimes "Numericable"
  { code: 20810, needles: ["sfr", "numericable", "radiotelephone", "radiotéléphone"] },
  { code: 20820, needles: ["bouygues", "bytel", "bouygues telecom"] },
  { code: 20815, needles: ["free"] },
];

export function mapOperatorLabelToCode(label: unknown): number | null {
  if (label === null || label === undefined) return null;
  const norm = String(label)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .trim();
  if (norm === "") return null;

  // Sometimes the feed already carries the MCC-MNC numeric code.
  const asNum = Number(norm.replace(/\s+/g, ""));
  if (Number.isInteger(asNum) && [20801, 20810, 20820, 20815].includes(asNum)) {
    return asNum;
  }

  for (const { code, needles } of OPERATOR_LABEL_PATTERNS) {
    if (needles.some((n) => norm.includes(n))) return code;
  }
  return null;
}
