'use client';
import React, { useState, useEffect } from 'react';

import * as turf from '@turf/turf';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

import ComponentMap from './components/map';
import Panel from './components/panel';
import SearchBar from './components/searchBar';
import ThematiqueBar from './components/thematiqueBar';
import TranslationProvider from './components/translations';
import Navigation from './components/navigation';

import { useOperatorsStore } from '@/store/operators';
import { isMobile } from '@/service/window';
import { useTerritoryStore, useTerritoryByUrlStore } from '@/store/filter';
import { useShowFilterSearch, useTogglePanelStore } from '@/store/togglePanel';
import Superposition from './components/superposition';
import Tools from './components/tools';
import { getTerritory } from '@/service/territory';
import { useCoordStore } from '@/store/selectedCoordStore';
import { useMapTerritoryStore } from '@/store/map';
import { getParamsTerritoryInUrl } from './components/navigation/utils';
import { useHeaderPanelStore } from '@/store/store';
import { useThemeStore } from '@/store/themes';
import { usePwaStore } from '@/store/pwa';
import { useIsFirstMount } from '@/utils/useIsFirstMount';
import { Suspense } from 'react';
import { initCsrf } from '@/service/csrf';

export default function Home() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const {
    operators,
    fetch: fetchOperators,
    setOperatorsColors,
  } = useOperatorsStore();

  const IsMobile = isMobile();
  const { showPanel } = useTogglePanelStore();
  const { territory } = useTerritoryStore();
  const searchParams = useSearchParams();
  const { theme } = useThemeStore();
  const isFirstMount = useIsFirstMount();

  useEffect(() => {
    fetchOperators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [territory]);

  useEffect(() => {
    initCsrf();

    const { selectTerritoire } = useCoordStore.getState();
    const { setTerritorySearch } = useMapTerritoryStore.getState();
    const { setLoaded: setLoadedTerritoryByUrl } =
      useTerritoryByUrlStore.getState();

    const params = getParamsTerritoryInUrl(searchParams);
    if (!params) {
      setLoadedTerritoryByUrl(true);
      return;
    }

    const fetchTerritory = async () => {
      const data = await getTerritory(params);
      if (!data) {
        setLoadedTerritoryByUrl(true);
        return;
      }

      let territorySearch = {
        extent: undefined,
        valueIdent: '',
        typeterritory: '',
      };
      const { map, ...oTerritory } = data;
      if (map) {
        territorySearch = mergeExtent(map);
      }

      selectTerritoire(oTerritory, false);
      setTerritorySearch(territorySearch);
      setLoadedTerritoryByUrl(true);
    };

    fetchTerritory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.querySelector('html')?.setAttribute('data-theme', theme);
    if (!isFirstMount) {
      setOperatorsColors(theme);
    }
  }, [theme]);

  const getClassNameMainDiv = () => {
    if (IsMobile) {
      return '';
    }

    let classNameMainDiv = 'grid h-[100vh] w-full duration-300 ';
    classNameMainDiv += showPanel
      ? 'grid-template-column-open'
      : 'grid-template-column-close';
    return classNameMainDiv;
  };

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', onBeforeinstallprompt);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('sw worker registered'))
        .catch(() => console.log('failed'));
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeinstallprompt);
    };
  }, []);

  if (operators === false) {
    return null;
  }

  return (
    <>
      <Script src='js/matomo.js' strategy='afterInteractive' />
      <Navigation>
        <TranslationProvider>
          <div className='App'>
            <div className={getClassNameMainDiv()}>
              {IsMobile ? (
                <HeaderMobile />
              ) : (
                <>
                  <Panel />
                  <ThematiqueBar />
                </>
              )}
              <MapRender />
              {IsMobile && <Panel />}
              <Superposition />
              <Tools />
            </div>
          </div>
        </TranslationProvider>
      </Navigation>
    </>
  );
}

function HeaderMobile() {
  const { showSearchPanel } = useShowFilterSearch();

  const [opacity, setOpacity] = useState('opacity-100');
  const [menuPanel, setMenuPanel] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScroll = () => {
    const { setHeaderPanel } = useHeaderPanelStore.getState();
    // Modifier les seuils et les opacités selon vos besoins
    const thresholds = [210, 229, 300, 454];
    const opacities = ['opacity-100', 'opacity-40', 'opacity-30', 'opacity-0'];

    const scrollY = window.scrollY;
    let nextOpacity = 'opacity-100';

    for (let i = 0; i < thresholds.length; i++) {
      if (scrollY >= thresholds[i]) {
        nextOpacity = opacities[i];
      }
      if (scrollY >= 331) {
        setMenuPanel(true);
      } else {
        setMenuPanel(false);
      }
      if (scrollY >= 730) {
        setHeaderPanel(true);
      } else {
        setHeaderPanel(false);
      }
    }

    setOpacity(nextOpacity);
  };

  const className = {
    search: !menuPanel ? '' : 'transition-all duration-300  w-20 md:w-full',
    buttonBack: menuPanel
      ? `transition-opacity duration-300 ease-in-out xl:opacity-100 ${opacity}`
      : ``,
    main: menuPanel
      ? showSearchPanel
        ? 'justify-end items-end top-1 z-50 w-full -left-4 px-5'
        : 'justify-end items-end top-1'
      : 'justify-end items-end top-1 z-[8] w-full -left-4 px-5',

    inputSelected: !menuPanel
      ? ''
      : `transition-opacity duration-300 ease-in-out  xl:opacity-100 ${opacity}`,
    input: menuPanel ? (showSearchPanel ? '' : 'hidden') : '',
  };

  return (
    <>
      <SearchBar className={className} />
      <ThematiqueBar
        className={`transition-opacity duration-300 ease-in-out xl:opacity-100 ${opacity}`}
      />
    </>
  );
}

function MapRender() {
  const { isLoaded: isLoadedTerritory } = useTerritoryByUrlStore();
  return <>{isLoadedTerritory && <ComponentMap />}</>;
}

function mergeExtent(territoire: any) {
  if (
    territoire.typeterritory !== 'adresse' &&
    territoire.typeterritory !== 'localisation'
  ) {
    return territoire;
  }

  const bufferDistance = 0.5;
  const point = [territoire.extent.minx, territoire.extent.miny];
  const buffer = turf.buffer(turf.point(point), bufferDistance, {
    units: 'kilometers',
  });
  const bbox = turf.bbox(buffer);

  const extent = {
    minx: bbox[0],
    miny: bbox[1],
    maxx: bbox[2],
    maxy: bbox[3],
  };
  return {
    ...territoire,
    extent,
  };
}

function onBeforeinstallprompt(e: any) {
  const { setDeferredPrompt } = usePwaStore.getState();
  e.preventDefault();
  setDeferredPrompt(e);
}
