import { useEffect, useMemo } from 'react';

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
import ResetMap from './reset';
import { useCrowdState } from '@/store/crowd';
import { getExtent } from '@/service/qos';
import { useMapStore } from '@/store/map';
import { getTable } from './drawMap/qualitytest';
import { useServiceQosStore, useOperatorsQosStore } from '@/store/qos';
import { useAxesTransportsStore, useOperatorsZoneStore } from '@/store/zone';
import { useOperatorsTrainStore } from '@/store/train';
import { useOperatorsRouteStore } from '@/store/route';
import { useSuperpositionStore } from '@/store/superposition';
import { useCoordStore } from '@/store/selectedCoordStore';
import { useServiceTrainStore } from '@/store/train';
import { useServiceRouteStore } from '@/store/route';
import { useOperatorsSignalementStore } from '@/store/signalement';
import { useLanguageStore } from '@/store/translation';

interface MapGlobalFilterProps {
  drawMap: any;
}

export default function MapGlobalFilter({
  drawMap,
}: Readonly<MapGlobalFilterProps>) {
  const { operators } = useOperatorStore();
  const { operatorsAndAll } = useOperatorAndAllStore();
  const { operators: operatorsZone } = useOperatorsZoneStore();
  const { technologies } = useTechnologiesStore();
  const { testInternet, testAppel } = useTestStore();
  const { typeZone } = useTypeZoneStore();
  const { situation } = useSituationStore();
  const { entite } = useEntiteStore();
  const { page } = usePageStore();
  const { territory } = useTerritoryStore();
  const { service } = useServiceStore();
  const { serviceTrain } = useServiceTrainStore();
  const { serviceRoute } = useServiceRouteStore();
  const { status } = useStatusStore();
  const { technologies: technologiesAntenne } = useTechnologiesStoreAntenne();
  const { dispositif } = useDispositifStore();
  const { crowdselect } = useCrowdState();
  const { service: serviceQos } = useServiceQosStore();
  const { operators: operatorsQos } = useOperatorsQosStore();
  const { axe } = useAxesTransportsStore();
  const { operators: operatorsTrain } = useOperatorsTrainStore();
  const { operators: operatorsRoute } = useOperatorsRouteStore();
  const { selectedTerritoire } = useCoordStore();
  const { isActive: isActiveSuperposition } = useSuperpositionStore();
  const { operators: operatorsSignalement } = useOperatorsSignalementStore();
  const { language } = useLanguageStore();

  const filter = useMemo(
    () => ({
      operator: operators,
      operatorAndAll: operatorsAndAll,
      technology: technologies,
      typeTest: {
        testInternet: testInternet,
        testAppel: testAppel,
      },
      typeZone: typeZone,
      situation: situation,
      entite: entite,
      page: page,
      territory: territory,
      service: service,
      antennes: {
        technologies: technologiesAntenne,
        dispositif,
      },
      status: status,
      crowd: crowdselect,
      qos: {
        service: serviceQos,
        operators: operatorsQos,
      },
      axe: axe,
      operatorsZone: operatorsZone,
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
    }),
    [
      operators,
      operatorsAndAll,
      operatorsZone,
      operatorsSignalement,
      technologies,
      testInternet,
      testAppel,
      typeZone,
      situation,
      entite,
      page,
      territory,
      service,
      status,
      technologiesAntenne,
      dispositif,
      crowdselect,
      serviceQos,
      operatorsQos,
      axe,
      operatorsTrain,
      operatorsRoute,
      selectedTerritoire,
      serviceTrain,
      serviceRoute,
      language,
    ]
  );

  useEffect(() => {
    drawMap(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, isActiveSuperposition]);

  useEffect(() => {
    if (!crowdselect) {
      return;
    }

    const fetchExtentQos = async () => {
      const { setExtent } = useMapStore.getState();

      try {
        const data = await getExtent({
          id: crowdselect.id_crowd,
          table: getTable(),
        });

        if (data) {
          setExtent(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (page === 'qualite-reseau') {
      fetchExtentQos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crowdselect]);

  return <ResetMap filter={filter} />;
}
