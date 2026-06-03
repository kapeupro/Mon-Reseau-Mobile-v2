import {
  clearMapVector,
  getRandomInt,
  clearMapVectorSite,
  clearMapVectorTerritory,
} from '@/app/components/map/drawMap/utils';
import {
  getOperatorColorByIdentifiant,
  getOperatorById,
} from '@/store/operators';
import {
  useSupportStore,
  useAntenneSubPagesStore,
  usePopUpStore,
  useClickedFromTerritoryStore,
} from '@/store/antenne';
import {
  MAX_ZOOM_DEPARTEMENT,
  MAX_ZOOM_COMMUNE,
  MIN_ZOOM_COMMUNE,
  ZOOM_CLUSTER,
  ZOOM_SUPPORT,
} from '@/app/constant/antennes';
import { getSupportByNiveau } from '@/service/antennes';
import { useSupportsStore } from '@/store/support';
import maplibregl, { Map as MapLibre } from 'maplibre-gl';
import { useBasemapStore } from '@/store/superposition';
import { usePageStore } from '@/store/store';
import { useCoordStore } from '@/store/selectedCoordStore';
import { isAdresse } from '@/utils/activeEntite';
import { PREFIX_SOURCE_LAYER } from '@/app/constant/constant';

import { Draw } from '@/app/components/map/drawMap/antenne/draw';
import { SiteComming } from '@/app/components/map/drawMap/antenne/sitecoming';
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
    en_maintenance: 'antenne-en-maintenance',
    ...buildObjectIdImages('clust_step', 'antenne-cluster-step-all'),
    ...buildObjectIdImages('a_venir_char', 'a_venir-cluster-step-all'),
    ...buildObjectIdImages('maintenance_char', 'antenne-maintenance-dark'),
  },
  light: {
    en_service: 'antenne-en-service-light',
    a_venir: 'antenne-a_venir-light',
    en_maintenance: 'antenne-en-maintenance-light',
    ...buildObjectIdImages('clust_step', 'antenne-cluster-step'),
    ...buildObjectIdImages('a_venir_char', 'a_venir-cluster-step'),
    ...buildObjectIdImages('maintenance_char', 'antenne-maintenance-light'),
  },
};

export const buildFilterImages = (oIdImages: any) => {
  const aSteps = [10, 100, 1000, 10000, 100000];
  const aFilterImages: any = ['step', ['get', 'tot_support']];

  let i = 1;

  for (const step of aSteps) {
    aFilterImages.push([
      'match',
      ['get', 'state'],
      'en_maintenance',
      oIdImages[`maintenance_char_${i}`],
      'a_venir',
      oIdImages[`a_venir_char_${i}`],
      oIdImages[`clust_step_${i}`],
    ]);
    aFilterImages.push(step);
    i += 1;
  }

  aFilterImages.push([
    'match',
    ['get', 'state'],
    'en_maintenance',
    oIdImages[`maintenance_char_${i}`],
    'a_venir',
    oIdImages[`a_venir_char_${i}`],
    oIdImages[`clust_step_${i}`],
  ]);

  return aFilterImages;
};

class Departement extends Draw {
  getSourceLayer() {
    return `${NEXT_PUBLIC_SCHEMA}.departement`;
  }
  getIdSourceLayer() {
    return `${this.getPrefixSourceLayer()}-departement`;
  }
  getIdLayer() {
    return `${this.getPrefixLayer()}-departement` + getRandomInt(50000);
  }
  addSource() {
    const idSourceLayer = this.getIdSourceLayer();

    if (!this.mapObj.getSource(idSourceLayer)) {
      this.mapObj.addSource(idSourceLayer, {
        type: 'vector',
        tiles: [
          `${TILESERV_URL}${this.getSourceLayer()}/{z}/{x}/{y}.pbf?properties=insee_dep`,
        ],
      });
    }
  }
  addLayer() {
    const idLayer = this.getIdLayer();
    const idSourceLayer = this.getIdSourceLayer();

    this.mapObj.addLayer({
      id: idLayer,
      type: 'line',
      source: idSourceLayer,
      'source-layer': this.getSourceLayer(),
      filter: this.buildFilter('insee_dep'),
      paint: {
        'line-color': '#807f99',
        'line-width': 2,
      },
      maxzoom: MAX_ZOOM_DEPARTEMENT,
    });
  }
  draw() {
    this.addSource();
    this.addLayer();
  }
}

