// ============================================================================
// ResiliaMap — ingest/pannes.ts   (ingest:pannes)
// ----------------------------------------------------------------------------
// >>> THE ARCHIVAL CORE — this is ResiliaMap's main value-add. <<<
//
// Arcep publishes a DAILY DATED GeoJSON of "sites indisponibles" (sites en
// panne / unavailable). NOBODY archives the daily snapshot: the URL only ever
// serves "today". If you don't capture it each day, the history is lost.
// ResiliaMap historises every day into site_outage(observed_date, …) so the
// resilience score can count recent nearby outages over a 90-day window.
//
// URL pattern (confirmed in cron_update_site.py):
//   {OUTAGE_BASE_URL}/{YYYY-MM-DD}/raw{YYYY-MM-DD}.geojson
//   default OUTAGE_BASE_URL = https://object.files.data.gouv.fr/arcep/sites-indisponibles/all
// The date is computed in Europe/Paris (matching the Arcep cron's ZoneInfo).
//
// GEO: features are WGS84 (EPSG:4326). We reproject to EPSG:2154 at insert via
//   ST_Transform(ST_SetSRID(ST_MakePoint(lon,lat),4326),2154).
//
// IDEMPOTENCY: UNIQUE(observed_date, source_site_id, operator_code) on
// site_outage means re-running a given day does NOT double-count. We ON CONFLICT
// DO NOTHING so a re-run is a safe no-op for already-captured rows.
//
// USAGE:
//   bun run pannes.ts                      # today (Europe/Paris)
//   bun run pannes.ts --date 2026-06-20    # one specific day
//   bun run pannes.ts --from 2026-06-01 --to 2026-06-20   # backfill a range
//   bun run pannes.ts --no-refresh         # skip MV refresh (e.g. inside ingest:all)
//
// License: AGPL-3.0-or-later (ResiliaMap new code). See README.ResiliaMap.md.
// ============================================================================

import {
  sql,
  closeDb,
  refreshScore,
  snapshotScore,
  mapOperatorLabelToCode,
} from "./db.ts";
import { pick, jsonParam } from "./pick.ts";

const OUTAGE_BASE_URL =
  process.env.OUTAGE_BASE_URL ??
  "https://object.files.data.gouv.fr/arcep/sites-indisponibles/all";

// ---------------------------------------------------------------------------
// Date helpers (Europe/Paris)
// ---------------------------------------------------------------------------

/** Today as YYYY-MM-DD in the Europe/Paris timezone (matches the Arcep cron). */
function todayParis(): string {
  // en-CA gives ISO-like YYYY-MM-DD; timeZone pins it to Paris regardless of host.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Validate a YYYY-MM-DD string and return it, else throw. */
function assertDate(d: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    throw new Error(`Invalid --date "${d}" (expected YYYY-MM-DD).`);
  }
  return d;
}

