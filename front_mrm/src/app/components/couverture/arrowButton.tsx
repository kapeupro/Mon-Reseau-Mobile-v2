'use client';
import React from 'react';

import ArrowButtonComponent from '@/app/components/arrowButton';

import IconMap from '@/assets/icons/iconMap.svg';

import { usePageStore } from '@/store/store';
import { useTranslations } from 'next-intl';

export default function ArrowButton() {
  const { setPage: handleChangeThematique } = usePageStore();
  const couvertureTranslation = useTranslations('couverture');
  const zoneTranslation = useTranslations('zone');
  const testTranslation = useTranslations('test');
  const antenneTranslation = useTranslations('antenne');
  return (
    <>
      <h2 className='text-color-primary flex items-start justify-start font-bold mb-0'>
        {couvertureTranslation('moreData')}
      </h2>
      <div className='flex flex-col space-y-6 !mt-4'>
        <ArrowButtonComponent
          text={zoneTranslation('title')}
          icon={<IconMap />}
          onClick={() => handleChangeThematique('zones-a-couvrir')}
        />
        <ArrowButtonComponent
          text={antenneTranslation('title')}
          icon={<IconMap />}
          onClick={() => handleChangeThematique('antennes-deploiements')}
        />
        <ArrowButtonComponent
          text={testTranslation('title')}
          icon={<IconMap />}
          onClick={() => handleChangeThematique('qualite-reseau')}
        />
      </div>
    </>
  );
}
