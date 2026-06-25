// ============================================================================
// ResiliaMap web — src/types/api.ts
// ----------------------------------------------------------------------------
// TypeScript types mirroring api/src/schema.ts EXACTLY. This is the single
// shared API contract; if the backend schema changes, change this file to match.
//
// SRID note (from the API): every emitted geometry is EPSG:4326 (lon/lat) for
// MapLibre / the OSM raster basemap. All metric scoring happens server-side in
// EPSG:2154 (Lambert 93) — the frontend never computes distances.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================

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
// Bbox helper (frontend convenience; API expects "minLon,minLat,maxLon,maxLat")
// ----------------------------------------------------------------------------

export interface Bbox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}
