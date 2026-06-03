'use client';
import React from 'react';

import EnService from '@/assets/icons/settings_input_antenna.svg';
import Maintenance from '@/assets/icons/site_maintenance.svg';
import IconSiteToBuild from '@/assets/icons/site_to_build.svg';

import SwitcherComponent from '@/app/components/switcher';
import Icon from '@/app/components/iconcmp';
import { useStatusStore } from '@/store/antenne';
import { useTranslations } from 'next-intl';

export default function SwitchButtonService() {
  const { status, toggleStatus } = useStatusStore();
  const antenneTranslations = useTranslations('antenne');
  return (
    <>
      <div className='flex justify-center items-center space-x-2'>
        <SwitcherComponent
          checked={status.includes('en_service')}
          onToggle={() => toggleStatus('en_service')}
          type='switcher'
          classname='h-24'
          dataTest='antennas-working-button'
        >
          <Icon icon={<EnService />} shadow />
          <span className='text-sm font-medium text-color-primary pb-1'>
            {antenneTranslations('inOperation')}
          </span>
        </SwitcherComponent>
        <SwitcherComponent
          checked={status.includes('en_maintenance')}
          onToggle={() => toggleStatus('en_maintenance')}
          type='switcher'
          classname='h-24'
          dataTest='antennas-not-working-button'
        >
          <div className='w-10 h-8'>
            <Maintenance className='w-10 h-10' />
          </div>
          <span className='text-sm font-medium text-color-primary pb-1'>
            {antenneTranslations('inMaintenance')}
          </span>
        </SwitcherComponent>
      </div>
      <SwitcherComponent
        checked={status.includes('a_venir')}
        onToggle={() => toggleStatus('a_venir')}
        type='switcher'
        classname='flex-row pt-2.5 pb-5 mt-6 hidden'
        dataTest='antennas-to-come-button'
      >
        <div className='flex flex-grow space-x-2.5'>
          <div className='w-10 h-8'>
            <IconSiteToBuild className='w-11 h-11' />
          </div>
          <span className='text-sm font-medium text-color-primary pt-2.5'>
            {antenneTranslations('sitesToCome')}
          </span>
        </div>
      </SwitcherComponent>
    </>
  );
}
