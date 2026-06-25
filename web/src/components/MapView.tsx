// ============================================================================
// ResiliaMap web — src/components/MapView.tsx
// ----------------------------------------------------------------------------
// MapLibre GL map of metropolitan France over a key-free OpenStreetMap raster
// basemap. Renders critical POI as circles, in one of two colouring modes:
//   * score mode (default): red = fragile -> green = resilient; grey = no
//     serving site, driven by lib/score.ts (scoreColorStepArgs).
//   * F1 operator mode: when `operator` is set, the API tags each POI with
//     `operator_covered`; circles turn green (covered) / red (absent) and the
//     <Legend/> switches to the matching green/red scale.
//
// Imperative API (F3d/F4): the parent gets a ref exposing flyTo(lng,lat,zoom)
// so the <SearchBar/> and the départements panel can recentre the map, and a
// best-effort getView() helper. Permalink sync is delegated upward through the
// `onViewChange` callback (fired on the debounced moveend).
//
// Design notes:
//   * The circle layer only needs primitive props (score, is_uncovered,
//     operator_covered) for styling; on click we read just the POI id and let
//     <PoiPanel/> fetch the full detail (avoids serialising nested breakdown).
//   * moveend is debounced so panning a few metres does not storm the API.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import maplibregl, {
  Map as MlMap,
  GeoJSONSource,
  type StyleSpecification,
  type MapGeoJSONFeature,
  type MapMouseEvent,
} from "maplibre-gl";
import { usePoi } from "../hooks/usePoi";
import type { Bbox, CategoryValue, PoiFeatureCollection } from "../types/api";
import {
  scoreColorStepArgs,
  UNCOVERED_COLOR,
  OPERATOR_COVERED_COLOR,
  OPERATOR_UNCOVERED_COLOR,
} from "../lib/score";
import { operatorName } from "../lib/operators";
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

// Default view: metropolitan France.
const DEFAULT_CENTER: [number, number] = [2.55, 46.6];
const DEFAULT_ZOOM = 5;

const EMPTY_FC: PoiFeatureCollection = {
  type: "FeatureCollection",
  features: [],
  meta: { count: 0, constants: { R_METERS: 0, OUTAGE_WINDOW_DAYS: 0 }, disclaimer: "" },
};

/** Circle-color expression for the active mode (score ramp vs operator green/red). */
function circleColorExpr(operator: number | null): unknown {
  if (operator != null) {
    // F1: paint by operator_covered (true=green, anything else=red).
    return [
      "case",
      ["==", ["get", "operator_covered"], true],
      OPERATOR_COVERED_COLOR,
      OPERATOR_UNCOVERED_COLOR,
    ];
  }
  // Score mode: is_uncovered -> grey, else step ramp over score.
  return [
    "case",
    ["==", ["get", "is_uncovered"], true],
    UNCOVERED_COLOR,
    ["step", ["get", "score"], ...scoreColorStepArgs()],
  ];
}

/** Initial map view, e.g. restored from a permalink. */
export interface InitialView {
  lng: number | null;
  lat: number | null;
  zoom: number | null;
}

/** Imperative handle the parent uses to drive the map (search / dept pick). */
export interface MapHandle {
  /** Recentre/zoom the map (lng/lat in EPSG:4326). */
  flyTo: (lng: number, lat: number, zoom?: number) => void;
  /** Current center+zoom (or null before the map is ready). */
  getView: () => { lng: number; lat: number; zoom: number } | null;
}

interface Props {
  category: CategoryValue | null;
  /** F1: selected operator MCC-MNC code, or null for the score ramp. */
  operator: number | null;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  /** F4: initial view restored from the URL (null fields => defaults). */
  initialView?: InitialView;
  /** F4: fired (debounced) on moveend with the new center+zoom for URL sync. */
  onViewChange?: (view: { lng: number; lat: number; zoom: number }) => void;
}

const MapView = forwardRef<MapHandle, Props>(function MapView(
  { category, operator, selectedId, onSelect, initialView, onViewChange },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MlMap | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onViewChangeRef = useRef(onViewChange);
  onViewChangeRef.current = onViewChange;
  // Read the initial view once; later changes must not re-init the map.
  const initialViewRef = useRef(initialView);

  const [bbox, setBbox] = useState<Bbox | null>(null);
  const [ready, setReady] = useState(false);

  const { data, isFetching, error } = usePoi(bbox, category, operator);

  // Expose the imperative flyTo / getView to the parent.
  useImperativeHandle(
    ref,
    (): MapHandle => ({
      flyTo: (lng, lat, zoom) => {
        const map = mapRef.current;
        if (!map) return;
        map.flyTo({
          center: [lng, lat],
          zoom: zoom ?? Math.max(map.getZoom(), 12),
          essential: true,
        });
      },
      getView: () => {
        const map = mapRef.current;
        if (!map) return null;
        const c = map.getCenter();
        return { lng: c.lng, lat: c.lat, zoom: map.getZoom() };
      },
    }),
    [],
  );

  // ----- init the map exactly once -----
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const iv = initialViewRef.current;
    const center: [number, number] =
      iv?.lng != null && iv?.lat != null ? [iv.lng, iv.lat] : DEFAULT_CENTER;
    const zoom = iv?.zoom != null ? iv.zoom : DEFAULT_ZOOM;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center,
      zoom,
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
      const c = map.getCenter();
      onViewChangeRef.current?.({ lng: c.lng, lat: c.lat, zoom: map.getZoom() });
    };

    map.on("load", () => {
      map.addSource(POI_SOURCE, { type: "geojson", data: EMPTY_FC });

      // Main POI layer; circle-color is reset by mode (see effect below).
      map.addLayer({
        id: POI_LAYER,
        type: "circle",
        source: POI_SOURCE,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 3, 9, 6, 13, 9],
          "circle-color": circleColorExpr(null),
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

  // ----- recolour the circles whenever the mode (operator) changes -----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setPaintProperty(
      POI_LAYER,
      "circle-color",
      circleColorExpr(operator) as never,
    );
  }, [operator, ready]);

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
      <Legend
        mode={operator != null ? "operator" : "score"}
        operatorName={operator != null ? operatorName(operator) : undefined}
      />
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
});

export default MapView;
