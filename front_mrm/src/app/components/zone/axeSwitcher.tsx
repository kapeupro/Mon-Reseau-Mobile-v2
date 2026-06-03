'use client';
import React from 'react';
import SwitcherComponent from '@/app/components/switcher';
import Ferres from '@/assets/icons/wayToCover.svg';
import AxePrioritaires from '@/assets/icons/axePrioritaires.svg';
import Prioritaire5G from '@/assets/icons/prioritaire5G.svg';
import IconZonesHelp from '@/assets/icons/icon_zone_help.svg';
import DropDownBlock from '../dropDownBlock';
import Title from '../title';
import ModalBubbleText from '../modalBubbleText';
import Help from '../help';

import { useAxesTransportsStore } from '@/store/zone';
import { useTranslations } from 'next-intl';

export default function AxeSwitcher() {
  const { axe, toggleAxe } = useAxesTransportsStore();
  const zoneTranslation = useTranslations('zone');
  const translations = useTranslations('whatIsThis.zone');
  return (
    <DropDownBlock
      header={
        <Title
          text={zoneTranslation('zac-axe-decouvert')}
          underline={false}
          className='text-base'
        />
      }
      show={true}
      classname='flex flex-col gap-2 mt-4 pt-4 border-y -mx-5 px-5 pb-4'
    >
      <ModalBubbleText
        title={translations('title')}
        image={<IconZonesHelp className='h-60 w-60' />}
        description={translations('description')}
      >
        <Help />
      </ModalBubbleText>
      <SwitcherComponent
        type='switcher'
        classname='flex-row pt-2 pb-5 my-2'
        checked={axe.includes('axe_ferre')}
        onToggle={() => toggleAxe('axe_ferre')}
      >
        <div className='flex flex-grow space-x-2.5'>
          <div className='w-10 flex items-center justify-center mt-2'>
            <Ferres />
          </div>
          <span className='text-sm font-medium text-color-primary pt-2.5'>
            {zoneTranslation('zac-axe-ferre')}
          </span>
        </div>
      </SwitcherComponent>
      <SwitcherComponent
        type='switcher'
        classname='flex-row pt-2 pb-5 my-2'
        checked={axe.includes('axe_prioritaire')}
        onToggle={() => toggleAxe('axe_prioritaire')}
      >
        <div className='flex flex-grow space-x-2.5'>
          <div className='w-10 flex items-center justify-center mt-2'>
            <AxePrioritaires />
          </div>
          <span className='text-sm font-medium text-color-primary pt-2.5'>
            {zoneTranslation('zac-axe-routier')}
          </span>
        </div>
      </SwitcherComponent>
      <SwitcherComponent
        type='switcher'
        classname='flex-row pt-2 pb-5 my-2'
        checked={axe.includes('axe_prioritaire_5g')}
        onToggle={() => toggleAxe('axe_prioritaire_5g')}
      >
        <div className='flex flex-grow space-x-2.5'>
          <div className='w-10 flex items-center justify-center mt-2'>
            <Prioritaire5G />
          </div>
          <span className='text-sm font-medium text-color-primary pt-2.5'>
            {zoneTranslation('zac-axe-routier-5g')}
          </span>
        </div>
      </SwitcherComponent>
    </DropDownBlock>
  );
}
