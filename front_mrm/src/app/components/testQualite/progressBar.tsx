'use client';
import React, { useEffect, useState } from 'react';

import MoonLoader from 'react-spinners/MoonLoader';

import Title from '@/app/components/title';

import Density from '@/app/components/testQualite/density';

import {
  useEntiteStore,
  useSituationStore,
  useTestStore,
  useTypeZoneStore,
} from '@/store/store';
import { useOperatorsStore } from '@/store/operators';
import { useStatTestTerritoryStore } from '@/store/stat';

import { getStatTest } from '@/service/territory';

import { TESTS_INTERNET, TESTS_APPEL } from '@/app/constant/constant';

import { useTranslations } from 'next-intl';

import { getCurrentInsee } from '@/utils/currentInsee';
import { getLabelEntite, isCommune, isAdresse } from '@/utils/activeEntite';
import { getTitleTerritoire } from '@/utils/titleTerritoire';

import { useOperatorsQosStore, useServiceQosStore } from '@/store/qos';
import { useCrowdState } from '@/store/crowd';
import { useTerritoryStore } from '@/store/filter';
import { Stat } from '../territoire/qualityTest';

export default function ProgressBar() {
  const { statTestTerritory, setStatTestTerritory } =
    useStatTestTerritoryStore();
  const { operators: listOperators } = useOperatorsStore();
  const { testInternet, testAppel } = useTestStore();
  const { service } = useServiceQosStore();

  const { operators: operatorsQos } = useOperatorsQosStore();
  const { crowdselect } = useCrowdState();
  const { entite } = useEntiteStore();
  const { situation } = useSituationStore();
  const { typeZone } = useTypeZoneStore();

  const testTranslation = useTranslations('test');

  const [loadTest, setLoadTest] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { territory } = useTerritoryStore.getState();

      setLoadTest(true);
      try {
        const data = await getStatTest({
          id: getCurrentInsee(),
          operators: operatorsQos.join(',').toUpperCase(),
          entite: getLabelEntite(),
          datasource: crowdselect?.id_crowd,
          protocole: getProtocole(service, testInternet, testAppel),
          metropole: territory.dept === 'metropole' ? '1' : '0',
          situation: castArrayToString(situation),
          zone: castArrayToString(typeZone),
          transport: entite !== 'territoire' ? 1 : 0,
        });
        setStatTestTerritory(data);
      } catch (error) {
        console.error("Une erreur s'est produite : ", error);
      }
      setLoadTest(false);
    };

    if (isCommune() || isAdresse()) {
      return;
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    operatorsQos,
    crowdselect,
    entite,
    situation,
    service,
    testInternet,
    testAppel,
    typeZone,
  ]);

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-col gap-1'>
        <span className='flex flex-row items-center gap-2'>
          <Title
            className='text-md text-black'
            text={
              service === 'internet'
                ? testTranslation(
                    TESTS_INTERNET.find((test) => test.name === testInternet)
                      ?.titleProgressBar ?? ''
                  )
                : testTranslation(
                    TESTS_APPEL.find((test) => test.name === testAppel)
                      ?.titleProgressBar ?? ''
                  )
            }
            underline={false}
          />
        </span>
        <Title
          className='text-sm text-[#0891B2]'
          text={getTitleTerritoire()}
          underline={false}
        />
      </div>
      {!loadTest ? (
        <>
          {isCommune() || isAdresse() ? (
            <Density />
          ) : (
            <Stat
              aDataStat={statTestTerritory?.data}
              listOperators={listOperators}
            />
          )}
        </>
      ) : (
        <div className='flex items-center justify-center'>
          <MoonLoader color='#232253' loading={loadTest} size={150} />
        </div>
      )}
    </div>
  );
}

function isData(service: string) {
  return service === 'internet';
}

function getProtocole(
  service: string,
  testInternet: string,
  testAppel: string
) {
  return isData(service) ? testInternet : testAppel;
}

function castArrayToString(aZone: string[]) {
  return aZone.join(',');
}
