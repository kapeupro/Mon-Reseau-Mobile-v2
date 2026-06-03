import { PREFIX_LAYER, PREFIX_SOURCE_LAYER } from '@/app/constant/constant';
import {
  getRandomInt,
  clearMapVector,
} from '@/app/components/map/drawMap/utils';
import { useCoordStore } from '@/store/selectedCoordStore';
import { isTrain } from '@/utils/activeEntite';
import { getOperatorById } from '@/store/operators';
import {
  isLevelTwo,
  isLevelOne,
} from '@/app/components/territoire/train_elements/utils';
import {
  getDefaultDatasource,
  useDatasourcesStore,
  useEmplacementTestStore,
  useTestSubPagesStore,
} from '@/store/qualityTest';
import { getEmplacementTestCluster } from '@/service/emplacementTest';
import maplibregl from 'maplibre-gl';
import { LIST_TYPE_AXES } from '@/app/constant/train';
import { useServiceTrainStore } from '@/store/train';
import { useServiceRouteStore } from '@/store/route';
class Transport {
  mapObj;
  oPopup: any;
  mapGlobalParameters;
  translations: any;
  idCurrentLayer = '';
  idCurrentSourceLayer = '';
  idDimageEchecMap = 'quality-echec';
  idDimageCheck = 'check';
  idDimageSelected = 'quality-active';
  minZoomImage = 10;
  tileservUrl = process.env.NEXT_PUBLIC_TILESERV_URL;
  schema = process.env.NEXT_PUBLIC_SCHEMA;
  circleColorError = '#e67fa3';
  constructor(
    mapObj: any,
    mapGlobalParameters: any,
    translations: any = () => {}
  ) {
    this.mapObj = mapObj;
    this.mapGlobalParameters = mapGlobalParameters;
    this.translations = translations;
  }
  getSourceLayer() {
    return `${this.schema}.fc_qos_transport`;
  }
  getPrefixLayer() {
    return `${PREFIX_LAYER}-quality-transport`;
  }
  getPrefixSourceLayer() {
    return `${PREFIX_SOURCE_LAYER}-quality-transport`;
  }
  getIdLayer() {
    return `${this.getPrefixLayer()}-${this.getParamsIdentifiant()}-${getRandomInt(
      50000
    )}`;
  }
  getIdSourceLayer() {
    return `${this.getPrefixSourceLayer()}-${this.getParamsIdentifiant()}`;
  }
  removeSpecialCharByUnderscore(strValue: string) {
    return strValue.replace(/[^A-Za-z0-9]/g, '_');
  }
  getProtocole() {
    const { serviceTrain } = useServiceTrainStore.getState();
    const { serviceRoute } = useServiceRouteStore.getState();

    const current_service = isTrain() ? serviceTrain : serviceRoute;

    return current_service == 'internet' ? 'WEB' : 'VOIX';
  }
  getParamsSourceLayer() {
    const oSearchParams = new URLSearchParams({
      operator: this.getOperator(),
      protocole: this.getProtocole(),
      situation: 'toutes',
      strate:
        '{OTHERS,ZONES RURALES,ZONES INTERMEDIAIRES,ZONES DENSES,ZONES TOURISTIQUES}',
      datasource: this.getDefaultDatasource(),
      metropole: '1',
      habitation: '0',
      axis: '{' + this.getAxisParamsSourceLayer() + '}',
      axis_name: this.getAxisNameParamsSourceLayer(),
    });
    return oSearchParams.toString();
  }
  getDefaultDatasource() {
    const { aDatasources } = useDatasourcesStore.getState();
    return getDefaultDatasource(aDatasources)?.id_crowd ?? '';
  }
  getParamsIdentifiant() {
    const aParams = [
      this.getOperator(),
      this.getAxis(),
      this.removeSpecialCharByUnderscore(this.getAxisName()),
      this.getProtocole(),
    ];

    return aParams.join('-');
  }
  getOperatorParameters() {
    return isTrain()
      ? this.mapGlobalParameters['train']['operators']
      : this.mapGlobalParameters['route']['operators'];
  }
  getOperator() {
    const aOperators = this.getOperatorParameters();
    return aOperators.length === 1 ? aOperators[0] : 'all';
  }
  getAxis() {
    const { selectedTerritoire } = useCoordStore.getState();
    return selectedTerritoire?.properties?.axis ?? '';
  }
  getAxisName() {
    const { selectedTerritoire } = useCoordStore.getState();
    return isLevelTwo() ? '' : (selectedTerritoire.properties?.nom ?? '');
  }
  addSource() {
    if (!this.mapObj.getSource(this.idCurrentSourceLayer)) {
      this.mapObj.addSource(this.idCurrentSourceLayer, {
        type: 'vector',
        tiles: [
          `${
            this.tileservUrl
          }${this.getSourceLayer()}/{z}/{x}/{y}.pbf?${this.getParamsSourceLayer()}`,
        ],
      });
    }
  }

