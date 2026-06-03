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
import {
  useTechnologiesStore as useTechnologiesStoreAntenne,
  useStatusStore,
  useDispositifStore,
} from '@/store/antenne';
import { useTerritoryStore } from '@/store/filter';
import { useCrowdState } from '@/store/crowd';
import { useServiceQosStore, useOperatorsQosStore } from '@/store/qos';
import { useAxesTransportsStore, useOperatorsZoneStore } from '@/store/zone';
import { useOperatorsTrainStore, useServiceTrainStore } from '@/store/train';
import { useOperatorsRouteStore, useServiceRouteStore } from '@/store/route';
import { useCoordStore } from '@/store/selectedCoordStore';
import { useOperatorsSignalementStore } from '@/store/signalement';
import { useLanguageStore } from '@/store/translation';

export const getMapGlobalParameters = () => {
  const operatorStore = useOperatorStore.getState();
  const operatorAndAllStore = useOperatorAndAllStore.getState();
  const operatorsZone = useOperatorsZoneStore.getState();
  const technologyStore = useTechnologiesStore.getState();
  const testStore = useTestStore.getState();
  const typeZoneStore = useTypeZoneStore.getState();
  const situationStore = useSituationStore.getState();
  const entiteStore = useEntiteStore.getState();
  const pageStore = usePageStore.getState();
  const territoryStore = useTerritoryStore.getState();
  const serviceStore = useServiceStore.getState();
  const statusStore = useStatusStore.getState();
  const { technologies: technologiesAntenne } =
    useTechnologiesStoreAntenne.getState();
  const { dispositif } = useDispositifStore.getState();
  const { crowdselect } = useCrowdState.getState();
  const { service: serviceQos } = useServiceQosStore.getState();
  const { operators: operatorsQos } = useOperatorsQosStore.getState();
  const { axe } = useAxesTransportsStore.getState();
  const { operators: operatorsTrain } = useOperatorsTrainStore.getState();
  const { operators: operatorsRoute } = useOperatorsRouteStore.getState();
  const { selectedTerritoire } = useCoordStore.getState();
  const { serviceTrain } = useServiceTrainStore.getState();
  const { serviceRoute } = useServiceRouteStore.getState();
  const { operators: operatorsSignalement } =
    useOperatorsSignalementStore.getState();
  const { language } = useLanguageStore.getState();

  return {
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
    antennes: {
      technologies: technologiesAntenne,
      dispositif,
    },
    status: statusStore['status'],
    crowd: crowdselect,
    qos: {
      service: serviceQos,
      operators: operatorsQos,
    },
    axe,
    operatorsZone: operatorsZone.operators,
    train: {
      operators: operatorsTrain,
    },
    route: {
      operators: operatorsRoute,
    },
    selectedTerritoire,
    serviceTrain: serviceTrain,
    serviceRoute: serviceRoute,
    signalement: {
      operators: operatorsSignalement,
    },
    language,
  };
};
