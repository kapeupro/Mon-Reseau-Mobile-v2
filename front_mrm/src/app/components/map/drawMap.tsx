import Icon from '@/app/components/iconcmp';

import drawMapCouverture from '@/app/components/map/drawMap/couverture';
import drawMapQualityTest from '@/app/components/map/drawMap/qualitytest';
import drawMapAntenne from '@/app/components/map/drawMap/antenne';
import drawMapZone from '@/app/components/map/drawMap/zone';
import drawMapTransport from '@/app/components/map/drawMap/transport';
import drawMapSignalement from '@/app/components/map/drawMap/signalement';

import TerritoryMapCouverture from '@/app/components/map/drawMap/territory/couverture';

import {
  TESTS_APPEL,
  TESTS_INTERNET,
  PREFIX_LAYER,
} from '@/app/constant/constant';

import { useMapStore } from '@/store/map';
import { useLegendStore } from '@/store/legend';
import { useOperatorsStore } from '@/store/operators';
import { usePageSuperpositionStore } from '@/store/superposition';
import { useClickedFromTerritoryStore } from '@/store/antenne';

import EnService from '@/assets/icons/settings_input_antenna.svg';
import Maintenance from '@/assets/icons/site_maintenance.svg';
import IconSiteToBuild from '@/assets/icons/site_to_build.svg';
import IconOutZone from '@/assets/icons/poi_out_zone_legend.svg';
import Ferres from '@/assets/icons/wayToCover_legend.svg';
import AxePrioritaires from '@/assets/icons/axePrioritaires_legend.svg';
import Prioritaire5G from '@/assets/icons/prioritaire5G_legend.svg';
import SvgHexagone from '@/assets/icons/hexagone.svg';

import { Region } from './drawMap/searchterritory';
import {
  isCommune,
  isTransport,
  isAdresse,
  isTrain,
} from '@/utils/activeEntite';
import { isActiveSuperposer } from '../superposition/utils';
import {
  RemoveLayers,
  ReorderLayers,
  SuperpositionLegend,
} from '../superposition/theme/map';
import { moveLayerSymbolFirst } from './drawMap/utils';
import { isModeDaltonien } from '@/utils/utils';
import { TECNO_NON_CLASSIFIABLE } from '@/app/constant/couverture';

export const setLegendCouverture = (
  mapGlobalParameters: any,
  bSuperposition = false,
  translations: any = () => {}
) => {
  const aStoreOperators = useOperatorsStore.getState().operators;

  const isClassifiable = !TECNO_NON_CLASSIFIABLE.includes(
    mapGlobalParameters['technology'][0].toUpperCase()
  );
  const title = isClassifiable
    ? translations('couverture.legend_title_call')
    : translations('couverture.legend_title_internet');

  const legendItems = [];

  for (const storeOperator of aStoreOperators) {
    for (const curentOperator of mapGlobalParameters.operator) {
      if (storeOperator.identifiant === curentOperator) {
        if (isClassifiable) {
          legendItems.push(
            {
              color: isModeDaltonien()
                ? storeOperator.mapOptCouleurNiveau4
                : storeOperator.mapCouleurNiveau4,
              attribute: translations('couverture.legend_very_good_coverage'),
            },
            {
              color: isModeDaltonien()
                ? storeOperator.mapOptCouleurNiveau3
                : storeOperator.mapCouleurNiveau3,
              attribute: translations('couverture.legend_good_coverage'),
            },
            {
              color: isModeDaltonien()
                ? storeOperator.mapOptCouleurNiveau2
                : storeOperator.mapCouleurNiveau2,
              attribute: translations('couverture.legend_limited_coverage'),
            }
          );
        } else {
          legendItems.push({
            color: isModeDaltonien()
              ? storeOperator.mapOptCouleurDefaut
              : storeOperator.mapCouleurDefaut,
            attribute: translations('couverture.legend_covered_area'),
          });
        }
      }
    }
  }

  legendItems.push({
    color: '#ffffff',
    attribute: translations('couverture.legend_uncovered_area'),
  });

  const dataLegend: any = {
    title: title,
    items: legendItems,
  };

  if (bSuperposition) {
    return legendItems;
  }

  useLegendStore.getState().setLegend(dataLegend);
  return true;
};

