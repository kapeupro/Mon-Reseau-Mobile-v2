import React, { useEffect, useState } from 'react';

import MoonLoader from 'react-spinners/MoonLoader';
import { useTranslations } from 'next-intl';

import Title from '@/app/components/title';

import { useStatSignalementTerritoryStore } from '@/store/stat';

import { isAdresse, getLabelEntite } from '@/utils/activeEntite';
import { formatThousandSeparator } from '@/utils/utils';
import { getTitleTerritoire } from '@/utils/titleTerritoire';
import { getCurrentInsee } from '@/utils/currentInsee';

import { getStatSignalement } from '@/service/territory';
import { useOperatorsStore } from '@/store/operators';

export default function SignalementTerritoire() {
  const translationsSignalement = useTranslations('signalement');

  const { statSignalementTerritory, setStatSignalementTerritory } =
    useStatSignalementTerritoryStore();

  const [loadSignalement, setLoadSignalement] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadSignalement(true);
      try {
        const data = await getStatSignalement({
          id: getCurrentInsee(),
          entite: getLabelEntite(),
          type: 'zone',
        });
        setStatSignalementTerritory(data);
      } catch (error) {
        console.error("Une erreur s'est produite : ", error);
      }
      setLoadSignalement(false);
    };

    if (!isAdresse()) {
      fetchData();
    }
  }, [setStatSignalementTerritory]);

  if (isAdresse()) {
    return <></>;
  }

  return (
    <div className='mt-4'>
      {loadSignalement ? (
        <div className='flex items-center justify-center'>
          <MoonLoader color='#232253' loading={loadSignalement} size={150} />
        </div>
      ) : (
        <>
          <Title
            text={translationsSignalement('statisticsTotalTitle')}
            className='text-lg text-black'
            underline={false}
          />
          <p className='text-base font-medium text-gray-500'>
            {translationsSignalement('statisticsTotalPeriod')}
          </p>
          <Title
            text={getTitleTerritoire()}
            underline={false}
            className='text-sm text-color-secondary'
          />
          <StatSignalement
            statSignalementTerritory={statSignalementTerritory}
          />
        </>
      )}
    </div>
  );
}

function StatSignalement(props: any) {
  const { statSignalementTerritory } = props;

  const translationsTerritoire = useTranslations('territoire');

  const { date } = useOperatorsStore();

  const oDate = date.find((date: any) => date.page === 'signalements');

  return (
    <>
      <div className='bg-stone-20 px-10 py-4 rounded-2xl font-bold w-full text-2xl text-bg-secondary-text mt-2'>
        {formatThousandSeparator(statSignalementTerritory?.value ?? 0)}
        <p className='font-semibold text-sm mt-2'>
          {translationsTerritoire('signalements')}
        </p>
      </div>
      <div className='text-xs font-medium text-gray-500 mt-4'>
        {translationsTerritoire('arcep_data') + ' '}
        <span className='underline'>
          {`${translationsTerritoire('of')} ${oDate?.date_maj}`}
        </span>
      </div>
    </>
  );
}
