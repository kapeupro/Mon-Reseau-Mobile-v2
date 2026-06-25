// ============================================================================
// ResiliaMap web — src/components/Legend.tsx
// ----------------------------------------------------------------------------
// Map legend. Two modes, kept in lock-step with the MapLibre circle ramp:
//   "score"     the resilience-score ramp (red -> green) from lib/score.ts,
//               plus the "no serving site" grey.
//   "operator"  F1 OPERATOR FILTER. When an operator overlay is active the map
//               drops the score ramp and paints each POI green (operator has an
//               active 4G site within R) or red (absent); the legend mirrors it.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import {
  SCORE_STOPS,
  UNCOVERED_COLOR,
  OPERATOR_COVERED_COLOR,
  OPERATOR_UNCOVERED_COLOR,
} from "../lib/score";

export type LegendMode = "score" | "operator";

interface Props {
  /** "score" (default) shows the ramp; "operator" shows green/red coverage. */
  mode?: LegendMode;
  /** Operator name to title the coverage legend (e.g. "Orange"). */
  operatorName?: string;
}

export default function Legend({ mode = "score", operatorName }: Props) {
  if (mode === "operator") {
    return (
      <div className="legend" aria-label="Légende de couverture opérateur">
        <div className="legend__title">
          Couverture{operatorName ? ` · ${operatorName}` : ""}
        </div>
        <ul className="legend__list">
          <li className="legend__item">
            <span
              className="legend__swatch legend__swatch--covered"
              style={{ background: OPERATOR_COVERED_COLOR }}
            />
            <span className="legend__desc">Site 4G actif à proximité</span>
          </li>
          <li className="legend__item">
            <span
              className="legend__swatch legend__swatch--uncovered"
              style={{ background: OPERATOR_UNCOVERED_COLOR }}
            />
            <span className="legend__desc">Opérateur absent</span>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="legend" aria-label="Légende du score de résilience">
      <div className="legend__title">Score de résilience</div>
      <ul className="legend__list">
        {SCORE_STOPS.map((s) => (
          <li key={s.label} className="legend__item">
            <span className="legend__swatch" style={{ background: s.color }} />
            <span className="legend__label">
              {s.from}–{s.to}
            </span>
            <span className="legend__desc">{s.description}</span>
          </li>
        ))}
        <li className="legend__item">
          <span className="legend__swatch" style={{ background: UNCOVERED_COLOR }} />
          <span className="legend__label">—</span>
          <span className="legend__desc">Aucun site desservant</span>
        </li>
      </ul>
    </div>
  );
}
