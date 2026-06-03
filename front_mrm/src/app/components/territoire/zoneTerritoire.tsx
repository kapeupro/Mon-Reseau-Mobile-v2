import React, { useEffect, useState } from 'react';

import MoonLoader from 'react-spinners/MoonLoader';

import Info from '@/app/components/info';

import { useStatZoneTerritoryStore } from '@/store/stat';
import { useOperatorsStore } from '@/store/operators';

import { formatThousandSeparator } from '@/utils/utils';
import {
  getCurrentInsee,
  isOutremer,
  getDepartementOutremer,
} from '@/utils/currentInsee';
import { getLabelEntite } from '@/utils/activeEntite';

import { getStatZone } from '@/service/territory';
import { useTranslations } from 'next-intl';

export default function ZoneTerritoire() {
  const { statZoneTerritory } = useStatZoneTerritoryStore();
  const { setStatZoneTerritory } = useStatZoneTerritoryStore();
  const { date } = useOperatorsStore();

  const [loadZone, setLoadZone] = useState(false);
  const zoneTranslation = useTranslations('zone');

  const date_zone = date.find((date: any) => date.page === 'zones-a-couvrir');

  const current_insee = getCurrentInsee();
  const label_insee = getLabelEntite();

  useEffect(() => {
    const fetchData = async () => {
      setLoadZone(true);
      try {
        const data = await getStatZone({
          id: current_insee,
          entite: label_insee,
          ...getDepartementOutremer(current_insee, label_insee),
        });
        setStatZoneTerritory(data);
      } catch (error) {
        console.error("Une erreur s'est produite : ", error);
      }
      setLoadZone(false);
    };

    fetchData();
  }, [setStatZoneTerritory, current_insee, label_insee]);

  return (
    <>
      {loadZone ? (
        <div className='flex items-center justify-center'>
          <MoonLoader color='#232253' loading={loadZone} size={150} />
        </div>
      ) : isOutremer() ? (
        <Info className='rounded-2xl w-full mt-4'>
          <span className='text-xs leading-4'>
            {
              "Ce territoire n'est pas concerné par les programmes de zone à couvrir."
            }
          </span>
        </Info>
      ) : !statZoneTerritory || statZoneTerritory.nbrSiteDemande === false ? (
        <Info className='rounded-2xl w-full mt-4'>
          <span className='text-xs leading-4'>
            {"Il n'y a pas de zone à couvrir pour ce territoire."}
          </span>
        </Info>
      ) : (
        <div className='flex text-color-primary gap-5'>
          <div className='bg-stone-20 p-5 rounded-2xl font-bold w-full text-xl text-bg-secondary-text'>
            {' '}
            {formatThousandSeparator(statZoneTerritory.nbrSiteDemande)}{' '}
            <p className='font-semibold text-sm'>
              {zoneTranslation('zac-nombre-site-demande')}
            </p>
          </div>
          <div className='bg-stone-20 p-5 rounded-2xl font-bold w-full text-xl text-bg-secondary-text'>
            {' '}
            {formatThousandSeparator(
              statZoneTerritory.nbrSitePutInService
            )}{' '}
            <p className='font-semibold text-sm'>
              {zoneTranslation('zac-site-mis-service')}
            </p>
          </div>
        </div>
      )}

      <p className='text-[11px] font-semibold text-info mb-6 mt-4'>
        {zoneTranslation('zac-data-arcep')}{' '}
        <span className='underline'>
          {zoneTranslation('zac-du-article')} {date_zone.date_build_start}
        </span>
      </p>
    </>
  );
}
