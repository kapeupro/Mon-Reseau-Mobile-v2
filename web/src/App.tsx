// ============================================================================
// ResiliaMap web — src/App.tsx
// ----------------------------------------------------------------------------
// App shell: header + connection badge, national stats bar, the map (with the
// category + operator filters, address search and legend overlays), the POI
// detail panel, a toggleable "Départements" ranking panel, and the mandatory
// Arcep disclaimer footer.
//
// State held here (lifted so siblings share it):
//   category    sante | securite | null   -> drives map + stats (F0)
//   operator    MCC-MNC code | null        -> F1 operator-coverage overlay
//   selectedId  the clicked POI id         -> opens the detail panel
//   showDepts   whether the F3 départements ranking panel is open
//   selectedDept which dept row is highlighted (and flown to on pick)
//   view        last map center+zoom        -> F4 permalink sync
//
// F4 PERMALINKS: {lng,lat,zoom,category,operator} are read from the URL once on
// mount (to seed the initial map view + filters) and written back debounced via
// history.replaceState, so a shared URL reopens the same view + filters.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { useRef, useState } from "react";
import type { CategoryValue } from "./types/api";
import { useHealth } from "./hooks/usePoi";
import {
  readUrlState,
  useUrlSync,
  type UrlState,
} from "./hooks/useUrlState";
import MapView, { type MapHandle } from "./components/MapView";
import PoiPanel from "./components/PoiPanel";
import Filters from "./components/Filters";
import OperatorFilter from "./components/OperatorFilter";
import SearchBar from "./components/SearchBar";
import DepartmentsPanel from "./components/DepartmentsPanel";
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

// Read the permalink ONCE at module evaluation so the very first render already
// has the shared view + filters (avoids a flash of the default France view).
const INITIAL = readUrlState();

export default function App() {
  const [category, setCategory] = useState<CategoryValue | null>(
    INITIAL.category,
  );
  const [operator, setOperator] = useState<number | null>(INITIAL.operator);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showDepts, setShowDepts] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  // Latest map center+zoom for the permalink (seeded from the URL).
  const [view, setView] = useState<{
    lng: number | null;
    lat: number | null;
    zoom: number | null;
  }>({ lng: INITIAL.lng, lat: INITIAL.lat, zoom: INITIAL.zoom });

  const mapRef = useRef<MapHandle | null>(null);

  // F4: keep the URL in sync with the current view + filters (debounced).
  const urlState: UrlState = {
    lng: view.lng,
    lat: view.lat,
    zoom: view.zoom,
    category,
    operator,
  };
  useUrlSync(urlState);

  // F3d: a BAN search pick recentres the map.
  const handleSearchSelect = (lng: number, lat: number) => {
    mapRef.current?.flyTo(lng, lat, 14);
  };

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
        <div className="app__actions">
          <button
            type="button"
            className={`app__tab${showDepts ? " app__tab--active" : ""}`}
            aria-pressed={showDepts}
            onClick={() => setShowDepts((v) => !v)}
          >
            Départements
          </button>
          <HealthBadge />
        </div>
      </header>

      <Stats category={category} />

      <main className="app__body">
        {showDepts && (
          <DepartmentsPanel
            selectedDept={selectedDept}
            onPick={(dept) => setSelectedDept(dept)}
          />
        )}

        <section className="app__map">
          <Filters value={category} onChange={setCategory} />
          <OperatorFilter value={operator} onChange={setOperator} />
          <SearchBar onSelect={handleSearchSelect} />
          <MapView
            ref={mapRef}
            category={category}
            operator={operator}
            selectedId={selectedId}
            onSelect={setSelectedId}
            initialView={{
              lng: INITIAL.lng,
              lat: INITIAL.lat,
              zoom: INITIAL.zoom,
            }}
            onViewChange={setView}
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
