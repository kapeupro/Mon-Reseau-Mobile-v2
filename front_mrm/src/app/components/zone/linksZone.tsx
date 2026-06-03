import React from 'react';

import ArrowButtonComponent from '@/app/components/arrowButton';
import IconMap from '@/assets/icons/iconMap.svg';
import DataLinksComponent from '@/app/components/dataLinks';
import { usePageStore } from '@/store/store';
import { twMerge } from 'tailwind-merge';
import { useTranslations } from 'next-intl';

interface LinkProps {
  className?: any;
}

export default function LinksZone({ className }: LinkProps) {
  const { setPage } = usePageStore();
  const generalTranslation = useTranslations('general');
  const antenneTranslation = useTranslations('antenne');

  const arrowLinks = [
    {
      label: antenneTranslation('title'),
      link: 'antennes-deploiements',
    },
    {
      label: generalTranslation('mapCouverage'),
      link: 'couverture-theorique',
    },
  ];

  return (
    <div className={twMerge('', className)}>
      <div className='flex flex-col gap-6 mb-6'>
        {arrowLinks.map((dt) => (
          <ArrowButtonComponent
            key={dt.label}
            text={dt.label}
            icon={<IconMap />}
            onClick={() => setPage(dt.link)}
          />
        ))}
      </div>
      <DataLinksComponent
        title=''
        item={[
          {
            urlName: generalTranslation('dispostif-cible'),
            link: `${process.env.NEXT_PUBLIC_LINK_DEVICE_ZONE}`,
            target: '_blank',
          },
        ]}
        className={{ main: 'mb-4' }}
      />
      <DataLinksComponent
        title={generalTranslation('use-opendata')}
        item={[
          {
            urlName: 'data.gouv',
            link: `${process.env.NEXT_PUBLIC_LINK_OPENDATA}`,
            target: '_blank',
          },
        ]}
        className={{ main: 'mb-4' }}
      />
    </div>
  );
}
