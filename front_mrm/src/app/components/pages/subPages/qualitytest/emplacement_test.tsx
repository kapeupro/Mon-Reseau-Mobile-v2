import React from 'react';
import { twMerge } from 'tailwind-merge';

import MoonLoader from 'react-spinners/MoonLoader';

import TitlePage from '@/app/components/titlePage';
import BreadcrumbsComponent from '@/app/components/breadcrumbs';

import InfoEmplacementTest from '@/app/components/testQualite/emplacement_test/infoEmplacementTest';

import LeftArrow from '@/assets/icons/leftArrow.svg';
import Home from '@/assets/icons/home.svg';

import { isMobile } from '@/service/window';

import {
  useEmplacementTestStore,
  useTestSubPagesStore,
} from '@/store/qualityTest';
import {
  useGradientStore,
  useHeaderPanelStore,
  usePageStore,
} from '@/store/store';
import Resume from '@/app/components/testQualite/emplacement_test/resume';
import { useTogglePanelStore } from '@/store/togglePanel';
import { isTransport } from '@/utils/activeEntite';

function Loading() {
  const { bLoading } = useEmplacementTestStore();
  const bMobile = isMobile();

  return (
    <div
      className={twMerge(
        'flex items-center justify-center pb-10',
        !bMobile && 'h-[calc(100vh-365px)]'
      )}
    >
      <MoonLoader color='#232253' loading={bLoading} size={150} />
    </div>
  );
}

export default function EmplacementTest() {
  const { bLoading } = useEmplacementTestStore();
  const { setSubPage } = useTestSubPagesStore();
  const { setPage } = usePageStore();
  const { bHeaderPanel } = useHeaderPanelStore();
  const bMobile = isMobile();
  const { isGradient } = useGradientStore();

  const BreadcrumbItems = [
    {
      iconHome: <Home />,
      onClick: () => setPage('home'),
    },
    {
      text: 'Tests de qualité',
      onClick: () => setSubPage(''),
    },
    {
      text: '',
    },
  ];

  if (bLoading) {
    return <Loading />;
  }
  let headerClass = '';
  if (bMobile && bHeaderPanel) {
    headerClass = 'fixed top-24 w-full bg-white z-5 pt-2';
  } else if (!bMobile) {
    headerClass = 'fixed top-28 w-[480px] bg-white z-5';
  }

  return (
    <div className='relative rounded-2xl w-full pt-3 pb-3'>
      <div className='flex flex-col gap-5'>
        <div
          className={twMerge('p-3 pt-6 ', isTransport() ? 'pb-0' : headerClass)}
        >
          <div className='flex flex-col gap-5'>
            <BreadcrumbsComponent items={BreadcrumbItems} />
            <div className='flex flex-row items-center gap-2 mb-4'>
              <LeftArrow onClick={() => setSubPage('')} />
              <TitlePage text='Emplacement de test' underline={false} />
            </div>
          </div>
          {!isTransport() && (
            <>
              <Resume />
              {isGradient && (
                <div className='bg-gradient-to-b from-gray-200 to-transparent h-6 -mb-8' />
              )}
            </>
          )}
        </div>
        <InfoEmplacementTest />
      </div>
    </div>
  );
}
