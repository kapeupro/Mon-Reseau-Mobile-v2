'use client';
import React from 'react';
import Link from 'next/link';

import DataLinksComponent from '@/app/components/dataLinks';
import Icon from '@/app/components/iconcmp';

import ArrowBack from '@/assets/icons/arrow_back.svg';

export default function DataLinks() {
  const urlItems = [
    {
      urlName: 'data.gouv',
      link: `${process.env.NEXT_PUBLIC_LINK_OPENDATA}`,
      target: '_blank',
    },
  ];
  return (
    <div className='space-y-2 space-x-2'>
      <Link href='/doc'>
        <Icon icon={<ArrowBack />} />
      </Link>
      <DataLinksComponent
        title='Utilisez ces données en open data'
        item={urlItems}
      />
    </div>
  );
}
