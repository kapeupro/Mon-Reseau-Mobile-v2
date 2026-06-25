// ============================================================================
// ResiliaMap web — src/App.tsx
// ----------------------------------------------------------------------------
// App shell: header + connection badge, national stats bar, the map (with the
// category filter + legend overlays), the POI detail panel, and the mandatory
// Arcep disclaimer footer.
//
// State held here (lifted so siblings share it):
//   category    sante | securite | null  -> drives map + stats
//   selectedId  the clicked POI id        -> opens the detail panel
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { useState } from "react";
import type { CategoryValue } from "./types/api";
import { useHealth } from "./hooks/usePoi";
import MapView from "./components/MapView";
import PoiPanel from "./components/PoiPanel";
import Filters from "./components/Filters";
import Disclaimer from "./components/Disclaimer";
import Stats from "./components/Stats";

function HealthBadge() {
  const { data, isLoading, isError } = useHealth();
  let label = "Connexion…";
  let cls = "health health--unknown";
  if (!isLoading) {
    if (isError || !data?.ok) {
      label = "API hors ligne";
      cls = "health health--down";
    } else if (data.status === "degraded") {
      label = "API dégradée";
      cls = "health health--degraded";
    } else {
      const rows = data.mv_resilience_score?.rows ?? 0;
      label = `API en ligne · ${rows.toLocaleString("fr-FR")} lieux scorés`;
      cls = "health health--ok";
    }
  }
  return <span className={cls}>{label}</span>;
}

export default function App() {
  const [category, setCategory] = useState<CategoryValue | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <h1 className="app__title">
            Resilia<span className="app__title-accent">Map</span>
          </h1>
          <p className="app__subtitle">
            Résilience réseau mobile des lieux critiques — hôpitaux, gendarmeries, commissariats
          </p>
        </div>
        <HealthBadge />
      </header>

      <Stats category={category} />

      <main className="app__body">
        <section className="app__map">
          <Filters value={category} onChange={setCategory} />
          <MapView
            category={category}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </section>

        {selectedId != null && (
          <PoiPanel id={selectedId} onClose={() => setSelectedId(null)} />
        )}
      </main>

      <Disclaimer />
    </div>
  );
}
