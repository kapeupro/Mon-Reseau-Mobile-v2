'use client';
import React from 'react';
import Link from 'next/link';

import Icon from '@/app/components/iconcmp';
import HelpComponent from '@/app/components/help';

import ArrowBack from '@/assets/icons/arrow_back.svg';

export default function Help() {
  const onClick = () => {
    alert('This is a help component');
  };

  return (
    <div className='space-y-2 space-x-2'>
      <Link href='/doc'>
        <Icon icon={<ArrowBack />} />
      </Link>
      <HelpComponent onClick={onClick} />
    </div>
  );
}
