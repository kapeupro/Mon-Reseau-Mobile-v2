'use client';

import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useTranslations } from 'next-intl';

import IconDown from '@/assets/icons/iconDown.svg';

interface LegendProps {
  classname?: string;
  children?: React.ReactNode;
}

export default function MoreInfo({ classname, children }: LegendProps) {
  const translationsMoreInfo = useTranslations('moreInfo');

  const [show, setShow] = useState(false);

  const onToggle = () => {
    setShow(!show);
  };

  return (
    <div>
      <div
        className={twMerge(
          'transition-grid-template-rows grid',
          show ? 'grid-rows-1fr' : 'grid-rows-0fr',
          'mt-auto'
        )}
      >
        <div className='leading-3 overflow-hidden'>{children}</div>
      </div>
      <div
        className={twMerge(
          'flex flex-row text-bg-secondary-text pt-2 cursor-pointer',
          classname
        )}
        onClick={onToggle}
      >
        <span className='flex justify-center items-center text-xs'>
          {show ? translationsMoreInfo('foldUp') : translationsMoreInfo('more')}
        </span>
        <IconDown
          className={twMerge(
            'transform transition-transform duration-500',
            show && 'rotate-180'
          )}
        />
      </div>
    </div>
  );
}
