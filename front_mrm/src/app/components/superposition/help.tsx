import React from 'react';

import IconActive from '@/assets/icons/help_active.svg';
import IconDragDrop from '@/assets/icons/help_drag_drop.svg';
import IconFilter from '@/assets/icons/help_filter.svg';
import { useTranslations } from 'next-intl';

export default function Help() {
  const translations = useTranslations();
  const aHelps = [
    {
      icon: <IconActive width={24} />,
      text: translations('superposer.help-filter'),
    },
    {
      icon: <IconFilter width={24} />,
      text: translations('superposer.help-choice'),
    },
    {
      icon: <IconDragDrop width={24} />,
      text: translations('superposer.help-drag'),
    },
  ];

  return (
    <div className='p-3 rounded-lg bg-stone-20 text-xs font-semibold flex flex-col space-y-2'>
      {aHelps.map((dt, index) => (
        <div className='flex space-x-4 items-center' key={index}>
          <div>{dt.icon}</div>
          <div className='text-secondary-text'>{dt.text}</div>
        </div>
      ))}
    </div>
  );
}
