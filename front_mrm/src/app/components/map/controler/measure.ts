import { PREFIX_LAYER, PREFIX_SOURCE_LAYER } from '@/app/constant/constant';
import * as turf from '@turf/turf';
import { Position } from '@turf/turf';
import { useAltimetriqueToolsStore, useToolsStore } from '@/store/tools';

export default class MeasureControlUx {
  omap: any;
  _container: any;
  prefixLayer: string;
  prefixSource: string;
  idLayerPointPrefix: string;
  idLayerSourcePointPrefix: string;
  idLayerLinePrefix: string;
  idLayerSourceLinePrefix: string;
  idLayerLabelLinePrefix: string;
  options: any;
  features: any;
  initiate: boolean;
  activate: boolean;
  isAltimetrie: boolean;
  coordinates: any;
  linelength: number;

  constructor(options: any) {
    this.options = options;
    this.prefixLayer = `${PREFIX_LAYER}-measure`;
    this.prefixSource = `${PREFIX_SOURCE_LAYER}-measure`;
    this.idLayerSourcePointPrefix = `${this.prefixSource}-sourcepoint`;
    this.idLayerPointPrefix = `${this.prefixLayer}-point`;
    this.idLayerSourceLinePrefix = `${this.prefixSource}-sourceline`;
    this.idLayerLinePrefix = `${this.prefixLayer}-linestring`;
    this.idLayerLabelLinePrefix = `${this.prefixLayer}-label-linestring`;
    this.features = [];
    this.coordinates = [];
    this.initiate = false;
    this.activate = false;
    this.isAltimetrie = false;
    this.linelength = 0;
  }

  _init() {
    this._registerEvents();
  }
  _registerEvents() {
    if (this.omap) {
      this.omap.on('click', this.drawMeasure.bind(this));
    }
  }

  _reset() {
    this.features = [];
    this.coordinates = [];
    this.initiate = false;
    this.activate = false;
  }

  getIsAltimetrie() {
    return this.isAltimetrie;
  }
  setIsAltimetrie(isAltimetrie: boolean) {
    this.isAltimetrie = isAltimetrie;
  }

  isInitiated() {
    return this.initiate;
  }
  setInitiate(initiate: boolean) {
    this.initiate = initiate;
  }

  isActivate() {
    return this.activate;
  }
  setActivate(activate: boolean) {
    this.activate = activate;
  }
  getIdLayerPoint() {
    return this.idLayerPointPrefix;
  }

  getIdSourcePoint() {
    return this.idLayerSourcePointPrefix;
  }

  getIdLayerLine() {
    return this.idLayerLinePrefix;
  }

  getIdLayerLabel() {
    return this.idLayerLabelLinePrefix;
  }

  getIdSourceLine() {
    return this.idLayerSourceLinePrefix;
  }

  getIdSourceLabel() {
    return `${this.idLayerPointPrefix}-label`;
  }

  getLabelDistance() {
    const distance = this.getDistance(this.coordinates[0], this.coordinates[1]);
    return distance;
  }

  getDistance(pointA: Position, pointB: Position) {
    const lineAB = turf.lineString([
      [pointA[0], pointA[1]],
      [pointB[0], pointB[1]],
    ]);
    let lineLength = turf.length(lineAB, { units: 'meters' });
    this.linelength = lineLength;
    const resDist = Math.round(lineLength);
    if (resDist > 10000) {
      return `${Math.round(resDist / 1000)} km`;
    } else {
      return `${resDist} m`;
    }
  }

  onAdd(omap: any) {
    this.omap = omap;
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl';
    this._container.textContent = '';
    this._init();
    return this._container;
  }

  initLayer() {
    this.buildLayerPoint();
    this.buildLayerLine();
    this.buildLayerLabel();
  }
  buildLayerLabel() {
    this.createSourceLabel();
    this.createLayerLabel();
  }
  buildLayerPoint() {
    this.createSourcePoint();
    this.createLayerPoint();
  }
  buildLayerLine() {
    this.createSourceLine();
    this.createLayerLine();
  }

  createSourceLabel() {
    if (this.omap.getSource(this.getIdSourceLabel())) {
      return true;
    }
    this.omap.addSource(this.getIdSourceLabel(), {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });
  }

  createSourcePoint() {
    if (this.omap.getSource(this.getIdSourcePoint())) {
      return true;
    }
    this.omap.addSource(this.getIdSourcePoint(), {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });
  }

  createSourceLine() {
    if (this.omap.getSource(this.getIdSourceLine())) {
      return true;
    }

    this.omap.addSource(this.getIdSourceLine(), {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });
  }

  createLayerLabel() {
    if (this.omap.getLayer(this.getIdLayerLabel())) {
      return true;
    }

    this.omap.addLayer({
      id: this.getIdLayerLabel(),
      type: 'symbol',
      source: this.getIdSourceLabel(),
      paint: {
        'text-color': '#232253',
        'text-halo-color': '#FFF', // Définit la couleur du halo à blanc
        'text-halo-width': 2, // Définit la largeur du halo
      },
      layout: {
        'text-field': ['get', 'distance'],
        'text-anchor': 'top',
        'text-size': 14,
        'text-radial-offset': 0.1,
        'text-justify': 'auto',
      },
    });
  }

  createLayerLine() {
    if (this.omap.getLayer(this.getIdLayerLine())) {
      return true;
    }

    this.omap.addLayer({
      id: this.getIdLayerLine(),
      type: 'line',
      source: this.getIdSourceLine(),
      layout: {
        visibility: 'visible',
      },
      paint: {
        'line-color': '#232253',
        'line-width': ['step', ['zoom'], 3, 11, 4],
        'line-dasharray': ['literal', [3, 1]],
      },
    });
  }