class Commune extends Draw {
  getSourceLayer() {
    return `${NEXT_PUBLIC_SCHEMA}.commune`;
  }
  getIdSourceLayer() {
    return `${this.getPrefixSourceLayer()}-commune`;
  }
  getIdLayer() {
    return `${this.getPrefixLayer()}-commune` + getRandomInt(50000);
  }
  addSource() {
    const idSourceLayer = this.getIdSourceLayer();

    if (!this.mapObj.getSource(idSourceLayer)) {
      this.mapObj.addSource(idSourceLayer, {
        type: 'vector',
        tiles: [
          `${TILESERV_URL}${this.getSourceLayer()}/{z}/{x}/{y}.pbf?properties=insee_dep`,
        ],
      });
    }
  }
  addLayer() {
    const idLayer = this.getIdLayer();
    const idSourceLayer = this.getIdSourceLayer();

    this.mapObj.addLayer({
      id: idLayer,
      type: 'line',
      source: idSourceLayer,
      'source-layer': this.getSourceLayer(),
      filter: this.buildFilter('insee_dep'),
      paint: {
        'line-color': '#807f99',
        'line-width': 1.2,
      },
      minzoom: MIN_ZOOM_COMMUNE,
      maxzoom: MAX_ZOOM_COMMUNE,
    });
  }
  draw() {
    this.addSource();
    this.addLayer();
  }
}

export class Support extends Draw {
  translation;
  constructor(mapObj: any, mapGlobalParameters: any, translation: any) {
    super(mapObj, mapGlobalParameters);
    this.translation = translation;
  }

