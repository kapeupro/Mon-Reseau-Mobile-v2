'use client';
import React from 'react';

import DataLinksComponent from '@/app/components/dataLinks';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function DataLinksMyConnexion() {
  const territoireTranslation = useTranslations('territoire');
  const urlItems = [
    {
      urlName: `« ${territoireTranslation('my_con_net')} »`,
      link: `${process.env.NEXT_PUBLIC_LINK_MY_INTERNET_CONNECTION}`,
      target: '_blank',
    },
  ];

  const classDataLinksComponent = {
    title: 'text-lg leading-normal',
    description: 'leading-normal',
  };

  return (
    <div>
      <Image
        src={'/assets/icons/aller_plus_loin.png'}
        alt={'IconMore'}
        className='mx-auto'
        width={140}
        height={140}
      />
      <DataLinksComponent
        title={territoireTranslation('what_techno_net')}
        description={territoireTranslation('what_techno_net_desc')}
        item={urlItems}
        isSeparator={true}
        className={classDataLinksComponent}
      />
    </div>
  );
}
