import React from 'react';

import Maintenance from '@/assets/icons/site_maintenance.svg';

interface SiteIndisponibleProps {
  infoSiteIndispo: any;
}

export default function SiteIndisponible({
  infoSiteIndispo,
}: SiteIndisponibleProps) {
  const labelClassName = 'text-xs font-medium text-gray-500';
  const contentClassName = 'text-xs text-color-primary font-bold';

  const indispo = (
    <span className='text-gray-400 font-normal'>Indisponible</span>
  );

  return (
    <div className='flex flex-col mt-5 p-2 border border-gray-200 rounded-lg'>
      <div className='flex flex-row gap-2'>
        <Maintenance className='w-10 h-10' />
        <span className='flex justify-center items-center font-bold text-sm'>
          Site indisponible
        </span>
      </div>
      <div className='flex flex-row m-3'>
        <div className='flex flex-row w-1/2'>
          <div className='flex flex-col gap-1 w-1/3'>
            <span className={labelClassName}>Motif</span>
            <span className={labelClassName}>Depuis</span>
            <span className={labelClassName}>Fin prévue</span>
          </div>
          <div className='flex flex-col gap-1'>
            <span className={contentClassName}>
              {infoSiteIndispo.motif ? infoSiteIndispo.motif : indispo}
            </span>
            <span className={contentClassName}>
              {infoSiteIndispo.debut ? infoSiteIndispo.debut : indispo}
            </span>
            <span className={contentClassName}>
              {infoSiteIndispo.fin ? infoSiteIndispo.fin : indispo}
            </span>
          </div>
        </div>
        <div className='flex flex-col w-1/2'>
          <div className='h-1/3'></div>
          <div className='flex flex-row h-1/2'>
            <div className='flex flex-col gap-1 w-1/2'>
              <span className={labelClassName}>Appels</span>
              <span className={labelClassName}>Accès web</span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className={contentClassName}>
                {infoSiteIndispo.appels ? infoSiteIndispo.appels : indispo}
              </span>
              <span className={contentClassName}>
                {infoSiteIndispo.acces_web
                  ? infoSiteIndispo.acces_web
                  : indispo}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
