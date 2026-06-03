import {
  clearMapVector,
  isMetropole,
  getRandomInt,
} from '@/app/components/map/drawMap/utils';
import maplibregl, { Map as MapLibre } from 'maplibre-gl';
import { PREFIX_LAYER, PREFIX_SOURCE_LAYER } from '@/app/constant/constant';
import {
  useSignalementStore,
  useSignalementSubPagesStore,
} from '@/store/signalement';

const TILESERV_URL = process.env.NEXT_PUBLIC_TILESERV_URL;
const NEXT_PUBLIC_SCHEMA = process.env.NEXT_PUBLIC_SCHEMA;

export class Signalement {
  mapObj;
  mapGlobalParameters;
  translations;
  idLayer = '';
  idSourceLayer = '';

  constructor(
    mapObj: any,
    mapGlobalParameters: any,
    translations: any = () => {}
  ) {
    this.mapObj = mapObj;
    this.mapGlobalParameters = mapGlobalParameters;
    this.translations = translations;
  }

  getPrefixLayer() {
    return `${PREFIX_LAYER}-signalement`;
  }

  getPrefixSourceLayer() {
    return `${PREFIX_SOURCE_LAYER}-signalement`;
  }

  getSourceLayer() {
    return `${NEXT_PUBLIC_SCHEMA}.fc_signalement`;
  }

  getOpertor() {
    const aOperators = this.mapGlobalParameters['signalement']['operators'];
    return aOperators.length === 1 ? aOperators[0] : 'all';
  }

  isMetropole() {
    return isMetropole(this.mapGlobalParameters) ? '1' : '0';
  }

  getIdSourceLayer() {
    return `${this.getPrefixSourceLayer()}-${this.getOpertor()}-${this.isMetropole()}`;
  }

  getIdLayer() {
    return `${this.getPrefixLayer()}-${this.getOpertor()}-${this.isMetropole()}-${getRandomInt(
      50000
    )}`;
  }

  addSource() {
    const idSourceLayer = this.getIdSourceLayer();

    if (!this.mapObj.getSource(idSourceLayer)) {
      this.mapObj.addSource(idSourceLayer, {
        type: 'vector',
        tiles: [
          `${TILESERV_URL}${this.getSourceLayer()}/{z}/{x}/{y}.pbf?&operator=${this.getOpertor()}&metropole=${this.isMetropole()}`,
        ],
      });
    }
  }

  addLayer() {
    this.idLayer = this.getIdLayer();
    this.idSourceLayer = this.getIdSourceLayer();

    this.mapObj.addLayer({
      id: this.idLayer,
      type: 'fill',
      source: this.idSourceLayer,
      'source-layer': 'default',
      layout: {},
      paint: {
        'fill-color': [
          'step',
          ['get', 'total'],
          '#febb78',
          3,
          '#ff474f',
          11,
          '#cc008f',
          31,
          '#670093',
        ],
        'fill-outline-color': [
          'step',
          ['get', 'total'],
          '#e99037',
          3,
          '#c50026',
          11,
          '#960061',
          31,
          '#350064',
        ],
        'fill-opacity': 0.75,
      },
    });

    this.mapObj.addLayer({
      id: `${this.idLayer}-selected`,
      type: 'fill',
      source: this.idSourceLayer,
      'source-layer': 'default',
      layout: {},
      filter: ['==', ['get', 'id'], ''],
      paint: {
        'fill-color': [
          'step',
          ['get', 'total'],
          '#febb78',
          3,
          '#ff474f',
          11,
          '#cc008f',
          31,
          '#670093',
        ],
        'fill-outline-color': [
          'step',
          ['get', 'total'],
          '#e99037',
          3,
          '#c50026',
          11,
          '#960061',
          31,
          '#350064',
        ],
        'fill-opacity': 1,
      },
    });

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: true,
    });

    this.mapObj.on('mouseenter', this.idLayer, (e: any) =>
      this.onMouseEnter(e, this.mapObj, popup)
    );

    this.mapObj.on('mouseleave', this.idLayer, (e: any) =>
      this.onMouseLeave(e, this.mapObj, popup)
    );

    this.mapObj.on('click', this.idLayer, this.onClickLayer.bind(this));
  }

  onMouseEnter(e: any, mapObj: MapLibre, popup: any) {
    // @ts-ignore
    mapObj.getCanvas().style.cursor = 'pointer';

    const features = e.features;
    const properties = features[0].properties;
    const coordinates = [parseFloat(properties.x), parseFloat(properties.y)];
    const description = this.translations('signalement.click-on-hexagon');

    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    popup.setLngLat(coordinates).setHTML(description).addTo(mapObj);
  }

  onMouseLeave(e: any, mapObj: MapLibre, popup: any) {
    // @ts-ignore
    mapObj.getCanvas().style.cursor = '';
    popup.remove();
  }

  onClickLayer(e: any) {
    if (!e.features.length) {
      return;
    }
    const features = e.features;
    const oProperties = features[0].properties;

    const { setIdHexa } = useSignalementStore.getState();
    const { setSubPage } = useSignalementSubPagesStore.getState();

    setIdHexa(oProperties.id);
    setSubPage('info');

    this.selectFeature(oProperties.id);
  }

  selectFeature(id: number) {
    const filter = ['==', ['get', 'id'], id];

    this.mapObj.setFilter(this.idLayer, ['!', filter]);
    this.mapObj.setFilter(`${this.idLayer}-selected`, filter);
  }

  draw() {
    this.addSource();
    this.addLayer();
  }
}

export default function drawMapSignalement(
  mapGlobalParameters: any,
  mapObj: any,
  bClearMapVector = true,
  translations: any = () => {}
) {
  const addLayers = () => {
    const oSignalement = new Signalement(
      mapObj,
      mapGlobalParameters,
      translations
    );
    oSignalement.draw();
  };

  const draw = (mapObjParams: any) => {
    if (bClearMapVector) {
      clearMapVector(mapObjParams);
    }
    addLayers();
  };

  draw(mapObj);
}
