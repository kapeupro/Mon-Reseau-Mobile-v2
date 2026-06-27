// ============================================================================
// ResiliaMap web — src/hooks/useUrlState.ts
// ----------------------------------------------------------------------------
// F4 PERMALINKS. Reads the shareable view + filter state from the URL query
// string ONCE on mount, and writes it back (debounced) via history.replaceState
// so the address bar always reflects what is on screen without polluting the
// browser back/forward history.
//
// Synced keys (all optional; absent => default):
//   lng,lat   map center (EPSG:4326, lon/lat) — rounded to 4 decimals (~11 m)
//   z         map zoom (rounded to 2 decimals)
//   cat       category filter: "sante" | "securite"
//   op        operator filter: MCC-MNC code (e.g. 20801)
//
// A shared URL therefore reopens the exact same view + active filters.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================

import { useEffect, useMemo, useRef } from "react";
import type { CategoryValue } from "../types/api";

/** Map view + filter snapshot serialised to / from the URL. */
export interface UrlState {
  lng: number | null;
  lat: number | null;
  zoom: number | null;
  category: CategoryValue | null;
  operator: number | null;
}

const VALID_CATEGORIES: ReadonlySet<string> = new Set(["sante", "securite"]);

/** Parse a finite float from a query param, or null. */
function num(v: string | null): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Read the initial state from the current location. Pure (no React); call once
 * to seed component state so the first render already reflects a shared link.
 */
export function readUrlState(): UrlState {
  const p = new URLSearchParams(window.location.search);
  const rawCat = p.get("cat");
  const category =
    rawCat && VALID_CATEGORIES.has(rawCat) ? (rawCat as CategoryValue) : null;
  const op = num(p.get("op"));
  return {
    lng: num(p.get("lng")),
    lat: num(p.get("lat")),
    zoom: num(p.get("z")),
    category,
    operator: op != null ? Math.trunc(op) : null,
  };
}

/** Round helpers keep the URL short and stable across tiny map jitters. */
const r4 = (v: number) => Math.round(v * 1e4) / 1e4;
const r2 = (v: number) => Math.round(v * 100) / 100;

/** Build the query string for a state (omitting null fields). */
function serialize(s: UrlState): string {
  const p = new URLSearchParams();
  if (s.lng != null) p.set("lng", String(r4(s.lng)));
  if (s.lat != null) p.set("lat", String(r4(s.lat)));
  if (s.zoom != null) p.set("z", String(r2(s.zoom)));
  if (s.category) p.set("cat", s.category);
  if (s.operator != null) p.set("op", String(s.operator));
  return p.toString();
}

/**
 * Debounced URL writer. Pass the current state; the hook coalesces rapid changes
 * (map moveend + filter toggles) into one history.replaceState. Never pushes a
 * new history entry, so back/forward stay clean.
 */
export function useUrlSync(state: UrlState, debounceMs = 400): void {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Stable-ish dependency: the serialized query string.
  const qs = useMemo(() => serialize(state), [state]);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      // Only touch history when the query string actually changed.
      const current = window.location.search.replace(/^\?/, "");
      if (current === qs) return;
      const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      window.history.replaceState(window.history.state, "", url);
    }, debounceMs);
    return () => clearTimeout(timer.current);
  }, [qs, debounceMs]);
}
