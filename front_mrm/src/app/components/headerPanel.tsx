import React from 'react';
import LogoArcep from '@/assets/logoArcep.png';
import IconMenu from '@/assets/icons/menu.svg';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useShowFilterSearch } from '@/store/togglePanel';
import SearchBar from './searchBar';
import { usePageStore, useHomeMenuStore } from '@/store/store';

export default function HeaderPanel() {
  const translations = useTranslations('home');
  const { showSearchPanel, setShowPanelSearch } = useShowFilterSearch();
  const translationsSearch = useTranslations('search');
  const { setPage } = usePageStore();
  const { setShow: setShowHomeMenu } = useHomeMenuStore();
  const classNameSearch = {
    search: ' transition-all duration-300  w-20 md:w-full',
    buttonBack: `hidden`,
    main: showSearchPanel
      ? 'absolute top-0 left-4 w-4/5'
      : 'absolute top-16 left-4 w-4/5',
    inputSelected: 'left-12',
  };

  const goHome = () => {
    setPage('home');
    setShowPanelSearch(false);
  };

  return (
    <div className='sticky top-0 z-[6] bg-secondary w-full flex px-10 gap-0 h-28 pb-7 shadow'>
      <div className='flex items-center m-auto h-12'>
        <IconMenu
          onClick={() => setShowHomeMenu(true)}
          className='cursor-pointer'
        ></IconMenu>
      </div>
      <div className='m-auto h-12 '>
        <Image
          alt='LogoArcep'
          src={LogoArcep}
          className='w-auto h-12 cursor-pointer'
          onClick={goHome}
        />
      </div>
      <div className='flex items-center'>
        <div
          className=' px-4 text-secondary-text font-title font-semibold text-lg border-l-2 border-gray-500 cursor-pointer'
          data-test='title-home'
          onClick={goHome}
        >
          {translations('title')}
        </div>
      </div>
      <SearchBar
        className={classNameSearch}
        isIcon={false}
        placholder={translationsSearch('placeholder')}
      />
    </div>
  );
}
