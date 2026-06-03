import React from 'react';

import Switcher from '@/app/components/switcher';
import { useTranslations } from 'next-intl';

interface BasemapItemProps {
  onToggle: Function;
  checked: boolean;
  data: any;
}

export default function BasemapItem({
  onToggle,
  checked,
  data,
}: Readonly<BasemapItemProps>) {
  const { label, background } = data;
  const translations = useTranslations('superposer');
  const onToggleBasemap = () => {
    onToggle(data);
  };

  return (
    <Switcher
      type='radio'
      classname='w-1/4 h-28 p-0 justify-start space-y-0'
      checked={checked}
      onToggle={onToggleBasemap}
    >
      <div className='w-full'>
        <div
          className={`w-full rounded-t-2xl bg-cover h-14 ${background}`}
        ></div>
        <p className='text-center mt-2 mb-1 text-color-primary text-xs font-semibold'>
          {translations(label)}
        </p>
      </div>
    </Switcher>
  );
}
