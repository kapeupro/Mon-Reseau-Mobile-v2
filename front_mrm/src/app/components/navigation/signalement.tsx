import { useEffect, useMemo } from 'react';

import { useRouter } from 'next/navigation';

import {
  useCountNavigationStore,
  useGlobalStore,
  usePageStore,
} from '@/store/store';
import { castArrayToString, formatSelectedTerritory } from './utils';
import { useNavigationStore } from '@/store/navigation';
import { useTerritoryStore } from '@/store/filter';
import { useLanguageStore } from '@/store/translation';
import { useMapTerritoryStore } from '@/store/map';
import { useCoordStore } from '@/store/selectedCoordStore';
import { useThemeStore } from '@/store/themes';
import { useOperatorsSignalementStore } from '@/store/signalement';

export const Signalement = () => {
  const router = useRouter();

  const { territory } = useTerritoryStore();
  const { language: lang } = useLanguageStore();
  const { territory: territorySearch } = useMapTerritoryStore();
  const { selectedTerritoire } = useCoordStore();
  const { operators } = useOperatorsSignalementStore();
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
      page,
      theme,
    ]
  );

  useEffect(() => {
    const { bInitStoreByUrl } = useGlobalStore.getState();
    const { bListenChangeOfUrl } = useNavigationStore.getState();
    const { incrementeCount } = useCountNavigationStore.getState();
    if (bInitStoreByUrl || bListenChangeOfUrl || page !== 'signalements') {
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
  initializeStoreOperators(oSearchParams);
};
const initializeStoreOperators = (oSearchParams: any) => {
  const { toggleOperators } = useOperatorsSignalementStore.getState();
  const operators = oSearchParams.get('operators');
  if (!operators) {
    return;
  }
  let aOperators = operators.split(',');
  if (!aOperators.length) {
    return;
  }

  aOperators = aOperators.map((op: any) => parseInt(op));
  toggleOperators(aOperators);
};
