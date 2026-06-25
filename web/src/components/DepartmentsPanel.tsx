// ============================================================================
// ResiliaMap web — src/components/DepartmentsPanel.tsx
// ----------------------------------------------------------------------------
// F3c TERRITORIAL RANKING. Lists the most fragile départements (avg_score ASC,
// most fragile first) from GET /api/departments via useDepartments(). Each row
// shows: rank, dept code, an avg-score CSS bar coloured by the same score ramp
// as the map (lib/score.ts), and the count of fragile POI (score < 40).
//
// Deliberately NO choropleth polygons — a list + CSS bars only. Clicking a row
// calls onPick(dept) so the parent can react (e.g. fly to / filter), but this
// component owns no map logic itself.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { useDepartments } from "../hooks/usePoi";
import { scoreToColor } from "../lib/score";

interface Props {
  /** Called with the dept code when a row is clicked (e.g. '13', '2A'). */
  onPick?: (dept: string) => void;
  /** Highlight this dept row as selected. */
  selectedDept?: string | null;
  /** Max rows to render (the API returns all; we show the worst N). */
  limit?: number;
}

export default function DepartmentsPanel({
  onPick,
  selectedDept = null,
  limit = 20,
}: Props) {
  const { data, isLoading, isError } = useDepartments();

  return (
    <aside className="depts" aria-label="Départements les plus fragiles">
      <header className="depts__head">
        <h2 className="depts__title">Départements les plus fragiles</h2>
        <p className="depts__sub">Score de résilience moyen, croissant</p>
      </header>

      {isLoading && <div className="depts__muted">Chargement du classement…</div>}

      {isError && (
        <div className="depts__error">Classement indisponible (API hors ligne).</div>
      )}

      {data && data.departments.length === 0 && (
        <div className="depts__muted">Aucune donnée départementale.</div>
      )}

      {data && data.departments.length > 0 && (
        <ol className="depts__list">
          {data.departments.slice(0, limit).map((d, i) => {
            const selected = selectedDept != null && d.dept === selectedDept;
            const pct = Math.max(0, Math.min(100, d.avg_score));
            return (
              <li key={d.dept}>
                <button
                  type="button"
                  className={`depts__row${selected ? " depts__row--active" : ""}`}
                  onClick={() => onPick?.(d.dept)}
                  aria-pressed={selected}
                >
                  <span className="depts__rank">{i + 1}</span>
                  <span className="depts__code">{d.dept}</span>
                  <span className="depts__bar">
                    <span
                      className="depts__bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: scoreToColor(d.avg_score),
                      }}
                    />
                  </span>
                  <span className="depts__score">{d.avg_score.toFixed(1)}</span>
                  <span
                    className="depts__fragile"
                    title={`${d.n_fragile} lieu(x) fragile(s) sur ${d.n_poi}`}
                  >
                    {d.n_fragile} fragile{d.n_fragile > 1 ? "s" : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {data?.disclaimer && <p className="depts__disclaimer">{data.disclaimer}</p>}
    </aside>
  );
}
