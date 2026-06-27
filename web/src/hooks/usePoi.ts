// ============================================================================
// ResiliaMap web — src/hooks/usePoi.ts
// ----------------------------------------------------------------------------
// TanStack Query hooks wrapping the typed API client (src/api.ts):
//   usePoi(bbox, category, operator)  POIs in the current map bbox (bbox-driven)
//   usePoiDetail(id)         full detail for a clicked POI
//   useStats(category)       national aggregates
//   useDepartments()         per-département resilience ranking (F3)
//   useHealth()              API/DB health for the status badge
//
// The bbox is rounded into a coarse query key so panning a few metres does not
// trigger a refetch storm; MapView debounces moveend on top of this.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================

import { useQuery } from "@tanstack/react-query";
import {
  getDepartments,
  getHealth,
  getPoi,
  getPoiDetail,
  getStats,
} from "../api";
import type { Bbox, CategoryValue } from "../types/api";

/** Round bbox coords so tiny movements reuse the same cache entry. */
function roundBbox(b: Bbox): Bbox {
  const r = (v: number) => Math.round(v * 1000) / 1000; // ~100m precision
  return {
    minLon: r(b.minLon),
    minLat: r(b.minLat),
    maxLon: r(b.maxLon),
    maxLat: r(b.maxLat),
  };
}

/**
 * POIs inside the current map bbox. `enabled` lets the caller hold the query
 * until the map has emitted its first real bounds.
 *
 * F1: `operator` (an MCC-MNC code or null) is part of the query key and is
 * forwarded to the API so each Feature gains `operator_covered` when set.
 */
export function usePoi(
  bbox: Bbox | null,
  category: CategoryValue | null,
  operator: number | null = null,
  enabled = true,
) {
  const key = bbox ? roundBbox(bbox) : null;
  return useQuery({
    queryKey: ["poi", key, category, operator],
    queryFn: ({ signal }) => getPoi(bbox as Bbox, category, operator, signal),
    enabled: enabled && bbox != null,
    // Keep the previous features painted while the next bbox loads (no flicker).
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

/** Full detail for a single POI; disabled when no POI is selected. */
export function usePoiDetail(id: number | null) {
  return useQuery({
    queryKey: ["poi-detail", id],
    queryFn: ({ signal }) => getPoiDetail(id as number, signal),
    enabled: id != null,
    staleTime: 60_000,
  });
}

/** National aggregates for the headline stats bar. */
export function useStats(category: CategoryValue | null) {
  return useQuery({
    queryKey: ["stats", category],
    queryFn: ({ signal }) => getStats(category, signal),
    staleTime: 60_000,
  });
}

/** Per-département resilience ranking (most fragile first). */
export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: ({ signal }) => getDepartments(signal),
    staleTime: 60_000,
  });
}

/** API/DB health for the connection-status badge. */
export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) => getHealth(signal),
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });
}
