import { Draw } from '@/app/components/map/drawMap/antenne/draw';
import { PREFIX_SOURCE_LAYER } from '@/app/constant/constant';

import {
  getRandomInt,
  clearMapVectorSite,
  clearMapVectorTerritory,
} from '@/app/components/map/drawMap/utils';

import { ZoomZoneInferieur } from '@/app/components/map/drawMap/antenne';
import {
  getOperatorColorByIdentifiant,
  getOperatorById,
} from '@/store/operators';

import { useSupportStore, usePopUpStore } from '@/store/antenne';

import { isAdresse } from '@/utils/activeEntite';
import { useCoordStore } from '@/store/selectedCoordStore';
import { usePageStore } from '@/store/store';
import { useBasemapStore } from '@/store/superposition';
import maplibregl, { Map as MapLibre } from 'maplibre-gl';

const TILESERV_URL = process.env.NEXT_PUBLIC_TILESERV_URL;
const NEXT_PUBLIC_SCHEMA = process.env.NEXT_PUBLIC_SCHEMA;

const IDimageAntenneActive = 'antenne-active';
const IDimageAdressActive = 'address-active';

const buildObjectIdImages = (key: string, name: string) => {
  const oIdImages: any = {};

  for (let i = 1; i < 7; i++) {
    oIdImages[`${key}_${i}`] = `${name}-${i}`;
  }

  return oIdImages;
};

const oIdImageAntenne = {
  dark: {
    en_service: 'antenne-en-service',
    a_venir: 'antenne-a_venir',
    ...buildObjectIdImages('clust_step', 'antenne-cluster-step-all'),
    ...buildObjectIdImages('a_venir_char', 'a_venir-cluster-step-all'),
  },
  light: {
    en_service: 'antenne-en-service-light',
    a_venir: 'antenne-a_venir-light',
    ...buildObjectIdImages('clust_step', 'antenne-cluster-step'),
    ...buildObjectIdImages('a_venir_char', 'a_venir-cluster-step'),
  },
};

const buildFilterImages = (oIdImages: any) => {
  const aSteps = [10, 100, 1000, 10000, 100000];
  const aFilterImages: any = ['step', ['get', 'tot_support']];

  let i = 1;

  for (const step of aSteps) {
    aFilterImages.push([
      'case',
      ['==', ['get', 'is_sav'], true],
      oIdImages[`a_venir_char_${i}`],
      oIdImages[`clust_step_${i}`],
    ]);
    aFilterImages.push(step);
    i += 1;
  }

  aFilterImages.push([
    'case',
    ['==', ['get', 'is_sav'], true],
    oIdImages[`a_venir_char_${i}`],
    oIdImages[`clust_step_${i}`],
  ]);

  return aFilterImages;
};

export class SiteComming extends Draw {
  translation;
  constructor(mapObj: any, mapGlobalParameters: any, translation: any) {
    super(mapObj, mapGlobalParameters);
    this.translation = translation;
  }
  getSourceLayer() {
    return `${NEXT_PUBLIC_SCHEMA}.fc_site_a_venir`;
  }
  getIdSourceLayer() {
    return `${this.getPrefixSourceLayer()}-${this.getNameOperators()}-${this.getNameTecno()}-${this.getDispositif()}-${this.getNameState()}-supports`;
  }
  getIdLayer() {
    return (
      `${this.getPrefixLayer()}-${this.getNameOperators()}-${this.getNameTecno()}-${this.getDispositif()}-${this.getNameState()}-supports-` +
      getRandomInt(50000)
    );
  }
  addSource() {
    const aOperators = this.getOperators();
    const aTecno = this.getTecno();
    const idSourceLayer = this.getIdSourceLayer();

    if (!this.mapObj.getSource(idSourceLayer)) {
      this.mapObj.addSource(idSourceLayer, {
        type: 'vector',
        tiles: [
          `${TILESERV_URL}${this.getSourceLayer()}/{z}/{x}/{y}.pbf?&liste_operateur=${this.formatParams(
            aOperators
          )}&techonologies=${this.formatParams(
            aTecno
          )}&dispositif=${this.getDispositif()}`,
        ],
      });
    }
  }
  getColorCircle() {
    const aOperators = this.getOperators();
    return aOperators.length === 1
      ? getOperatorColorByIdentifiant(aOperators[0])
      : '#FFF';
  }
  getIdImageAntenne() {
    const aOperators = this.getOperators();
    if (!aOperators.length) {
      return false;
    }

    if (aOperators.length > 1) {
      return oIdImageAntenne.dark;
    }

    const dtOperator = getOperatorById(aOperators[0]);
    if (!dtOperator) {
      return false;
    }

    if (!dtOperator.iconAntenne) {
      return oIdImageAntenne.dark;
    }

    //@ts-ignore
    return oIdImageAntenne[dtOperator.iconAntenne];
  }

