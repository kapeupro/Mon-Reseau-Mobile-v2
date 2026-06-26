// ============================================================================
// ResiliaMap web — src/components/DataQualityPanel.tsx
// ----------------------------------------------------------------------------
// E4 internal data-quality dashboard. Renders only behind ?admin=1 (see App.tsx)
// — it is NOT wired into the public map. One row per ingest source with the last
// run's status / freshness / counts and any unrecognized columns, plus an
// outage-freshness banner that distinguishes "archive depth" from "did today's
// fetch actually work" (a 404 today is visible even if older days look fine).
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { useEffect, useState } from "react";
import { getDataQuality } from "../api";
import type { DataQuality } from "../types/api";

function StatusBadge({ status }: { status: string }) {
  // green ok · amber partial/never · red error
  const cls =
    status === "ok"
      ? "dq-badge dq-badge--ok"
      : status === "error"
        ? "dq-badge dq-badge--error"
        : "dq-badge dq-badge--warn";
  return <span className={cls}>{status}</span>;
}

function fmt(ts: string | null): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? ts : d.toLocaleString("fr-FR");
}

export default function DataQualityPanel() {
  const [data, setData] = useState<DataQuality | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    getDataQuality(ctrl.signal)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
    return () => ctrl.abort();
  }, []);

  if (error) return <div className="dq-panel dq-panel--error">Data-quality: {error}</div>;
  if (!data) return <div className="dq-panel">Chargement qualité des données…</div>;

  const fresh = data.outage_freshness;
  const freshBad = fresh.last_fetch_status !== "ok";

  return (
    <div className="dq-panel">
      <h2>Qualité des données</h2>
      <div className={freshBad ? "dq-fresh dq-fresh--bad" : "dq-fresh dq-fresh--ok"}>
        Pannes — dernier fetch : <StatusBadge status={fresh.last_fetch_status} />{" "}
        ({fmt(fresh.last_fetch_at)}) · archive : {fresh.latest_observed_date ?? "—"} ·{" "}
        {fresh.days_in_archive} jours
      </div>
      <table className="dq-table">
        <thead>
          <tr>
            <th>Source</th><th>Statut</th><th>Dernier run</th>
            <th>Récupérés</th><th>Insérés</th><th>Ignorés</th>
            <th>Colonnes non reconnues</th>
          </tr>
        </thead>
        <tbody>
          {data.sources.map((s) => (
            <tr key={s.source}>
              <td>{s.source}</td>
              <td><StatusBadge status={s.status} /></td>
              <td>{fmt(s.last_run_at)}</td>
              <td>{s.rows_fetched ?? "—"}</td>
              <td>{s.rows_inserted ?? "—"}</td>
              <td>{s.rows_ignored ?? "—"}</td>
              <td>
                {s.unrecognized_columns.length === 0
                  ? "—"
                  : s.unrecognized_columns.join(", ")}
                {s.error_detail ? ` · ⚠ ${s.error_detail}` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="dq-generated">Généré : {fmt(data.generated_at)}</p>
    </div>
  );
}
