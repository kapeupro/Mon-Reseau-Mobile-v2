import { PREFIX_LAYER, PREFIX_SOURCE_LAYER } from '@/app/constant/constant';
import { getOperatorColorByIdentifiant } from '@/store/operators';
import { useOperatorsZoneStore } from '@/store/zone';
import {
  clearMapVectorSite,
  getRandomInt,
  isLayerExist,
  removeLayer,
} from '../utils';
import * as turf from '@turf/turf';

const NEXT_PUBLIC_SCHEMA = process.env.NEXT_PUBLIC_SCHEMA;
const TILESERV_URL = process.env.NEXT_PUBLIC_TILESERV_URL;
const IDimageSite = 'site-in-zone';

class DrawSelection {
  mapObj;
  zacinfos;
  numberCircle: number;
  constructor(mapObj: any, zacinfos: any) {
    this.mapObj = mapObj;
    this.zacinfos = zacinfos;
    this.numberCircle = 30;
  }

  draw() {
    this.removeExistingSelection();
    this.buildLayerZone();
    //this.manageFilterNumZoneArrete()
  }

  getPrefixLayerZone = () => {
    return `${PREFIX_LAYER}-zone`;
  };
  getFirstLayerZac(idlayerExclude: string) {
    for (var i = 0; i < this.mapObj.getStyle().layers.length; i++) {
      var layerId = this.mapObj.getStyle().layers[i].id;
      if (
        layerId.substring(0, this.getPrefixLayerZone().length) ===
          this.getPrefixLayerZone() &&
        layerId !== idlayerExclude
      )
        return layerId;
    }
    return false;
  }

  resetIconsSelection() {
    const tablename = 'fc_zac_poi';
    const prefix_poi = `${this.getPrefixLayerZone()}-${tablename}`;

    for (let i = this.mapObj.getStyle().layers.length - 1; 0 <= i; i--) {
      let layerId = this.mapObj.getStyle().layers[i].id;
      if (layerId.substring(0, prefix_poi.length) === prefix_poi) {
        this.initLayout(layerId);
      }
    }
  }

  removeExistingSelection() {
    for (var i = this.mapObj.getStyle().layers.length - 1; 0 <= i; i--) {
      var layerId = this.mapObj.getStyle().layers[i].id;
      if (
        layerId.substring(0, this.getPrefixLayer().length) ===
        this.getPrefixLayer()
      ) {
        if (isLayerExist(layerId, this.mapObj)) {
          removeLayer(layerId, this.mapObj);
        }
      }
    }
  }

