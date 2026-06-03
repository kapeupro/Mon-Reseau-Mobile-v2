import React, { useEffect, useMemo } from 'react';

import { useRouter } from 'next/navigation';

import {
  Couverture as NavigationCouverture,
  initializeStore as initializeStoreCouverture,
} from './navigation/couverture';
import {
  Antennes as NavigationAntennes,
  initializeStore as initializeStoreAntennes,
} from './navigation/antennes';
import {
  Qos as NavigationQos,
  initializeStore as initializeStoreQos,
} from './navigation/qos';
import {
  Zone as NavigationZone,
  initializeStore as initializeStoreZone,
} from './navigation/zone';
import {
  Signalement as SignalementZone,
  initializeStore as initializeStoreSignalement,
} from './navigation/signalement';
import {
  useGlobalStore,
  usePageStore,
  useCountNavigationStore,
} from '@/store/store';
import { useTerritoryByUrlStore, useTerritoryStore } from '@/store/filter';
import { useMapStore, useMapTerritoryStore } from '@/store/map';
import { LIST_TERRITOIRES } from '../constant/constant';
import {
  getParamsTerritoryInUrl,
  formatSelectedTerritory,
} from './navigation/utils';
import { useLanguageStore } from '@/store/translation';
import { useNavigationStore, useFinishedInitStore } from '@/store/navigation';
import { useThemeStore } from '@/store/themes';
import { useIsFirstMount } from '@/utils/useIsFirstMount';
import { useCoordStore } from '@/store/selectedCoordStore';
import { getTerritory } from '@/service/territory';

interface InitStoreProps {
  children: React.ReactNode;
}

export default function Navigation({ children }: Readonly<InitStoreProps>) {
  useEffect(() => {
    window.addEventListener('popstate', onChangeUrl);
    return () => window.removeEventListener('popstate', onChangeUrl);
  }, []);

  return (
    <>
      <ListenChangeURL />
      <DefaultComponent />
      <NavigationCouverture />
      <NavigationAntennes />
      <NavigationQos />
      <NavigationZone />
      <SignalementZone />
      {children}
      <ManageStoreComponent />
    </>
  );
}

const DefaultComponent = () => {
  const router = useRouter();

  const { territory } = useTerritoryStore();
  const { language: lang } = useLanguageStore();
  const { territory: territorySearch } = useMapTerritoryStore();
  const { selectedTerritoire } = useCoordStore();
  const { page } = usePageStore();
  const { theme } = useThemeStore();

  const { extent, typeterritory, valueIdent } = territorySearch;

  const oDependecies = useMemo(
    () => ({
      territory,
      lang,
      territorySearch,
      selectedTerritoire,
      page,
      theme,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      territory,
      lang,
      selectedTerritoire,
      page,
      extent,
      typeterritory,
      valueIdent,
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
      [
        'couverture-theorique',
        'antennes-deploiements',
        'qualite-reseau',
        'zones-a-couvrir',
        'signalements',
      ].includes(page)
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
    });

    const curtUrlSearchParams = window.location.search;
    if (!curtUrlSearchParams && page === 'home') {
      return;
    }

    const nextUrlSearchParams = `?${searchParams.toString()}`;
    if (curtUrlSearchParams === nextUrlSearchParams) {
      return;
    }

    incrementeCount();
    router.push(nextUrlSearchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oDependecies]);

  return null;
};

const initializeStorePage = (page: any, oSearchParams: any) => {
  switch (page) {
    case 'couverture-theorique':
      initializeStoreCouverture(oSearchParams);
      break;
    case 'qualite-reseau':
      initializeStoreQos(oSearchParams);
      break;
    case 'antennes-deploiements':
      initializeStoreAntennes(oSearchParams);
      break;
    case 'zones-a-couvrir':
      initializeStoreZone(oSearchParams);
      break;
    case 'signalements':
      initializeStoreSignalement(oSearchParams);
      break;
  }
};

const onChangeUrl = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const { setListenChangeOfUrl } = useNavigationStore.getState();
  setListenChangeOfUrl(true);
};

