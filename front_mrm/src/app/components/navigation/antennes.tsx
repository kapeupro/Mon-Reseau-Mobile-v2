import { useEffect, useMemo } from 'react';

import { useRouter } from 'next/navigation';

import {
  useCountNavigationStore,
  useGlobalStore,
  useOperatorAndAllStore,
  usePageStore,
} from '@/store/store';
import {
  useStatusStore,
  useTechnologiesStore,
  useDispositifStore,
} from '@/store/antenne';
import { castArrayToString, formatSelectedTerritory } from './utils';
import { useNavigationStore } from '@/store/navigation';
import { useTerritoryStore } from '@/store/filter';
import { useLanguageStore } from '@/store/translation';
import { useMapTerritoryStore } from '@/store/map';
import { useCoordStore } from '@/store/selectedCoordStore';
import { useThemeStore } from '@/store/themes';

export const Antennes = () => {
  const router = useRouter();

  const { territory } = useTerritoryStore();
  const { language: lang } = useLanguageStore();
  const { territory: territorySearch } = useMapTerritoryStore();
  const { selectedTerritoire } = useCoordStore();
  const { operatorsAndAll } = useOperatorAndAllStore();
  const { technologies } = useTechnologiesStore();
  const { status } = useStatusStore();
  const { dispositif } = useDispositifStore();
  const { page } = usePageStore();
  const { theme } = useThemeStore();

  const { extent, typeterritory, valueIdent } = territorySearch;

  const oDependecies = useMemo(
    () => ({
      territory,
      lang,
      territorySearch,
      selectedTerritoire,
      operatorsAndAll,
      technologies,
      status,
      dispositif,
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
      operatorsAndAll,
      technologies,
      status,
      dispositif,
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
      page !== 'antennes-deploiements'
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
      dispositif,
      operators: castArrayToString(operatorsAndAll),
      techno: castArrayToString(technologies),
      status: castArrayToString(status),
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
  initializeStoreTecno(oSearchParams);
  initializeStoreStatus(oSearchParams);
};
const initializeStoreOperators = (oSearchParams: any) => {
  const { toggleOperatorAndAll } = useOperatorAndAllStore.getState();
  const operators = oSearchParams.get('operators');
  if (!operators) {
    return;
  }
  let aOperators = operators.split(',');
  if (!aOperators.length) {
    return;
  }

  aOperators = aOperators.map((op: any) => parseInt(op));
  toggleOperatorAndAll(aOperators);
};

const initializeStoreTecno = (oSearchParams: any) => {
  const { setTechnology } = useTechnologiesStore.getState();
  const tecno = oSearchParams.get('techno');
  if (!tecno) {
    return;
  }
  const aTecno = tecno.split(',');
  if (!aTecno.length) {
    return;
  }
  setTechnology(aTecno);
};

const initializeStoreStatus = (oSearchParams: any) => {
  const { setStatus } = useStatusStore.getState();
  const status = oSearchParams.get('status');
  if (!status) {
    return;
  }
  const aStatus = status.split(',');
  if (!aStatus.length) {
    return;
  }
  setStatus(aStatus);
};
