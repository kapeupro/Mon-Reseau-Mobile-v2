// ============================================================================
// ResiliaMap API — src/constants.ts
// ----------------------------------------------------------------------------
// Operator code -> {name,color} map (the 4 métropole MNOs) for response
// enrichment, plus shared category/subcategory enums and the mandatory Arcep
// disclaimer string.
//
// Colors are the EXACT values from back_mrm/data/operateurs.json (verified):
//   20801 Orange   #ff8700
//   20810 SFR      #b54241
//   20820 Bouygues #3dd0ff
//   20815 Free     #4be1bb   (NOT red — verified)
//
// This mirrors the db/resilience.sql `operator` seed. The DB remains the source
// of truth; this map is a convenience for enriching API responses without an
// extra join when a code is already known.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================

export interface OperatorInfo {
  code: number;
  name: string;
  color: string;
}

/** Métropole operators keyed by MCC-MNC (matches site.code_op / operator.code). */
export const OPERATORS: Record<number, OperatorInfo> = {
  20801: { code: 20801, name: "Orange", color: "#ff8700" },
  20810: { code: 20810, name: "SFR", color: "#b54241" },
  20820: { code: 20820, name: "Bouygues", color: "#3dd0ff" },
  20815: { code: 20815, name: "Free", color: "#4be1bb" },
};

/** Fallback color for an operator code not in the métropole map (e.g. DOM). */
export const UNKNOWN_OPERATOR_COLOR = "#999999";

export function operatorName(code: number | null): string | null {
  if (code == null) return null;
  return OPERATORS[code]?.name ?? `MNO ${code}`;
}

export function operatorColor(code: number | null): string {
  if (code == null) return UNKNOWN_OPERATOR_COLOR;
  return OPERATORS[code]?.color ?? UNKNOWN_OPERATOR_COLOR;
}

/** Allowed POI categories (matches critical_poi.category CHECK constraint). */
export const CATEGORIES = ["sante", "securite"] as const;
export type Category = (typeof CATEGORIES)[number];

export function isCategory(v: unknown): v is Category {
  return typeof v === "string" && (CATEGORIES as readonly string[]).includes(v);
}

/**
 * Methodology notice shown on every data-bearing API response.
 *
 * IMPORTANT (credibility): the score does NOT use Arcep's "simulated/indicative"
 * coverage maps. It is built on FACTUAL open data — the ANFR regulatory registry
 * of authorised radio sites (>5 W) and the operators' OWN declared outages. The
 * only modelled step is the proximity inference (an antenna nearby does not
 * guarantee real reception). So we describe the factual basis, not a simulation.
 */
export const ARCEP_DISCLAIMER =
  "Indicateur dérivé de données ouvertes factuelles : registre ANFR des sites radio autorisés (>5 W) et pannes déclarées par les opérateurs. La présence d'une antenne 4G à proximité ne garantit pas la réception réelle (propagation, bâti, terminal) : le score mesure la robustesse de l'infrastructure, pas la qualité de service. Seuils à étalonner ; ResiliaMap n'est pas un produit officiel de l'Arcep.";

/** Default radius (metres, EPSG:2154) advertised in API meta. The DB
 *  score_constants table is the real source of truth; this is read at startup
 *  and used as a display/meta fallback only. */
export const R_METERS_DEFAULT = Number(process.env.R_METERS ?? 3000);
export const OUTAGE_WINDOW_DAYS_DEFAULT = Number(
  process.env.OUTAGE_WINDOW_DAYS ?? 90
);

/** API port. Defaults to 3010 to avoid collisions with the Arcep stack (:8000);
 *  compose passes API_PORT explicitly (3801 there). */
export const API_PORT = Number(process.env.API_PORT ?? 3010);

/** Version string surfaced in /api/health. Override with API_VERSION env. */
export const API_VERSION = process.env.API_VERSION ?? "0.1.0";
