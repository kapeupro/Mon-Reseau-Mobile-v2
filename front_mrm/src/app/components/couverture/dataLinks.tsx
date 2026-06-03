'use client';
import React from 'react';

import DataLinksComponent from '@/app/components/dataLinks';
import { useTranslations } from 'next-intl';

export default function DataLinks() {
  const urlItems = [
    {
      urlName: 'data.gouv',
      target: '_blank',
      link: `${process.env.NEXT_PUBLIC_LINK_OPENDATA}`,
    },
  ];
  const couvertureTranslation = useTranslations('couverture');
  return (
    <div>
      <DataLinksComponent
        title={couvertureTranslation('useOpenData')}
        item={urlItems}
      />
    </div>
  );
}