export const setLegendQualityTest = (
  mapGlobalParameters: any,
  bSuperposition: false,
  translations: any
) => {
  const currentService = mapGlobalParameters.qos.service;
  let currentTest =
    currentService === 'internet'
      ? mapGlobalParameters.typeTest.testInternet
      : mapGlobalParameters.typeTest.testAppel;

  if (isTransport()) {
    const transportService = isTrain()
      ? mapGlobalParameters.serviceTrain
      : mapGlobalParameters.serviceRoute;
    currentTest = transportService === 'internet' ? 'WEB' : 'Voix';
  }

  const allTypeTests: any = [];
  TESTS_INTERNET.forEach((item: any) => {
    allTypeTests.push(item);
  });
  TESTS_APPEL.forEach((item: any) => {
    allTypeTests.push(item);
  });

  let title = '';
  let legendItems: any = [];
  for (const typeTest of allTypeTests) {
    if (typeTest.name === currentTest) {
      title = typeTest.legend.titleLegend;
      legendItems = typeTest.legend.items.map((item: any) => ({
        ...item,
        attribute: translations(item.attribute),
      }));
    }
  }

  const dataLegend: any = {
    title: translations(`test.${title}`),
    items: legendItems,
  };

  if (bSuperposition) {
    return legendItems;
  }

  useLegendStore.getState().setLegend(dataLegend);
  return true;
};

export const setLegendAntenne = (
  mapGlobalParameters: any,
  bSuperposition = false,
  translations: any = () => {}
) => {
  const aStatusStore = mapGlobalParameters.status;

  const title = translations('antenne.support-status');
  const legendItems: any = [];

  let items = {
    icon: <></>,
    attribute: '',
  };

  const statusOrder = {
    en_service: {
      icon: (
        <Icon
          className='-mx-1'
          icon={<EnService className='w-4 h-4' />}
          shadow
        />
      ),
      attribute: translations('antenne.inOperation'),
    },
    en_maintenance: {
      icon: <Maintenance className='w-8 h-8 -mx-2 -mb-2' />,
      attribute: translations('antenne.inMaintenance'),
    },
    a_venir: {
      icon: <IconSiteToBuild className='w-8 h-8 -mx-2 -mb-2' />,
      attribute: translations('antenne.sitesToCome'),
    },
  };

  if (aStatusStore.length === 0) {
    items = {
      icon: <EnService />,
      attribute: translations('antenne.inOperation'),
    };
    legendItems.push(items);
  } else {
    for (const statusKey in statusOrder) {
      const statusItem = statusOrder[statusKey as keyof typeof statusOrder];
      const statusIndex = aStatusStore.indexOf(statusKey);

      if (statusIndex !== -1) {
        legendItems.push(statusItem);
      }
    }
  }

  const dataLegend: any = {
    title: title,
    items: legendItems,
  };

  if (bSuperposition) {
    return legendItems;
  }

  useLegendStore.getState().setLegend(dataLegend);
  return true;
};

export const setLegendTerritory = (
  mapGlobalParameters: any,
  bSuperposition = false,
  translations: any = () => {
    return;
  }
) => {
  const { operators } = useOperatorsStore.getState();
  const legendItems: any[] = [];
  const opacity = 1;
  const nbreOperators = operators.length;

  if (nbreOperators) {
    const stepOpacity = opacity / nbreOperators;

    for (let i = 0; i < nbreOperators; i++) {
      const numOperator = nbreOperators - i;

      legendItems.push({
        color: '#232353',
        attribute: `${numOperator} ${translations(
          'territoire.legend_operator'
        )}${numOperator !== 1 ? 's' : ''}`,
        opacity: opacity - i * stepOpacity,
      });
    }
  }

  const dataLegend: any = {
    title: `${translations('territoire.legend_title')} :`,
    items: legendItems,
  };

  if (bSuperposition) {
    return legendItems;
  }

  useLegendStore.getState().setLegend(dataLegend);
  return true;
};

