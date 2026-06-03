/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import Button from '@/app/components/button';
import ArrowButton from '@/app/components/arrowButton';
import SwitcherComponent from '@/app/components/switcher';

import Donnees from '@/app/components/home/donnees';
import Themes from '@/app/components/home/themes';
import DownloadPwa from '@/app/components/home/downloadPwa';
import SearchTerritory from '@/app/components/home/searchTerritory';

import BreadcrumbsPage from '@/app/components/pages/BreadcrumbsPage';

import LogoArcep from '@/assets/logoArcep.png';
// import LogoMRM from "@/assets/logoMRM.svg"
import LogoMRM from '@/assets/logoHdMRM.svg';
import IconRight from '@/assets/iconRight.svg';
import { isMobile } from '@/service/window';
import IconMenu from '@/assets/icons/menu.svg';
import IconAccessibility from '@/assets/icons/accessibility_switcher.svg';
import SearchBar from '../searchBar';
import { useShowFilterSearch } from '@/store/togglePanel';
import TitlePage from '../titlePage';
import { useFilterStore } from '@/store/filter';
import DataFilter from '../DataFilter';
import { aTerritoryFilter } from '../../constant/search';
import Link from 'next/link';

import { useThemeStore } from '@/store/themes';
import { usePageStore, useHomeMenuStore } from '@/store/store';

export default function Home() {
  const translations = useTranslations('home');
  const translationsSearch = useTranslations('search');
  const { setFilter } = useFilterStore();
  const IsMobile = isMobile();
  const { showSearchPanel, setShowPanelSearch } = useShowFilterSearch();
  const { theme, setTheme } = useThemeStore();
  const { setPage } = usePageStore();
  const { setShow: setShowHomeMenu } = useHomeMenuStore();
  const [accessibility, setAccessibility] = useState(false);
  const classNameSearch = {
    search: ' transition-all duration-300  w-20 md:w-full',
    buttonBack: `hidden`,
    main: showSearchPanel
      ? 'absolute top-0 left-0 w-11/12'
      : 'absolute top-[305px] left-4 w-4/5 mt-[2.4rem]',
    inputSelected: 'left-12',
  };

  useEffect(() => {
    if (theme != 'default' && !accessibility) {
      setAccessibility(true);
    }
  }, [theme]);

  const handlerSearchTerritory = (id: any) => {
    setFilter(id);
    setShowPanelSearch(true);
  };

  const onToggleAccessibility = () => {
    setAccessibility(!accessibility);

    if (!accessibility) {
      setTheme('monochrome');
    } else {
      setTheme('default');
    }
  };

  return (
    <div className='relative bg-secondary w-full pt-4 rounded-t-2xl xl:rounded-none'>
      <TitlePage text='Accueil' className='mb-4 hidden' />
      <div className='ml-0 xl:mr-20 mx-auto h-12 pt-4 flex xl:mx-0 xl:ml-4'>
        {!IsMobile && (
          <IconMenu
            onClick={() => setShowHomeMenu(true)}
            className='cursor-pointer'
          />
        )}
        <Image
          alt='LogoArcep'
          src={LogoArcep}
          className='w-auto h-14 mx-auto'
        />
      </div>
      <div className='grid grid-cols-5 grid-row-2 gap-2 pt-12 mr-4 md:mr-6 md:mx-6 mb-4'>
        <div className='col-span-2 row-span-2'>
          <LogoMRM className='' />
        </div>
        <div
          className='col-span-3 text-secondary-text font-title font-semibold text-lg'
          data-test='title-home'
        >
          {translations('title')}
        </div>
        <div className='col-span-3 text-secondary-text font-paragraphe font-semibold text-sm'>
          {translations('subtitle')}
        </div>
      </div>
      <div className='h-12 pt-4 flex justify-center mb-16'>
        <ArrowButton
          text={translations('learnMore')}
          onClick={() =>
            window.open(`${process.env.NEXT_PUBLIC_LINK_HOME_OTHERS}`, '_blank')
          }
        />

        {!IsMobile && (
          <SearchBar
            className={classNameSearch}
            isIcon={false}
            placholder={translationsSearch('placeholder')}
          />
        )}
      </div>
      <div className='flex flex-col bg-white w-full px-5 pt-12 gap-5'>
        <BreadcrumbsPage />
        <Donnees />
      </div>
      <div className='bg-white w-full py-6 px-5 '>
        <DataFilter
          title={translations('findTerritory')}
          aData={aTerritoryFilter}
          setFilter={handlerSearchTerritory}
        />
      </div>
      <Themes />
      {/* <div className="flex flex-col gap-5 py-8 bg-white border-b">
                <div className="flex flex-row justify-between">
                    <div></div>

                    <ArrowButton
                        text="Thème par défaut"
                        onClick={() => setTheme("default")}
                    />

                    <ArrowButton
                        text="Deutéranomalie"
                        onClick={() => setTheme("deuteranomalie")}
                    />

                    <div></div>
                </div>
                <div className="flex flex-row justify-between">
                    <div></div>

                    <ArrowButton
                        text="Monochrome"
                        onClick={() => setTheme("monochrome")}
                    />

                    <ArrowButton
                        text="Protanomalie"
                        onClick={() => setTheme("protanomalie")}
                    />

                    <div></div>
                </div>
            </div> */}
      <div className='p-5 bg-white border-b'>
        <SwitcherComponent
          checked={accessibility}
          onToggle={onToggleAccessibility}
          type='switcher'
          classname='flex-row py-5 items-center text-center justify-center space-y-0'
        >
          <div className='flex items-center flex-grow space-x-2.5'>
            <IconAccessibility />
            <span className='text-sm font-medium text-color-primary'>
              Passer en mode accessibilité renforcée
            </span>
          </div>
        </SwitcherComponent>
      </div>
      <DownloadPwa />
    </div>
  );
}
