// ============================================================================
// ResiliaMap web — src/api.ts
// ----------------------------------------------------------------------------
// Typed fetch client for the ResiliaMap API (Bun + Elysia).
//
// Endpoints mirrored from api/src/schema.ts (the single contract source):
//   GET /api/poi?bbox=minLon,minLat,maxLon,maxLat&category=&operator=  -> GeoJSON FC
//   GET /api/poi/:id                                          -> PoiDetail
//   GET /api/stats?category=                                  -> Stats
//   GET /api/departments                                      -> DepartmentsResponse
//   GET /api/health                                           -> Health
//
// Base URL: import.meta.env.VITE_API_URL (default http://localhost:3801).
// In the compose stack, set VITE_API_URL="/api"-host (nginx proxies). When the
// base is left as a relative path the Vite dev proxy forwards /api -> :3801.
//
// SRID note: bbox sent in EPSG:4326; geometry received in EPSG:4326. All metric
// scoring is server-side in EPSG:2154 — the frontend never computes distances.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================

import type {
  Bbox,
  CategoryValue,
  DataQuality,
  DepartmentsResponse,
  Health,
  PoiDetail,
  PoiFeatureCollection,
  Stats,
} from "./types/api";

/**
 * API base URL. Defaults to the api/ default dev port (3801). Trailing slashes
 * are stripped so `${API_BASE}/api/...` is always well formed. A relative value
 * like "" (empty) makes requests same-origin so the Vite dev proxy / nginx can
 * forward them.
 */
export const API_BASE: string = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3801"
).replace(/\/+$/, "");

/** Standard error envelope thrown by the client on non-2xx responses. */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = `${API_BASE}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      signal,
      headers: { Accept: "application/json, application/geo+json" },
    });
  } catch (cause) {
    // Network-level failure (API down, CORS, DNS...). Surface a clear message.
    throw new ApiError(0, `Réseau: impossible de joindre l'API (${url})`, cause);
  }

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status} sur ${path}`;
    if (parsed && typeof parsed === "object" && "error" in parsed) {
      const e = (parsed as { error: unknown }).error;
      if (typeof e === "string") msg = e;
    }
    throw new ApiError(res.status, msg, parsed);
  }

  return parsed as T;
}

/** Serialize a bbox into the API's `minLon,minLat,maxLon,maxLat` query form. */
export function bboxToParam(b: Bbox): string {
  // Clamp to WGS84 range so MapLibre's slightly-over-the-edge bounds at world
  // zoom never trip the API's 400 validation.
  const lon = (v: number) => Math.min(180, Math.max(-180, v));
  const lat = (v: number) => Math.min(90, Math.max(-90, v));
  const minLon = lon(b.minLon);
  const maxLon = lon(b.maxLon);
  const minLat = lat(b.minLat);
  const maxLat = lat(b.maxLat);
  return `${minLon},${minLat},${maxLon},${maxLat}`;
}

/**
 * GET /api/poi — POIs (with score + breakdown) inside a bbox, optional category.
 * Returns a GeoJSON FeatureCollection with `meta` (count, constants, disclaimer).
 *
 * F1: when `operator` (an MCC-MNC code) is supplied it is forwarded as
 * `&operator=`, and each Feature.properties gains `operator_covered` (boolean).
 * When `operator` is null the param is omitted and `operator_covered` is absent.
 */
export function getPoi(
  bbox: Bbox,
  category: CategoryValue | null,
  operator?: number | null,
  signal?: AbortSignal,
): Promise<PoiFeatureCollection> {
  const params = new URLSearchParams({ bbox: bboxToParam(bbox) });
  if (category) params.set("category", category);
  if (operator != null) params.set("operator", String(operator));
  return request<PoiFeatureCollection>(`/api/poi?${params.toString()}`, signal);
}

/** GET /api/poi/:id — full detail for one POI. */
export function getPoiDetail(
  id: number,
  signal?: AbortSignal,
): Promise<PoiDetail> {
  return request<PoiDetail>(`/api/poi/${encodeURIComponent(String(id))}`, signal);
}

/** GET /api/stats — national aggregates, optional category filter. */
export function getStats(
  category: CategoryValue | null,
  signal?: AbortSignal,
): Promise<Stats> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  const qs = params.toString();
  return request<Stats>(`/api/stats${qs ? `?${qs}` : ""}`, signal);
}

/**
 * GET /api/departments — per-département resilience aggregate, sorted by
 * avg_score ASC (most fragile first), wrapped as { departments, disclaimer }.
 */
export function getDepartments(
  signal?: AbortSignal,
): Promise<DepartmentsResponse> {
  return request<DepartmentsResponse>(`/api/departments`, signal);
}

/** GET /api/health — DB + MV freshness (used for a status indicator). */
export function getHealth(signal?: AbortSignal): Promise<Health> {
  return request<Health>(`/api/health`, signal);
}

/** GET /api/admin/data-quality — per-source ingest run health (E4 admin view). */
export function getDataQuality(signal?: AbortSignal): Promise<DataQuality> {
  return request<DataQuality>(`/api/admin/data-quality`, signal);
}
