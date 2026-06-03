import React from 'react';

import { useTranslations } from 'next-intl';

import Title from '@/app/components/title';
import Toggle from '@/app/components/toggle';

import { LIST_TYPEZONE } from '@/app/constant/constant';

import { useTypeZoneStore } from '@/store/store';

export default function ZoneFilter() {
  const { typeZone, toggleTypeZone, setTypeZone } = useTypeZoneStore();
  const testTranslation = useTranslations('test');

  const getButtonLabel = () => {
    const key = typeZone.length ? 'disableAll' : 'enableAll';
    return testTranslation(key);
  };

  const onClickManageAllButton = () => {
    const keys = typeZone.length ? [] : LIST_TYPEZONE.map((item) => item.name);
    setTypeZone(keys);
  };

  return (
    <>
      <div className='flex justify-between'>
        <Title
          text={testTranslation('zoneTypes')}
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
        {LIST_TYPEZONE.map((item) => {
          return (
            <Toggle
              key={item.name}
              label={testTranslation(item.text)}
              checked={typeZone.includes(item.name)}
              onToggle={() => toggleTypeZone([item.name])}
            />
          );
        })}
      </div>
    </>
  );
}
