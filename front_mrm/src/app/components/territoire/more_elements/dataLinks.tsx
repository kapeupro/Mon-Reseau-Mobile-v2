'use client';
import React from 'react';

import DataLinksComponent from '@/app/components/dataLinks';
import { useTranslations } from 'next-intl';

interface DataLinksProps {
  items: any;
  className?: string;
}

export default function DataLinks({ items, className }: DataLinksProps) {
  const antenneTranslation = useTranslations('antenne');

  const classDataLinksComponent = {
    items: 'mb-2',
  };

  return (
    <div className={className}>
      <DataLinksComponent
        title={antenneTranslation('publication')}
        item={items}
        isSeparator={true}
        className={classDataLinksComponent}
      />
    </div>
  );
}
