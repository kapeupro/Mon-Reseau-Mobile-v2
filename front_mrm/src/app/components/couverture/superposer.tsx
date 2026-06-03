import React from 'react';

import Switcher from '@/app/components/switcher';
import Icon from '@/app/components/iconcmp';

import IconStack from '@/assets/icons/stack.svg';

import { useSuperposerStore } from '@/store/store';
import { useTranslations } from 'next-intl';

export default function Superposer() {
  const { active, toggleSuperposer } = useSuperposerStore();
  const couvertureTranslation = useTranslations('couverture');
  return (
    <div className={`w-1/6 text-center ${active ? 'mt-[-25px]' : ''}`}>
      {active && (
        <span className='text-sm font-medium text-color-primary'>2 max.</span>
      )}
      <Switcher
        type='switcher'
        checked={active}
        onToggle={toggleSuperposer}
        classname='h-20 cursor-pointer'
      >
        <div className='flex flex-col justify-center items-center'>
          <Icon icon={<IconStack />} />
          <span className='text-[10px]  font-medium text-color-primary text-center'>
            {couvertureTranslation('overlap')}
          </span>
        </div>
      </Switcher>
    </div>
  );
}
