import React, { useEffect, useState } from 'react';

import MoonLoader from 'react-spinners/MoonLoader';
import { twMerge } from 'tailwind-merge';

import TitlePage from '@/app/components/titlePage';

import BreadcrumbsSupportAntennes from '@/app/components/support/breadCrumbs';
import Operators from '@/app/components/support/operators';
import Links from '@/app/components/support/links';
import InfoSupport from '@/app/components/support/infoSupport';
import ListOperators from '@/app/components/support/listOperators';
import BreadcrumbsInfoZone from '@/app/components/zone/breadCrumbs';
import { useOperatorAndAllStore } from '@/store/store';

import {
  useAntenneSubPagesStore,
  useSupportStore,
  useTechnologiesStore,
  useDispositifStore,
  useStatusStore,
  useClickedFromTerritoryStore,
} from '@/store/antenne';
import { useSupportsStore } from '@/store/support';

import { isMobile } from '@/service/window';

import LeftArrow from '@/assets/icons/leftArrow.svg';
import { getSupportById } from '@/service/supports';
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

function NoDataFound() {
  const bMobile = isMobile();

  return (
    <div
      className={twMerge(
        'flex  items-center justify-center pb-10',
        !bMobile && 'h-[calc(100vh-670px)]'
      )}
    >
      Aucune donnée à afficher pour ce support
    </div>
  );
}

export default function Support() {
  const { setSubPage } = useAntenneSubPagesStore();
  const { setIsClickedFromTerritory } = useClickedFromTerritoryStore();
  const { id: idSupport, bLoading, setLoading } = useSupportStore();
  const { supports, setSupports } = useSupportsStore();
  const [dataAvailable, setDataAvailable] = useState(true);
  const { setSubPage: setSubPageZone } = useZoneSubPagesStore();

  const bIsZac = isZac();

  useEffect(() => {
    if (!idSupport) {
      return;
    }

    const fetchData = async () => {
      const { technologies } = useTechnologiesStore.getState();
      const { dispositif } = useDispositifStore.getState();
      const { status } = useStatusStore.getState();
      const { operatorsAndAll } = useOperatorAndAllStore.getState();

      setLoading(true);
      try {
        const data = await getSupportById({
          id: idSupport?.toString() ?? '',
          dispositif,
          technologies,
          status,
          is_zac: bIsZac ? 1 : 0,
          operators: operatorsAndAll,
        });
        setSupports(data);
      } catch (e) {
        console.log('Error get support : ', e);
      }
      setLoading(false);
    };

    if (!supports) {
      fetchData();
    } else if (supports.length <= 0) {
      setDataAvailable(false);
    } else {
      setDataAvailable(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSupport, supports]);

  const clickReturn = () => {
    if (bIsZac) {
      setSubPageZone('zone_info');
    } else {
      setSubPage('');
    }

    setIsClickedFromTerritory(false);
  };

  if (bLoading) {
    return <Loading />;
  }

  return (
    <div>
      <div className='flex flex-col gap-5'>
        {bIsZac ? <BreadcrumbsInfoZone /> : <BreadcrumbsSupportAntennes />}
        <div className='flex flex-row items-center gap-2 mb-4'>
          <LeftArrow className='' onClick={() => clickReturn()} />
          <TitlePage text='Support' underline={false} />
        </div>
      </div>
      {idSupport &&
        (!dataAvailable ? (
          <NoDataFound />
        ) : (
          <>
            <Operators />
            <InfoSupport />
            <ListOperators />
          </>
        ))}
      <Links />
    </div>
  );
}
