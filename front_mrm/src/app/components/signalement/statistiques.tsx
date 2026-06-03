import React, { useState, useEffect } from 'react';

import { useTranslations } from 'next-intl';

import Title from '@/app/components/title';

import { formatThousandSeparator } from '@/utils/utils';
import { useOperatorsStore } from '@/store/operators';
import { useOperatorsSignalementStore } from '@/store/signalement';
import { getStatSignalement } from '@/service/territory';
import { MoonLoader } from 'react-spinners';

export default function StatsSignalements() {
  const translationsSignalement = useTranslations('signalement');
  const { operators } = useOperatorsSignalementStore();

  const [bLoading, setBLoading] = useState(false);
  const [data, setData] = useState<any>();

  const { date } = useOperatorsStore();
  const date_signalement = date.find(
    (date: any) => date.page === 'signalements'
  );

  useEffect(() => {
    const fetchData = async () => {
      setBLoading(true);
      try {
        const data = await getStatSignalement({
          type: 'recap',
          operators: operators.join(','),
        });
        setData(data);
      } catch (error) {
        console.error("Une erreur s'est produite : ", error);
      }
      setBLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operators]);

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-col'>
        <Title
          text={translationsSignalement('statisticsTotalTitle')}
          className='text-lg text-black'
          underline={false}
        />
        <p className='text-sm font-medium text-gray-500'>
          {translationsSignalement('statisticsTotalPeriod')}
        </p>
      </div>

      {bLoading ? (
        <div className='flex items-center justify-center my-2'>
          <MoonLoader color='#232253' loading={bLoading} size={100} />
        </div>
      ) : (
        <div className='flex text-color-primary gap-3'>
          <div className='bg-stone-20 p-5 rounded-2xl font-bold w-full text-2xl text-bg-secondary-text'>
            {formatThousandSeparator(data?.data?.metropole ?? 0)}
            <p className='font-semibold text-sm'>
              {`${translationsSignalement(
                'statisticsDescription'
              )} ${translationsSignalement('statisticsMetropolitan')}`}
            </p>
          </div>
          <div className='bg-stone-20 p-5 rounded-2xl font-bold w-full text-2xl text-bg-secondary-text'>
            {formatThousandSeparator(data?.data?.outremer ?? 0)}
            <p className='font-semibold text-sm'>
              {`${translationsSignalement(
                'statisticsDescription'
              )} ${translationsSignalement('statisticsOverseas')}`}
            </p>
          </div>
        </div>
      )}

      <p className='text-xs font-semibold text-info'>
        {translationsSignalement('statisticsDate') + ' '}
        <span className='underline'>{date_signalement.date_maj}</span>
      </p>
    </div>
  );
}