export const setLegendZone = (
  mapGlobalParameters: any,
  bSuperposition = false,
  translation: any = () => {}
) => {
  const aAxeStore = mapGlobalParameters.axe;

  const legendItems: any = [
    {
      id: 'poi',
      icon: <IconOutZone />,
      attribute: translation('zone.zac-poi-label'),
    },
  ];

  const axeOrder = {
    axe_ferre: {
      id: 'zac_rfr',
      icon: <Ferres />,
      attribute: translation('zone.zac-axe-ferre'),
    },
    axe_prioritaire: {
      id: 'zac_arp',
      icon: <AxePrioritaires />,
      attribute: translation('zone.zac-axe-routier'),
    },
    axe_prioritaire_5g: {
      id: 'zac_arp_5g',
      icon: <Prioritaire5G />,
      attribute: translation('zone.zac-axe-routier-5g'),
    },
  };

  if (aAxeStore.length !== 0) {
    for (const axeKey in axeOrder) {
      const axeItem = axeOrder[axeKey as keyof typeof axeOrder];
      const axeIndex = aAxeStore.indexOf(axeKey);

      if (axeIndex !== -1) {
        legendItems.push(axeItem);
      }
    }
  }

  const dataLegend: any = {
    title: translation('zone.title'),
    items: legendItems,
  };

  if (bSuperposition) {
    return legendItems;
  }

  useLegendStore.getState().setLegend(dataLegend);
  return true;
};

export const setLegendSignalement = (
  mapGlobalParameters: any,
  bSuperposition = false,
  translation: any = () => {}
) => {
  const legendItems: any = [
    {
      icon: <SvgHexagone className='w-3 h-3 text-[#febb78]' />,
      attribute: '[1-2]',
    },
    {
      icon: <SvgHexagone className='w-3 h-3 text-[#ff474f]' />,
      attribute: '[3-10]',
    },
    {
      icon: <SvgHexagone className='w-3 h-3 text-[#cc008f]' />,
      attribute: '[11-30]',
    },
    {
      icon: <SvgHexagone className='w-3 h-3 text-[#670093]' />,
      attribute: '[31-max]',
    },
  ];

  const dataLegend: any = {
    title: translation('signalement.legend-title'),
    items: legendItems,
  };

  if (bSuperposition) {
    return legendItems;
  }

  useLegendStore.getState().setLegend(dataLegend);
  return true;
};

export function drawMap(
  mapGlobalParameters: any,
  mapObj: any,
  translations: any
) {
  const getCurrentParge = (mapGlobalParametersParams: any) => {
    if (typeof mapGlobalParametersParams != 'object') {
      return 'home';
    }
    return mapGlobalParametersParams['page'];
  };

  const addLayers = (mapObjParams: any, mapGlobalParametersParams: any) => {
    const { page: activePageSuperposition } =
      usePageSuperpositionStore.getState();

    const { isClickedFromTerritory } = useClickedFromTerritoryStore.getState();

    const bActiveSuperposer = isActiveSuperposer();
    let currentPage = getCurrentParge(mapGlobalParametersParams);
    if (bActiveSuperposer && activePageSuperposition) {
      currentPage = activePageSuperposition;
    }

    const bClearVector = !bActiveSuperposer;

    if (bActiveSuperposer) {
      removeThemesLayer(currentPage);
    }

    switch (currentPage) {
      case 'home':
      case 'territory':
        drawMapTerritory(
          mapGlobalParametersParams,
          mapObjParams,
          translations,
          bActiveSuperposer
        );
        break;
      case 'couverture-theorique':
        drawMapCouverture(
          mapGlobalParametersParams,
          mapObjParams,
          bClearVector
        );
        setLegend(
          setLegendCouverture,
          bActiveSuperposer,
          mapGlobalParametersParams,
          translations
        );
        break;
      case 'qualite-reseau':
        drawQos(
          mapGlobalParametersParams,
          mapObjParams,
          translations,
          bActiveSuperposer,
          bClearVector
        );
        break;
      case 'antennes-deploiements':
        if (!isClickedFromTerritory) {
          drawMapAntenne(
            mapGlobalParametersParams,
            mapObjParams,
            bClearVector,
            translations
          );
          setLegend(
            setLegendAntenne,
            bActiveSuperposer,
            mapGlobalParametersParams,
            translations
          );
        }
        break;
      case 'zones-a-couvrir':
        drawMapZone(
          mapObjParams,
          mapGlobalParametersParams,
          bClearVector,
          translations
        );
        setLegend(
          setLegendZone,
          bActiveSuperposer,
          mapGlobalParametersParams,
          translations
        );
        break;
      case 'signalements':
        drawMapSignalement(
          mapGlobalParametersParams,
          mapObjParams,
          bClearVector,
          translations
        );
        setLegend(
          setLegendSignalement,
          bActiveSuperposer,
          mapGlobalParametersParams,
          translations
        );
        break;
    }

    if (bActiveSuperposer) {
      const { oMap } = useMapStore.getState();

      const oReorderLayers = new ReorderLayers(oMap);
      oReorderLayers.reorder();
    }

    manageLayerPositionSearchTerritory(mapObjParams);
  };

  addLayers(mapObj, mapGlobalParameters);
  moveLayerSymbolFirst(mapObj);
}