  getSourceLayer() {
    return `${NEXT_PUBLIC_SCHEMA}.fc_support_cluster`;
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
          )}&dispositif=${this.getDispositif()}&state=${this.formatState()}`,
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

    const aOffsetHasTotSupport = [
      'match',
      ['get', 'state'],
      'en_maintenance',
      ['literal', [150, 85]],
      'a_venir',
      ['literal', [175, 60]],
      ['literal', [260, 90]],
    ];

    const aOffsetHasNoTotSupport = [
      'match',
      ['get', 'state'],
      'a_venir',
      ['literal', [175, 60]],
      ['literal', [150, 20]],
    ];

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
                'match',
                ['get', 'state'],
                'en_maintenance',
                oIdImage.en_maintenance,
                'a_venir',
                oIdImage.a_venir,
                oIdImage.en_service,
              ],
            ],
            filterImage,
          ],
          [
            'match',
            ['get', 'state'],
            'en_maintenance',
            oIdImage.en_maintenance,
            'a_venir',
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
              aOffsetHasTotSupport,
              aOffsetHasNoTotSupport,
            ],
            aOffsetHasTotSupport,
          ],
          aOffsetHasNoTotSupport,
        ],
        ...oFont,
      },
      paint: {
        'text-color': '#ffffff',
        'text-translate': [8, 10],
        'text-translate-anchor': 'viewport',
      },
    });

    this.addSourceSupportSelected();
    this.addLayerSupportSelected(idLayer);

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
    mapObj.getCanvas().style.cursor = 'pointer';
    const features = e.features;
    const oProperties = features[0].properties;
    const coordinates = features[0].geometry.coordinates.slice();
    const { show: bShowPopUp } = usePopUpStore.getState();

    if (!bShowPopUp) {
      return;
    }

    if (oProperties.tot_support <= 1 || oProperties.niveau === 'supp') {
      const description = this.translation(`antenne.${'click-for-detail'}`);

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      popup.setLngLat(coordinates).setHTML(description).addTo(mapObj);
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
  showSupportDetail(features: any, code_dep: any, aIdsup: any = false) {
    const oSupportDetail = new SupportDetail(
      this.mapObj,
      this.mapGlobalParameters,
      features,
      code_dep,
      aIdsup
    );
    oSupportDetail.show();
  }
  onClickLayer(e: any) {
    if (!e.features.length) {
      return;
    }
    const features = e.features;
    const oProperties = features[0].properties;

    const code_dep = oProperties.code_dep;
    if (oProperties.niveau === 'supp') {
      this.showSupportDetail(features, code_dep);
      return;
    }

    if (oProperties.tot_support > 1) {
      this.zoomZoneInferieur(e);
      return;
    }

    if (oProperties.niveau === 'clust') {
      this.zoomZoneInferieur(e);
      this.showSupportDetail(
        features,
        code_dep,
        [this.extractFids(oProperties.fids)].map((id) => parseInt(id))
      );
      return;
    }

    this.showPanelDetail();
    this.setLoading(true);

    getSupportByNiveau({
      fid: this.extractFids(oProperties.fids),
    })
      .then((res) => {
        if (res) {
          this.mapObj.flyTo({
            center: [res.x, res.y],
            zoom: ZOOM_SUPPORT,
          });

          this.showSupportDetail(features, code_dep, [res.fid]);
        } else {
          this.setLoading(false);
        }
      })
      .catch((error) => {
        console.error(error);
        this.setLoading(false);
      });
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
  formatState() {
    const aState = this.getState();
    return `{${aState.join(',')}}`;
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
  showPanelDetail() {
    const antenneSupbagesStore = useAntenneSubPagesStore.getState();
    antenneSupbagesStore.setSubPage('support_info');
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
    return `${PREFIX_SOURCE_LAYER}-supports-selected`;
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

export class ZoomZoneInferieur {
  mapObj;
  selectedFeature;
  constructor(mapObj: any, selectedFeature: any) {
    this.mapObj = mapObj;
    this.selectedFeature = selectedFeature;
  }
  getPropertiesFeature() {
    return this.selectedFeature.properties;
  }
  getNextZoom() {
    const oNextZoom = {
      dept: MAX_ZOOM_DEPARTEMENT,
      com: ZOOM_CLUSTER,
      clust: ZOOM_SUPPORT,
    };
    const oProperties = this.getPropertiesFeature();
    // @ts-ignore
    return oNextZoom[oProperties.niveau];
  }
  zoom(oLongLat: any) {
    this.mapObj.flyTo({
      center: [oLongLat.lng, oLongLat.lat],
      zoom: this.getNextZoom(),
    });
  }
}

export class SupportDetail extends Draw {
  features;
  aIdsup;
  code_dep;
  constructor(
    mapObj: any,
    mapGlobalParameters: any,
    features: any,
    code_dep: any,
    aIdsup: any = false
  ) {
    super(mapObj, mapGlobalParameters);
    this.features = features;
    this.aIdsup = aIdsup;
    this.code_dep = code_dep;
  }
  getLayer() {
    return this.features[0].layer;
  }
  show() {
    this.setIconSelectedFeature();
    this.showDetail();
  }
  getListIdSupport() {
    return this.aIdsup
      ? this.aIdsup
      : this.features.map((feat: any) => feat.properties.fid);
  }
  showDetail() {
    const aIds: any = this.getListIdSupport();
    const supportPage = useSupportsStore.getState();
    const storeSupport = useSupportStore.getState();
    const antenneSupbagesStore = useAntenneSubPagesStore.getState();
    const pageStore = usePageStore.getState();
    const clickedFromTerritory = useClickedFromTerritoryStore.getState();
    if (pageStore.page === 'territory') {
      clickedFromTerritory.setIsClickedFromTerritory(true);
      pageStore.setPage('antennes-deploiements');
    } else {
      clickedFromTerritory.setIsClickedFromTerritory(false);
    }
    storeSupport.setData({
      id: aIds[0],
      code_dep: this.code_dep,
    });
    supportPage.setSupports(false);
    antenneSupbagesStore.setSubPage('support_info');
  }
  setIconSelectedFeature() {
    const layer = this.getLayer();
    const layerid = layer.id;
    const aIds: any = this.getListIdSupport();
    const globalFilter = this.buildFilter('code_dep');

    const aCurrentFilter = [];
    aCurrentFilter.push(['!', ['in', ['get', 'fid'], ['literal', aIds]]]);
    aCurrentFilter.push([
      '!',
      ['==', ['get', 'fids'], '{' + aIds.join(',') + '}'],
    ]);

    this.mapObj.setFilter(layerid, [...globalFilter, ...aCurrentFilter]);

    this.mapObj.setFilter(`${layerid}-selected`, [
      '==',
      ['get', 'fid'],
      aIds[0],
    ]);

    this.mapObj.setFilter(`${layerid}-circle`, [
      ...globalFilter,
      ...aCurrentFilter,
    ]);

    this.mapObj.setFilter(`${layerid}-circle-blur`, [
      ...globalFilter,
      ...aCurrentFilter,
    ]);
  }
}

export default function drawMapAntenne(
  mapGlobalParameters: any,
  mapObj: any,
  bClearMapVector = true,
  translations: any
) {
  const addSupportLayer = () => {
    const oSupport = new Support(mapObj, mapGlobalParameters, translations);
    oSupport.draw();
  };

  const addDepartementLayer = () => {
    const oDepartement = new Departement(mapObj, mapGlobalParameters);
    oDepartement.draw();
  };

  const addCommuneLayer = () => {
    const oCommune = new Commune(mapObj, mapGlobalParameters);
    oCommune.draw();
  };

  const addSiteToCome = () => {
    const oSiteComming = new SiteComming(
      mapObj,
      mapGlobalParameters,
      translations
    );
    oSiteComming.draw();
  };

  const draw = (mapObjParams: any) => {
    if (bClearMapVector) {
      clearMapVector(mapObjParams);
    }

    addDepartementLayer();
    addCommuneLayer();
    addSupportLayer();
  };

  const isSiteToCome = () => {
    return mapGlobalParameters.status.includes('a_venir');
  };

  draw(mapObj);
}
