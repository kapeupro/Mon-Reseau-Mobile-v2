import { useEffect } from 'react';

import { useTranslations } from 'next-intl';

import {
  useAntenneSubPagesStore,
  useClickedFromTerritoryStore,
} from '@/store/antenne';
import { useTestSubPagesStore } from '@/store/qualityTest';
import { useZoneSubPagesStore } from '@/store/zone';
import { useIsFirstMount } from '@/utils/useIsFirstMount';
import { Support } from './drawMap/antenne';
import { useMapStore } from '@/store/map';
import { usePageStore } from '@/store/store';
import { useZacStore } from '@/store/zone';
import { useLegendStore } from '@/store/legend';
import {
  getDeptNotInMetropole,
  getIdDeptTerritory,
  isMetropole,
  clearMapVectorHexa,
  clearMapVectorSite,
} from './drawMap/utils';
import { PREFIX_LAYER } from '@/app/constant/constant';
import DrawSelection from '@/app/components/map/drawMap/zone/drawselection';

interface ResetMapProps {
  filter: any;
}

export default function ResetMap({ filter }: Readonly<ResetMapProps>) {
  return (
    <>
      <ResetAntenneLayer filter={filter} />
      <ResetQosLayer filter={filter} />
      <ResetZoneLayer />
    </>
  );
}

function ResetAntenneLayer({ filter }: ResetMapProps) {
  const translation = useTranslations();
  const { subPage } = useAntenneSubPagesStore();
  const isFirstMount = useIsFirstMount();
  const { isClickedFromTerritory } = useClickedFromTerritoryStore();
  const { page } = usePageStore();

  useEffect(() => {
    if (isFirstMount) {
      return;
    }

    if (isClickedFromTerritory && page !== 'antennes-deploiements') {
      return;
    }

    const { oMap } = useMapStore.getState();
    const oSupport = new Support(oMap, filter, translation);
    oSupport.resetFilter(subPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subPage]);

  return null;
}

function ResetQosLayer({ filter }: ResetMapProps) {
  const { subPage } = useTestSubPagesStore();
  const isFirstMount = useIsFirstMount();

  useEffect(() => {
    if (isFirstMount) {
      return;
    }
    if (subPage) {
      return;
    }

    const { oMap } = useMapStore.getState();

    const oQosLayer = new QosLayer(oMap, filter);
    oQosLayer.clearMapVectorHexa();
    oQosLayer.resetFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subPage]);

  return null;
}

function ResetZoneLayer() {
  const { subPage } = useZoneSubPagesStore();
  const isFirstMount = useIsFirstMount();

  useEffect(() => {
    if (isFirstMount) {
      return;
    }
    if (subPage) {
      return;
    }

    const { oMap } = useMapStore.getState();
    const { data_zac } = useZacStore.getState();
    const { legend, setLegend } = useLegendStore.getState();
    const currentItems = legend.items || [];

    const updatedItems = currentItems.filter(
      (item: any) => item.id !== 'site_en_service'
    );

    const updatedDataLegend = {
      ...legend,
      items: updatedItems,
    };

    setLegend(updatedDataLegend);

    const oDrawSelection = new DrawSelection(oMap, data_zac);
    oDrawSelection.resetIconsSelection();
    oDrawSelection.removeExistingSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subPage]);

  useEffect(() => {
    if (isFirstMount) {
      return;
    }

    if (subPage === 'zone_site') {
      return;
    }

    const { oMap } = useMapStore.getState();
    clearMapVectorSite(oMap);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subPage]);

  return null;
}

class QosLayer {
  mapObj;
  mapGlobalParameters;
  fieldDeptInBdd;
  constructor(mapObj: any, mapGlobalParameters: any) {
    this.mapObj = mapObj;
    this.mapGlobalParameters = mapGlobalParameters;
    this.fieldDeptInBdd = 'insee_dep';
  }
  buildFilter() {
    const aFilter = [];
    aFilter.push('all');
    return aFilter;
  }
  getFilterByTerritory() {
    let filter = null;
    if (isMetropole(this.mapGlobalParameters)) {
      filter = [
        '!',
        [
          'in',
          ['get', this.fieldDeptInBdd],
          ['literal', getDeptNotInMetropole()],
        ],
      ];
    } else {
      filter = [
        'in',
        ['get', this.fieldDeptInBdd],
        ['literal', [getIdDeptTerritory(this.mapGlobalParameters)]],
      ];
    }
    return filter;
  }
  getArcepLayersByListLayers(aLayers: any, prefixLayer: any) {
    return aLayers.filter(
      (layer: any) => layer.id && layer.id.startsWith(prefixLayer)
    );
  }
  categorizedLayers(aArcepLayers: any[]) {
    const aIdLayers = aArcepLayers.filter(
      (layer: any) =>
        !(layer.id.endsWith('circle') || layer.id.endsWith('selected'))
    );

    if (!aIdLayers.length) {
      return false;
    }

    const oCategorizedLayers: any = {
      id_layer: aIdLayers[0].id,
    };

    const aData = [
      {
        last_text: 'selected',
        name: 'id_layer_selected',
      },
      {
        last_text: 'circle',
        name: 'id_layer_circle',
      },
    ];

    for (const oData of aData) {
      const aMatchedLayers = aArcepLayers.filter((layer: any) =>
        layer.id.endsWith(oData.last_text)
      );
      oCategorizedLayers[oData.name] = aMatchedLayers.length
        ? aMatchedLayers[0].id
        : undefined;
    }

    return oCategorizedLayers;
  }
  getPrefixLayer() {
    return `${PREFIX_LAYER}-quality`;
  }
  resetFilter() {
    const oStyle = this.mapObj.getStyle();

    const aArcepLayers = this.getArcepLayersByListLayers(
      oStyle.layers,
      this.getPrefixLayer()
    );
    if (!aArcepLayers.length) {
      return;
    }

    const oCategorizedLayers = this.categorizedLayers(aArcepLayers);
    if (!oCategorizedLayers) {
      return;
    }

    const { id_layer, id_layer_selected, id_layer_circle } = oCategorizedLayers;

    const globalFilter = this.buildFilter();

    this.mapObj.setFilter(id_layer, globalFilter);

    if (!this.isDownload() && id_layer_circle) {
      this.mapObj.setFilter(id_layer_circle, globalFilter);
    }

    if (id_layer_selected) {
      this.mapObj.setFilter(id_layer_selected, ['==', ['get', 'id'], '']);
    }
  }
  getOperatorSelected() {
    return this.mapGlobalParameters['operatorAndAll'];
  }
  getIdentifiantOperator() {
    const aOperatorSelected = this.getOperatorSelected();
    return aOperatorSelected.length === 1 ? aOperatorSelected[0] : 'tous';
  }
  extractRandomIntIdLayer(idLayer: any, indexStart: any) {
    const sData = idLayer.substring(indexStart);
    const aData = sData.split('-');
    return aData.length ? aData[0] : false;
  }
  isDownload() {
    const typeTest = this.mapGlobalParameters['typeTest'];
    return typeTest['testInternet'] === 'DOWNLOAD';
  }
  clearMapVectorHexa() {
    clearMapVectorHexa(this.mapObj);
  }
}
