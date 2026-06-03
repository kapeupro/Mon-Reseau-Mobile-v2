import React from 'react';

import { useTranslations } from 'next-intl';

import InfoComponent from '@/app/components/info';
import MoreInfo from '@/app/components/moreInfo';
import OperatorsRoute from './route_elements/operators';
import ButtonServices from '@/app/components/territoire/route_elements/button_services';
import StatistiquesRoute from '@/app/components/territoire/route_elements/statistiques';
import ListRoutes from '@/app/components/territoire/route_elements/routes';

export default function TransportRoute() {
  const testTranslation = useTranslations('test');

  return (
    <div className='flex flex-col justify-center items-center py-5 gap-5'>
      <InfoComponent className='w-full'>
        <span className='text-xs'>{testTranslation('transport-info')}</span>
        <MoreInfo>
          <span className='text-xs'>
            {testTranslation('transport-more-info')}
          </span>
        </MoreInfo>
      </InfoComponent>
      <OperatorsRoute />
      <ListRoutes />
      <hr className='border-gray-400 w-full' />
      <ButtonServices />
      <StatistiquesRoute />
    </div>
  );
}
