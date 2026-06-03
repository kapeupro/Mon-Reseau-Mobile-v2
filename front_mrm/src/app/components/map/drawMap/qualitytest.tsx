import {
  clearMapVector,
  isMetropole,
  getRandomInt,
} from '@/app/components/map/drawMap/utils';

import md5 from 'md5';
import { getOperatorById } from '@/store/operators';
import drawMapHexa from '@/app/components/map/drawMap/hexa';

import maplibregl, { Map as MapLibre } from 'maplibre-gl';
import { useMapStore } from '@/store/map';

import {
  useEmplacementTestStore,
  useTestSubPagesStore,
} from '@/store/qualityTest';
import { getEmplacementTestCluster } from '@/service/emplacementTest';
import {
  useTypeZoneStore,
  useSituationStore,
  useEntiteStore,
  useTestStore,
} from '@/store/store';
import { useTerritoryStore } from '@/store/filter';
import { PREFIX_LAYER, PREFIX_SOURCE_LAYER } from '@/app/constant/constant';
import { useServiceQosStore, useOperatorsQosStore } from '@/store/qos';

const NEXT_PUBLIC_SCHEMA = process.env.NEXT_PUBLIC_SCHEMA;

const isData = (mapGlobalParameters: any) => {
  var service = mapGlobalParameters['qos']['service'];
  return service === 'internet';
};

const isHabitation = (mapGlobalParameters: any) => {
  var service = mapGlobalParameters['entite'];
  return service === 'territoire';
};

export const getTable = () => {
  return `${NEXT_PUBLIC_SCHEMA}.fc_qos`;
};

