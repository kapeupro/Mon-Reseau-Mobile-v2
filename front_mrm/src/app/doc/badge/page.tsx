'use client';
import React from 'react';
import Link from 'next/link';

import BadgeComponent from '@/app/components/badge';
import Icon from '@/app/components/iconcmp';

import ArrowBack from '@/assets/icons/arrow_back.svg';

export default function Switcher() {
  return (
    <div className='space-y-2 space-x-2'>
      <Link href='/doc'>
        <Icon icon={<ArrowBack />} />
      </Link>
      <BadgeComponent text='Default' color={{}} />
      <BadgeComponent
        text='Colored'
        color={{ color: '#00FFFF', isHexaDecimal: true }}
      />
      <BadgeComponent
        text='Dark Colored'
        textColor='white'
        color={{
          color: 'primary',
          isHexaDecimal: false,
        }}
      />
    </div>
  );
}