  addLayerAdress() {
    const coords = useCoordStore.getState().selectedTerritoire.coordinates;

    const id = `search-${this.getPrefixLayer()}-${getRandomInt(
      50000
    )}-adress-symbol`;
    const id_source = `src-${id}-adress-point`;

    const pointSource = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [coords.xmin, coords.ymin],
            },
            properties: {},
          },
        ],
      },
    };

    this.mapObj.addSource(id_source, pointSource);

    this.mapObj.addLayer({
      id: id,
      type: 'symbol',
      source: id_source,
      filter: ['all'],
      layout: {
        'icon-image': IDimageAdressActive,
      },
    });

    /*
        this.mapObj.setZoom(7)
        this.mapObj.setCenter([coords.xmin, coords.ymin])
        */
  }

  addLayer() {
    if (!this.hasTecnoSelected()) {
      return;
    }

    const oIdImage = this.getIdImageAntenne();
    if (!oIdImage) {
      return;
    }

    const idLayer = this.getIdLayer();
    const idSourceLayer = this.getIdSourceLayer();
    const globalFilter = this.buildFilter('code_dep');

    const filterImage = buildFilterImages(oIdImage);
    const oFont = this.getFont();

    this.mapObj.addLayer({
      id: `${idLayer}-circle-blur`,
      type: 'circle',
      source: idSourceLayer,
      'source-layer': 'default',
      filter: globalFilter,
      layout: {},
      paint: {
        'circle-color': '#23225324',
        'circle-radius': 22,
        'circle-blur': 1,
      },
    });

    this.mapObj.addLayer({
      id: `${idLayer}-circle`,
      type: 'circle',
      source: idSourceLayer,
      'source-layer': 'default',
      filter: globalFilter,
      layout: {},
      paint: {
        'circle-color': this.getColorCircle(),
        'circle-radius': 15,
        'circle-translate': [0, 0],
      },
    });

    this.mapObj.addLayer({
      id: idLayer,
      type: 'symbol',
      source: idSourceLayer,
      'source-layer': 'default',
      filter: globalFilter,
      layout: {
        // If the feature has the property "point_count" it means it's a cluster then we use the image "tree-cluster"
        // Otherwise we use the simple "tree" image.
        'icon-image': [
          'case',
          ['has', 'tot_support'],
          [
            'case',
            ['==', ['get', 'niveau'], 'clust'],
            [
              'case',
              ['>', ['get', 'tot_support'], 1],
              filterImage,
              [
                'case',
                ['==', ['get', 'is_sav'], true],
                oIdImage.a_venir,
                oIdImage.en_service,
              ],
            ],
            filterImage,
          ],
          [
            'case',
            ['==', ['get', 'is_sav'], true],
            oIdImage.a_venir,
            oIdImage.en_service,
          ],
        ],
        // Display the cluster point count if >= 2
        'text-field': [
          'case',
          ['has', 'tot_support'],
          [
            'case',
            ['==', ['get', 'niveau'], 'clust'],
            [
              'case',
              ['==', ['get', 'tot_support'], 1],
              '',
              ['get', 'tot_support'],
            ],
            ['get', 'tot_support'],
          ],
          '',
        ],
        'icon-padding': 0,
        'text-padding': 0,
        'text-overlap': 'always',
        'icon-overlap': 'always',
        'text-size': 12,
        'text-anchor': 'left',
        'icon-size': 0.125,
        'icon-offset': [
          'case',
          ['has', 'tot_support'],
          [
            'case',
            ['==', ['get', 'niveau'], 'clust'],
            [
              'case',
              ['>', ['get', 'tot_support'], 1],
              [
                'case',
                ['==', ['get', 'is_sav'], true],
                ['literal', [175, 60]],
                ['literal', [260, 90]],
              ],
              [
                'case',
                ['==', ['get', 'is_sav'], true],
                ['literal', [175, 50]],
                ['literal', [150, 20]],
              ],
            ],
            [
              'case',
              ['==', ['get', 'is_sav'], true],
              ['literal', [175, 60]],
              ['literal', [260, 90]],
            ],
          ],
          [
            'case',
            ['==', ['get', 'is_sav'], true],
            ['literal', [175, 60]],
            ['literal', [150, 20]],
          ],
        ],
        ...oFont,
      },
      paint: {
        'text-color': '#ffffff',
        'text-translate': [8, 10],
        'text-translate-anchor': 'viewport',
      },
    });

    // this.addSourceSupportSelected()
    // this.addLayerSupportSelected(idLayer)

    const currentPage = usePageStore.getState().page;
    if (isAdresse() && currentPage === 'territory') {
      clearMapVectorTerritory(this.mapObj);
      this.addLayerAdress();
    }

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: true,
    });

    this.mapObj.on('mouseenter', idLayer, (e: any) =>
      this.onMouseEnter(e, this.mapObj, popup)
    );

    this.mapObj.off('mouseleave', idLayer, (e: any) =>
      this.onMouseLeave(e, this.mapObj, popup)
    );
    this.mapObj.on('mouseleave', idLayer, (e: any) =>
      this.onMouseLeave(e, this.mapObj, popup)
    );

    this.mapObj.on('click', idLayer, this.onClickLayer.bind(this));
  }

  onMouseEnter(e: any, mapObj: MapLibre, popup: any) {
    // @ts-ignore
    // this.getCanvas().style.cursor = "pointer"
    const features = e.features;
    const oProperties = features[0].properties;
    if (oProperties.tot_support > 1) {
      mapObj.getCanvas().style.cursor = 'pointer';
    }

    const coordinates = features[0].geometry.coordinates.slice();
    const { show: bShowPopUp } = usePopUpStore.getState();

    if (!bShowPopUp) {
      return;
    }

    if (oProperties.tot_support <= 1 || oProperties.niveau === 'supp') {
      // const description = this.translation(
      //     `antenne.${"click-for-detail"}`
      // )
      // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      //     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      // }
      // popup.setLngLat(coordinates).setHTML(description).addTo(mapObj)
    }
  }
  onMouseLeave(e: any, mapObj: MapLibre, popup: any) {
    // @ts-ignore
    mapObj.getCanvas().style.cursor = '';
    popup.remove();
  }

  zoomZoneInferieur(e: any) {
    const oZoomZoneInferieur = new ZoomZoneInferieur(
      this.mapObj,
      e.features[0]
    );
    oZoomZoneInferieur.zoom(e.lngLat);
  }

  onClickLayer(e: any) {
    if (!e.features.length) {
      return;
    }
    const features = e.features;
    const oProperties = features[0].properties;
    if (oProperties.tot_support >= 1) {
      this.zoomZoneInferieur(e);
      return;
    }

    if (oProperties.niveau === 'clust') {
      this.zoomZoneInferieur(e);
      return;
    }
  }
  draw() {
    this.addSource();
    this.addLayer();
  }
  getOperators() {
    return this.mapGlobalParameters['operatorAndAll'];
  }
  getTecno() {
    return this.mapGlobalParameters['antennes']['technologies'];
  }
  getDispositif() {
    return this.mapGlobalParameters['antennes']['dispositif'];
  }
  getState() {
    return this.mapGlobalParameters['status'];
  }
  getNameOperators() {
    return this.formatNames(this.getOperators());
  }
  getNameTecno() {
    return this.formatNames(this.getTecno());
  }
  getNameState() {
    return this.formatNames(this.getState());
  }
  extractFids(data: string) {
    return data.substring(1, data.length - 1);
  }
  setLoading(bLoading: boolean) {
    const supportStore = useSupportStore.getState();
    supportStore.setLoading(bLoading);
  }
  hasTecnoSelected() {
    const aTecno = this.getTecno();
    return aTecno.length > 0;
  }
  addLayerSupportSelected(idLayer: any) {
    this.mapObj.addLayer({
      id: `${idLayer}-selected`,
      type: 'symbol',
      source: this.getIdSourceSupportSelected(),
      'source-layer': this.getSourceLayerSupportSelected(),
      layout: {
        'icon-image': IDimageAntenneActive,
        visibility: 'visible',
        'icon-overlap': 'always',
        'icon-size': 0.75,
        'icon-offset': [2, -20],
      },
      filter: ['==', ['get', 'fid'], null],
    });
  }
  addSourceSupportSelected() {
    const idSourceLayer = this.getIdSourceSupportSelected();

    if (!this.mapObj.getSource(idSourceLayer)) {
      this.mapObj.addSource(idSourceLayer, {
        type: 'vector',
        tiles: [
          `${TILESERV_URL}${this.getSourceLayerSupportSelected()}/{z}/{x}/{y}.pbf`,
        ],
      });
    }
  }
  getIdSourceSupportSelected() {
    return `${PREFIX_SOURCE_LAYER}-sitecomming-selected`;
  }
  getSourceLayerSupportSelected() {
    return `${NEXT_PUBLIC_SCHEMA}.anfr_sup_support`;
  }
  getFont() {
    const { oBasemap } = useBasemapStore.getState();
    const oFont: any = {};
    if (oBasemap.name === 'ign') {
      oFont['text-font'] = ['Source Sans Pro Regular'];
    }
    return oFont;
  }
  resetFilter(subPage: any) {
    const { id } = useSupportStore.getState();
    if (!id) {
      return;
    }

    const oStyle = this.mapObj.getStyle();
    const prefixLayer = `${this.getPrefixLayer()}-${this.getNameOperators()}-${this.getNameTecno()}-${this.getDispositif()}-${this.getNameState()}-supports-`;
    const aArcepLayers = this.getArcepLayersByListLayers(
      oStyle.layers,
      prefixLayer
    );
    if (!aArcepLayers.length) {
      return;
    }

    const randomInt = this.extractRandomIntIdLayer(
      aArcepLayers[0].id,
      prefixLayer.length
    );
    if (!randomInt) {
      return;
    }

    const layerId = `${prefixLayer}${randomInt}`;
    const globalFilter = this.buildFilter('code_dep');
    let filter = [...globalFilter];
    let filterSelected = null;
    if (!subPage || subPage === 'support_info') {
      clearMapVectorSite(this.mapObj);
    }
    if (subPage === 'support_info') {
      filterSelected = id;
    }
    if (['support_info', 'support_site'].includes(subPage)) {
      filter = [
        ...globalFilter,
        ['!', ['in', ['get', 'fid'], ['literal', [id]]]],
        ['!', ['==', ['get', 'fids'], `{${id}}`]],
      ];
    }

    this.mapObj.setFilter(layerId, filter);
    this.mapObj.setFilter(`${layerId}-selected`, [
      '==',
      ['get', 'fid'],
      filterSelected,
    ]);
    this.mapObj.setFilter(`${layerId}-circle`, filter);
    this.mapObj.setFilter(`${layerId}-circle-blur`, filter);
  }
  extractRandomIntIdLayer(idLayer: any, indexStart: any) {
    const sData = idLayer.substring(indexStart);
    const aData = sData.split('-');
    return aData.length ? aData[0] : false;
  }
  getArcepLayersByListLayers(aLayers: any, prefixLayer: any) {
    return aLayers.filter(
      (layer: any) => layer.id && layer.id.startsWith(prefixLayer)
    );
  }
}
