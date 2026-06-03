import React, { useState } from 'react';

import { useTranslations } from 'next-intl';
import { twMerge } from 'tailwind-merge';

import { isModeDaltonien } from '@/utils/utils';

interface ButtonService {
  children?: React.ReactNode;
  service: string;
  setService: Function;
}

export default function ButtonServices({
  children,
  service,
  setService,
}: Readonly<ButtonService>) {
  const [isSelected, setIsSelected] = useState(true);

  const couvertureTranslation = useTranslations('couverture');

  const setActiveService = () => {
    setIsSelected(!isSelected);

    let activeService = 'internet';
    if (service === 'internet') {
      activeService = 'appel_sms';
    }

    setService(activeService);
  };

  return (
    <div className='relative flex w-full'>
      <label className='flex-grow cursor-pointer'>
        <input
          checked={isSelected}
          className='sr-only peer'
          value=''
          type='checkbox'
          onChange={(e) => setActiveService()}
        />
        <div
          className={twMerge(
            'font-paragraphe peer rounded-xl outline-none duration-100 h-12 bg-white py-2 px-3 flex flex-row items-center relative',
            isModeDaltonien() ? 'border border-border-primary' : 'shadow'
          )}
        >
          <div
            className={twMerge(
              'absolute w-[calc(50%-12px)] h-9 rounded-lg duration-300 bg-primary z-[5] transition-transform',
              service === 'internet'
                ? 'transition-transform ease-in-out duration-300 translate-x-[0%]'
                : 'transition-transform ease-in-out duration-300 translate-x-[100%]',
              isModeDaltonien() && 'border border-border-primary'
            )}
            data-test='coverage-service-buttons'
          ></div>
          <span
            className={`w-1/2 rounded-md duration-300 text-sm text-center text-gray-400 z-[5] ${
              service === 'internet' ? 'text-white' : ''
            }`}
          >
            {couvertureTranslation('internetServices')}
          </span>
          <span
            className={`w-1/2 rounded-md duration-300 text-sm text-center text-gray-400 z-[5] ${
              service === 'appel_sms' ? 'text-white' : ''
            }`}
          >
            {couvertureTranslation('callSMS')}
          </span>
        </div>
      </label>
      {children}
    </div>
  );
}
