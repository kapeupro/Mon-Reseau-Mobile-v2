// ============================================================================
// ResiliaMap web — src/lib/score.ts
// ----------------------------------------------------------------------------
// Resilience-score color ramp (red = fragile -> green = resilient) and the
// bucket labels, kept consistent with the /api/stats score_distribution
// buckets (0-19, 20-39, 40-59, 60-79, 80-100).
//
// The exact same ramp is used for the MapLibre circle layer (see
// scoreColorStops) and the legend, so the map and the legend never disagree.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================

import type { ScoreBucket } from "../types/api";

export interface ScoreStop {
  /** Lower bound of the bucket (inclusive). */
  from: number;
  /** Upper bound of the bucket (inclusive). */
  to: number;
  /** Bucket label matching /api/stats. */
  label: ScoreBucket["bucket"];
  /** Hex color used on the map + legend. */
  color: string;
  /** Short human description (FR). */
  description: string;
}

/**
 * Five-bucket diverging ramp from red (fragile) to green (resilient).
 * Order matters: lowest score first.
 */
export const SCORE_STOPS: ScoreStop[] = [
  { from: 0, to: 19, label: "0-19", color: "#d7191c", description: "Très fragile" },
  { from: 20, to: 39, label: "20-39", color: "#fdae61", description: "Fragile" },
  { from: 40, to: 59, label: "40-59", color: "#ffffbf", description: "Moyen" },
  { from: 60, to: 79, label: "60-79", color: "#a6d96a", description: "Bon" },
  { from: 80, to: 100, label: "80-100", color: "#1a9641", description: "Résilient" },
];

/** Color shown for a POI with no serving site (is_uncovered === true). */
export const UNCOVERED_COLOR = "#6b7280"; // neutral grey

/** Map a 0..100 score to a ramp color. */
export function scoreToColor(score: number): string {
  for (const stop of SCORE_STOPS) {
    if (score <= stop.to) return stop.color;
  }
  return SCORE_STOPS[SCORE_STOPS.length - 1]!.color;
}

/**
 * MapLibre `step` expression stops for circle-color, derived from SCORE_STOPS
 * so the map ramp is the single source of truth. Returns the args after the
 * input expression: [color0, stop1, color1, stop2, color2, ...].
 */
export function scoreColorStepArgs(): (string | number)[] {
  // step(input, base, stop, value, stop, value, ...)
  // base color = first bucket; then a new color at the START of each next bucket.
  const args: (string | number)[] = [SCORE_STOPS[0]!.color];
  for (let i = 1; i < SCORE_STOPS.length; i++) {
    args.push(SCORE_STOPS[i]!.from, SCORE_STOPS[i]!.color);
  }
  return args;
}
