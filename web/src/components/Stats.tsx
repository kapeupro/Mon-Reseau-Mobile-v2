// ============================================================================
// ResiliaMap web — src/components/Stats.tsx
// ----------------------------------------------------------------------------
// National headline numbers from GET /api/stats — the "shareable" figures
// (scored POI, fragile share, single-points-of-failure, recent outages). Honors
// the active category filter.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import type { CategoryValue } from "../types/api";
import { useStats } from "../hooks/usePoi";

interface Props {
  category: CategoryValue | null;
}

function fmt(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("fr-FR");
}

function pct(part: number, whole: number): string {
  if (!whole) return "—";
  return `${Math.round((part / whole) * 100)} %`;
}

export default function Stats({ category }: Props) {
  const { data, isLoading, isError } = useStats(category);

  if (isError) {
    return (
      <div className="stats stats--empty">
        Statistiques indisponibles (API hors ligne).
      </div>
    );
  }

  const total = data?.poi_total ?? 0;

  return (
    <div className="stats" aria-busy={isLoading}>
      <div className="stats__card">
        <div className="stats__value">{isLoading ? "…" : fmt(total)}</div>
        <div className="stats__label">Lieux critiques scorés</div>
      </div>
      <div className="stats__card stats__card--alert">
        <div className="stats__value">
          {isLoading ? "…" : fmt(data?.uncovered_poi)}
        </div>
        <div className="stats__label">
          Sans site desservant
          {data ? ` · ${pct(data.uncovered_poi, total)}` : ""}
        </div>
      </div>
      <div className="stats__card stats__card--warn">
        <div className="stats__value">{isLoading ? "…" : fmt(data?.spof_poi)}</div>
        <div className="stats__label">
          Point de défaillance unique
          {data ? ` · ${pct(data.spof_poi, total)}` : ""}
        </div>
      </div>
      <div className="stats__card">
        <div className="stats__value">
          {isLoading ? "…" : fmt(data?.outages_90d_total)}
        </div>
        <div className="stats__label">
          Pannes à proximité (90&nbsp;j)
        </div>
      </div>
    </div>
  );
}