  addSymbolWeb() {
    this.mapObj.addLayer({
      id: this.idCurrentLayer,
      type: 'symbol',
      source: this.idCurrentSourceLayer,
      'source-layer': 'default',
      layout: {
        'icon-image': [
          'step',
          ['get', 'acess_duration'],
          this.idDimageCheck,
          10,
          this.idDimageEchecMap,
        ],
        visibility: 'visible',
        'icon-padding': 2,
        'text-overlap': 'always',
        'icon-overlap': 'always',
      },
      minzoom: this.minZoomImage,
    });
  }

  addSymbolVoix() {
    this.mapObj.addLayer({
      id: this.idCurrentLayer,
      type: 'symbol',
      source: this.idCurrentSourceLayer,
      'source-layer': 'default',
      layout: {
        'icon-image': [
          'case',
          ['==', ['get', 'status'], 2],
          this.idDimageCheck,
          ['==', ['get', 'status'], 1],
          this.idDimageCheck,
          this.idDimageEchecMap,
        ],
        visibility: 'visible',
        'icon-padding': 2,
        'text-overlap': 'always',
        'icon-overlap': 'always',
      },
      minzoom: this.minZoomImage,
    });
  }

  isData() {
    var service = isTrain()
      ? this.mapGlobalParameters['serviceTrain']
      : this.mapGlobalParameters['serviceRoute'];
    return service === 'internet';
  }
  addSymbolLayer() {
    if (this.isData()) {
      this.addSymbolWeb();
    } else {
      this.addSymbolVoix();
    }
    this.mapObj.on('click', this.idCurrentLayer, this.onClickLayer.bind(this));
    this.mapObj.on(
      'mouseenter',
      this.idCurrentLayer,
      this.onMouseenterLayer.bind(this)
    );
    this.mapObj.on(
      'mouseleave',
      this.idCurrentLayer,
      this.onMouseleaveLayer.bind(this)
    );
  }
  onClickLayer(e: any) {
    const countFeatures = e.features.length;
    if (!countFeatures) {
      return;
    }

    const sIds = e.features[0].properties.ids;

    this.setIconSelectedFeatures(sIds);
    this.getDetail(sIds);
    this.showDetail();
  }
  getDetail(sIds: string) {
    const { setDataEmplacementTest, setLoading } =
      useEmplacementTestStore.getState();

    const params = {
      fid: sIds.substring(1, sIds.length - 1),
      type: 'transport',
    };

    const fetchData = async () => {
      setDataEmplacementTest([]);
      setLoading(true);
      try {
        const dataEmplacement = await getEmplacementTestCluster(params);
        setDataEmplacementTest(dataEmplacement);
      } catch (e) {
        console.log('Error get emplacement test : ', e);
      }
      setLoading(false);
    };

    fetchData();
  }
  showDetail() {
    const testSupbagesStore = useTestSubPagesStore.getState();
    testSupbagesStore.setSubPage('emplacement_test');
  }
  onMouseenterLayer(e: any) {
    const countFeatures = e.features.length;
    if (!countFeatures) {
      return;
    }

    this.mapObj.getCanvas().style.cursor = 'pointer';

    const features = e.features;
    const coordinates = features[0].geometry.coordinates.slice();
    const idFeature = features[0].layer['id'];

    if (idFeature.startsWith(this.getPrefixLayer())) {
      const description = this.translations('test.click-on-point');

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      this.oPopup
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(this.mapObj);
    }
  }
  onMouseleaveLayer() {
    this.mapObj.getCanvas().style.cursor = '';
    this.oPopup.remove();
  }
  draw() {
    this.idCurrentSourceLayer = this.getIdSourceLayer();
    this.idCurrentLayer = this.getIdLayer();

    this.createPopUpObject();

    this.addSource();
    this.addCircleLayer();
    this.addSymbolLayer();
    this.addSelectedLayer();
  }
  createPopUpObject() {
    this.oPopup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: true,
    });
  }
  addSelectedLayer() {
    this.mapObj.addLayer({
      id: `${this.idCurrentLayer}-selected`,
      type: 'symbol',
      source: this.idCurrentSourceLayer,
      'source-layer': 'default',
      layout: {
        'icon-image': this.idDimageSelected,
        visibility: 'visible',
        'icon-overlap': 'always',
        'icon-size': 0.75,
        'icon-offset': [0, -10],
      },
      filter: ['==', ['get', 'ids'], ''],
    });
  }
  addCircleWeb() {
    const oColor = this.getCircleColor();
    this.mapObj.addLayer({
      id: `${this.idCurrentLayer}-circle`,
      type: 'circle',
      source: this.idCurrentSourceLayer,
      'source-layer': 'default',
      paint: {
        'circle-color': [
          'step',
          ['get', 'acess_duration'],
          oColor.success,
          5,
          oColor.success_partiel,
          10,
          this.circleColorError,
        ],
        'circle-opacity': [
          'step',
          ['zoom'],
          1,
          this.minZoomImage,
          ['step', ['get', 'acess_duration'], 1, 10, 0],
        ],
        'circle-radius': ['step', ['zoom'], 5, 10, 7],
        'circle-translate': [0, 0],
      },
    });
  }

  addCircleVoix() {
    const oColor = this.getCircleColor();
    this.mapObj.addLayer({
      id: `${this.idCurrentLayer}-circle`,
      type: 'circle',
      source: this.idCurrentSourceLayer,
      'source-layer': 'default',
      paint: {
        'circle-color': [
          'case',
          ['==', ['get', 'status'], 2],
          oColor.success,
          ['==', ['get', 'status'], 1],
          oColor.success_partiel,
          this.circleColorError,
        ],
        'circle-opacity': [
          'step',
          ['zoom'],
          1,
          this.minZoomImage,
          [
            'case',
            ['==', ['get', 'status'], 2],
            1,
            ['==', ['get', 'status'], 1],
            1,
            0,
          ],
        ],
        'circle-radius': ['step', ['zoom'], 5, 10, 7],
        'circle-translate': [0, 0],
      },
    });
  }

  addCircleLayer() {
    if (this.isData()) {
      this.addCircleWeb();
    } else {
      this.addCircleVoix();
    }
  }
  getCircleColor() {
    const oDefaultColor = {
      success: '#232253',
      success_partiel: '#cdccff',
    };
    const aOperators = this.getOperatorParameters();
    if (aOperators.length !== 1) {
      return oDefaultColor;
    }

    const operators = getOperatorById(aOperators[0]);
    if (!operators) {
      return oDefaultColor;
    }

    return {
      success: operators.couleurNiveau4,
      success_partiel: operators.couleurNiveau3,
    };
  }
  setIconSelectedFeatures(sIds: any) {
    const currentFilter = ['==', ['get', 'ids'], sIds];

    this.mapObj.setFilter(this.idCurrentLayer, ['!', currentFilter]);
    this.mapObj.setFilter(`${this.idCurrentLayer}-circle`, [
      '!',
      currentFilter,
    ]);
    this.mapObj.setFilter(`${this.idCurrentLayer}-selected`, currentFilter);
  }
  getAxisParamsSourceLayer() {
    if (!isLevelOne()) {
      return this.getAxis();
    }
    return isTrain() ? this.getAllAxisTrain() : 'routes';
  }
  getAllAxisTrain() {
    const lstAxis = <any>[];
    LIST_TYPE_AXES.forEach((oType) => {
      if (oType.name === 'all') {
        return;
      }

      lstAxis.push(oType.name);
    });

    return lstAxis.join(',');
  }
  getAxisNameParamsSourceLayer() {
    return isLevelOne() ? '' : this.getAxisName();
  }
}

export default function drawMapTransport(
  mapGlobalParameters: any,
  mapObj: any,
  bClearMapVector = true,
  translations: any = () => {}
) {
  const addTransportLayer = () => {
    const oTransport = new Transport(mapObj, mapGlobalParameters, translations);
    oTransport.draw();
  };

  const draw = () => {
    if (bClearMapVector) {
      clearMapVector(mapObj);
    }

    addTransportLayer();
  };

  draw();
}
