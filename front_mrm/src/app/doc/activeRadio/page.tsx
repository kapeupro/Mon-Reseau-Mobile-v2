'use client';
import React, { useState } from 'react';
import Link from 'next/link';

import ActiveRadioComponent from '@/app/components/activeRadio';
import Icon from '@/app/components/iconcmp';

import ArrowBack from '@/assets/icons/arrow_back.svg';
import ContactGroup from '@/assets/icons/contact_group.svg';
import Region from '@/assets/icons/departement.svg';
import { useTranslations } from 'next-intl';

export default function Help() {
  const [selectedValue, setSelectedValue] = useState('population');
  const couvertureTranslation = useTranslations('couverture');

  const onClick = (value: any) => {
    setSelectedValue(value);
  };

  return (
    <div className='space-y-2 space-x-2'>
      <Link href='/doc'>
        <Icon icon={<ArrowBack />} />
      </Link>
      <div className='flex space-x-2'>
        <ActiveRadioComponent
          icon={<ContactGroup />}
          text={couvertureTranslation('populationCovered')}
          active={selectedValue === 'population'}
          onClick={() => onClick('population')}
        />
        <ActiveRadioComponent
          icon={<Region />}
          text={couvertureTranslation('surfaceCovered')}
          active={selectedValue === 'surface'}
          onClick={() => onClick('surface')}
        />
      </div>
    </div>
  );
}
