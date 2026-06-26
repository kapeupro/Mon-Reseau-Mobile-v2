// ============================================================================
// ResiliaMap API — src/schema.ts
// ----------------------------------------------------------------------------
// Single source of the API contract: query-param helpers + response TypeScript
// types. The frontend (web/src/types/api.ts) MUST mirror these shapes exactly.
//
// SRID note: every `bbox` query param is in EPSG:4326 (lon/lat). All emitted
// geometry is ALSO 4326 (for MapLibre / OSM basemap). The server transforms to
// 2154 internally for spatial filtering and distance math — never client-side.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { OPERATORS } from "./constants.ts";

// ----------------------------------------------------------------------------
// Shared sub-shapes
// ----------------------------------------------------------------------------

/** Score component breakdown (already 0..100 for display). */
export interface ScoreBreakdown {
  redundancy: number; // comp_redundancy  (positive contribution, 0..100)
  spof_malus: number; // comp_spof_malus  (subtracted, 0..100)
  outage_malus: number; // comp_outage_malus (subtracted, 0..100)
  n_operators: number; // distinct active 4G operators within R
  n_sites: number; // active 4G sites within R
  n_outages_90d: number; // nearby outages in the window (default 90d)
}

export type CategoryValue = "sante" | "securite";
export type SubcategoryValue =
  | "hopital"
  | "urgences"
  | "police"
  | "gendarmerie"
  | string; // permissive: subcategory is free-ish text in critical_poi

// ----------------------------------------------------------------------------
// GET /api/poi  — GeoJSON FeatureCollection
// ----------------------------------------------------------------------------

export interface PoiProperties {
  id: number;
  name: string;
  category: CategoryValue;
  subcategory: SubcategoryValue | null;
  score: number; // 0..100
  is_uncovered: boolean; // true when no serving site within R
  breakdown: ScoreBreakdown;
  /**
   * F1 OPERATOR FILTER. Present ONLY when the `operator=<MCC-MNC>` query param
   * is supplied. true when that operator has an ACTIVE 4G network_site within
   * R_METERS of the POI (ST_DWithin in 2154). Absent (undefined) otherwise.
   */
  operator_covered?: boolean;
}

export interface PoiFeature {
  type: "Feature";
  id: number;
  geometry: { type: "Point"; coordinates: [number, number] }; // [lon,lat] 4326
  properties: PoiProperties;
}

export interface PoiFeatureCollection {
  type: "FeatureCollection";
  features: PoiFeature[];
  meta: {
    count: number;
    constants: { R_METERS: number; OUTAGE_WINDOW_DAYS: number };
    disclaimer: string;
  };
}

// ----------------------------------------------------------------------------
// GET /api/poi/:id  — detail
// ----------------------------------------------------------------------------

export interface ServingOperator {
  code: number;
  name: string;
  color: string;
  n_sites_within_R: number;
  nearest_site_m: number;
  /** Oldest 4G in-service year among this operator's nearby sites (ANFR). */
  since_year: number | null;
  /** LTE bands deployed nearby, e.g. "700/800/1800/2100/2600" (ANFR). */
  bands: string | null;
}

export interface NearbyOutage {
  observed_date: string; // YYYY-MM-DD
  operator_code: number | null;
  operator_name: string | null;
  distance_m: number;
}

/** F2b. One archived daily score for the POI (from score_snapshot). */
export interface ScoreHistoryPoint {
  date: string; // YYYY-MM-DD (captured_date)
  score: number; // 0..100
}

/** F2b. Nearby outages bucketed by ISO week over OUTAGE_WINDOW_DAYS. */
export interface OutageWeeklyBucket {
  week_start: string; // YYYY-MM-DD (Monday of the ISO week)
  count: number;
}

export interface PoiDetail {
  id: number;
  name: string;
  category: CategoryValue;
  subcategory: SubcategoryValue | null;
  address: string | null;
  insee_com: string | null;
  location: { lon: number; lat: number }; // 4326
  score: number; // 0..100
  is_uncovered: boolean;
  breakdown: ScoreBreakdown;
  serving_operators: ServingOperator[];
  nearby_outages: NearbyOutage[];
  /** F2b. Daily score history (oldest -> newest); may be empty. */
  score_history: ScoreHistoryPoint[];
  /** F2b. Nearby outages bucketed by ISO week over the window; may be empty. */
  outage_weekly: OutageWeeklyBucket[];
  constants: { R_METERS: number; OUTAGE_WINDOW_DAYS: number };
  disclaimer: string;
}

// ----------------------------------------------------------------------------
// GET /api/stats  — national aggregates
// ----------------------------------------------------------------------------

export interface ScoreBucket {
  bucket: "0-19" | "20-39" | "40-59" | "60-79" | "80-100";
  count: number;
}

export interface Stats {
  poi_total: number;
  by_category: { sante: number; securite: number };
  score: { mean: number; median: number; min: number; max: number };
  score_distribution: ScoreBucket[];
  uncovered_poi: number;
  spof_poi: number;
  outages_90d_total: number;
  coverage_layer_loaded: boolean;
  constants: {
    R_METERS: number;
    OUTAGE_WINDOW_DAYS: number;
    REDUNDANCY_FULL_OPERATORS: number;
    W_REDUNDANCY: number;
    W_SPOF_MALUS: number;
    W_OUTAGE: number;
    OUTAGE_DECAY_HALFLIFE_DAYS: number;
  };
  disclaimer: string;
}

// ----------------------------------------------------------------------------
// GET /api/departments  — per-département resilience aggregate (F3)
// ----------------------------------------------------------------------------

