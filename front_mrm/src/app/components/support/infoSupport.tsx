import React from 'react';

import CopyLabel from '@/app/components/copyLabel';

import { useSupportsStore } from '@/store/support';

export default function InfoSupport() {
  const { supports: foundSupport } = useSupportsStore();

  const itemsClassName = 'flex flex-col gap-2';
  const labelClassName = 'text-xs font-medium text-gray-500';
  const contentClassName = 'text-xs text-color-primary font-bold';

  if (!foundSupport || foundSupport.length === 0) {
    return <></>;
  }

  let identifiant = '';
  let support = '';
  let hauteur = '';
  let adresse = '';
  let coordonnees = '';
  let construction = '';
  let mutualise = '';

  if (foundSupport || foundSupport.length > 0) {
    const currentSupport = foundSupport[0];

    if (currentSupport) {
      identifiant = currentSupport.hasOwnProperty('sup_id')
        ? currentSupport.sup_id
        : '';
    }
    mutualise = foundSupport.length > 1 ? 'Mutualisé' : 'Non mutualisé';
    support = currentSupport.support;
    hauteur = currentSupport.sup_nm_haut;
    adresse = currentSupport.adr_lb_lieu
      ? currentSupport.adr_lb_lieu
      : currentSupport.adr_lb_add1;
    coordonnees = `${currentSupport.coordinates.y}, ${currentSupport.coordinates.x}`;
    construction = currentSupport.date_construction;
  }

  return (
    <div className='flex flex-col gap-5 py-5'>
      <div className='flex flex-row gap-10'>
        <div className={itemsClassName}>
          <span className={labelClassName}>Identifiant</span>
          {identifiant ? (
            <CopyLabel
              className={contentClassName}
              toolTipMsg='Identifiant copié'
              text={identifiant}
              dataTest='antennas-support-id'
            />
          ) : (
            <span className='text-xs text-gray-400 font-normal'>
              Indisponible
            </span>
          )}
        </div>
        <div className={itemsClassName}>
          <span className={labelClassName}>Support</span>
          {support ? (
            <span
              className={contentClassName}
              data-test='antennas-support-nature'
            >
              {support}
            </span>
          ) : (
            <span className='text-xs text-gray-400 font-normal'>
              Indisponible
            </span>
          )}
        </div>
        <div className={itemsClassName}>
          <span className={labelClassName}>Hauteur</span>
          <span
            className={contentClassName}
            data-test='antennas-support-height'
          >
            {hauteur ? (
              `${hauteur} m`
            ) : (
              <span className='text-xs text-gray-400 font-normal'>
                Indisponible
              </span>
            )}
          </span>
        </div>
      </div>
      <div className={itemsClassName}>
        <span className={labelClassName}>Localisation</span>
        {adresse ? (
          <CopyLabel
            className={contentClassName}
            toolTipMsg='Adresse copiée'
            text={adresse}
            dataTest='antennas-support-localisation-name'
          />
        ) : (
          <span className='text-xs text-gray-400 font-normal'>
            Indisponible
          </span>
        )}
        {coordonnees ? (
          <CopyLabel
            className={contentClassName}
            toolTipMsg='Coordonnées copiées'
            text={coordonnees}
            dataTest='antennas-support-localisation-long-lat'
          />
        ) : (
          <span className='text-xs text-gray-400 font-normal'>
            Indisponible
          </span>
        )}
      </div>
      <div className='flex flex-row gap-16'>
        <div className={itemsClassName}>
          <span className={labelClassName}>Construction</span>
          <span
            className={contentClassName}
            data-test='antennas-support-construction'
          >
            {construction ? (
              construction
            ) : (
              <span className='text-xs text-gray-400 font-normal'>
                Indisponible
              </span>
            )}
          </span>
        </div>
        <div className={itemsClassName}>
          <span className={labelClassName}>Mutualisation</span>
          <span
            className={contentClassName}
            data-test='antennas-support-sharing'
          >
            {mutualise ? (
              mutualise
            ) : (
              <span className='text-xs text-gray-400 font-normal'>
                Indisponible
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
