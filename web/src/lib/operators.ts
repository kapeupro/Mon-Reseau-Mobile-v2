// ============================================================================
// ResiliaMap web — src/lib/operators.ts
// ----------------------------------------------------------------------------
// Operator code -> {name,color} map for the 4 métropole MNOs, shared by the
// map styling, the POI panel chips and the legend.
//
// Colors are the EXACT values from back_mrm/data/operateurs.json (verified),
// mirroring api/src/constants.ts:
//   20801 Orange   #ff8700
//   20810 SFR      #b54241
//   20820 Bouygues #3dd0ff
//   20815 Free     #4be1bb   (NOT red — verified)
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================

export interface OperatorInfo {
  code: number;
  name: string;
  color: string;
}

/** Métropole operators keyed by MCC-MNC (matches operator.code / site.code_op). */
export const OPERATORS: Record<number, OperatorInfo> = {
  20801: { code: 20801, name: "Orange", color: "#ff8700" },
  20810: { code: 20810, name: "SFR", color: "#b54241" },
  20820: { code: 20820, name: "Bouygues", color: "#3dd0ff" },
  20815: { code: 20815, name: "Free", color: "#4be1bb" },
};

/** Ordered list for the legend (stable display order). */
export const OPERATOR_LIST: OperatorInfo[] = [
  OPERATORS[20801]!,
  OPERATORS[20810]!,
  OPERATORS[20820]!,
  OPERATORS[20815]!,
];

/** Fallback color for an operator code outside the métropole map (e.g. DOM). */
export const UNKNOWN_OPERATOR_COLOR = "#999999";

export function operatorName(code: number | null | undefined): string {
  if (code == null) return "Inconnu";
  return OPERATORS[code]?.name ?? `MNO ${code}`;
}

export function operatorColor(code: number | null | undefined): string {
  if (code == null) return UNKNOWN_OPERATOR_COLOR;
  return OPERATORS[code]?.color ?? UNKNOWN_OPERATOR_COLOR;
}
