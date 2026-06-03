import React from 'react';
import Button from './button';
import Home from '@/assets/home.svg';
import { usePageStore } from '@/store/store';
import { isMobile } from '../../service/window';
import { twMerge } from 'tailwind-merge';
import { useTogglePanelStore } from '@/store/togglePanel';
import { useCoordStore } from '@/store/selectedCoordStore';
import { useTranslations } from 'next-intl';
import {
  useSuperpositionStore,
  useThemesStore,
  usePageSuperpositionStore,
} from '@/store/superposition';
import { useClickedFromTerritoryStore } from '@/store/antenne';
import IconStack from '@/assets/icons/stack.svg';

interface ThematiqueBarProps {
  active?: boolean;
  className?: string;
}

export default function ThematiqueBar({
  className = '',
}: Readonly<ThematiqueBarProps>) {
  const { showPanel } = useTogglePanelStore();
  const { page: activePage, setPage: handleChangeThematique } = usePageStore();
  const { selectedTerritoire } = useCoordStore();
  const couvertureTranslation = useTranslations('couverture');
  const zoneTranslation = useTranslations('zone');
  const testTranslation = useTranslations('test');
  const antenneTranslation = useTranslations('antenne');
  const signalementTranslation = useTranslations('signalement');
  const { isActive: bShowSuperposition } = useSuperpositionStore();
  const { themes: aThemesSuperposition } = useThemesStore();
  const { setIsClickedFromTerritory } = useClickedFromTerritoryStore();
  const { page: activePageSuperposition, setPage: setActivePageSuperposition } =
    usePageSuperpositionStore();

  const aMenu = [
    {
      text: couvertureTranslation('title'),
      title: 'couverture-theorique',
    },
    {
      text: testTranslation('title'),
      title: 'qualite-reseau',
    },
    {
      text: antenneTranslation('title'),
      title: 'antennes-deploiements',
    },
    {
      text: zoneTranslation('title'),
      title: 'zones-a-couvrir',
    },
    {
      text: signalementTranslation('reportingTitle'),
      title: 'signalements',
    },
  ];
  //todo test https://www.npmjs.com/package/tailwind-scrollbar
  //scrollbar:!w-1 scrollbar:!h-1 scrollbar-track:!bg-slate-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-slate-300
  // const handleChangeThematique = (event:any) => {
  //   console.log(event.target.title)
  // }

  const onChangeThematique = (label: string) => {
    if (bShowSuperposition) {
      setActivePageSuperposition(label);
    } else {
      handleChangeThematique(label);
    }
    setIsClickedFromTerritory(false);
  };

  let classThematique = 'fixed mt-20 z-[6] w-full';
  if (!isMobile()) {
    classThematique =
      'transition duration-300 ease-in-out ' +
      (showPanel
        ? 'fixed mt-5 z-[4] w-[calc(100vw-480px)] translate-x-120'
        : 'fixed mt-5 z-[4] w-[calc(100vw-20px)] translate-x-0');
  }

  const bActiveTerritory = isActiveMenu(
    'territory',
    activePage,
    bShowSuperposition,
    activePageSuperposition
  );

  return (
    <div className={classThematique}>
      <div
        className={twMerge(
          'flex  overflow-hidden hover:overflow-auto overflow-x-auto w-full',
          className
        )}
        data-test='data-set-buttons'
      >
        <Button
          onClick={() => onChangeThematique('home')}
          className='ml-5 pt-[7px] shadow mb-1'
          active={isActiveMenu(
            'home',
            activePage,
            bShowSuperposition,
            activePageSuperposition
          )}
        >
          <Home />
        </Button>
        {selectedTerritoire &&
          !['train', 'route'].includes(
            selectedTerritoire?.entite?.toLowerCase()
          ) && (
            <MenuTerritory
              bActive={bActiveTerritory}
              bSecondaryActiveMenuSuperposition={isSecondaryActiveMenuSuperposition(
                'territory',
                activePage,
                aThemesSuperposition,
                bActiveTerritory,
                bShowSuperposition
              )}
              bShowSuperposition={bShowSuperposition}
              onChangeThematique={onChangeThematique}
            />
          )}
        {aMenu.map((menu) => {
          const title = menu.title;
          const bActive = isActiveMenu(
            title,
            activePage,
            bShowSuperposition,
            activePageSuperposition
          );

          const bSecondaryShowSuperposition =
            isSecondaryActiveMenuSuperposition(
              title,
              activePage,
              aThemesSuperposition,
              bActive,
              bShowSuperposition
            );

          let classNameStr = 'pt-[6px] shadow mb-1 ';
          if (bSecondaryShowSuperposition) {
            classNameStr += 'bg-purple-20';
          }

          return (
            <Button
              key={title}
              onClick={(e: any) => {
                onChangeThematique(title);
              }}
              className={classNameStr}
              active={bActive}
            >
              <div className='flex'>
                {bShowSuperposition &&
                  (bActive || bSecondaryShowSuperposition) && (
                    <IconStack className='mr-1' />
                  )}
                {menu.text}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function isActiveMenu(
  name: string,
  activePage: string,
  bShowSuperposition: boolean,
  activePageSuperposition: string | undefined
) {
  let bActive = name === activePage;

  if (!bShowSuperposition) {
    return bActive;
  }

  return activePageSuperposition ? activePageSuperposition === name : bActive;
}

function isSecondaryActiveMenuSuperposition(
  name: string,
  activePage: string,
  aThemesSuperposition: any,
  isActive: boolean,
  bShowSuperposition: boolean
) {
  if (!bShowSuperposition || isActive) {
    return false;
  }

  if (activePage === name) {
    return true;
  }

  const aFilteredThemesSuperposition = aThemesSuperposition.filter(
    (theme: any) => theme.name === name
  );

  if (!aFilteredThemesSuperposition.length) {
    return false;
  }

  return aFilteredThemesSuperposition[0].bSuperposer;
}

function MenuTerritory({
  onChangeThematique,
  bActive,
  bSecondaryActiveMenuSuperposition,
  bShowSuperposition,
}: Readonly<{
  onChangeThematique: any;
  bActive: boolean;
  bSecondaryActiveMenuSuperposition: boolean;
  bShowSuperposition: boolean;
}>) {
  return (
    <Button
      onClick={() => onChangeThematique('territory')}
      className={`pt-[6px] shadow mb-1 ${
        bSecondaryActiveMenuSuperposition ? 'bg-purple-20' : ''
      }`}
      active={bActive}
    >
      <div className='flex'>
        {bShowSuperposition && <IconStack className='mr-1' />}
        Aperçu
      </div>
    </Button>
  );
}