const initializeGlobalStore = async () => {
  const { setPage } = usePageStore.getState();
  const { setLanguage } = useLanguageStore.getState();

  const oSelectedTerritory = await getSelectedTerritory();

  setValueStoreByKeyURLParams('page', setPage, 'home');
  setValueStoreByKeyURLParams('lang', setLanguage, 'fr');

  initializeSelectedTerritory(oSelectedTerritory);
  initializeTerritory();
};

const setValueStoreByKeyURLParams = (
  key: any,
  fnSetStore: any,
  defaultValue: any
) => {
  const oURLSearchParams = new URLSearchParams(window.location.search);
  const valKey = oURLSearchParams.get(key);

  if (key !== 'page') {
    const nextValue = valKey ?? defaultValue;
    fnSetStore(nextValue);
    return;
  }

  const nextPage = valKey ?? defaultValue;
  fnSetStore(nextPage, false);
};

const initializeTerritory = () => {
  const { setTerritory, territory } = useTerritoryStore.getState();
  const { setExtent } = useMapStore.getState();
  const oURLSearchParams = new URLSearchParams(window.location.search);
  const paramterritory = oURLSearchParams.get('territory');

  if (!paramterritory || paramterritory === territory.name) {
    return;
  }

  const aTerritory = LIST_TERRITOIRES.filter(
    (dt) => dt.name === paramterritory
  );
  if (!aTerritory.length) {
    return;
  }
  const oTerritory = aTerritory[0];

  setTerritory(oTerritory);
  setExtent(oTerritory.extent);
};

function ListenChangeURL() {
  const { bListenChangeOfUrl } = useNavigationStore();
  const bFirstMount = useIsFirstMount();

  useEffect(() => {
    const { setFinished } = useFinishedInitStore.getState();

    if (bFirstMount || !bListenChangeOfUrl) {
      return;
    }

    const oURLSearchParams = new URLSearchParams(window.location.search);

    initializeGlobalStore();
    initializeStorePage(oURLSearchParams.get('page'), oURLSearchParams);
    setFinished(true);

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bListenChangeOfUrl]);

  return null;
}

const getSelectedTerritory = async () => {
  const { territory } = useMapTerritoryStore.getState();
  const { selectedTerritoire } = useCoordStore.getState();

  const oURLSearchParams = new URLSearchParams(window.location.search);
  const params = getParamsTerritoryInUrl(oURLSearchParams);
  if (!params) {
    return false;
  }

  if (selectedTerritoire) {
    if (selectedTerritoire.label) {
      if (selectedTerritoire.dept === params.id) {
        return null;
      }
    } else if (territory.valueIdent === params.id) {
      return null;
    } else if (
      selectedTerritoire.level &&
      selectedTerritoire.level === parseInt(params.level) &&
      selectedTerritoire.properties?.nom === params[params['type']]
    ) {
      return null;
    }
  }

  const fetchTerritory = async () => {
    const data = await getTerritory(params);
    return data || false;
  };

  return await fetchTerritory();
};

const initializeSelectedTerritory = (oSelectedTerritory: any) => {
  const { setTerritorySearch } = useMapTerritoryStore.getState();
  const { selectTerritoire } = useCoordStore.getState();

  if (oSelectedTerritory === null) {
    return;
  }

  let territorySearch = {
    extent: undefined,
    valueIdent: '',
    typeterritory: '',
  };
  let selectedTerritoire = null;

  if (oSelectedTerritory) {
    const { map, ...oTerritory } = oSelectedTerritory;
    if (map) {
      territorySearch = map;
    }
    selectedTerritoire = oTerritory;
  }

  setTerritorySearch(territorySearch);
  selectTerritoire(selectedTerritoire, false);
};

function ManageStoreComponent() {
  const { isLoaded } = useTerritoryByUrlStore();
  const { bFinished, setFinished } = useFinishedInitStore();

  useEffect(() => {
    const { setInitStoreByUrl } = useGlobalStore.getState();
    if (isLoaded) {
      setInitStoreByUrl(false);
    }
  }, [isLoaded]);

  useEffect(() => {
    const { setListenChangeOfUrl } = useNavigationStore.getState();

    if (bFinished) {
      setFinished(false);
      setListenChangeOfUrl(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bFinished]);

  return null;
}
