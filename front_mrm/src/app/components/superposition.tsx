import React, { useEffect } from 'react';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import Basemap from './superposition/basemap';
import Themes from './superposition/theme';
import Help from './superposition/help';
import Credits from './superposition/credits';

import Title from './title';
import {
  useSuperpositionStore,
  useThemesStore,
  usePageSuperpositionStore,
} from '@/store/superposition';
import { isMobile } from '@/service/window';

import IconCross from '@/assets/icons/close.svg';
import IconHeadIcon from '@/assets/icons/head_icon.svg';
import iconSubtract from '@/assets/icons/subtract.png';
import { clearMapVectorTerritoryCouverture } from './map/drawMap/utils';
import { useMapStore } from '@/store/map';
import { SuperpositionLegend } from './superposition/theme/map';

export default function Superposition() {
  const translations = useTranslations();
  const { isActive, show, setState, setShow } = useSuperpositionStore();

  const bIsMobile = isMobile();

  const closeSuperposition = () => {
    const { setPage: setPageSuperposition } =
      usePageSuperpositionStore.getState();
    const { reset: resetThemes } = useThemesStore.getState();

    setPageSuperposition(undefined);
    resetThemes();

    setState({
      isActive: false,
      show: false,
    });
  };

  const minimize = () => {
    setShow(false);
  };

  const setLegendSuperposition = () => {
    const oSuperpositionLegend = new SuperpositionLegend(translations);
    oSuperpositionLegend.setLegend();
  };

  useEffect(() => {
    if (isActive) {
      const { oMap } = useMapStore.getState();
      clearMapVectorTerritoryCouverture(oMap);
      setLegendSuperposition();
    }
  }, [isActive]);

  if (!show) {
    return null;
  }

  return (
    <div
      className={`fixed z-50 right-0 ${
        bIsMobile
          ? 'left-0 top-0 bottom-0 bg-black bg-opacity-50 p-2'
          : 'mr-14 mt-14 bottom-3'
      }`}
    >
      {bIsMobile && (
        <div className='flex justify-end space-x-2'>
          <MinimizeButtonMobile onMinimize={minimize} />
          <CloseButtonMobile closeSuperposition={closeSuperposition} />
        </div>
      )}
      <div
        className={`bg-white  rounded-lg p-2 mt-2 shadow flex flex-col space-y-4 px-5 ${
          bIsMobile ? 'w-full' : 'w-96'
        } `}
      >
        {bIsMobile ? <HeadMobile /> : <HeadDesktop />}

        <div className='flex justify-between'>
          <Title
            text={translations('measuretools.maps')}
            underline={false}
            className='py-2'
          />
          {!bIsMobile && (
            <div className='flex justify-end space-x-2'>
              <MinimizeButtonDesktop onMinimize={minimize} />
              <CloseButtonDesktop closeSuperposition={closeSuperposition} />
            </div>
          )}
        </div>
        <Basemap />
        <Themes />
        <Help />
        <Credits className={{ main: 'text-xs', text: 'w-64' }} />
      </div>
    </div>
  );
}

interface CloseButtonProps {
  closeSuperposition: any;
}

function CloseButtonMobile({ closeSuperposition }: Readonly<CloseButtonProps>) {
  return (
    <button
      className='text-xs font-bold bg-white p-1 rounded-lg shadow pt-2'
      onClick={closeSuperposition}
    >
      <IconCross />
    </button>
  );
}

function MinimizeButtonMobile({ onMinimize }: Readonly<{ onMinimize: any }>) {
  return (
    <button
      className='text-xs font-bold bg-white p-1 rounded-lg shadow pt-2'
      onClick={onMinimize}
    >
      <Image src={iconSubtract} alt='minimize icon' />
    </button>
  );
}
function CloseButtonDesktop({
  closeSuperposition,
}: Readonly<CloseButtonProps>) {
  return (
    <button
      className='text-xs font-bold bg-white rounded-md border h-9 p-1'
      onClick={closeSuperposition}
    >
      <IconCross />
    </button>
  );
}
function MinimizeButtonDesktop({ onMinimize }: Readonly<{ onMinimize: any }>) {
  return (
    <button
      className='text-xs font-bold bg-white rounded-md border h-9 p-1'
      onClick={onMinimize}
    >
      <Image src={iconSubtract} alt='minimize icon' />
    </button>
  );
}

function HeadMobile() {
  return <div className='bg-primary pt-1.5 w-1/3 m-auto rounded-lg'></div>;
}

function HeadDesktop() {
  return (
    <div className='flex justify-center'>
      <IconHeadIcon />
    </div>
  );
}
