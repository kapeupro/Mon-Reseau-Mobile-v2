import React from 'react';

import { useTranslations } from 'next-intl';

import ArrowButtonComponent from '@/app/components/arrowButton';
import { getListTrainByAxis } from '@/service/territoire_train';
import { onSelectSearchResult } from '@/app/components/territoire/train_elements/utils';
import { isMetropole } from '@/utils/utils';

import IconTrain from '@/assets/icons/train.svg';
import IconCar from '@/assets/icons/car.svg';

export default function LinkTransport() {
  const testTranslation = useTranslations('test');

  if (!isMetropole()) {
    return null;
  }

  return (
    <>
      <h2 className='text-color-primary flex items-start justify-start font-bold mb-0'>
        {testTranslation('transportAxis')}
      </h2>
      <div className='flex flex-col gap-6'>
        <ArrowButtonComponent
          text={testTranslation('trains')}
          icon={<IconTrain />}
          onClick={() => initSelectedTerritory('trains')}
        />
        <ArrowButtonComponent
          text={testTranslation('roads')}
          icon={<IconCar />}
          onClick={() => initSelectedTerritory('routes')}
        />
      </div>
    </>
  );
}

async function initSelectedTerritory(axis: string) {
  const response = await getListTrainByAxis({
    level: 1,
    axis: axis,
    axis_name: '',
  });

  if (response) {
    onSelectSearchResult(response);
  }
}
