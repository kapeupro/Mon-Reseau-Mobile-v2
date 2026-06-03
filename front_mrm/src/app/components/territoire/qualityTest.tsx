import React, { useState, useEffect } from 'react';

import MoonLoader from 'react-spinners/MoonLoader';
import { useTranslations } from 'next-intl';

import Title from '@/app/components/title';
import Badge from '@/app/components/badge';

import { useOperatorsStore } from '@/store/operators';
import { useStatTestTerritoryStore } from '@/store/stat';
import { useCrowdState } from '@/store/crowd';
import { useTerritoryStore } from '@/store/filter';

import { getStatTest } from '@/service/territory';

import { getCurrentInsee } from '@/utils/currentInsee';
import { getTitleTerritoire } from '@/utils/titleTerritoire';
import { getLabelEntite } from '@/utils/activeEntite';

export default function QualityTest() {
  const { operators: listOperators } = useOperatorsStore();
  const { statTestTerritory, setStatTestTerritory } =
    useStatTestTerritoryStore();

  const [loadTest, setLoadTest] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { crowdselect } = useCrowdState.getState();
      const { territory } = useTerritoryStore.getState();

      setLoadTest(true);
      const listOperator = [...listOperators].map((op: any) => {
        return op.identifiant;
      });
      try {
        const data = await getStatTest({
          id: getCurrentInsee(),
          operators: listOperator.join(',').toUpperCase(),
          entite: getLabelEntite(),
          datasource: crowdselect?.id_crowd,
          protocole: 'web',
          metropole: territory.dept === 'metropole' ? '1' : '0',
          situation: 'toutes',
          zone: 'toutes',
          transport: 0,
        });
        setStatTestTerritory(data);
      } catch (error) {
        console.error("Une erreur s'est produite : ", error);
      }
      setLoadTest(false);
    };

    fetchData();
  }, [listOperators, setStatTestTerritory]);

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex flex-col gap-1'>
        <Title
          text='Taux de succès des tests de navigation web :'
          className='text-md text-black'
          underline={false}
        />
        <Title
          text={getTitleTerritoire()}
          underline={false}
          className='text-sm text-color-secondary'
        />
      </div>

      {loadTest ? (
        <div className='flex items-center justify-center'>
          <MoonLoader color='#232253' loading={loadTest} size={150} />
        </div>
      ) : (
        <Stat
          aDataStat={statTestTerritory?.data}
          listOperators={listOperators}
        />
      )}
    </div>
  );
}

export function Stat({
  aDataStat,
  listOperators,
}: Readonly<{
  aDataStat: any[];
  listOperators: any[];
}>) {
  const testTranslation = useTranslations('test');

  const aData = aDataStat ?? listOperators;

  if (!aData.length) {
    return (
      <span className='text-sm font-medium text-center mx-auto '>
        Aucun résultat
      </span>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { date } = useOperatorsStore();
  const date_qos = date.find((date: any) => date.page === 'qualite-reseau');

  return (
    <>
      <div className={`grid grid-cols-${aData.length} w-full gap-2`}>
        {aData.map((dt: any) => {
          const aOperators = listOperators.filter(
            (op: any) => op.identifiant === dt.identifiant
          );

          if (!aOperators.length) {
            return null;
          }

          const oOperator = aOperators[0];
          return (
            <div key={dt.identifiant}>
              <div className='header px-1'>
                <Badge
                  text={oOperator.nomAffichage}
                  description={`${dt.prct ?? '-'} % `}
                  color={{
                    color: oOperator.couleurDefaut,
                    isHexaDecimal: true,
                  }}
                  classname='w-full'
                />
              </div>
              <div className='header px-1'>
                <span className='underline flex justify-center items-center text-xs font-semibold'>
                  {dt.total ?? '-'} test(s)
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <span className='text-xs font-medium text-gray-500'>
        {`${testTranslation('test-date')} : ${
          date_qos.date_build_start
        } ${testTranslation('test-date-to')} ${date_qos.date_build_end}`}
      </span>
    </>
  );
}
