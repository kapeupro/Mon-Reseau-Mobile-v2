import { useEffect, useMemo } from 'react';

import { useRouter } from 'next/navigation';

import {
  useOperatorStore,
  useServiceStore,
  useTechnologiesStore,
  useSuperposerStore,
  usePageStore,
  useGlobalStore,
  useCountNavigationStore,
} from '@/store/store';
import { castArrayToString, formatSelectedTerritory } from './utils';
import { useNavigationStore } from '@/store/navigation';
import { useTerritoryStore } from '@/store/filter';
import { useLanguageStore } from '@/store/translation';
import { useMapTerritoryStore } from '@/store/map';
import { useThemeStore } from '@/store/themes';
import { useCoordStore } from '@/store/selectedCoordStore';

export const Couverture = () => {
  const router = useRouter();

  const { territory } = useTerritoryStore();
  const { language: lang } = useLanguageStore();
  const { territory: territorySearch } = useMapTerritoryStore();
  const { selectedTerritoire } = useCoordStore();
  const { operators } = useOperatorStore();
  const { technologies } = useTechnologiesStore();
  const { service } = useServiceStore();
  const { page } = usePageStore();
  const { theme } = useThemeStore();

  const { extent, typeterritory, valueIdent } = territorySearch;

  const oDependecies = useMemo(
    () => ({
      territory,
      lang,
      territorySearch,
      selectedTerritoire,
      operators,
      technologies,
      service,
      page,
      theme,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      territory,
      lang,
      extent,
      typeterritory,
      valueIdent,
      selectedTerritoire,
      operators,
      technologies,
      service,
      page,
      theme,
    ]
  );

  useEffect(() => {
    const { bInitStoreByUrl } = useGlobalStore.getState();
    const { bListenChangeOfUrl } = useNavigationStore.getState();
    const { incrementeCount } = useCountNavigationStore.getState();
    if (
      bInitStoreByUrl ||
      bListenChangeOfUrl ||
      page !== 'couverture-theorique'
    ) {
      return;
    }

    const oSelectedTerritory: any = formatSelectedTerritory(
      territorySearch,
      selectedTerritoire
    );

    const searchParams = new URLSearchParams({
      page,
      lang,
      theme,
      territory: territory.name,
      ...oSelectedTerritory,
      operators: castArrayToString(operators),
      techno: castArrayToString(technologies),
      service,
    });

    const nextUrlSearchParams = `?${searchParams.toString()}`;
    if (window.location.search === nextUrlSearchParams) {
      return;
    }

    incrementeCount();
    router.push(nextUrlSearchParams);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oDependecies]);

  return null;
};

export const initializeStore = (oSearchParams: any) => {
  initializeTecnologiesStore(oSearchParams);
  initializeServiceStore(oSearchParams);
  initializeOperatorStore(oSearchParams);
};

const initializeTecnologiesStore = (oSearchParams: any) => {
  const { toggleTechnology } = useTechnologiesStore.getState();
  const tecno = oSearchParams.get('techno');
  if (!tecno) {
    return;
  }
  toggleTechnology(tecno);
};

const initializeServiceStore = (oSearchParams: any) => {
  const { setService } = useServiceStore.getState();
  const service = oSearchParams.get('service');
  if (!service) {
    return;
  }
  setService(service);
};

const initializeOperatorStore = (oSearchParams: any) => {
  const { setOperator } = useOperatorStore.getState();
  const { setSuperposer } = useSuperposerStore.getState();

  const { bListenChangeOfUrl } = useNavigationStore.getState();
  if (!bListenChangeOfUrl) {
    return;
  }

  const operators = oSearchParams.get('operators');
  if (!operators) {
    return;
  }

  let aOperators = operators.split(',');
  if (!aOperators.length) {
    return;
  }
  aOperators = aOperators.map((op: any) => parseInt(op));

  setOperator(aOperators);
  setSuperposer(aOperators.length > 1);
};
