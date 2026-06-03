import React from 'react';
import IconArrow from '@/assets/icons/arrow_back.svg';
import CopyLabel from '../copyLabel';
import { useTranslations } from 'next-intl';

interface InfoAntenneProps {
  id?: string;
  emetteurs?: string[];
  className?: any;
  tilt?: string;
  azimut?: string;
  antenne?: any;
}

export default function InfoAntenne({
  id = '',
  emetteurs,
  className,
  tilt = '',
  azimut = '0',
}: InfoAntenneProps) {
  const antenneTranslation = useTranslations('antenne');
  const getAzimut = (azimutParams: string) => {
    let degInput = 0;
    let degOutput = 0;
    if (azimutParams === '') {
      degOutput = 90;
    } else {
      degInput = parseInt(azimutParams);
      degOutput = degInput + 90;
    }
    return degOutput;
  };
  return (
    <div className='flex gap-2 border rounded-2xl w-full flex-col p-7 text-color-primary'>
      <div className='flex'>
        {azimut && (
          <IconArrow
            className={`mr-4 rounded-full bg-primary text-white`}
            style={{ transform: `rotate(${getAzimut(azimut)}deg)` }}
          />
        )}

        <CopyLabel
          className={'font-semibold text-sm'}
          toolTipMsg='Numéro copié'
          text={`Antenne n°${id}`}
          dataTest='antennas-site-antenna-id'
        />
      </div>
      {emetteurs && emetteurs.length > 0 && (
        <div className=''>
          <p className='font-semibold text-sm mb-2'>
            {antenneTranslation('emetteur')}
          </p>
          <div className='flex'>
            <div className='flex-1'>
              <div
                className='grid grid-rows text-[0.9rem]'
                data-test='antennas-site-technologies'
              >
                {emetteurs?.slice(0, 5).map((emetteur: any, index: number) => (
                  <div key={index} className='grid grid-cols-2'>
                    <span className='font-bold'>{emetteur.label}</span>
                    <span className='font-medium text-info'>
                      {emetteur.technologie}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className='flex-1'>
              <div
                className='grid grid-rows text-[0.9rem]'
                data-test='antennas-site-technologies'
              >
                {emetteurs?.slice(5).map((emetteur: any, index: number) => (
                  <div key={index} className='grid grid-cols-2'>
                    <span className='font-bold'>{emetteur.label}</span>
                    <span className='font-medium text-info'>
                      {emetteur.technologie}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='flex gap-2'>
        <div className='flex flex-col '>
          <span className='text-info font-semibold text-sm'>
            {antenneTranslation('hauteur-support')}
          </span>
          <span className='font-bold text-xs' data-test='antennas-site-tilt'>
            {tilt} {antenneTranslation('unit-hauteur')}
          </span>
        </div>
        <div className='flex flex-col'>
          <span className='text-info font-semibold text-sm'>
            {antenneTranslation('orientation-horizontale')}
          </span>
          <span className='font-bold text-xs' data-test='antennas-site-azimut'>
            {azimut}°
          </span>
        </div>
      </div>
    </div>
  );
}
