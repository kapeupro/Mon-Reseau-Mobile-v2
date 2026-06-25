// ============================================================================
// ResiliaMap web — src/components/Legend.tsx
// ----------------------------------------------------------------------------
// Score colour legend, driven by lib/score.ts SCORE_STOPS so it always matches
// the MapLibre circle ramp. Includes the "no serving site" grey.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { SCORE_STOPS, UNCOVERED_COLOR } from "../lib/score";

export default function Legend() {
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
