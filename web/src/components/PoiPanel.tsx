// ============================================================================
// ResiliaMap web — src/components/PoiPanel.tsx
// ----------------------------------------------------------------------------
// Detail panel opened on POI click. Fetches GET /api/poi/:id and shows the
// resilience score, the component breakdown (operator redundancy, single-point-
// of-failure malus, recent-outage malus), the serving operators (with brand
// colours), and the nearby outages over the window.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { usePoiDetail } from "../hooks/usePoi";
import { scoreToColor, SCORE_STOPS } from "../lib/score";
import { operatorColor } from "../lib/operators";
import type {
  CategoryValue,
  OutageWeeklyBucket,
  ScoreHistoryPoint,
} from "../types/api";

interface Props {
  id: number;
  onClose: () => void;
}

const CATEGORY_LABEL: Record<CategoryValue, string> = {
  sante: "Santé",
  securite: "Sécurité",
};

function scoreWord(score: number): string {
  const stop = SCORE_STOPS.find((s) => score <= s.to);
  return stop?.description ?? "—";
}

// ---------------------------------------------------------------------------
// F2c. Pure-SVG score-history sparkline (no chart lib). Only rendered with >=2
// points. The line is plotted on a fixed 0..100 score scale so slopes are
// comparable across POIs; the last point is dotted in its score-ramp colour.
// ---------------------------------------------------------------------------
function ScoreSparkline({ history }: { history: ScoreHistoryPoint[] }) {
  if (history.length < 2) return null;

  const W = 240;
  const H = 48;
  const PAD = 4;
  const n = history.length;
  const x = (i: number) => PAD + (i * (W - 2 * PAD)) / (n - 1);
  // y inverted: score 100 at top, 0 at bottom.
  const y = (s: number) =>
    PAD + (1 - Math.max(0, Math.min(100, s)) / 100) * (H - 2 * PAD);

  const points = history.map((p, i) => `${x(i)},${y(p.score)}`).join(" ");
  const last = history[n - 1]!;
  const first = history[0]!;

  return (
    <div className="spark">
      <svg
        className="spark__svg"
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        role="img"
        aria-label={`Historique du score : de ${Math.round(
          first.score,
        )} le ${first.date} à ${Math.round(last.score)} le ${last.date}`}
      >
        <polyline
          className="spark__line"
          points={points}
          fill="none"
          stroke={scoreToColor(last.score)}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle
          cx={x(n - 1)}
          cy={y(last.score)}
          r={3}
          fill={scoreToColor(last.score)}
        />
      </svg>
      <div className="spark__axis">
        <span>{first.date}</span>
        <span>{last.date}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// F2c. Outage-by-ISO-week mini bar chart (pure CSS bars, no chart lib). Bars
// are scaled to the busiest week in the window; empty weeks render a zero stub.
// ---------------------------------------------------------------------------
function OutageWeekBars({ weeks }: { weeks: OutageWeeklyBucket[] }) {
  if (weeks.length === 0) return null;
  const max = Math.max(1, ...weeks.map((w) => w.count));
  return (
    <div className="weekbars" aria-label="Pannes à proximité par semaine ISO">
      {weeks.map((w) => {
        const h = w.count === 0 ? 2 : Math.round((w.count / max) * 100);
        return (
          <div
            key={w.week_start}
            className="weekbars__col"
            title={`Semaine du ${w.week_start} : ${w.count} panne(s)`}
          >
            <span className="weekbars__bar" style={{ height: `${h}%` }} />
          </div>
        );
      })}
    </div>
  );
}

export default function PoiPanel({ id, onClose }: Props) {
  const { data, isLoading, isError, error } = usePoiDetail(id);

  return (
    <aside className="panel" aria-label="Détail du lieu critique">
      <button
        type="button"
        className="panel__close"
        onClick={onClose}
        aria-label="Fermer le panneau"
      >
        ✕
      </button>

      {isLoading && <div className="panel__loading">Chargement du détail…</div>}

      {isError && (
        <div className="panel__error">
          Impossible de charger ce lieu.
          <br />
          <small>{error instanceof Error ? error.message : "Erreur inconnue"}</small>
        </div>
      )}

      {data && (
        <div className="panel__body">
          <header className="panel__head">
            <span className={`tag tag--${data.category}`}>
              {CATEGORY_LABEL[data.category]}
              {data.subcategory ? ` · ${data.subcategory}` : ""}
            </span>
            <h2 className="panel__name">{data.name}</h2>
            {data.address && <p className="panel__addr">{data.address}</p>}
          </header>

          <div className="panel__score">
            <div
              className="panel__score-ring"
              style={{ borderColor: scoreToColor(data.score) }}
            >
              <span className="panel__score-num">{Math.round(data.score)}</span>
              <span className="panel__score-max">/100</span>
            </div>
            <div className="panel__score-side">
              <div
                className="panel__score-word"
                style={{ color: scoreToColor(data.score) }}
              >
                {data.is_uncovered ? "Aucun site desservant" : scoreWord(data.score)}
              </div>
              <div className="panel__score-sub">Score de résilience réseau</div>
            </div>
          </div>

          {data.score_history.length >= 2 && (
            <section className="panel__section">
              <h3 className="panel__h3">Historique du score</h3>
              <ScoreSparkline history={data.score_history} />
            </section>
          )}

          <section className="panel__section">
            <h3 className="panel__h3">Décomposition</h3>
            <dl className="kv">
              <div className="kv__row">
                <dt>Opérateurs 4G distincts (≤ {data.constants.R_METERS} m)</dt>
                <dd>{data.breakdown.n_operators}</dd>
              </div>
              <div className="kv__row">
                <dt>Sites actifs à proximité</dt>
                <dd>{data.breakdown.n_sites}</dd>
              </div>
              <div className="kv__row">
                <dt>Redondance (apport)</dt>
                <dd className="kv__pos">+{Math.round(data.breakdown.redundancy)}</dd>
              </div>
              <div className="kv__row">
                <dt>Défaillance unique (malus)</dt>
                <dd className="kv__neg">−{Math.round(data.breakdown.spof_malus)}</dd>
              </div>
              <div className="kv__row">
                <dt>
                  Pannes &lt; {data.constants.OUTAGE_WINDOW_DAYS} j (malus)
                </dt>
                <dd className="kv__neg">−{Math.round(data.breakdown.outage_malus)}</dd>
              </div>
            </dl>
          </section>

          <section className="panel__section">
            <h3 className="panel__h3">
              Opérateurs desservants ({data.serving_operators.length})
            </h3>
            {data.serving_operators.length === 0 ? (
              <p className="panel__muted">
                Aucun site 4G actif dans un rayon de {data.constants.R_METERS} m.
              </p>
            ) : (
              <ul className="ops">
                {data.serving_operators.map((op) => (
                  <li key={op.code} className="ops__item">
                    <span
                      className="ops__dot"
                      style={{ background: operatorColor(op.code) }}
                    />
                    <span className="ops__name">{op.name}</span>
                    <span className="ops__meta">
                      {op.n_sites_within_R} site{op.n_sites_within_R > 1 ? "s" : ""} ·
                      le + proche {op.nearest_site_m} m
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel__section">
            <h3 className="panel__h3">
              Pannes récentes à proximité ({data.nearby_outages.length})
            </h3>
            {data.outage_weekly.length > 0 && (
              <OutageWeekBars weeks={data.outage_weekly} />
            )}
            {data.nearby_outages.length === 0 ? (
              <p className="panel__muted">
                Aucune panne enregistrée sur {data.constants.OUTAGE_WINDOW_DAYS} jours.
              </p>
            ) : (
              <ul className="outages">
                {data.nearby_outages.slice(0, 12).map((o, i) => (
                  <li key={`${o.observed_date}-${i}`} className="outages__item">
                    <span
                      className="outages__dot"
                      style={{ background: operatorColor(o.operator_code) }}
                    />
                    <span className="outages__date">{o.observed_date}</span>
                    <span className="outages__op">
                      {o.operator_name ?? "Opérateur inconnu"}
                    </span>
                    <span className="outages__dist">{o.distance_m} m</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="panel__disclaimer">{data.disclaimer}</p>
        </div>
      )}
    </aside>
  );
}
