import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/navigation';

import IconSearch from '@/assets/icons/search.svg';
import IconArrowBack from '@/assets/icons/arrow_back.svg';
import IconMenu from '@/assets/icons/menu.svg';
import IconCaretLeft from '@/assets/icons/caret_left.svg';
import IconCross from '@/assets/icons/Cross.svg';

import { isMobile } from '../../service/window';
import Icon from '@/app/components/iconcmp';
import Search from './search';
import { useCoordStore, useSelectionStore } from '@/store/selectedCoordStore';
import { useShowFilterSearch } from '@/store/togglePanel';
import ButtonInfo from './buttonTerritoireSelected';
import { useFilterStore } from '@/store/filter';
import { useNavigationStore } from '@/store/navigation';
import {
  usePageStore,
  useCountNavigationStore,
  useHomeMenuStore,
} from '@/store/store';

interface SearchBarProps {
  active?: boolean;
  className?: any;
  isIcon?: boolean;
  placholder?: string;
}

export default function SearchBar({
  active = false,
  className,
  isIcon = true,
  placholder = 'Rechercher une adresse, territoire',
}: SearchBarProps) {
  const classSearchBar = 'fixed w-[calc(100vw-50px)] mt-5 mx-5';
  const { showSearchPanel, setShowPanelSearch } = useShowFilterSearch();
  const { resetFilter } = useFilterStore();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [text, setText] = useState('');
  const { selectedTerritoire } = useCoordStore();
  const [debouncedText, setDebouncedText] = useState(text);
  const { filter } = useFilterStore();
  const { isSelect, setIsSelect } = useSelectionStore();
  const router = useRouter();
  const { count: countNavigation, decrementCount } = useCountNavigationStore();
  const { page: activePage, setPage } = usePageStore();
  const { show: showHomeMenu, setShow: setShowHomeMenu } = useHomeMenuStore();

  const IsMobile = isMobile();

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setDebouncedText(text);
    }, 500); // Définir le délai souhaité en millisecondes (par exemple, 300 ms)

    return () => clearTimeout(debounceTimeout);
  }, [text]);

  const clearInput = () => {
    setText('');
  };

  const firstIconInput = active ? <IconArrowBack /> : <IconSearch />;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  useEffect(() => {
    if (inputRef.current && showSearchPanel) {
      inputRef.current.focus();
    }
  }, [filter, showSearchPanel]);

  const openFilters = () => {
    setShowPanelSearch(true);
  };

  const focushandler = () => {
    if (selectedTerritoire) {
      setText(selectedTerritoire.properties?.nom || selectedTerritoire.label);
    }
    setIsSelect(false);
  };

  const closeFilters = () => {
    setShowPanelSearch(false);
    if (selectedTerritoire) {
      setIsSelect(true);
    }
    setText('');
    resetFilter();
  };
  // console.log("ato", className.buttonBack, className)

  const onClickBackButton = () => {
    router.back();
    decrementCount();
  };

  let classShowPanel = '';
  if (!IsMobile && showSearchPanel) {
    classShowPanel = 'top-16';
  }

  const getClassNameButtonInfo = () => {
    if (!showSearchPanel && countNavigation !== 0) {
      return '';
    }

    return IsMobile ? ' left-14 ' : ' left-9 ';
  };
  return (
    <>
      <div
        className={twMerge(
          'flex justify-center items-center space-x-2 mt-5 mx-5 z-[7]',
          classSearchBar,
          className?.main,
          classShowPanel,
          showHomeMenu ? 'hidden' : ''
        )}
      >
        {!showSearchPanel && countNavigation !== 0 && (
          <button onClick={onClickBackButton}>
            <Icon
              icon={<IconCaretLeft />}
              width={40}
              shadow
              className={twMerge('bg-white', className?.buttonBack)}
            />
          </button>
        )}
        <div
          className={twMerge(
            'flex justify-center  items-end  w-full rounded-2xl bg-white p-3 space-x-2 shadow',
            showSearchPanel ? '' : className?.search
          )}
        >
          {showSearchPanel ? (
            <IconArrowBack onClick={() => closeFilters()} />
          ) : (
            <Icon icon={firstIconInput} onClick={() => openFilters()} />
          )}
          <input
            type='text'
            data-test='search-bar'
            value={text}
            ref={inputRef}
            onFocus={() => focushandler()}
            onClick={() => openFilters()}
            onChange={handleInputChange}
            placeholder={selectedTerritoire ? '' : placholder}
            className={twMerge(
              'grow outline-none  placeholder:text-color-primary-500 truncate',
              className?.input
            )}
          />
          {selectedTerritoire && isSelect && (
            <ButtonInfo
              className={twMerge(
                className?.inputSelected,
                getClassNameButtonInfo()
              )}
            />
          )}
          {text && (
            <button
              onClick={clearInput}
              className='absolute top-1 right-16 md:right-3 m-2 text-gray-600 hover:text-gray-800'
            >
              <IconCross className=''></IconCross>
            </button>
          )}
          {isIcon && (
            <Icon
              icon={
                <IconMenu
                  onClick={() => setShowHomeMenu(true)}
                  className='cursor-pointer'
                />
              }
              className='pl-1 border-l focus:bg-opacity-50 border-stone-20'
            />
          )}
        </div>
      </div>
      {showSearchPanel && (
        <Search text={debouncedText} closeFilter={closeFilters} />
      )}
    </>
  );
}
