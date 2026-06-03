import maplibregl, { Map as MapLibre } from 'maplibre-gl';

import md5 from 'md5';

import {
  getRandomInt,
  clearMapVector,
} from '@/app/components/map/drawMap/utils';

import SiteInZone from '@/assets/icons/InZoneLegend.svg';

import { PREFIX_LAYER, PREFIX_SOURCE_LAYER } from '@/app/constant/constant';

import {
  useAxesTransportsStore,
  useZoneSubPagesStore,
  useZacStore,
} from '@/store/zone';
import { getOperatorColorByIdentifiant } from '@/store/operators';

import { getZacInfos } from '@/service/zac';
import DrawSelection from './zone/drawselection';
import { useClickedFromTerritoryStore, useSupportStore } from '@/store/antenne';
import { useSupportsStore } from '@/store/support';
import { useLegendStore } from '@/store/legend';

const NEXT_PUBLIC_SCHEMA = process.env.NEXT_PUBLIC_SCHEMA;
const TILESERV_URL = process.env.NEXT_PUBLIC_TILESERV_URL;

export default function drawMapZone(
  mapObj: any,
  mapGlobalParametersParams: any,
  bClearMapVector = true,
  translations: any = () => {}
) {
  const { axe } = useAxesTransportsStore.getState();

  const getPrefixLayerZone = () => {
    return `${PREFIX_LAYER}-zone`;
  };

  const getSourceName = (table: string, properties: string) => {
    return `${PREFIX_SOURCE_LAYER}-${md5(
      table + properties + getRandomInt(50000)
    )}`;
  };

  const getIdLayer = (tablename: string) => {
    return `${getPrefixLayerZone()}-${tablename}-${getRandomInt(50000)}`;
  };

  const getTableSourceLayer = (tablename: string) => {
    return `${NEXT_PUBLIC_SCHEMA}.${tablename}`;
  };

  const buildFilter = () => {
    var aFilter = [];
    aFilter.push('all');
    return aFilter;
  };

  const getFormattedOperators = (data: any[]) => {
    return data.join(',');
  };

  const getOperators = () => {
    return mapGlobalParametersParams['operatorsZone'];
  };

  const addSource = (layerSource: any, tableSource: any) => {
    if (!mapObj.getSource(layerSource)) {
      let aOperators = getOperators();

      if (aOperators.length > 1) {
        aOperators = ['all'];
      }

      mapObj.addSource(layerSource, {
        type: 'vector',
        tiles: [
          `${TILESERV_URL}${tableSource}/{z}/{x}/{y}.pbf?operateur=${getFormattedOperators(
            aOperators
          )}`,
        ],
      });
    }
  };

  const addLayerLine = (
    layerSource: any,
    tableSource: any,
    id_layer: any,
    line_width: any,
    line_color: any,
    line_visibility = false,
    dashed = false,
    dashed_line_color: string = '',
    line_dash_array: any = [1, 0.7]
  ) => {
    let visible = 'none';
    if (line_visibility) {
      visible = 'visible';
    }

    mapObj.addLayer({
      id: `${id_layer}-line`,
      type: 'line',
      source: layerSource,
      'source-layer': tableSource,
      layout: {
        visibility: visible,
      },
      paint: {
        'line-color': line_color,
        'line-width': line_width,
      },
    });

    if (dashed) {
      mapObj.addLayer({
        id: `${id_layer}-dashed-line`,
        type: 'line',
        source: layerSource,
        'source-layer': tableSource,
        layout: {
          visibility: visible,
        },
        paint: {
          'line-color': dashed_line_color,
          'line-width': {
            base: 1.2,
            stops: [
              [9, 1],
              [16, 10],
            ],
          },
          'line-dasharray': line_dash_array,
          //"line-width": ["step", ["zoom"], 5, 5, 4, 7, 3],
          // "line-dasharray": [
          //     "step",
          //     ["zoom"],
          //     ["literal", [0, 0]],
          //     6.5,
          //     ["literal", [0.5, 1]],
          // ],
        },
      });
    }
  };

  const getColorCircle = () => {
    const aOperators = getOperators();
    return aOperators.length === 1
      ? getOperatorColorByIdentifiant(aOperators[0])
      : '#232253';
  };

  const addDoughnutLayer = (
    layerSource: any,
    tableSource: any,
    idDoughnutLayer: any,
    filter: any,
    circleStrokeColor = '#232253',
    circleColor = '#ffffff',
    circleRadius = 3,
    circleStrokeWidth = 4
  ) => {
    let visible = 'none';
    if (axe.includes('zac_poi')) {
      visible = 'visible';
    }
    mapObj.addLayer({
      id: idDoughnutLayer,
      type: 'circle',
      source: layerSource,
      'source-layer': tableSource,
      layout: {
        visibility: visible,
      },
      paint: {
        'circle-radius': circleRadius,
        'circle-color': circleColor,
        'circle-stroke-width': circleStrokeWidth,
        'circle-stroke-color': circleStrokeColor,
      },
    });

    mapObj.setFilter(idDoughnutLayer, filter);
  };

  const addLayer = (layerSource: any, tableSource: any, tablename: any) => {
    const id_layer = getIdLayer(tablename);

    if (tablename === 'zac_axe_ferre') {
      addLayerLine(
        layerSource,
        tableSource,
        id_layer,
        {
          base: 1.2,
          stops: [
            [9, 1],
            [16, 10],
          ],
        },
        '#7C7AC7',
        axe.includes('axe_ferre'),
        true,
        '#CDCCFF',
        [0.3, 0.3]
      );
    }

    if (tablename === 'zac_axe_routier_prioritaire') {
      addLayerLine(
        layerSource,
        tableSource,
        id_layer,
        {
          base: 1.2,
          stops: [
            [9, 1],
            [16, 10],
          ],
        },
        '#4A488D',
        axe.includes('axe_prioritaire')
      );
    }

    if (tablename === 'zac_axe_routier_prioritaire_5g') {
      addLayerLine(
        layerSource,
        tableSource,
        id_layer,
        {
          base: 1.2,
          stops: [
            [9, 1],
            [16, 10],
          ],
        },
        '#CDCCFF',
        axe.includes('axe_prioritaire_5g'),
        true,
        '#4A488D',
        [1, 0.5]
      );
    }

    if (tablename === 'fc_zac_poi') {
      const color_layer = getColorCircle();

      let visible = 'none';
      if (axe.includes('zac_poi')) {
        visible = 'visible';
      }

      mapObj.addLayer({
        id: `${id_layer}-circle`,
        type: 'circle',
        source: layerSource,
        'source-layer': 'default',
        filter: ['==', ['get', 'num_zone_arrete'], ''],
        layout: {
          visibility: visible,
        },
        paint: {
          'circle-radius': 8,
          'circle-color': color_layer,
        },
      });

      addDoughnutLayer(
        layerSource,
        'default',
        id_layer,
        buildFilter(),
        color_layer
      );

      addSiteLayer(id_layer);

      // mapObj.fitBounds([
      //     [0.7012082194047498, 49.52170385555162],
      //     [0.775696632811883, 49.57003484389048],
      // ])

      addLayerEvents(id_layer);
    }
  };

  const addLayerEvents = (id_layer: any) => {
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: true,
    });

    mapObj.off('mouseenter', id_layer, (e: any) =>
      onMouseEnter(e, mapObj, popup)
    );

    mapObj.on('mouseenter', id_layer, (e: any) =>
      onMouseEnter(e, mapObj, popup)
    );

    mapObj.on('mouseleave', id_layer, (e: any) =>
      onMouseLeave(e, mapObj, popup)
    );

    mapObj.on('click', id_layer, (e: any) => onClickLayer(e));
  };

  const onClickLayer = async (e: any) => {
    if (!e.features.length) {
      return;
    }

    const features = e.features;
    const layer_id = features[0].layer.id;
    const id_zac = features[0].properties.id_point;

    const { setDataZac } = useZacStore.getState();

    setIconSelectedFeature(layer_id, features[0].properties);
    showPOIDetail();

    const data_zac = await getLayerInfoById(id_zac);

    if (data_zac.success) {
      setDataZac(data_zac);
      drawMap(data_zac.data);
      setFilterSiteLayer(layer_id, data_zac.data?.id_support);
    } else {
      setDataZac(false);
    }
  };

  const setIconSelectedFeature = (layer_id: any, featProperties: any) => {
    const oDrawSelection = new DrawSelection(mapObj, []);
    oDrawSelection.manageLayout(layer_id, featProperties);
  };

  const getLayerInfoById = async (id_zac: any) => {
    const { setLoading } = useZacStore.getState();

    setLoading(true);
    const data_zac = await getZacInfos(id_zac);
    setLoading(false);

    return data_zac;
  };

  const drawMap = (data_zac: any) => {
    drawLayerSelection(data_zac);
    zoomOnLayer(data_zac);
  };

  const drawLayerSelection = (data_zac: any) => {
    const oDrawSelection = new DrawSelection(mapObj, data_zac);
    oDrawSelection.draw();
  };
  const zoomOnLayer = (data_zac: any) => {
    const extent = data_zac.blurry_zone;
    const bounds = [
      [extent['minx'], extent['miny']],
      [extent['maxx'], extent['maxy']],
    ];

    mapObj.fitBounds(bounds, {
      padding: 100, // ajoute un padding autour de la boîte englobante
      maxZoom: 13, // définit un zoom maximal
    });
  };

  const showPOIDetail = () => {
    const zoneSubPagesStore = useZoneSubPagesStore.getState();

    zoneSubPagesStore.setSubPage('zone_info');
  };

  const onMouseEnter = (e: any, mapObj: MapLibre, popup: any) => {
    // @ts-ignore
    mapObj.getCanvas().style.cursor = 'pointer';
    const features = e.features;
    const coordinates = features[0].geometry.coordinates.slice();
    const idFeature = features[0].layer['id'];

    if (idFeature.startsWith(getPrefixLayerZone())) {
      const description = translations('test.click-on-point');

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      popup.setLngLat(coordinates).setHTML(description).addTo(mapObj);
    }
  };

  const onMouseLeave = (e: any, mapObj: MapLibre, popup: any) => {
    // @ts-ignore
    mapObj.getCanvas().style.cursor = '';
    popup.remove();
  };

  const drawLayer = (tablename: string) => {
    const tableSource = getTableSourceLayer(tablename);
    const layerSource = getSourceName(tableSource, mapGlobalParametersParams);

    addSource(layerSource, tableSource);
    addLayer(layerSource, tableSource, tablename);
  };

  const draw = (mapObj: any) => {
    if (bClearMapVector) {
      clearMapVector(mapObj);
    }

    drawLayer('zac_axe_routier_prioritaire_5g');
    drawLayer('zac_axe_routier_prioritaire');
    drawLayer('zac_axe_ferre');
    drawLayer('fc_zac_poi');
  };

  const addSiteLayer = (idLayer: string) => {
    const oSiteLayer = new SiteLayer(mapObj, idLayer, translations);
    oSiteLayer.draw();
  };

  const setFilterSiteLayer = (idLayer: string, data: any) => {
    const oSiteLayer = new SiteLayer(mapObj, idLayer, translations);
    oSiteLayer.setFilter(data);
  };

  draw(mapObj);
}

