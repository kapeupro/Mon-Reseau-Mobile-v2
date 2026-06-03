import React, { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import TitlePage from '@/app/components/titlePage';

import BreadcrumbsComponent from '@/app/components/breadcrumbs';
import Links from '@/app/components/support/links';
import GeometricShape from '@/app/components/geometricShape';

import {
  useAntenneSiteOperatorStore,
  useAntenneSubPagesStore,
  useSupportStore,
  useClickedFromTerritoryStore,
} from '@/store/antenne';

import LeftArrow from '@/assets/icons/leftArrow.svg';
import Home from '@/assets/icons/home.svg';
import Badge from '@/app/components/badge';
import InfoSite from '@/app/components/support/infoSite';
import InfoAntenne from '@/app/components/support/infoAntennes';
import SiteIndisponible from '@/app/components/support/siteIndisponible';
import { getSiteByFid } from '@/service/antennes';
import MoonLoader from 'react-spinners/MoonLoader';
import { twMerge } from 'tailwind-merge';
import { isMobile } from '@/service/window';
import drawMapSite from '@/app/components/map/drawMap/site';
import { useMapStore } from '@/store/map';
import BreadcrumbsInfoZone from '@/app/components/zone/breadCrumbs';
import { useZoneSubPagesStore } from '@/store/zone';
import { isZac } from '@/app/components/zone/utils';

function Loading() {
  const { bLoading } = useSupportStore();
  const bMobile = isMobile();

  return (
    <div
      className={twMerge(
        'flex  items-center justify-center pb-10',
        !bMobile && 'h-[calc(100vh-365px)]'
      )}
    >
      <MoonLoader color='#232253' loading={bLoading} size={150} />
    </div>
  );
}

function drawSite(data: any) {
  const { oMap } = useMapStore.getState();
  const oDrawMapSite = new drawMapSite(oMap, data);
  oDrawMapSite.draw();
}

export default function Site() {
  const { setSubPage } = useAntenneSubPagesStore();
  const { setSubPage: setSubPageZone } = useZoneSubPagesStore();
  const [site, setSite] = useState<any>();
  const { index, id_site, statutOperator = '' } = useAntenneSiteOperatorStore();
  const { code_dep, setLoading, bLoading } = useSupportStore();
  const antenneTranslations = useTranslations('antenne');

  const bIsZac = isZac();

  const getConfig = (dtsite: any) => {
    let status = antenneTranslations('site-broken-down');
    let color = '#ed3232';

    if (dtsite.in_service) {
      status = antenneTranslations('inOperation');
      color = '#34eb34';
    } else if (dtsite.is_sav) {
      status = antenneTranslations('sitesToCome');
      color = '#d0cfe7';
    }

    return {
      status,
      color,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const codeDepParams = bIsZac ? '' : code_dep;
      try {
        const data = await getSiteByFid(
          id_site,
          codeDepParams!,
          statutOperator === 'site-avenir'
        );
        setSite(data);
        drawSite(data);
      } catch (error) {
        console.error("Une erreur s'est produite : ", error);
      }
      setLoading(false);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_site]);

  if (bLoading) {
    return <Loading />;
  }

  return (
    <div>
      <div className='flex flex-col gap-5'>
        <Breadcrumbs />
        <div className='flex flex-row items-center gap-2 mb-4'>
          <LeftArrow
            className=''
            onClick={() => {
              if (bIsZac) {
                setSubPageZone('zone_support');
              } else {
                setSubPage('support_info');
              }
            }}
          />
          <TitlePage
            text={`${antenneTranslations('site-tile')} ${index}`}
            underline={false}
          />
        </div>
      </div>
      {site && (
        <>
          <div className='flex flex-row gap-5'>
            {site[0] && site[0].nom_affichage ? (
              <Badge
                text={site[0] ? site[0].nom_affichage : ''}
                color={{
                  color: site[0] ? site[0].couleur_defaut : '',
                  isHexaDecimal: true,
                }}
                classname='w-[70px] rounded-lg p-1 mb-2'
                dataTest='antennas-site-operator-label'
              />
            ) : (
              <span className='text-gray-400 font-normal text-xs'>
                Indisponible
              </span>
            )}

            <GeometricShape
              color={{
                color: getConfig(site[0]).color,
                isHexaDecimal: true,
              }}
              type='circle'
            >
              <span className='text-xs'>{getConfig(site[0]).status}</span>
            </GeometricShape>
          </div>
          {site[0] && site[0].data_site_indispo && (
            <SiteIndisponible infoSiteIndispo={site[0].data_site_indispo} />
          )}
          <InfoSite
            support={site[0] ? site[0].sup_id : false}
            hauteur={
              site[0]?.hauteur ? (
                `${site[0].hauteur} m`
              ) : (
                <span className='text-gray-400 font-normal'>Indisponible</span>
              )
            }
            regionname={
              site[0] ? (
                site[0].dispositif ? (
                  `${antenneTranslations(site[0] ? site[0].dispositif : '')}`
                ) : (
                  <span className='text-gray-400 font-normal'>
                    Indisponible
                  </span>
                )
              ) : (
                <span className='text-gray-400 font-normal'>Indisponible</span>
              )
            }
          />
          <InfoAntenne antennes={site[0] ? site[0].antennes : false} />
        </>
      )}
      <Links />
    </div>
  );
}

function Breadcrumbs() {
  return isZac() ? <BreadcrumbsInfoZone /> : <BreadcrumbsSiteAntennes />;
}

function BreadcrumbsSiteAntennes() {
  const { setSubPage } = useAntenneSubPagesStore();
  const { setIsClickedFromTerritory } = useClickedFromTerritoryStore();

  const activeMainPage = () => {
    setSubPage('');
    setIsClickedFromTerritory(false);
  };

  const aItems = [
    {
      iconHome: <Home />,
      onClick: activeMainPage,
    },
    {
      text: 'Antennes et déploiements',
      onClick: activeMainPage,
    },
    {
      text: 'Support',
      onClick: () => setSubPage('support_info'),
    },
  ];

  return <BreadcrumbsComponent items={aItems} />;
}
