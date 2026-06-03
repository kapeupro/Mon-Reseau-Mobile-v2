import React from 'react';

import { twMerge } from 'tailwind-merge';

import MoonLoader from 'react-spinners/MoonLoader';

import Icon from '@/app/components/iconcmp';
import Title from '@/app/components/title';
import Info from '@/app/components/info';
import MoreInfo from '@/app/components/moreInfo';
import LinksZone from '@/app/components/zone/linksZone';

import { useTranslations } from 'next-intl';

import BreadcrumbsInfoZone from './breadCrumbs';

import IconInfo from '@/assets/icons/iconInfo.svg';
import IconArrowBack from '@/assets/icons/arrow_back.svg';
import IconInZone from '@/assets/icons/POI-inZone-icon.svg';
import IconOutZone from '@/assets/icons/POI-outZone.svg';
import SiteInZoneLoad from '@/assets/icons/InZoneLoad.svg';
import SiteInZone from '@/assets/icons/InZone.svg';
import IconRight from '@/assets/icons/iconRight.svg';

import OperatorsZoneDetails from '@/app/components/zone/operator';

import { isMobile } from '@/service/window';

import { useZoneSubPagesStore, useZacStore } from '@/store/zone';

export default function ZoneInfo() {
  const translations = useTranslations('zone');
  const { setSubPage } = useZoneSubPagesStore();
  const { loading, data_zac } = useZacStore();
  const bMobile = isMobile();

  if (loading) {
    return (
      <div
        className={twMerge(
          'flex  items-center justify-center pb-10',
          !bMobile && 'h-[calc(100vh-365px)]'
        )}
      >
        <MoonLoader color='#232253' loading={loading} size={150} />
      </div>
    );
  }

  const data_zac_properties = data_zac ? data_zac.data.properties : false;

  return (
    <div className='pt-12 '>
      <div className='px-5'>
        <div className='flex flex-col gap-5'>
          <BreadcrumbsInfoZone />
          <div className='flex flex-row items-center gap-2 mb-4'>
            <IconArrowBack
              onClick={() => setSubPage('')}
              className='mt-1.5 -ml-1'
            />
            <Title
              text={
                data_zac_properties ? (
                  data_zac_properties.nom_dossier
                    .split(/(\s|-)/)
                    .map(
                      (segment: string) =>
                        segment.charAt(0).toUpperCase() +
                        segment.slice(1).toLowerCase()
                    )
                    .join('')
                ) : (
                  <span className='text-base text-gray-400 font-normal'>
                    Indisponible
                  </span>
                )
              }
              underline={false}
              className='ml-2'
            />
          </div>
        </div>
      </div>
      {data_zac_properties ? (
        <>
          <div className='mt-4 px-5'>
            <Info className='rounded-2xl w-full'>
              <div className='flex flex-col gap-1.5'>
                <span className='text-xs leading-4'>
                  {translations('description-first')}
                </span>
                <MoreInfo>
                  <span className='text-xs leading-4'>
                    {translations('description-second')}
                  </span>
                </MoreInfo>
              </div>
            </Info>
          </div>
          <div className='mt-4 px-5'>
            <Title
              text='Points d’intérêt à couvrir'
              className='mb-1 text-[18px] text-color-primary font-bold'
              underline={false}
            />
            <div className='flex mt-2'>
              <IconInZone className='h-8 w-8 ml-0.5' />
              <span className='font-semibold text-[13px] mt-1 ml-2'>
                {translations('point-compose')}{' '}
                <span className='font-bold'>
                  {data_zac_properties.nbre_mm_num_zonne_arrete}
                </span>
              </span>
            </div>
            <div className='flex mt-2'>
              <IconOutZone className='h-8 w-8 ml-0.5' />
              <span className='font-semibold text-[13px] mt-1 ml-1.5'>
                {translations('point-appart')}
              </span>
            </div>
          </div>
          <div className='mt-4 px-5'>
            <Title
              text='Sites propres à la zone'
              className='mb-1 text-[18px] text-color-primary font-bold'
              underline={false}
            />
            <div className='flex mt-3'>
              <div className='h-8 w-11 flex items-center justify-center'>
                <SiteInZoneLoad className='' />
              </div>
              <span className='font-semibold text-[13px] mt-1 ml-2'>
                {translations('site-ask')}{' '}
                <span className='font-bold'>
                  {data_zac_properties.construire_pr_couvrir}
                </span>
              </span>
            </div>
            <div className='flex mt-5'>
              <div className='h-8 w-11 flex items-center justify-center'>
                <SiteInZone className='h-8 w-8' />
              </div>
              <span className='font-semibold text-[13px] mt-0.5 ml-1.5'>
                {translations('site-service')}{' '}
                <span className='font-bold'>
                  {data_zac_properties.deja_mis_en_service}
                </span>
              </span>
            </div>
          </div>
          <Info className='rounded-2xl mx-5 mt-4'>
            <div className='flex flex-row items-center justify-center space-x-2'>
              <Icon icon={<IconInfo />} className='cursor-default' />
              <span className='text-xs leading-4'>
                {translations('site-not-appear')}
              </span>
            </div>
          </Info>
          <div className='mt-4 px-5'>
            <Title
              text={translations('operator-concerned')}
              className='mb-1 text-[18px] text-color-primary font-bold'
              underline={false}
            />
            <OperatorsZoneDetails />
          </div>
          <div className='mt-4 px-5'>
            <Title
              text={translations('arrete-zone')}
              className='mb-3 pt-3 text-[18px] text-color-primary font-bold'
              underline={false}
            />
            <a
              className='flex mt-2'
              target='_blank'
              href={
                data_zac_properties.lien_arrete
                  ? data_zac_properties.lien_arrete
                  : '#'
              }
            >
              <span className='font-semibold text-[13px] '>
                {data_zac_properties.date_arrete ? (
                  <>
                    {translations('arrete-on')}{' '}
                    {data_zac_properties.date_arrete}
                  </>
                ) : (
                  <span className='text-[13px] text-gray-400 font-normal'>
                    Indisponible
                  </span>
                )}
              </span>
              {data_zac_properties.date_arrete && (
                <IconRight className='-mt-0.5 h-5 w-5' />
              )}
            </a>
          </div>
          <LinksZone className='px-5 pt-5' />
        </>
      ) : (
        <div
          className={twMerge(
            'flex  items-center justify-center pb-10',
            !bMobile && 'h-[calc(100vh-670px)]'
          )}
        >
          Aucune donnée à afficher pour ce point
        </div>
      )}
    </div>
  );
}
