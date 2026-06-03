import { useEffect, useMemo } from 'react';

import { useRouter } from 'next/navigation';

import {
  useTestStore,
  useEntiteStore,
  useTypeZoneStore,
  useSituationStore,
  usePageStore,
  useGlobalStore,
  useCountNavigationStore,
} from '@/store/store';
import { castArrayToString, formatSelectedTerritory } from './utils';
import { useNavigationStore } from '@/store/navigation';
import { useTerritoryStore } from '@/store/filter';
import { useLanguageStore } from '@/store/translation';
import { useMapTerritoryStore } from '@/store/map';
import { useCoordStore } from '@/store/selectedCoordStore';
import { useServiceQosStore, useOperatorsQosStore } from '@/store/qos';
import { useOperatorsTrainStore } from '@/store/train';
import { useOperatorsRouteStore } from '@/store/route';
import { useThemeStore } from '@/store/themes';
import { useServiceTrainStore } from '@/store/train';
import { useServiceRouteStore } from '@/store/route';
import { isTrain, isRoute } from '@/utils/activeEntite';
import { getDatasource } from '../territoire/train_elements/statistiques';

export const Qos = () => {
  const router = useRouter();

  const { territory } = useTerritoryStore();
  const { language: lang } = useLanguageStore();
  const { territory: territorySearch } = useMapTerritoryStore();
  const { selectedTerritoire } = useCoordStore();
  const { operators } = useOperatorsQosStore();
  const { service } = useServiceQosStore();
  const { serviceTrain } = useServiceTrainStore();
  const { serviceRoute } = useServiceRouteStore();
  const { testAppel, testInternet } = useTestStore();
  const { entite } = useEntiteStore();
  const { typeZone } = useTypeZoneStore();
  const { situation } = useSituationStore();
  const { page } = usePageStore();
  const { theme } = useThemeStore();
  const { operators: operatorsTrain } = useOperatorsTrainStore();
  const { operators: operatorsRoute } = useOperatorsRouteStore();
  const dataSource = getDatasource();

  const { extent, typeterritory, valueIdent } = territorySearch;

  const oDependecies = useMemo(
    () => ({
      territory,
      lang,
      territorySearch,
      selectedTerritoire,
      operators,
      operatorsTrain,
      operatorsRoute,
      service,
      testAppel,
      testInternet,
      entite,
      typeZone,
      situation,
      page,
      theme,
      serviceTrain,
      serviceRoute,
      dataSource,
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
      operatorsTrain,
      operatorsRoute,
      service,
      testAppel,
      testInternet,
      entite,
      typeZone,
      situation,
      page,
      theme,
      serviceTrain,
      serviceRoute,
      dataSource,
    ]
  );

  useEffect(() => {
    const { bInitStoreByUrl } = useGlobalStore.getState();
    const { bListenChangeOfUrl } = useNavigationStore.getState();
    const { incrementeCount } = useCountNavigationStore.getState();
    if (bInitStoreByUrl || bListenChangeOfUrl || page !== 'qualite-reseau') {
      return;
    }
    const oSelectedTerritory: any = formatSelectedTerritory(
      territorySearch,
      selectedTerritoire
    );

    let paramsOperators = operators;
    if (isRoute()) {
      paramsOperators = operatorsRoute;
    } else if (isTrain()) {
      paramsOperators = operatorsTrain;
    }

    const searchParams = new URLSearchParams({
      page,
      lang,
      theme,
      territory: territory.name,
      ...oSelectedTerritory,
      operators: castArrayToString(paramsOperators),
      type_test: service,
      service_train: serviceTrain,
      service_route: serviceRoute,
      data_source: dataSource,
      test: service === 'internet' ? testInternet : testAppel,
      entite,
      zone: castArrayToString(typeZone),
      situation: castArrayToString(situation),
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
  initializeStoreTypeTest(oSearchParams);
  initializeStoreTest(oSearchParams);
  initializeStoreEntite(oSearchParams);
  initializeStoreZone(oSearchParams);
  initializeStoreSituation(oSearchParams);
};

const initializeStoreOperators = (oSearchParams: any) => {
  const { toggleOperators } = useOperatorsQosStore.getState();
  const { toggleOperators: toggleOperatorsTrain } =
    useOperatorsTrainStore.getState();
  const { toggleOperators: toggleOperatorsRoute } =
    useOperatorsRouteStore.getState();
  const operators = oSearchParams.get('operators');
  if (!operators) {
    return;
  }
  let aOperators = operators.split(',');
  if (!aOperators.length) {
    return;
  }

  aOperators = aOperators.map((op: any) => parseInt(op));

  const paramsTrain = oSearchParams.get('train');
  const paramsRoute = oSearchParams.get('route');

  if (paramsTrain) {
    toggleOperatorsTrain(aOperators);
  } else if (paramsRoute) {
    toggleOperatorsRoute(aOperators);
  } else {
    toggleOperators(aOperators);
  }
};

const initializeStoreTypeTest = (oSearchParams: any) => {
  const { setService } = useServiceQosStore.getState();
  const typeTest = oSearchParams.get('type_test');
  if (!typeTest) {
    return;
  }
  setService(typeTest);
};

const initializeStoreTest = (oSearchParams: any) => {
  const { toggleTestAppel, toggleTestInternet } = useTestStore.getState();
  const typeTest = oSearchParams.get('type_test');
  const test = oSearchParams.get('test');
  if (!(typeTest && test)) {
    return;
  }
  if (typeTest === 'internet') {
    toggleTestInternet(test);
  } else if (typeTest === 'appel_sms') {
    toggleTestAppel(test);
  }
};

const initializeStoreEntite = (oSearchParams: any) => {
  const { toggleEntite } = useEntiteStore.getState();
  const entite = oSearchParams.get('entite');
  if (!entite) {
    return;
  }
  toggleEntite(entite);
};

const initializeStoreZone = (oSearchParams: any) => {
  const { setTypeZone } = useTypeZoneStore.getState();
  const zone = oSearchParams.get('zone');
  const aZone = zone ? zone.split(',') : [];
  setTypeZone(aZone);
};

const initializeStoreSituation = (oSearchParams: any) => {
  const { setSituation } = useSituationStore.getState();
  const situation = oSearchParams.get('situation');
  const aSituation = situation ? situation.split(',') : [];
  setSituation(aSituation);
};
