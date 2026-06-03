import React from 'react';

import IconDataFilterInActive from '@/assets/icons/data_filter_inactive.svg';
import IconDataFilterActive from '@/assets/icons/data_filter_active.svg';
import IconDragDrop from '@/assets/icons/drag_drop.svg';

import { usePageStore } from '@/store/store';
import { usePageSuperpositionStore } from '@/store/superposition';
import { useTranslations } from 'next-intl';

interface ThemeItemProps {
  label: string;
  name: string;
  bSuperposer: boolean;
  bFiltered: boolean;
  toggleSuperposer: Function;
  toggleFiltered: Function;
}

export default function ThemeItem({
  label,
  name,
  bSuperposer,
  toggleFiltered,
  toggleSuperposer,
}: Readonly<ThemeItemProps>) {
  const { page } = usePageStore();
  const { page: superpositionPage } = usePageSuperpositionStore();

  const isPageActive = [page, superpositionPage].includes(name);
  const translation = useTranslations();
  const onSuperposer = () => {
    if (isPageActive) {
      return;
    }

    toggleSuperposer(name);
  };

  const onFilter = () => {
    toggleFiltered(name);
  };

  return (
    <div
      className={`border ${
        bSuperposer || isPageActive ? 'border-violet-10' : ''
      } ${
        superpositionPage === name || (!superpositionPage && page === name)
          ? 'shadow-md'
          : ''
      } rounded p-2 flex justify-between items-center bg-white`}
    >
      <div className='flex justify-center items-center space-x-2'>
        <IconDragDrop height={16} />
        <h1 className='text-xs font-semibold'>{translation(label)}</h1>
      </div>
      <div className='flex space-x-2'>
        <button className='h-6' onClick={onFilter}>
          {superpositionPage === name ||
          (isPageActive && !superpositionPage) ? (
            <IconDataFilterActive height={25} />
          ) : (
            <IconDataFilterInActive height={14} />
          )}
        </button>
        <div className='border-l-2 pl-2 flex items-center'>
          <button className='h-4 relative' onClick={onSuperposer}>
            <input
              type='checkbox'
              className='sr-only peer '
              checked={bSuperposer || isPageActive}
              onChange={() => {
                return;
              }}
            />
            <div className="w-8 h-4 bg-grey-20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[2px] after:bg-white after:border-grey-20 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary"></div>
          </button>
        </div>
      </div>
    </div>
  );
}