/** One row of v_department_resilience (counts are JS numbers, avg parsed). */
export interface DepartmentResilience {
  dept: string; // left(insee_com,2): '75', '13', '2A', '2B', '97' (DOM caveat)
  n_poi: number;
  n_sante: number;
  n_securite: number;
  avg_score: number; // numeric(5,1) -> parsed float, e.g. 62.4
  n_fragile: number; // score < 40
  n_uncovered: number; // is_uncovered
  n_spof: number; // comp_spof_malus > 0
}

export interface DepartmentsResponse {
  departments: DepartmentResilience[]; // sorted by avg_score ASC (NULLS LAST)
  disclaimer: string;
}

// ----------------------------------------------------------------------------
// GET /api/health
// ----------------------------------------------------------------------------

export interface Health {
  status: "ok" | "degraded";
  ok: boolean;
  db: boolean;
  mv_resilience_score: { rows: number; last_refresh: string | null };
  outages: { latest_observed_date: string | null; days_in_archive: number };
  coverage_layer_loaded: boolean;
  version: string;
}

// ----------------------------------------------------------------------------
// GET /api/admin/data-quality  — ingest run health (E4)
// ----------------------------------------------------------------------------

/** Latest run for one ingest source (from ingest_run). */
export interface DataQualitySource {
  source: "sites" | "poi" | "pannes" | "all";
  last_run_at: string | null; // ISO, finished_at of the newest run
  status: "ok" | "partial" | "error" | "never";
  rows_fetched: number | null;
  rows_inserted: number | null;
  rows_ignored: number | null;
  error_detail: string | null;
  unrecognized_columns: string[];
}

export interface DataQuality {
  generated_at: string; // ISO
  sources: DataQualitySource[];
  /** Outage-feed freshness, separating "archive depth" from "did today's fetch work". */
  outage_freshness: {
    latest_observed_date: string | null; // max(observed_date) in site_outage
    days_in_archive: number;
    last_fetch_status: "ok" | "partial" | "error" | "never"; // newest pannes run
    last_fetch_at: string | null;
  };
}

// ----------------------------------------------------------------------------
// Query-param parsing & validation (no external validator dependency).
// Returns {ok:true,value} or {ok:false,error} so routes can map to HTTP 400.
// ----------------------------------------------------------------------------

export type Parsed<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export interface Bbox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

/**
 * Parse and validate a `bbox=minLon,minLat,maxLon,maxLat` query string (4326).
 * Rejects: wrong arity, non-finite numbers, out-of-range lon/lat, and inverted
 * (min >= max) extents. Bounds are generous to allow DOM/world but catch junk.
 */
export function parseBbox(raw: string | null | undefined): Parsed<Bbox> {
  if (!raw || typeof raw !== "string") {
    return { ok: false, error: "bbox is required: minLon,minLat,maxLon,maxLat (EPSG:4326)" };
  }
  const parts = raw.split(",").map((s) => s.trim());
  if (parts.length !== 4) {
    return { ok: false, error: "bbox must have exactly 4 comma-separated numbers: minLon,minLat,maxLon,maxLat" };
  }
  const nums = parts.map(Number);
  if (nums.some((n) => !Number.isFinite(n))) {
    return { ok: false, error: "bbox values must all be finite numbers" };
  }
  const [minLon, minLat, maxLon, maxLat] = nums as [number, number, number, number];
  if (minLon < -180 || maxLon > 180 || minLat < -90 || maxLat > 90) {
    return { ok: false, error: "bbox out of WGS84 range: lon in [-180,180], lat in [-90,90]" };
  }
  if (minLon >= maxLon || minLat >= maxLat) {
    return { ok: false, error: "bbox must satisfy minLon<maxLon and minLat<maxLat" };
  }
  return { ok: true, value: { minLon, minLat, maxLon, maxLat } };
}

/** Validate optional category param. Empty/undefined -> null (no filter). */
export function parseCategory(raw: string | null | undefined): Parsed<CategoryValue | null> {
  if (raw == null || raw === "") return { ok: true, value: null };
  if (raw === "sante" || raw === "securite") return { ok: true, value: raw };
  return { ok: false, error: "category must be 'sante' or 'securite'" };
}

/** Validate a positive integer path id. */
export function parseId(raw: string | null | undefined): Parsed<number> {
  if (raw == null || raw === "") return { ok: false, error: "id is required" };
  if (!/^\d+$/.test(raw)) return { ok: false, error: "id must be a positive integer" };
  const n = Number(raw);
  if (!Number.isSafeInteger(n) || n <= 0) return { ok: false, error: "id out of range" };
  return { ok: true, value: n };
}

/**
 * F1. Validate the optional `operator=<MCC-MNC>` query param. Empty/undefined
 * -> null (no operator overlay). Must otherwise be one of the 4 known métropole
 * operator codes (Orange/SFR/Bouygues/Free) from constants.OPERATORS; anything
 * else is a 400 so we never run an unfiltered/unexpected operator query.
 */
export function parseOperator(raw: string | null | undefined): Parsed<number | null> {
  if (raw == null || raw === "") return { ok: true, value: null };
  if (!/^\d+$/.test(raw)) {
    return { ok: false, error: "operator must be a numeric MCC-MNC code" };
  }
  const code = Number(raw);
  if (!Object.prototype.hasOwnProperty.call(OPERATORS, code)) {
    return {
      ok: false,
      error: "operator must be one of 20801,20810,20820,20815",
    };
  }
  return { ok: true, value: code };
}
