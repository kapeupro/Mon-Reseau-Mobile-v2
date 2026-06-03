'use client';
import React from 'react';
import Link from 'next/link';

import ArrowBack from '@/assets/icons/arrow_back.svg';

import Icon from '@/app/components/iconcmp';
import Symbole from '@/app/components/symbole';

export default function ListSymbole() {
  return (
    <div className='space-y-2'>
      <Link href='/doc'>
        <Icon icon={<ArrowBack />} />
      </Link>
      <div className='flex items-center gap-2 mx-4'>
        <Symbole className='bg-greenTheme-500 text-greenTheme-100' />
        <Symbole className='text-greenTheme-500 bg-greenTheme-100' />
        <Symbole iconCheck={false} className='text-rose-400' />
      </div>
      <div className='flex items-center gap-2 mx-4'>
        <Symbole className='text-white bg-black' />
        <Symbole className='bg-violetTheme-100 text-violetTheme-500' />
        <Symbole iconCheck={false} className='text-rose-400' />
      </div>
    </div>
  );
}
