import {
  getDeptNotInMetropole,
  getIdDeptTerritory,
  isMetropole,
  getRandomInt,
  clearMapVector,
} from '@/app/components/map/drawMap/utils';
import { useTerritoryStore } from '@/store/filter';
import { PREFIX_LAYER } from '@/app/constant/constant';
import { useOperatorsStore } from '@/store/operators';

export default class TerritoryMapCouverture {
  mapObj;
  tecno;
  tileservUrl = process.env.NEXT_PUBLIC_TILESERV_URL;
  schema = process.env.NEXT_PUBLIC_SCHEMA;
  idSrcLayer = '';
  idLayer = '';
  prefixeLayer = `${PREFIX_LAYER}-territory-couverture`;
  constructor(mapObj: any, tecno: any) {
    this.mapObj = mapObj;
    this.tecno = tecno;
  }

  setIdSourceLayer() {
    this.idSrcLayer = `src-${this.prefixeLayer}-${
      this.tecno
    }-${getRandomInt(50000)}`;
  }
  getIdSourceLayer() {
    return this.idSrcLayer;
  }
  setIdLayer() {
    this.idLayer = `${this.prefixeLayer}-${this.tecno}-${getRandomInt(50000)}`;
  }
  getIdLayer() {
    return this.idLayer;
  }

  addSourceLayer() {
    this.setIdSourceLayer();

    const idSrcLayer = this.getIdSourceLayer();

    if (!this.mapObj.getSource(idSrcLayer)) {
      this.mapObj.addSource(idSrcLayer, {
        type: 'vector',
        tiles: [
          `${this.tileservUrl}${this.schema}.couvertures_tbc/{z}/{x}/{y}.pbf?in_techno=${this.tecno}`,
        ],
      });
    }
  }
  addLayer() {
    this.setIdLayer();

    this.mapObj.addLayer({
      id: this.getIdLayer(),
      type: 'fill',
      source: this.getIdSourceLayer(),
      'source-layer': 'default',
      layout: {
        visibility: 'visible',
      },
      filter: this.buildFilter(),
      paint: {
        'fill-outline-color': 'transparent',
        'fill-color': '#49488d',
        'fill-opacity': this.buildFillOpacity(),
      },
    });
  }
  buildFilter() {
    const aFilter = [];
    aFilter.push('all');
    aFilter.push(this.getFilterByTerritory());
    return aFilter;
  }
  draw() {
    clearMapVector(this.mapObj);

    this.addSourceLayer();
    this.addLayer();
  }
  getFilterByTerritory() {
    const { territory } = useTerritoryStore.getState();

    const params = { territory };
    let filter = null;
    if (isMetropole(params)) {
      filter = [
        '!',
        ['in', ['get', 'dept'], ['literal', getDeptNotInMetropole()]],
      ];
    } else {
      filter = [
        'in',
        ['get', 'dept'],
        ['literal', [getIdDeptTerritory(params)]],
      ];
    }
    return filter;
  }

  buildFillOpacity() {
    const { operators } = useOperatorsStore.getState();
    if (!operators.length) {
      return 1;
    }

    const opacity = 1 / operators.length;
    let aCaseOpacity: any = ['case'];

    for (const operator of operators) {
      aCaseOpacity = [
        ...aCaseOpacity,
        ['==', ['get', 'operateur'], operator.identifiant],
        opacity,
      ];
    }

    aCaseOpacity.push(opacity);

    return aCaseOpacity;
  }
}