/** Inclusive list of YYYY-MM-DD dates from `from` to `to`. */
function dateRange(from: string, to: string): string[] {
  const out: string[] = [];
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  if (start > end) throw new Error(`--from (${from}) is after --to (${to}).`);
  for (let d = start; d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function outageUrl(date: string): string {
  return `${OUTAGE_BASE_URL}/${date}/raw${date}.geojson`;
}

// ---------------------------------------------------------------------------
// GeoJSON feature -> outage row
// ---------------------------------------------------------------------------

interface GeoJsonFeature {
  type: "Feature";
  geometry: { type: string; coordinates: unknown } | null;
  properties: Record<string, unknown> | null;
}

interface OutageRow {
  observed_date: string;
  source_site_id: string | null;
  operator_code: number | null;
  raw_props: Record<string, unknown>;
  lon: number;
  lat: number;
}

/**
 * Extract (lon, lat) from a GeoJSON geometry. The feed is a Point feed; we only
 * support Point and (defensively) the first coordinate of other geometries.
 * Returns null when no usable coordinate is present.
 */
function extractLonLat(geometry: GeoJsonFeature["geometry"]): [number, number] | null {
  if (!geometry) return null;
  const coords = geometry.coordinates;
  // Point: [lon, lat]
  if (
    geometry.type === "Point" &&
    Array.isArray(coords) &&
    typeof coords[0] === "number" &&
    typeof coords[1] === "number"
  ) {
    return [coords[0], coords[1]];
  }
  // Defensive: dig to the first numeric pair for MultiPoint/other.
  let node: unknown = coords;
  while (Array.isArray(node) && Array.isArray(node[0])) node = node[0];
  if (
    Array.isArray(node) &&
    typeof node[0] === "number" &&
    typeof node[1] === "number"
  ) {
    return [node[0], node[1]];
  }
  return null;
}

function featureToRow(feature: GeoJsonFeature, observedDate: string): OutageRow | null {
  const props = feature.properties ?? {};
  const ll = extractLonLat(feature.geometry);
  if (!ll) return null; // no geometry -> cannot place on map / score

  // Site identifier: defensive pick over the unstable property names.
  // TODO(one-time real-file inspection): confirm the exact site-id property name
  // in a real raw{date}.geojson. Candidates below cover the likely Arcep/ANFR forms.
  const sourceSiteId =
    pick(props, [
      "station_anfr", // VERIFIED real column in raw{date}.geojson (2026-06-23)
      "id_site",
      "site_id",
      "id_station_anfr",
      "id_station",
      "num_site",
      "code_site",
      "id",
      "gid",
      "fid",
    ], { context: "pannes source_site_id" }) ?? null;

  // Operator label -> MCC-MNC (nullable; unmappable rows kept for audit).
  // TODO(one-time real-file inspection): confirm the operator property name.
  const operatorLabel = pick(props, [
    "operateur",
    "operator",
    "nom_operateur",
    "code_op",
    "exploitant",
  ], { context: "pannes operator" });
  const operatorCode = mapOperatorLabelToCode(operatorLabel);
  if (operatorLabel && operatorCode === null) {
    console.warn(
      `[pannes] unmappable operator "${operatorLabel}" — kept with operator_code NULL (raw_props retained).`,
    );
  }

  return {
    observed_date: observedDate,
    source_site_id: sourceSiteId,
    operator_code: operatorCode,
    raw_props: props, // forensic audit: column names are unstable
    lon: ll[0],
    lat: ll[1],
  };
}

// ---------------------------------------------------------------------------
// Load one day
// ---------------------------------------------------------------------------

interface DayResult {
  date: string;
  fetched: number;
  inserted: number;
  skippedNoGeom: number;
  status: "ok" | "missing" | "error";
}

async function loadDay(date: string): Promise<DayResult> {
  const url = outageUrl(date);
  console.log(`[pannes] ${date}: GET ${url}`);

  let resp: Response;
  try {
    resp = await fetch(url, { headers: { Accept: "application/geo+json,application/json" } });
  } catch (err) {
    console.error(`[pannes] ${date}: network error: ${(err as Error).message}`);
    return { date, fetched: 0, inserted: 0, skippedNoGeom: 0, status: "error" };
  }

  if (resp.status === 404) {
    // Common for future dates, weekends, or days the snapshot was not published.
    console.warn(`[pannes] ${date}: 404 (no snapshot for this day) — skipping.`);
    return { date, fetched: 0, inserted: 0, skippedNoGeom: 0, status: "missing" };
  }
  if (!resp.ok) {
    console.error(`[pannes] ${date}: HTTP ${resp.status} ${resp.statusText}`);
    return { date, fetched: 0, inserted: 0, skippedNoGeom: 0, status: "error" };
  }

  let fc: { features?: GeoJsonFeature[] };
  try {
    fc = (await resp.json()) as { features?: GeoJsonFeature[] };
  } catch (err) {
    console.error(`[pannes] ${date}: invalid JSON: ${(err as Error).message}`);
    return { date, fetched: 0, inserted: 0, skippedNoGeom: 0, status: "error" };
  }

  const features = Array.isArray(fc.features) ? fc.features : [];
  let skippedNoGeom = 0;
  const rows: OutageRow[] = [];
  for (const f of features) {
    const row = featureToRow(f, date);
    if (row === null) {
      skippedNoGeom++;
      continue;
    }
    rows.push(row);
  }

  if (rows.length === 0) {
    console.warn(`[pannes] ${date}: 0 mappable features (fetched ${features.length}).`);
    return { date, fetched: features.length, inserted: 0, skippedNoGeom, status: "ok" };
  }

  // Idempotent insert. The COALESCE'd UNIQUE index uq_site_outage makes
  // re-running a day a no-op even for rows with a NULL site id / operator.
  // We reproject 4326 -> 2154 in SQL.
  // Batched to keep parameter counts sane on big days.
  let inserted = 0;
  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const res = await sql`
      INSERT INTO site_outage
        (observed_date, source_site_id, operator_code, raw_props, geom)
      SELECT
        x.observed_date::date,
        x.source_site_id,
        x.operator_code,
        x.raw_props::jsonb,
        -- GEO LAW: WGS84 input reprojected to Lambert 93 (EPSG:2154)
        ST_Transform(ST_SetSRID(ST_MakePoint(x.lon, x.lat), 4326), 2154)
      -- sql.json() lets porsager bind the whole batch as a single jsonb value.
      -- (Do NOT pre-JSON.stringify + ::jsonb — that double-encodes and breaks
      -- jsonb_to_recordset with "cannot call ... on a non-array".)
      -- The batch is a plain JSON-serialisable array of OutageRow objects;
      -- jsonParam() widens the typed array to porsager's JSONValue (see pick.ts).
      FROM jsonb_to_recordset(${sql.json(jsonParam(batch))})
        AS x(
          observed_date  text,
          source_site_id text,
          operator_code  bigint,
          raw_props      jsonb,
          lon            double precision,
          lat            double precision
        )
      ON CONFLICT (observed_date, COALESCE(source_site_id, ''), COALESCE(operator_code, -1)) DO NOTHING
    `;
    inserted += res.count;
  }

  console.log(
    `[pannes] ${date}: fetched=${features.length} mappable=${rows.length} ` +
      `inserted=${inserted} (dupes skipped=${rows.length - inserted}) noGeom=${skippedNoGeom}`,
  );
  return { date, fetched: features.length, inserted, skippedNoGeom, status: "ok" };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): {
  dates: string[];
  refresh: boolean;
} {
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const refresh = !argv.includes("--no-refresh");

  const single = get("--date");
  const from = get("--from");
  const to = get("--to");

  if (from || to) {
    if (!from || !to) throw new Error("Backfill needs BOTH --from and --to (YYYY-MM-DD).");
    return { dates: dateRange(assertDate(from), assertDate(to)), refresh };
  }
  if (single) return { dates: [assertDate(single)], refresh };
  return { dates: [todayParis()], refresh };
}

export async function runPannes(argv: string[] = process.argv.slice(2)): Promise<DayResult[]> {
  const { dates, refresh } = parseArgs(argv);
  console.log(`[pannes] historising ${dates.length} day(s): ${dates[0]}${dates.length > 1 ? ` … ${dates.at(-1)}` : ""}`);

  const results: DayResult[] = [];
  for (const date of dates) {
    results.push(await loadDay(date));
  }

  const totalInserted = results.reduce((a, r) => a + r.inserted, 0);
  console.log(`[pannes] done. New outage rows archived: ${totalInserted}.`);

  if (refresh) {
    await refreshScore();
    // Daily cron path (cron_outages.ts): record the day's scores for history.
    await snapshotScore();
  }
  return results;
}

// Run when invoked directly (not when imported by index.ts).
if (import.meta.main) {
  runPannes()
    .then((results) => {
      const hadError = results.some((r) => r.status === "error");
      return closeDb().then(() => process.exit(hadError ? 1 : 0));
    })
    .catch(async (err) => {
      console.error("[pannes] FATAL:", err);
      await closeDb().catch(() => {});
      process.exit(1);
    });
}
