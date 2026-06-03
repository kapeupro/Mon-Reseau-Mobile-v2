import React, { useEffect, useState } from 'react';
import { isMobile } from '../../service/window';
import {
  usePageStore,
  useTitleStore,
  useHeaderPanelStore,
  useHomeMenuStore,
  useGradientStore,
} from '@/store/store';
import Home from './pages/home';
import Territory from './pages/territoires';
import Couverture from './pages/couverture';
import Test from './pages/test';
import Antennes from './pages/antennes';
import Zones from './pages/zones';
import Signalements from './pages/signalements';
import IconCaretLeft from '@/assets/icons/caret_left.svg';
import { twMerge } from 'tailwind-merge';
import Footer from './footer';

import { useTerritoryStore } from '@/store/filter';
import { useShowFilterSearch, useTogglePanelStore } from '@/store/togglePanel';
import { useTestSubPagesStore, useDatasourcesStore } from '@/store/qualityTest';
import { useZoneSubPagesStore } from '@/store/zone';
import {
  useAntenneSiteOperatorStore,
  useAntenneSubPagesStore,
  useSupportStore,
  useClickedFromTerritoryStore,
} from '@/store/antenne';

import IconLeft from '@/assets/icons/iconLeft.svg';
import HeaderPanel from './headerPanel';

import { usePageSuperpositionStore } from '@/store/superposition';
import { isActiveSuperposer } from './superposition/utils';
import { useControleStore } from '@/store/map';
import { useToolsStore } from '@/store/tools';
import HomeMenu from './pages/homeMenu';
import FooterMenu from './footerMenu';

interface PanelProps {
  className?: string;
}

