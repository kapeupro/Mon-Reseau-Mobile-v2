import React from 'react';

import { useTranslations } from 'next-intl';

import Title from '@/app/components/title';
import Toggle from '@/app/components/toggle';

import { LIST_SITUATION } from '@/app/constant/constant';

import { useSituationStore } from '@/store/store';

export default function LocationFilter() {
  const { situation, toggleSituation, setSituation } = useSituationStore();
  const testTranslation = useTranslations('test');

  const getButtonLabel = () => {
    const key = situation.length ? 'disableAll' : 'enableAll';
    return testTranslation(key);
  };

  const onClickManageAllButton = () => {
    const keys = situation.length
      ? []
      : LIST_SITUATION.map((item) => item.name);
    setSituation(keys);
  };

  return (
    <>
      <div className='flex justify-between'>
        <Title
          text={testTranslation('locationOfMeasurements')}
          className='text-md text-bg-secondary-text mt-2'
          underline={false}
        />
        <button onClick={onClickManageAllButton}>
          <span className='underline font-semibold text-sm decoration-bg-secondary-text text-bg-secondary-text'>
            {getButtonLabel()}
          </span>
        </button>
      </div>
      <div className='flex flex-col space-y-2'>
        {LIST_SITUATION.map((item) => {
          return (
            <Toggle
              key={item.name}
              label={testTranslation(item.text)}
              checked={situation.includes(item.name)}
              onToggle={() => toggleSituation(item.name)}
            />
          );
        })}
      </div>
    </>
  );
}
