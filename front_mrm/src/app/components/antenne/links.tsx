import React from 'react';

import ArrowButtonComponent from '@/app/components/arrowButton';
import IconMap from '@/assets/icons/iconMap.svg';
import DataLinksComponent from '@/app/components/dataLinks';
import { usePageStore } from '@/store/store';
import { useTranslations } from 'next-intl';

const arrowLinks = [
  {
    label: 'zac',
    link: 'zones-a-couvrir',
  },
  {
    label: 'couverture',
    link: 'couverture-theorique',
  },
];

export default function Links() {
  const { setPage: handleChangeThematique } = usePageStore();
  const translation = useTranslations('antenne');
  return (
    <>
      <div className='flex flex-col gap-6 mb-6'>
        {arrowLinks.map((dt) => (
          <ArrowButtonComponent
            key={dt.label}
            text={translation(dt.label)}
            icon={<IconMap />}
            onClick={() => handleChangeThematique(dt.link)}
          />
        ))}
      </div>
      <DataLinksComponent
        title={translation('useOpenData')}
        item={[
          {
            urlName: 'data.gouv',
            link: `${process.env.NEXT_PUBLIC_LINK_OPENDATA}`,
            target: '_blank',
          },
        ]}
        className={{ main: 'mb-4' }}
      />
      <DataLinksComponent
        title={translation('publication')}
        item={[
          {
            urlName: translation('5gDeployment'),
            link: `${process.env.NEXT_PUBLIC_LINK_PUBLICATION_ANTENNE}`,
          },
        ]}
        className={{ main: 'mb-4' }}
      />
    </>
  );
}
