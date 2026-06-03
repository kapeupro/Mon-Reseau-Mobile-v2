import React from 'react';

import { useTranslations } from 'next-intl';

import InfoComponent from '@/app/components/info';
import MoreInfo from '@/app/components/moreInfo';

import OperatorsTrain from '@/app/components/territoire/train_elements/operators';
import TypeAxe from '@/app/components/territoire/train_elements/type_axes';
import ButtonServices from '@/app/components/territoire/train_elements/button_services';
import StatistiquesTrain from '@/app/components/territoire/train_elements/statistiques';

export default function TransportTrain() {
  const testTranslation = useTranslations('test');

  return (
    <div className='flex flex-col justify-center items-center py-5 gap-5'>
      <InfoComponent className='w-full'>
        <span className='text-xs'>{testTranslation('transport-info')}</span>
        <MoreInfo>
          <span className='text-xs'>
            {testTranslation('transport-more-info')}
          </span>
        </MoreInfo>
      </InfoComponent>
      <OperatorsTrain />
      <TypeAxe />
      <hr className='border-gray-400 w-full' />
      <ButtonServices />
      <StatistiquesTrain />
    </div>
  );
}