function drawMapTerritory(
  mapGlobalParameters: any,
  oMap: any,
  translation: any,
  bActiveSuperposer: boolean
) {
  if (isCommune() || isAdresse()) {
    drawMapAntenne(mapGlobalParameters, oMap, true, translation);
    setLegendAntenne(mapGlobalParameters);
  } else if (!isActiveSuperposer()) {
    const oTerritoryMapCouverture = new TerritoryMapCouverture(oMap, '2G3G');
    oTerritoryMapCouverture.draw();
    setLegendTerritory(mapGlobalParameters, bActiveSuperposer, translation);
  }
}

export function manageLayerPositionSearchTerritory(oMap: any) {
  const oRegion = new Region(oMap);
  oRegion.manageLayerPosition();
}

function removeThemesLayer(page: string) {
  const { oMap } = useMapStore.getState();

  let prefixLayer = '';

  switch (page) {
    case 'couverture-theorique': {
      prefixLayer = `${PREFIX_LAYER}-couverture`;
      break;
    }

    case 'qualite-reseau': {
      prefixLayer = `${PREFIX_LAYER}-quality`;
      break;
    }
    case 'antennes-deploiements': {
      prefixLayer = `${PREFIX_LAYER}-antenne`;
      break;
    }
    case 'zones-a-couvrir': {
      prefixLayer = `${PREFIX_LAYER}-zone`;
      break;
    }
    case 'signalements': {
      prefixLayer = `${PREFIX_LAYER}-signalement`;
      break;
    }
  }

  if (prefixLayer) {
    const oRemoveLayers = new RemoveLayers(oMap, prefixLayer);
    oRemoveLayers.remove();
  }
}

function drawQos(
  mapGlobalParameters: any,
  oMap: any,
  translations: any,
  bActiveSuperposer: boolean,
  bClearVector: boolean
) {
  if (isTransport()) {
    drawMapTransport(mapGlobalParameters, oMap, bClearVector, translations);
  } else {
    drawMapQualityTest(mapGlobalParameters, oMap, bClearVector, translations);
  }

  setLegend(
    setLegendQualityTest,
    bActiveSuperposer,
    mapGlobalParameters,
    translations
  );
}

function setLegend(
  fnSetLegend: Function,
  bActiveSuperposer: boolean,
  mapGlobalParametersParams: any,
  translation: any
) {
  if (bActiveSuperposer) {
    setLegendSuperposition(translation);
  } else {
    fnSetLegend(mapGlobalParametersParams, bActiveSuperposer, translation);
  }
}

function setLegendSuperposition(translation: any) {
  const oSuperpositionLegend = new SuperpositionLegend(translation);
  oSuperpositionLegend.setLegend();
}
