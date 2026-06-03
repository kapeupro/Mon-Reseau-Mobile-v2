import {
  clearMapVectorTerritory,
  getRandomInt,
} from '@/app/components/map/drawMap/utils';
import { PREFIX_LAYER } from '@/app/constant/constant';

const TILESERV_URL = process.env.NEXT_PUBLIC_TILESERV_URL;
const NEXT_PUBLIC_SCHEMA = process.env.NEXT_PUBLIC_SCHEMA;
const TYPE_REGION = 'region';
const TYPE_DEPARTEMENT = 'departement';
const TYPE_COMMUNE = 'commune';

class Draw {
  mapObj;
  valueIdent = null;
  idSourceLayer = '';
  constructor(mapObj: any) {
    this.mapObj = mapObj;
  }
  setValueIdent(valueIDent: any) {
    this.valueIdent = valueIDent;
  }
  getValueIdent() {
    return this.valueIdent;
  }
  getMaxZoom() {
    return 0;
  }
  getMinZoom() {
    return 0;
  }
  getTypeTerritory() {
    return '';
  }
  getSourceLayer() {
    return '';
  }
  getField() {
    return '';
  }
  getPrefixLayer() {
    return 'search-layer-arcep';
  }
  getIdSourceLayer() {
    return (
      `src-${this.getPrefixLayer()}-${this.getTypeTerritory()}` +
      getRandomInt(50000)
    );
  }
  getIdLayer() {
    return (
      `${this.getPrefixLayer()}-${this.getTypeTerritory()}` +
      getRandomInt(50000)
    );
  }
  getIdLayerHallow() {
    return `${this.getPrefixLayer()}-hallow` + getRandomInt(50000);
  }
  getIdLayerOutline() {
    return `${this.getPrefixLayer()}-outline` + getRandomInt(50000);
  }
  buildFilter() {
    let filter = null;
    filter = ['all', ['==', ['get', this.getField()], this.getValueIdent()]];
    return filter;
  }
  addSource() {
    this.idSourceLayer = this.getIdSourceLayer();

    if (!this.mapObj.getSource(this.idSourceLayer)) {
      this.mapObj.addSource(this.idSourceLayer, {
        type: 'vector',
        tiles: [
          `${TILESERV_URL}${this.getSourceLayer()}/{z}/{x}/{y}.pbf?properties=${this.getField()}`,
        ],
      });
    }
  }
  addMain() {
    const idLayer = this.getIdLayer();

    this.mapObj.addLayer({
      id: idLayer,
      type: 'line',
      source: this.idSourceLayer,
      'source-layer': this.getSourceLayer(),
      layout: {
        visibility: 'visible',
      },
      filter: this.buildFilter(),
      paint: {
        'line-color': '#232253',
        'line-width': ['step', ['zoom'], 2, 11, 3],
        'line-dasharray': ['literal', [2, 1]],
      },
      maxzoom: this.getMaxZoom(),
      minzoom: this.getMinZoom(),
    });
  }
  addHallow() {
    const idLayer = this.getIdLayerHallow();

    this.mapObj.addLayer({
      id: idLayer,
      type: 'line',
      source: this.idSourceLayer,
      'source-layer': this.getSourceLayer(),
      layout: {
        visibility: 'visible',
      },
      filter: this.buildFilter(),
      paint: {
        'line-color': 'rgb(45, 157, 255)',
        'line-width': ['step', ['zoom'], 8, 11, 10],
        'line-opacity': ['step', ['zoom'], 0.04, 11, 0.2],
      },
      maxzoom: this.getMaxZoom(),
      minzoom: this.getMinZoom(),
    });
  }
  addOutline() {
    const idLayerOutline = this.getIdLayerOutline();

    this.mapObj.addLayer({
      id: idLayerOutline,
      type: 'fill',
      source: this.idSourceLayer,
      'source-layer': this.getSourceLayer(),
      layout: {
        visibility: 'visible',
      },
      filter: ['!', this.buildFilter()],
      paint: {
        'fill-color': '#232253',
        'fill-opacity': 0.12,
      },
      maxzoom: this.getMaxZoom(),
      minzoom: this.getMinZoom(),
    });
  }
  addLayers() {
    clearMapVectorTerritory(this.mapObj);
    this.addHallow();
    this.addMain();
    this.addOutline();
  }
  draw() {
    this.addSource();
    this.addLayers();
  }
  manageLayerPosition() {
    const style = this.mapObj.getStyle();
    const aSearchTerritoryLayers = style.layers.filter(
      (layer: any) => layer.id && layer.id.startsWith(`search-${PREFIX_LAYER}`)
    );
    if (!aSearchTerritoryLayers.length) {
      return;
    }

    for (const oLayers of aSearchTerritoryLayers) {
      this.mapObj.moveLayer(oLayers.id);
    }
  }
}

export class Region extends Draw {
  getTypeTerritory() {
    return TYPE_REGION;
  }
  getSourceLayer() {
    return `${NEXT_PUBLIC_SCHEMA}.region`;
  }
  getField() {
    return 'insee_reg';
  }
}

export class Departement extends Draw {
  getTypeTerritory() {
    return TYPE_DEPARTEMENT;
  }
  getSourceLayer() {
    return `${NEXT_PUBLIC_SCHEMA}.departement`;
  }
  getField() {
    return 'insee_dep';
  }
}

export class Commune extends Draw {
  getMinZoom() {
    return 9;
  }
  getTypeTerritory() {
    return TYPE_COMMUNE;
  }
  getSourceLayer() {
    return `${NEXT_PUBLIC_SCHEMA}.commune`;
  }
  getField() {
    return 'insee_com';
  }
}