class SiteLayer {
  mapObj;
  idZacLayer;
  translations;
  oPopup: any;
  table = `${NEXT_PUBLIC_SCHEMA}.anfr_sup_support`;
  idImageEnService = 'antenne-en-service-light';
  constructor(mapObj: any, idZacLayer: string, translations: any) {
    this.mapObj = mapObj;
    this.idZacLayer = idZacLayer;
    this.translations = translations;
  }
  getIdSourceLayer() {
    return `${PREFIX_SOURCE_LAYER}-zone-site`;
  }
  getIdLayer() {
    return `${this.idZacLayer}-zone-site`;
  }
  getIdLayerCircle() {
    return `${this.idZacLayer}-circle-zone-site`;
  }
  addLayerCircle() {
    this.mapObj.addLayer({
      id: this.getIdLayerCircle(),
      type: 'circle',
      source: this.getIdSourceLayer(),
      'source-layer': this.table,
      filter: ['in', ['id'], ['literal', []]],
      layout: {
        visibility: 'none',
      },
      paint: {
        'circle-color': '#232253',
        'circle-radius': 15,
        'circle-translate': [0, 0],
      },
    });
  }
  addSource() {
    const idLayerSource = this.getIdSourceLayer();
    if (!this.mapObj.getSource(idLayerSource)) {
      this.mapObj.addSource(idLayerSource, {
        type: 'vector',
        tiles: [
          `${TILESERV_URL}${this.table}/{z}/{x}/{y}.pbf?properties=sup_id`,
        ],
      });
    }
  }
  addLayer() {
    const idLayer = this.getIdLayer();

    this.addLayerCircle();

    this.mapObj.addLayer({
      id: idLayer,
      type: 'symbol',
      source: this.getIdSourceLayer(),
      'source-layer': this.table,
      filter: ['in', ['id'], ['literal', []]],
      layout: {
        visibility: 'none',
        'icon-image': this.idImageEnService,
        'icon-padding': 0,
        'icon-overlap': 'always',
        'icon-size': 0.125,
        'icon-offset': [150, 20],
      },
    });

    this.mapObj.on('click', idLayer, this.onClickLayer.bind(this));
    this.mapObj.on('mouseenter', idLayer, this.onMouseEnter.bind(this));
    this.mapObj.on('mouseleave', idLayer, this.onMouseLeave.bind(this));
  }
  draw() {
    this.createObjectPopUp();
    this.addSource();
    this.addLayer();
  }
  setFilter(id_support: any) {
    const idLayer = this.getIdLayer();
    const idLayerCircle = this.getIdLayerCircle();

    const filterCondition = ['in', ['id'], ['literal', id_support || []]];

    this.mapObj.setLayoutProperty(idLayer, 'visibility', 'visible');
    this.mapObj.setLayoutProperty(idLayerCircle, 'visibility', 'visible');
    this.mapObj.setFilter(idLayer, filterCondition);
    this.mapObj.setFilter(idLayerCircle, filterCondition);

    const { legend, setLegend } = useLegendStore.getState();
    const currentItems = legend.items || [];
    let updatedDataLegend;
    if (id_support) {
      const newItem = {
        id: 'site_en_service',
        icon: <SiteInZone />,
        attribute: this.translations('zone.site_in_use'),
      };

      const itemExists = currentItems.some(
        (item: any) => item.id === 'site_en_service'
      );

      const updatedItems = itemExists
        ? currentItems
        : [...currentItems, newItem];

      updatedDataLegend = {
        ...legend,
        items: updatedItems,
      };
    } else {
      const updatedItems = currentItems.filter(
        (item: any) => item.id !== 'site_en_service'
      );

      updatedDataLegend = {
        ...legend,
        items: updatedItems,
      };
    }
    setLegend(updatedDataLegend);
  }
  onClickLayer(e: any) {
    const { setSubPage } = useZoneSubPagesStore.getState();
    const { setId: setIdSupport } = useSupportStore.getState();
    const { setSupports } = useSupportsStore.getState();
    const { setIsClickedFromTerritory } =
      useClickedFromTerritoryStore.getState();
    const aFeatures = e.features;
    if (!aFeatures.length) {
      return;
    }

    setIsClickedFromTerritory(false);
    setIdSupport(aFeatures[0].id);
    setSupports(false);
    setSubPage('zone_support');
  }
  createObjectPopUp() {
    this.oPopup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: true,
    });
  }
  onMouseEnter(e: any) {
    // @ts-ignore
    this.mapObj.getCanvas().style.cursor = 'pointer';
    const features = e.features;
    const coordinates = features[0].geometry.coordinates.slice();
    const idFeature = features[0].layer['id'];

    if (idFeature.endsWith('-zone-site')) {
      const description = this.translations('antenne.click-for-detail');

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      this.oPopup
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(this.mapObj);
    }
  }
  onMouseLeave(e: any) {
    // @ts-ignore
    this.mapObj.getCanvas().style.cursor = '';
    this.oPopup.remove();
  }
}