  createLayerPoint() {
    if (this.omap.getLayer(this.getIdLayerPoint())) {
      return true;
    }

    this.omap.addLayer({
      id: this.getIdLayerPoint(),
      type: 'symbol',
      source: this.getIdSourcePoint(),
      layout: {
        'icon-image': [
          'case',
          ['==', ['get', 'order'], 1],
          'measure-a',
          'measure-b',
        ],
        visibility: 'visible',
        'icon-overlap': 'always',
        'icon-size': 0.75,
        'icon-offset': [0, -15],
      },
    });
  }
  onRemove() {
    this.clearMap();
  }
  clearMap() {
    this.removeLayers();
    this.removeSources();
    this._reset();
  }
  removeSources() {
    if (!this.omap) {
      return;
    }
    if (this.omap.getSource(this.getIdSourcePoint())) {
      this.omap.removeSource(this.getIdSourcePoint());
    }
    if (this.omap.getSource(this.getIdSourceLabel())) {
      this.omap.removeSource(this.getIdSourceLabel());
    }
    if (this.omap.getSource(this.getIdSourceLine())) {
      this.omap.removeSource(this.getIdSourceLine());
    }
  }
  removeLayers() {
    if (!this.omap) {
      return;
    }
    if (this.omap.getLayer(this.getIdLayerPoint())) {
      this.omap.removeLayer(this.getIdLayerPoint());
    }
    if (this.omap.getLayer(this.getIdLayerLine())) {
      this.omap.removeLayer(this.getIdLayerLine());
    }
    if (this.omap.getLayer(this.getIdLayerLabel())) {
      this.omap.removeLayer(this.getIdLayerLabel());
    }
  }

  buildLabel() {
    const lineAB = turf.lineString([this.coordinates[0], this.coordinates[1]]);

    const distance = this.getDistance(this.coordinates[0], this.coordinates[1]);
    let lineLength = turf.length(lineAB, { units: 'meters' });

    const position = lineLength / 2;
    let currentPoint = turf.along(lineAB, position, {
      units: 'meters',
    });

    const point = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: currentPoint.geometry.coordinates,
      },
      properties: {
        id: String(new Date().getTime()),
        distance: distance,
      },
    };

    return [point];
  }

  buildLine() {
    const data = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            id: String(new Date().getTime()),
          },
          geometry: {
            type: 'LineString',
            coordinates: this.coordinates,
          },
        },
      ],
    };
    return data;
  }

  buildPoint(e: any) {
    const point = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [e.lngLat.lng, e.lngLat.lat],
      },
      properties: {
        id: String(new Date().getTime()),
        order: this.features.length + 1,
      },
    };
    this.features.push(point);
    this.coordinates.push([e.lngLat.lng, e.lngLat.lat]);
  }
  updateLayerPoint() {
    this.omap.getSource(this.getIdSourcePoint()).setData({
      type: 'FeatureCollection',
      features: this.features,
    });
  }

  updateLayerLine(featureLine: any) {
    this.omap.getSource(this.getIdSourceLine()).setData(featureLine);
  }

  updateLayerLabel(featureLabel: any) {
    this.omap.getSource(this.getIdSourceLabel()).setData({
      type: 'FeatureCollection',
      features: featureLabel,
    });
  }

  isLineBuildable() {
    return this.features.length === 2;
  }

  getDefaultLineEmpty() {
    const defaultData = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            id: String(new Date().getTime()),
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [0, 0],
              [0.00000001, 0.00000001],
            ],
          },
        },
      ],
    };
    return defaultData;
  }

  getDefaultLabelEmpty() {
    const defaultData = [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0],
        },
        properties: {
          id: String(new Date().getTime()),
          distance: '0',
        },
      },
    ];
    return defaultData;
  }

  drawMeasure(e: any) {
    if (!this.isActivate()) {
      return;
    }
    if (!this.isInitiated()) {
      this.initLayer();
      this.setInitiate(true);
    }

    if (this.features.length === 2) {
      this.features = [];
      this.coordinates = [];
    }

    this.buildPoint(e);
    this.updateLayerPoint();

    let featureLine = this.getDefaultLineEmpty();
    let featureLabel = this.getDefaultLabelEmpty();

    if (this.isLineBuildable()) {
      featureLine = this.buildLine();
      featureLabel = this.buildLabel();
    }

    this.updateLayerLine(featureLine);
    this.updateLayerLabel(featureLabel);

    this.callbackPoint();
  }

  callbackPoint() {
    if (this.getIsAltimetrie()) {
      this.activeAltimetrique(
        this.features.map((feat: any) => feat.geometry.coordinates)
      );
    } else {
      this.activeDistance(
        this.features.map((feat: any) => feat.geometry.coordinates)
      );
    }
  }

  activeAltimetrique(aPoints: any[]) {
    const { setPoints } = useAltimetriqueToolsStore.getState();
    const { setSubPageTools } = useToolsStore.getState();

    if (aPoints.length !== 2) {
      return;
    }

    setPoints(aPoints);
    setSubPageTools({
      isActive: true,
      show: true,
      subPageTools: 'tools_altimetrie',
    });
  }

  activeDistance(aPoints: any[]) {
    const { setPoints } = useAltimetriqueToolsStore.getState();
    const { setSubPageTools } = useToolsStore.getState();

    if (aPoints.length !== 2) {
      return;
    }

    setPoints(aPoints);
    setSubPageTools({
      isActive: true,
      show: true,
      subPageTools: 'tools_distance',
    });
  }

  hasCoordinates() {
    return this.coordinates.length === 2;
  }
}
