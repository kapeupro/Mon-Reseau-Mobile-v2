'use client';
import React from 'react';
import Link from 'next/link';

import ArrowBack from '@/assets/icons/arrow_back.svg';

import Icon from '@/app/components/iconcmp';
import Title from '@/app/components/title';

export default function Switcher() {
  return (
    <div className='space-y-2'>
      <Link href='/doc'>
        <Icon icon={<ArrowBack />} />
      </Link>
      <div className='space-y-4'>
        <Title text='Test de qualité' />
        <Title text='Seine Maritime' underline={false} />
      </div>
    </div>
  );
}
