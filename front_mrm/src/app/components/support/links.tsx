import React from 'react';

import DataLinksComponent from '@/app/components/dataLinks';
import { useTranslations } from 'next-intl';

export default function Links() {
  const generalTranslation = useTranslations('general');
  return (
    <div className='py-5'>
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
      <DataLinksComponent
        title={generalTranslation('us-publication')}
        item={[
          {
            urlName: generalTranslation('observatioire-5g'),
            link: `${process.env.NEXT_PUBLIC_LINK_PUBLICATION_ANTENNE}`,
          },
        ]}
        className={{ main: 'mb-4' }}
      />
    </div>
  );
}
