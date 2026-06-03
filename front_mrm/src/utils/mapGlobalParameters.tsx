import {
  useOperatorStore,
  useOperatorAndAllStore,
  useTechnologiesStore,
  useTestStore,
  useTypeZoneStore,
  useSituationStore,
  useEntiteStore,
  usePageStore,
  useServiceStore,
} from '@/store/store';

import { useTerritoryStore } from '@/store/filter';

export const getMapGlobalParameter = () => {
  const operatorStore = useOperatorStore.getState();
  const operatorAndAllStore = useOperatorAndAllStore.getState();
  const technologyStore = useTechnologiesStore.getState();
  const testStore = useTestStore.getState();
  const typeZoneStore = useTypeZoneStore.getState();
  const situationStore = useSituationStore.getState();
  const entiteStore = useEntiteStore.getState();
  const pageStore = usePageStore.getState();
  const territoryStore = useTerritoryStore.getState();
  const serviceStore = useServiceStore.getState();

  const filter = {
    operator: operatorStore.operators,
    operatorAndAll: operatorAndAllStore.operatorsAndAll,
    technology: technologyStore.technologies,
    typeTest: {
      testInternet: testStore.testInternet,
      testAppel: testStore.testAppel,
    },
    typeZone: typeZoneStore.typeZone,
    situation: situationStore.situation,
    entite: entiteStore.entite,
    page: pageStore.page,
    territory: territoryStore.territory,
    service: serviceStore.service,
  };

  return filter;
};