export default function drawMapQualityTest(
  mapGlobalParameters: any,
  mapObj: any,
  bClearMapVector = true,
  translations: any = () => {}
) {
  const TILESERV_URL = process.env.NEXT_PUBLIC_TILESERV_URL;
  const aOperatorSelected = mapGlobalParameters['qos']['operators'];
  const IDimageEchecMap = 'quality-echec';
  const IDimageQualityTestActive = 'quality-active';
  const IDimageCheck = 'check';
  const minZoomImage = 10;
  const circleColorError = '#e67fa3';

  const getPrefixLayerCouverture = () => {
    return `${PREFIX_LAYER}-quality`;
  };

  const getIdLayerByIdentifiant = (identifiant: number) => {
    var prefixLayerIdent = getPrefixLayerCouverture();
    var layerIdent =
      prefixLayerIdent + '-' + identifiant + '-' + getRandomInt(50000);
    return layerIdent;
  };

  const draw = (mapObjParams: any, mapGlobalParametersParams: any) => {
    if (bClearMapVector) {
      clearMapVector(mapObjParams);
    }

    addLayer(mapObjParams, mapGlobalParametersParams);
  };

  const buildFilter = () => {
    var aFilter = [];
    aFilter.push('all');
    return aFilter;
  };

  const isWeb = (mapGlobalParametersParams: any) => {
    var typeTest = mapGlobalParametersParams['typeTest'];
    return typeTest['testInternet'] === 'WEB';
  };

  const isStream = (mapGlobalParametersParams: any) => {
    var typeTest = mapGlobalParametersParams['typeTest'];
    return typeTest['testInternet'] === 'STREAM';
  };

  const isVoix = (mapGlobalParametersParams: any) => {
    if (isData(mapGlobalParametersParams)) {
      return false;
    }

    if (mapGlobalParametersParams['typeTest']['testAppel'] === 'Voix') {
      return true;
    }
    return false;
  };

  const isDownload = (mapGlobalParametersParams: any) => {
    var typeTest = mapGlobalParametersParams['typeTest'];
    return typeTest['testInternet'] === 'DOWNLOAD';
  };

  const isUpload = (mapGlobalParametersParams: any) => {
    var typeTest = mapGlobalParametersParams['typeTest'];
    return typeTest['testInternet'] === 'UPLOAD';
  };

  const buildLayoutWeb = () => {
    var layout = {
      'icon-image': [
        'step',
        ['get', 'acess_duration'],
        IDimageCheck,
        10,
        IDimageEchecMap,
      ],
      visibility: 'visible',
      'icon-padding': 2,
      'text-overlap': 'always',
      'icon-overlap': 'always',
    };
    return layout;
  };

  const buildLayoutStream = () => {
    var layout = {
      'icon-image': [
        'case',
        ['==', ['get', 'quality_perfect'], true],
        IDimageCheck,
        [
          'case',
          ['==', ['get', 'quality_correct'], true],
          IDimageCheck,
          IDimageEchecMap,
        ],
      ],
      visibility: 'visible',
      'icon-padding': 2,
      'text-overlap': 'always',
      'icon-overlap': 'always',
    };
    return layout;
  };

  const buildLayoutDownload = () => {
    var layout = {
      visibility: 'visible',
    };
    return layout;
  };

  const buildLayoutUpload = () => {
    var layout = {
      'icon-image': [
        'case',
        ['==', ['get', 'upload_ok'], true],
        IDimageCheck,
        IDimageEchecMap,
      ],
      visibility: 'visible',
      'icon-padding': 2,
      'text-overlap': 'always',
      'icon-overlap': 'always',
    };
    return layout;
  };

  const buildLayoutVoix = () => {
    var layout = {
      'icon-image': [
        'case',
        ['==', ['get', 'status'], 2],
        IDimageCheck,
        ['==', ['get', 'status'], 1],
        IDimageCheck,
        IDimageEchecMap,
      ],
      visibility: 'visible',
      'icon-padding': 2,
      'text-overlap': 'always',
      'icon-overlap': 'always',
    };
    return layout;
  };

  const buildLayoutSMS = () => {
    var layout = {
      'icon-image': [
        'case',
        ['<=', ['get', 'sms_delai'], 10],
        IDimageCheck,
        IDimageEchecMap,
      ],
      visibility: 'visible',
      'icon-padding': 2,
      'text-overlap': 'always',
      'icon-overlap': 'always',
    };
    return layout;
  };

  const buildLayout = (mapGlobalParametersParams: any) => {
    const oColor = getColorCircle(mapGlobalParametersParams);

    if (isData(mapGlobalParametersParams)) {
      if (isStream(mapGlobalParametersParams)) {
        return {
          layout: buildLayoutStream(),
          circle: buildCircleStream(oColor),
        };
      } else if (isDownload(mapGlobalParametersParams)) {
        return {
          layout: buildLayoutDownload(),
          circle: buildCircleDownload(),
        };
      } else if (isUpload(mapGlobalParametersParams)) {
        return {
          layout: buildLayoutUpload(),
          circle: buildCircleUpload(oColor),
        };
      } else {
        // case web
        return {
          layout: buildLayoutWeb(),
          circle: buildCircleWeb(oColor),
        };
      }
    } else {
      if (isVoix(mapGlobalParametersParams)) {
        return {
          layout: buildLayoutVoix(),
          circle: buildCircleVoix(oColor),
        };
      } else {
        return {
          layout: buildLayoutSMS(),
          circle: buildCircleSMS(oColor),
        };
      }
    }
  };

  const buildPaint = (mapGlobalParametersParams: any) => {
    if (isDownload(mapGlobalParametersParams)) {
      return buildPaintDownload();
    } else {
      return {};
    }
  };

  const getTypePoint = (mapGlobalParametersParams: any) => {
    if (isDownload(mapGlobalParametersParams)) {
      return 'circle';
    } else {
      return 'symbol';
    }
  };

  const buildPaintDownload = () => {
    var paint = {
      'circle-color': [
        'step',
        ['get', 'bitrate_dl'],
        '#eebb45',
        3,
        '#7ccc98',
        8,
        '#41b6c4',
        30,
        '#225ea8',
      ],
      'circle-radius': ['step', ['zoom'], 5, 10, 7],
    };
    return paint;
  };

  const getProperties = (mapGlobalParametersParams: any) => {
    var properties = 'mcc_mnc,situation,strate,protocole,insee_dep,fids';
    if (isData(mapGlobalParametersParams)) {
      if (isWeb(mapGlobalParametersParams)) {
        properties += ',temps_en_secondes';
      } else if (isStream(mapGlobalParametersParams)) {
        properties += ',video_en_qualite_correcte,video_en_qualite_parfaite';
      } else if (isDownload(mapGlobalParametersParams)) {
        properties += ',debit_en_mbits';
      } else if (isUpload(mapGlobalParametersParams)) {
        properties += ',fichier_charge_en_moins_de_30s';
      }
    } else {
      if (isVoix(mapGlobalParametersParams)) {
        properties += ',mosminglob,appel_2min';
      } else {
        properties += ',sms_10s';
      }
    }
    return properties;
  };

  const calculSourceName = (table: string, properties: string) => {
    return `${PREFIX_SOURCE_LAYER}-${md5(
      table + properties + getRandomInt(50000)
    )}`;
  };

  const formatBooleanAsUrlParams = (value: any) => {
    return value ? 1 : 0;
  };

  const addLayer = (mapObjParams: any, mapGlobalParametersParams: any) => {
    const crowId = getCrowdId(mapGlobalParametersParams);

    if (!crowId) {
      return;
    }

    var identifiantOperator =
      aOperatorSelected.length === 1 ? aOperatorSelected[0] : 'tous';
    var properties = getProperties(mapGlobalParametersParams);
    var tableSource = getTable();
    var layerSource = calculSourceName(tableSource, properties);

    if (!mapObjParams.getSource(layerSource)) {
      mapObjParams.addSource(layerSource, {
        type: 'vector',
        tiles: [
          `${TILESERV_URL}${tableSource}/{z}/{x}/{y}.pbf?operator=${getOpertor(
            mapGlobalParametersParams
          )}&protocole=${getTypeTest(
            mapGlobalParametersParams
          )}&situation=${getSituation(
            mapGlobalParametersParams
          )}&strate=${getTypeZone(
            mapGlobalParametersParams
          )}&datasource=${crowId}&metropole=${formatBooleanAsUrlParams(
            isMetropole(mapGlobalParametersParams)
          )}&habitation=${formatBooleanAsUrlParams(
            isHabitation(mapGlobalParametersParams)
          )}`,
        ],
      });
    }

    const idLayer = getIdLayerByIdentifiant(identifiantOperator);

    const oLayout = buildLayout(mapGlobalParameters);

    if (oLayout.circle) {
      mapObjParams.addLayer({
        id: `${idLayer}-circle`,
        type: 'circle',
        source: layerSource,
        'source-layer': 'default',
        paint: {
          //@ts-expect-error
          ...oLayout.circle,
          'circle-radius': ['step', ['zoom'], 5, 10, 7],
          'circle-translate': [0, 0],
        },
      });

      mapObjParams.setFilter(`${idLayer}-circle`, buildFilter());
    }

    const oPaint = buildPaint(mapGlobalParameters);
    const oMinZoom = Object.keys(oPaint).length
      ? {}
      : { minzoom: minZoomImage };

    mapObjParams.addLayer({
      id: idLayer,
      type: getTypePoint(mapGlobalParametersParams),
      source: layerSource,
      'source-layer': 'default',
      layout: oLayout.layout,
      paint: oPaint,
      ...oMinZoom,
    });
    mapObjParams.setFilter(idLayer, buildFilter());

    mapObjParams.addLayer({
      id: `${idLayer}-selected`,
      type: 'symbol',
      source: layerSource,
      'source-layer': 'default',
      layout: {
        'icon-image': IDimageQualityTestActive,
        visibility: 'visible',
        'icon-overlap': 'always',
        'icon-size': 0.75,
        'icon-offset': [0, -10],
      },
      filter: ['==', ['get', 'id'], ''],
    });

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: true,
    });

    mapObjParams.off('mouseenter', idLayer, (e: any) =>
      onMouseEnter(e, mapObjParams, popup)
    );
    mapObjParams.on('mouseenter', idLayer, (e: any) =>
      onMouseEnter(e, mapObjParams, popup)
    );

    mapObjParams.on('mouseleave', idLayer, (e: any) =>
      onMouseLeave(e, mapObjParams, popup)
    );
    mapObjParams.on('click', idLayer, (e: any) => onClickLayer(e));
  };

  const onClickLayer = (e: any) => {
    if (!e.features.length) {
      return;
    }

    const features = e.features;
    const feature_id = features[0].properties.id;
    const layer_id = features[0].layer.id;
    const tableSource = getTable().replace(/fc_/g, '');
    const fids = features[0].properties.fids
      .replace(/[{}]/g, '')
      .split(',')
      .map((element: string) => parseInt(element.trim(), 10));

    //setIconSelectedFeature(layer_id, feature_id)
    getLayerInfoByIdAndTable(fids, tableSource);
    showEmplacementTestDetail();
  };

  const setIconSelectedFeature = (layer_id: any, feature_id: any) => {
    const currentFilter = ['!=', ['get', 'id'], feature_id];

    mapObj.setFilter(layer_id, [...buildFilter(), currentFilter]);

    if (!isDownload(mapGlobalParameters)) {
      mapObj.setFilter(`${layer_id}-circle`, [...buildFilter(), currentFilter]);
    }

    mapObj.setFilter(`${layer_id}-selected`, ['==', ['get', 'id'], feature_id]);
  };

  const getLayerInfoByIdAndTable = (feature_id: any, table: any) => {
    const { operators } = useOperatorsQosStore.getState();
    const { typeZone } = useTypeZoneStore.getState();
    const { situation } = useSituationStore.getState();
    const { setDataEmplacementTest, setLoading } =
      useEmplacementTestStore.getState();
    const { entite } = useEntiteStore.getState();
    const { testAppel: appel, testInternet: internet } =
      useTestStore.getState();
    const { service } = useServiceQosStore.getState();
    const { territory } = useTerritoryStore.getState();

    const params = {
      operators: formatParamsArray(operators),
      zones: formatParamsArray(typeZone),
      // buffer: getBuffer(),
      territory: territory.dept,
      fid: feature_id,
      situation: formatParamsArray(situation),
      table,
      entite,
      appel,
      internet,
      service,
    };

    const fetchData = async () => {
      setDataEmplacementTest([]);
      setLoading(true);
      try {
        const dataEmplacement = await getEmplacementTestCluster(params);
        setDataEmplacementTest(dataEmplacement);
        drawHexaBuffer(dataEmplacement);
        manageLayerPosition();
      } catch (e) {
        console.log('Error get emplacement test : ', e);
      }
      setLoading(false);
    };

    fetchData();
  };

  const formatParamsArray = (aData: any[]) => {
    return aData.map((dt) => dt.toString()).join(',');
  };

  const showEmplacementTestDetail = () => {
    const testSupbagesStore = useTestSubPagesStore.getState();

    testSupbagesStore.setSubPage('emplacement_test');
  };

  const onMouseLeave = (e: any, mapObj: MapLibre, popup: any) => {
    // @ts-ignore
    mapObj.getCanvas().style.cursor = '';
    popup.remove();
  };

  const onMouseEnter = (e: any, mapObjParams: MapLibre, popup: any) => {
    // @ts-ignore
    mapObj.getCanvas().style.cursor = 'pointer';
    const features = e.features;
    const coordinates = features[0].geometry.coordinates.slice();
    const idFeature = features[0].layer['id'];

    if (idFeature.startsWith(`${PREFIX_LAYER}-quality`)) {
      const description = translations('test.click-on-point');

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      popup.setLngLat(coordinates).setHTML(description).addTo(mapObjParams);
    }
  };

  const getColorCircle = (mapGlobalParametersParams: any) => {
    const oDefaultColor = {
      success: '#232253',
      success_partiel: '#cdccff',
    };
    const aOperators = mapGlobalParametersParams['qos']['operators'];
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
  };

  const buildCircleWeb = (oColor: any) => {
    const paint = {
      'circle-color': [
        'step',
        ['get', 'acess_duration'],
        oColor.success,
        5,
        oColor.success_partiel,
        10,
        circleColorError,
      ],
      'circle-opacity': [
        'step',
        ['zoom'],
        1,
        minZoomImage,
        ['step', ['get', 'acess_duration'], 1, 10, 0],
      ],
    };
    return paint;
  };

  const buildCircleStream = (oColor: any) => {
    const paint = {
      'circle-color': [
        'case',
        ['==', ['get', 'quality_perfect'], true],
        oColor.success,
        [
          'case',
          ['==', ['get', 'quality_correct'], true],
          oColor.success_partiel,
          circleColorError,
        ],
      ],
      'circle-opacity': [
        'step',
        ['zoom'],
        1,
        minZoomImage,
        [
          'case',
          ['==', ['get', 'quality_perfect'], true],
          1,
          ['case', ['==', ['get', 'quality_correct'], true], 1, 0],
        ],
      ],
    };
    return paint;
  };

  const buildCircleDownload = () => {
    return false;
  };

  const buildCircleUpload = (oColor: any) => {
    const paint = {
      'circle-color': [
        'case',
        ['==', ['get', 'upload_ok'], true],
        oColor.success,
        circleColorError,
      ],
      'circle-opacity': [
        'step',
        ['zoom'],
        1,
        minZoomImage,
        ['case', ['==', ['get', 'upload_ok'], true], 1, 0],
      ],
    };
    return paint;
  };

  const buildCircleVoix = (oColor: any) => {
    const paint = {
      'circle-color': [
        'case',
        ['==', ['get', 'status'], 2],
        oColor.success,
        ['==', ['get', 'status'], 1],
        oColor.success_partiel,
        circleColorError,
      ],
      'circle-opacity': [
        'step',
        ['zoom'],
        1,
        minZoomImage,
        [
          'case',
          ['==', ['get', 'status'], 2],
          1,
          ['==', ['get', 'status'], 1],
          1,
          0,
        ],
      ],
    };
    return paint;
  };

  const buildCircleSMS = (oColor: any) => {
    const paint = {
      'circle-color': [
        'case',
        ['<=', ['get', 'sms_delai'], 10],
        oColor.success,
        circleColorError,
      ],
      'circle-opacity': [
        'step',
        ['zoom'],
        1,
        minZoomImage,
        ['case', ['<=', ['get', 'sms_delai'], 10], 1, 0],
      ],
    };
    return paint;
  };

  const drawHexaBuffer = (dataEmplacement: any) => {
    if (!dataEmplacement[0]['geojson_hexa']) {
      return false;
    }

    const { oMap } = useMapStore.getState();
    const oDrawMapHexa = new drawMapHexa(
      oMap,
      JSON.parse(dataEmplacement[0]['geojson_hexa'])
    );
    oDrawMapHexa.draw();
    return true;
  };

  const manageLayerPosition = () => {
    const style = mapObj.getStyle();
    const aQosSelectedLayers = style.layers.filter(
      (layer: any) =>
        layer.id &&
        layer.id.startsWith(`${PREFIX_LAYER}-quality`) &&
        layer.id.endsWith('-selected')
    );
    if (!aQosSelectedLayers.length) {
      return;
    }

    for (const oLayers of aQosSelectedLayers) {
      mapObj.moveLayer(oLayers.id);
    }
  };

  const getOpertor = (mapGlobalParametersParams: any) => {
    const aOperators = mapGlobalParametersParams['qos']['operators'];
    return aOperators.length === 1 ? aOperators[0] : 'all';
  };

  const getTypeTest = (mapGlobalParametersParams: any) => {
    return isData(mapGlobalParametersParams)
      ? mapGlobalParametersParams['typeTest']['testInternet']
      : mapGlobalParametersParams['typeTest']['testAppel'];
  };

  const getSituation = (mapGlobalParametersParams: any) => {
    return formatParamsTilesUrl(mapGlobalParametersParams['situation']);
  };

  const getTypeZone = (mapGlobalParametersParams: any) => {
    return formatParamsTilesUrl(mapGlobalParametersParams['typeZone']);
  };

  const formatParamsTilesUrl = (data: any[]) => {
    if (data.length === 0) {
      return '{}';
    }
    return '{' + data.join(',').toUpperCase() + '}';
  };

  const getCrowdId = (mapGlobalParametersParams: any) => {
    const oCrowd = mapGlobalParametersParams['crowd'];
    return oCrowd ? oCrowd.id_crowd : '';
  };

  draw(mapObj, mapGlobalParameters);
}
