import React from 'react';
import CopyLabel from '@/app/components/copyLabel';
import DataLinksComponent from '@/app/components/dataLinks';
import { twMerge } from 'tailwind-merge';
import { typeOf } from 'maplibre-gl';

interface InfoSiteProps {
  support?: any;
  hauteur?: any;
  regionname?: any;
}

export default function InfoSite({
  support = '',
  hauteur = '',
  regionname = '',
}: InfoSiteProps) {
  const itemsClassName = 'flex flex-col gap-2';
  const labelClassName = 'text-xs font-medium text-gray-500';
  const contentClassName = 'text-xs text-color-primary font-bold';
  const isNotDispositif =
    typeof regionname === 'string'
      ? regionname.toLowerCase() === 'aucun' ||
        regionname.toLowerCase() === 'none'
      : true;

  return (
    <div className='flex flex-col gap-5 py-5'>
      <div className='flex flex-row gap-16'>
        <div className={itemsClassName}>
          <span className={labelClassName}>Support</span>
          {support ? (
            <CopyLabel
              className={contentClassName}
              text={support}
              dataTest='antennas-site-support-id'
            />
          ) : (
            <span className='text-xs text-gray-400 font-normal'>
              Indisponible
            </span>
          )}
        </div>
        <div className={itemsClassName}>
          <span className={labelClassName}>Hauteur</span>
          <span className={contentClassName} data-test='antennas-site-height'>
            {hauteur}
          </span>
        </div>
      </div>
      <div className={itemsClassName}>
        <DataLinksComponent
          title='Site relevant du dispositif'
          item={[
            {
              urlName: regionname,
              link: `${process.env.NEXT_PUBLIC_LINK_DEVICE_ZONE}`,
              target: '_blank',
            },
          ]}
          isLink={!isNotDispositif}
          className={{
            main: 'mb-4 gap-2',
            title: labelClassName,
            items: 'justify-normal',
            itemUrl: twMerge(
              'mr-2 flex justify-center items-center',
              contentClassName
            ),
          }}
          isDivider={false}
          dataTest='antennas-site-program-nature'
        />
      </div>
    </div>
  );
}
