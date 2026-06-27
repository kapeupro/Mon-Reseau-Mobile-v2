// ============================================================================
// ResiliaMap web — src/components/Filters.tsx
// ----------------------------------------------------------------------------
// Category filter overlaid on the map: Tous / Santé / Sécurité. A null value
// means no filter (both categories shown).
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import type { CategoryValue } from "../types/api";

interface Props {
  value: CategoryValue | null;
  onChange: (v: CategoryValue | null) => void;
}

const OPTIONS: { value: CategoryValue | null; label: string; icon: string }[] = [
  { value: null, label: "Tous", icon: "◍" },
  { value: "sante", label: "Santé", icon: "✚" },
  { value: "securite", label: "Sécurité", icon: "⊕" },
];

export default function Filters({ value, onChange }: Props) {
  return (
    <div className="filters" role="group" aria-label="Filtrer par catégorie">
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.label}
            type="button"
            className={`filters__btn${active ? " filters__btn--active" : ""}`}
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
          >
            <span className="filters__icon" aria-hidden="true">
              {opt.icon}
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
