// ============================================================================
// ResiliaMap web — src/components/OperatorFilter.tsx
// ----------------------------------------------------------------------------
// F1 OPERATOR FILTER. A pill selector overlaid on the map: Tous / Orange / SFR
// / Bouygues / Free, each with the operator's brand colour dot. A null value
// means "no operator overlay" (the map keeps the score ramp). When an operator
// is chosen the parent switches the map to the green/red coverage colouring and
// requests &operator=<code> so every POI gets `operator_covered`.
//
// Self-contained leaf: it only receives the selected code + an onChange; it
// holds no state. Codes/colours come from lib/operators.ts (the shared map).
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { OPERATOR_LIST } from "../lib/operators";

interface Props {
  /** Selected operator MCC-MNC code, or null for "Tous" (no overlay). */
  value: number | null;
  /** Called with the new code (or null to clear the overlay). */
  onChange: (code: number | null) => void;
}

export default function OperatorFilter({ value, onChange }: Props) {
  return (
    <div
      className="opfilter"
      role="group"
      aria-label="Filtrer par opérateur"
    >
      <button
        type="button"
        className={`opfilter__btn${value == null ? " opfilter__btn--active" : ""}`}
        aria-pressed={value == null}
        onClick={() => onChange(null)}
      >
        Tous
      </button>
      {OPERATOR_LIST.map((op) => {
        const active = value === op.code;
        return (
          <button
            key={op.code}
            type="button"
            className={`opfilter__btn${active ? " opfilter__btn--active" : ""}`}
            aria-pressed={active}
            onClick={() => onChange(op.code)}
          >
            <span
              className="opfilter__dot"
              style={{ background: op.color }}
              aria-hidden="true"
            />
            {op.name}
          </button>
        );
      })}
    </div>
  );
}