export default function Panel(props: PanelProps) {
  const { bHeaderPanel: isMenu } = useHeaderPanelStore();

  const { showPanel, togglePanel } = useTogglePanelStore();
  const { setSubPage: setSubPageAntenne, subPage: subPageAntenne } =
    useAntenneSubPagesStore();
  const { setSubPage: setSubPageTest, subPage: subPageTest } =
    useTestSubPagesStore();
  const { setSubPage: setSubPageZone, subPage: subPageZone } =
    useZoneSubPagesStore();
  const { id: idSupport, setData, setId } = useSupportStore();
  const { operatorSite, setOperatorSite } = useAntenneSiteOperatorStore();
  const { isClickedFromTerritory } = useClickedFromTerritoryStore();

  const { page: activePage, setPage } = usePageStore();
  const { title } = useTitleStore();
  const { territory } = useTerritoryStore();
  const IsMobile = isMobile();
  const { showSearchPanel } = useShowFilterSearch();
  const { fetch: fetchDatasource } = useDatasourcesStore();
  const { page: activePageSuperposition } = usePageSuperpositionStore();
  const { oMeasure, setControle } = useControleStore();
  const { show: showTools, subPageTools } = useToolsStore();
  const { show: showHomeMenu } = useHomeMenuStore();
  const { setIsGradient } = useGradientStore();

  const [overFlow, setOverFlow] = useState('overflow-auto');

  const onTogglePanel = () => {
    togglePanel(!showPanel);
  };

  useEffect(() => {
    if (isClickedFromTerritory) {
      return;
    }
    setSubPageAntenne('');
    setSubPageTest('');
    setSubPageZone('');
  }, [
    isClickedFromTerritory,
    activePage,
    setSubPageAntenne,
    setSubPageTest,
    setSubPageZone,
  ]);

  const currentActivePage =
    isActiveSuperposer() && activePageSuperposition
      ? activePageSuperposition
      : activePage;

  const returnPage = getActiveComponent(currentActivePage);

  const handlerBack = () => {
    if (activePage === 'antennes-deploiements') {
      if (subPageAntenne === 'support_site') {
        setSubPageAntenne('support_info');
        setOperatorSite('');
      } else if (subPageAntenne === 'support_info') {
        setSubPageAntenne('');
        setId(NaN);
        setData({
          id: NaN,
          code_dep: '',
        });
      } else {
        setPage('home');
      }
    } else if (activePage === 'qualite-reseau') {
      if (subPageTest === 'emplacement_test') {
        setSubPageTest('');
      } else {
        setPage('home');
      }
    } else if (activePage === 'zones-a-couvrir') {
      if (subPageTest === 'zone_info') {
        setSubPageZone('');
      } else {
        setPage('home');
      }
    } else {
      setPage('home');
    }
  };

  const isMesureMobile = oMeasure?.activate && IsMobile;
  const isToolsAlertMobile =
    IsMobile && showTools && subPageTools === 'tools_alert';

  let classPanel =
    'relative top-[calc(100vh-100px)]  w-full rounded-2xl xl:rounded-none shadow-panel-mobile ' +
    (isMesureMobile || isToolsAlertMobile
      ? '!bg-purple-20 hidden'
      : 'bg-white');

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (IsMobile && !showHomeMenu) {
        window.scrollTo({
          top: 210,
          behavior: 'smooth',
        });
      } else {
        setOverFlow('scroll-smooth scroll-y scroll-top-0');
        setTimeout(() => {
          setOverFlow('overflow-auto');
        }, 100);
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [activePage, IsMobile, showHomeMenu]);

  let togglePanelPosition = 'left-120';

  if (!IsMobile) {
    classPanel =
      'transition duration-300 ease-in-out relative w-120 ' +
      (showPanel ? ' h-full  overflow-auto' : '-translate-x-full');

    togglePanelPosition =
      'transition duration-300 ease-in-out ' +
      (showPanel ? 'left-0 translate-x-120' : ' translate-x-0');
  }

  const handlerScroll = (e: any) => {
    const { scrollTop } = e.target;

    if (scrollTop === 0) {
      setIsGradient(false);
    } else {
      setIsGradient(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const heightWindows = window.innerHeight;
    if (scrollY >= heightWindows - 60) {
      setIsGradient(true);
    } else {
      setIsGradient(false);
    }
  };

  useEffect(() => {
    fetchDatasource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //  return <></>

  return (
    <div
      className={twMerge(
        'flex shadow-panel z-[5] ',
        !IsMobile ? overFlow : '',
        showSearchPanel ? '' : ''
      )}
    >
      {!IsMobile && (
        <button
          onClick={onTogglePanel}
          className={twMerge(
            'fixed top-1/4 bg-white rounded-r-lg px-2 py-1 shadow-button-panel',
            togglePanelPosition
          )}
          data-test='collapse-button-main-menu'
        >
          <IconLeft
            className={
              'transition duration-300 ease-in-out ' +
              (showPanel ? '' : 'transform rotate-180')
            }
            onClick={onTogglePanel}
          />
        </button>
      )}
      <div
        className={twMerge(classPanel, showHomeMenu ? 'top-0 z-10' : '')}
        style={{}}
      >
        {isMenu ? (
          !showHomeMenu && (
            <div className='bg-white w-full sticky h-24 top-0 z-[6] rounded-t-2xl shadow'>
              <div className='flex pt-7 items-center'>
                <div onClick={handlerBack} className='w-10 h-10 cursor-pointer'>
                  <IconCaretLeft />
                </div>

                <div>
                  <p className='mt-2 text-color-primary font-bold'>{title}</p>
                  {activePage === 'antennes-deploiements' ? (
                    subPageAntenne === 'support_info' ? (
                      <span className=' text-color-primary '>{idSupport}</span>
                    ) : (
                      <span className=' text-color-primary '>
                        {operatorSite || territory.label}
                      </span>
                    )
                  ) : (
                    <span className=' text-color-primary '>
                      {territory.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        ) : (
          <>
            {IsMobile && !showHomeMenu && (
              <div className='bg-primary absolute top-4 z-[6] right-0 left-0 pt-1.5 w-1/3 m-auto rounded-lg'>
                {' '}
              </div>
            )}
          </>
        )}
        {!IsMobile ? (
          <div
            className={
              'transition-all w-120 overflow-x-hidden grid duration-300 ' +
              (showHomeMenu
                ? 'grid-template-column-left h-[1700px]'
                : 'grid-template-column-right h-full')
            }
          >
            <div className={twMerge(`relative overflow-y-hidden home-page`)}>
              <HomeMenu />
            </div>
            <div
              className={twMerge(`relative overflow-x-hidden active-page`)}
              onScroll={handlerScroll}
            >
              {returnPage}
            </div>
          </div>
        ) : showHomeMenu ? (
          <div className={twMerge(`absolute top-0 z-50  w-full`)}>
            <HomeMenu />
          </div>
        ) : (
          <div className={twMerge(`relative`)}>{returnPage}</div>
        )}
      </div>
    </div>
  );
}

interface ComponentWithHeaderPanelProps {
  children?: React.ReactNode;
}

function ComponentWithHeaderPanel({
  children,
}: Readonly<ComponentWithHeaderPanelProps>) {
  const IsMobile = isMobile();
  return (
    <>
      {!IsMobile && <HeaderPanel></HeaderPanel>}
      {children}
      <Footer />
    </>
  );
}

function getActiveComponent(page: string) {
  let cmp = (
    <>
      <Home />
      <Footer />
    </>
  );

  switch (page) {
    case 'territory':
      cmp = (
        <ComponentWithHeaderPanel>
          <Territory />
        </ComponentWithHeaderPanel>
      );
      break;
    case 'couverture-theorique':
      cmp = (
        <ComponentWithHeaderPanel>
          <Couverture />
        </ComponentWithHeaderPanel>
      );
      break;
    case 'qualite-reseau':
      cmp = (
        <ComponentWithHeaderPanel>
          <Test />
        </ComponentWithHeaderPanel>
      );
      break;
    case 'antennes-deploiements':
      cmp = (
        <ComponentWithHeaderPanel>
          <Antennes />
        </ComponentWithHeaderPanel>
      );
      break;
    case 'zones-a-couvrir':
      cmp = (
        <ComponentWithHeaderPanel>
          <Zones />
        </ComponentWithHeaderPanel>
      );
      break;
    case 'signalements':
      cmp = (
        <ComponentWithHeaderPanel>
          <Signalements />
        </ComponentWithHeaderPanel>
      );
      break;
  }

  return cmp;
}
