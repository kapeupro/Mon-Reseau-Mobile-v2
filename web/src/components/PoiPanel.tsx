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
import type { CategoryValue } from "../types/api";

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
