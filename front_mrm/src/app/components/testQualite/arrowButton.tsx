'use client';
import React from 'react';

import ArrowButtonComponent from '@/app/components/arrowButton';

import IconMap from '@/assets/icons/iconMap.svg';

import { usePageStore } from '@/store/store';
import { useTranslations } from 'next-intl';
import LinkTransport from '../linkTransport';

export default function ArrowButton() {
  const { setPage: handleChangeThematique } = usePageStore();
  const testTranslation = useTranslations('test');
  return (
    <div className='flex flex-col gap-4'>
      <LinkTransport />
      <h2 className='text-color-primary flex items-start justify-start font-bold mb-0'>
        {testTranslation('moreData')}
      </h2>
      <div className='flex flex-col gap-6'>
        <ArrowButtonComponent
          text={testTranslation('mapCouverage')}
          icon={<IconMap />}
          onClick={() => handleChangeThematique('couverture-theorique')}
        />
        <ArrowButtonComponent
          text={testTranslation('mapAntenna')}
          icon={<IconMap />}
          onClick={() => handleChangeThematique('antennes-deploiements')}
        />
      </div>
    </div>
  );
}
