// ============================================================================
// ResiliaMap web — src/components/MapView.tsx
// ----------------------------------------------------------------------------
// MapLibre GL map of metropolitan France over a key-free OpenStreetMap raster
// basemap. Renders critical POI as circles coloured by resilience score
// (red = fragile -> green = resilient; grey = no serving site), driven by the
// current map bbox + category filter.
//
// Design notes:
//   * The circle layer only needs primitive props (score, is_uncovered) for
//     styling; on click we read just the POI id and let <PoiPanel/> fetch the
//     full detail. This sidesteps MapLibre serialising the nested `breakdown`.
//   * The colour ramp comes from lib/score.ts (scoreColorStepArgs) so the map
//     and the <Legend/> are guaranteed to agree.
//   * moveend is debounced so panning a few metres does not storm the API.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { useEffect, useRef, useState } from "react";
import maplibregl, {
  Map as MlMap,
  GeoJSONSource,
  type StyleSpecification,
  type MapGeoJSONFeature,
  type MapMouseEvent,
} from "maplibre-gl";
import { usePoi } from "../hooks/usePoi";
import type { Bbox, CategoryValue, PoiFeatureCollection } from "../types/api";
import { scoreColorStepArgs, UNCOVERED_COLOR } from "../lib/score";
import Legend from "./Legend";

// Key-free OSM raster basemap. Fine for dev / civic demos; for production traffic
// switch to a self-hosted or licensed tile provider (see README).
const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm", minzoom: 0, maxzoom: 19 }],
};

const POI_SOURCE = "poi";
const POI_LAYER = "poi-circles";
const POI_LAYER_SELECTED = "poi-selected";

const EMPTY_FC: PoiFeatureCollection = {
  type: "FeatureCollection",
  features: [],
  meta: { count: 0, constants: { R_METERS: 0, OUTAGE_WINDOW_DAYS: 0 }, disclaimer: "" },
};

interface Props {
  category: CategoryValue | null;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export default function MapView({ category, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MlMap | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const [bbox, setBbox] = useState<Bbox | null>(null);
  const [ready, setReady] = useState(false);

  const { data, isFetching, error } = usePoi(bbox, category);

  // ----- init the map exactly once -----
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: [2.55, 46.6], // metropolitan France
      zoom: 5,
      minZoom: 4,
      maxZoom: 17,
      attributionControl: false,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.AttributionControl({ compact: true }));
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-right");

    const emitBounds = () => {
      const b = map.getBounds();
      setBbox({
        minLon: b.getWest(),
        minLat: b.getSouth(),
        maxLon: b.getEast(),
        maxLat: b.getNorth(),
      });
    };

    map.on("load", () => {
      map.addSource(POI_SOURCE, { type: "geojson", data: EMPTY_FC });

      // Main scored layer.
      map.addLayer({
        id: POI_LAYER,
        type: "circle",
        source: POI_SOURCE,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 3, 9, 6, 13, 9],
          // is_uncovered -> grey, else step ramp over score.
          "circle-color": [
            "case",
            ["==", ["get", "is_uncovered"], true],
            UNCOVERED_COLOR,
            ["step", ["get", "score"], ...scoreColorStepArgs()],
          ],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.92,
        },
      } as unknown as maplibregl.AddLayerObject);

      // Selection highlight layer (filtered to the selected id).
      map.addLayer({
        id: POI_LAYER_SELECTED,
        type: "circle",
        source: POI_SOURCE,
        filter: ["==", ["get", "id"], -1],
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 6, 9, 10, 13, 14],
          "circle-color": "rgba(0,0,0,0)",
          "circle-stroke-width": 3,
          "circle-stroke-color": "#0f172a",
        },
      } as unknown as maplibregl.AddLayerObject);

      setReady(true);
      emitBounds();
    });

    map.on("moveend", () => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(emitBounds, 250);
    });

    const handleClick = (
      e: MapMouseEvent & { features?: MapGeoJSONFeature[] },
    ) => {
      const f = e.features?.[0];
      const id = f?.properties?.["id"];
      if (id != null) onSelectRef.current(Number(id));
    };
    map.on("click", POI_LAYER, handleClick);
    map.on("mouseenter", POI_LAYER, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", POI_LAYER, () => {
      map.getCanvas().style.cursor = "";
    });

    return () => {
      clearTimeout(debounceRef.current);
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  // ----- push new POI data into the source whenever the query resolves -----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const src = map.getSource(POI_SOURCE) as GeoJSONSource | undefined;
    src?.setData((data ?? EMPTY_FC) as unknown as GeoJSON.FeatureCollection);
  }, [data, ready]);

  // ----- keep the selection highlight in sync -----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setFilter(POI_LAYER_SELECTED, ["==", ["get", "id"], selectedId ?? -1]);
  }, [selectedId, ready]);

  return (
    <div className="mapview">
      <div ref={containerRef} className="mapview__canvas" />
      <Legend />
      <div className="mapview__status" role="status" aria-live="polite">
        {error ? (
          <span className="badge badge--error">API injoignable</span>
        ) : isFetching ? (
          <span className="badge badge--loading">Chargement…</span>
        ) : data ? (
          <span className="badge">
            {data.meta.count.toLocaleString("fr-FR")} lieux affichés
          </span>
        ) : null}
      </div>
    </div>
  );
}