  getPrefixLayer() {
    return `${PREFIX_LAYER}-zone-selection`;
  }
  getPrefixSourceLayer() {
    return `${PREFIX_SOURCE_LAYER}-zone-selection`;
  }
  getIdSource() {
    return `${this.getPrefixSourceLayer()}` + getRandomInt(50000);
  }
  getIdLayer() {
    return `${this.getPrefixLayer()}` + getRandomInt(50000);
  }
  createCircles() {
    const pas = Math.round(
      parseFloat(this.zacinfos['blurry_zone']['dist']) / this.numberCircle
    );

    let aCricle = [];
    const lng = parseFloat(this.zacinfos['blurry_zone']['center_x']);
    const lat = parseFloat(this.zacinfos['blurry_zone']['center_y']);
    for (let i = 1; i < this.numberCircle; i++) {
      aCricle.push(
        turf.circle([lng, lat], pas * i, {
          steps: 64,
          units: 'meters',
        })
      );
    }
    const circlesLayer = turf.featureCollection(aCricle);
    return circlesLayer;
  }
  buildLayerZone() {
    const circlesLayer = this.createCircles();
    const idlayer = this.getIdLayer();
    this.mapObj.addLayer({
      id: idlayer,
      type: 'fill',
      source: {
        type: 'geojson',
        data: circlesLayer,
      },
      paint: {
        'fill-color': '#0500FF',
        'fill-opacity': 0.015,
      },
    });

    const id_layer_first_on_zone = this.getFirstLayerZac(idlayer);
    if (id_layer_first_on_zone) {
      this.mapObj.moveLayer(idlayer, id_layer_first_on_zone);
    }
  }
  buildLayerZoneOld() {
    const idsource = this.getIdSource();
    this.mapObj.addSource(idsource, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates:
                this.zacinfos['blurry_zone']['geojson']['coordinates'],
            },
          },
        ],
      },
    });

    const idlayer = this.getIdLayer();
    this.mapObj.addLayer({
      id: idlayer,
      type: 'fill',
      source: idsource,
      layout: {},
      paint: {
        'fill-color': '#232253',
        'fill-opacity': 0.2,
      },
    });

    const id_layer_first_on_zone = this.getFirstLayerZac(idlayer);
    if (id_layer_first_on_zone) {
      this.mapObj.moveLayer(idlayer, id_layer_first_on_zone);
    }
  }

  getLayerPoi() {
    const tablename = 'zac_poi';
    const prefix_poi = `${this.getPrefixLayerZone()}-${tablename}`;

    for (let i = this.mapObj.getStyle().layers.length - 1; 0 <= i; i--) {
      let layerId = this.mapObj.getStyle().layers[i].id;
      if (layerId.substring(0, prefix_poi.length) === prefix_poi) {
        return layerId;
      }
    }
    return false;
  }

  getColorCircle = () => {
    const { operators } = useOperatorsZoneStore.getState();
    return operators.length === 1
      ? getOperatorColorByIdentifiant(operators[0])
      : '#232253';
  };

  getIdLayerSelect(tablename: string) {
    return `${PREFIX_LAYER}-${tablename}-${getRandomInt(50000)}`;
  }

  getTableSourceLayer(tablename: string) {
    return `${NEXT_PUBLIC_SCHEMA}.${tablename}`;
  }

  getSourceName(tablename: string) {
    return `${PREFIX_SOURCE_LAYER}-${tablename}-${getRandomInt(50000)}`;
  }

  addLayerSite() {
    const tableName = 'zac_site';
    const layerSource = this.getSourceName(tableName);
    const tableSource = this.getTableSourceLayer(tableName);
    const idLayer = this.getIdLayerSelect(tableName);

    if (!this.mapObj.getSource(layerSource)) {
      this.mapObj.addSource(layerSource, {
        type: 'vector',
        tiles: [
          `${TILESERV_URL}${tableSource}/{z}/{x}/{y}.pbf?properties=numero_site`,
        ],
      });
    }

    this.mapObj.addLayer({
      id: idLayer,
      type: 'symbol',
      source: layerSource,
      'source-layer': tableSource,
      filter: ['all'],
      layout: {
        'icon-image': IDimageSite,
        'icon-size': 0.5,
      },
    });
  }

  manageLayout(layer_id: string, featProperties: any) {
    const color_op = this.getColorCircle();

    this.mapObj.setLayoutProperty(
      `${layer_id}-circle`,
      'visibility',
      'visible'
    );

    this.mapObj.setFilter(`${layer_id}-circle`, [
      '==',
      ['get', 'num_zone_arrete'],
      featProperties['num_zone_arrete'],
    ]);

    this.mapObj.setPaintProperty(layer_id, 'circle-color', [
      'case',
      ['==', ['get', 'num_zone_arrete'], featProperties['num_zone_arrete']],
      color_op,
      '#ffffff',
    ]);

    this.mapObj.setPaintProperty(layer_id, 'circle-radius', [
      'case',
      ['==', ['get', 'num_zone_arrete'], featProperties['num_zone_arrete']],
      5,
      3,
    ]);

    this.mapObj.setPaintProperty(layer_id, 'circle-stroke-color', [
      'case',
      ['==', ['get', 'num_zone_arrete'], featProperties['num_zone_arrete']],
      '#ffffff',
      color_op,
    ]);

    this.mapObj.setPaintProperty(layer_id, 'circle-stroke-width', [
      'case',
      ['==', ['get', 'num_zone_arrete'], featProperties['num_zone_arrete']],
      1.25,
      4,
    ]);
  }

  initLayout(layer_id: string) {
    if (layer_id.endsWith('-circle')) {
      this.mapObj.setLayoutProperty(layer_id, 'visibility', 'none');
    }

    if (layer_id.endsWith('-zone-site')) {
      this.mapObj.setLayoutProperty(layer_id, 'visibility', 'none');

      clearMapVectorSite(this.mapObj);
    }

    if (!layer_id.endsWith('-circle') && !layer_id.endsWith('-zone-site')) {
      const color_op = this.getColorCircle();

      this.mapObj.setPaintProperty(layer_id, 'circle-color', '#ffffff');
      this.mapObj.setPaintProperty(layer_id, 'circle-stroke-color', color_op);
      this.mapObj.setPaintProperty(layer_id, 'circle-radius', 3);
      this.mapObj.setPaintProperty(layer_id, 'circle-stroke-width', 4);
    }
  }
}
export default DrawSelection;
