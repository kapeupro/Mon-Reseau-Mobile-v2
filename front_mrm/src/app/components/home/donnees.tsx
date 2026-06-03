import React from 'react';
import Title from '@/app/components/title';
import Territory from '@/app/components/territory';
import { useTerritoryStore } from '@/store/filter';
import { useMapStore } from '@/store/map';
import { resetScroll, isMobile } from '@/service/window';
import { useCoordStore, useSelectionStore } from '@/store/selectedCoordStore';
import { useTranslations } from 'next-intl';
import { twMerge } from 'tailwind-merge';

interface DonneesProps {
  classTitle?: string;
}

export default function Donnees({ classTitle }: DonneesProps) {
  const { setTerritory } = useTerritoryStore();
  const translations = useTranslations('home');
  const { setExtent } = useMapStore();
  const { selectTerritoire } = useCoordStore();
  const { setIsSelect } = useSelectionStore();

  const bMobile = isMobile();

  const onClickTerritory = (data: any) => {
    setTerritory(data);
    selectTerritoire(data);
    setIsSelect(true);
    setExtent(data.extent);
    resetScrollInMobile();
  };

  const resetScrollInMobile = () => {
    if (bMobile) {
      resetScroll();
    }
  };

  return (
    <div className={twMerge('')}>
      <Title
        className={twMerge('text-color-primary', classTitle)}
        text={translations('dataTitle')}
        underline={false}
      />
      <Territory onClickTerritory={onClickTerritory} />
    </div>
  );
}
