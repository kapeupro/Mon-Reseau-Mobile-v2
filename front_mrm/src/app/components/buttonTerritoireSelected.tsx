import React from 'react';

import { twMerge } from 'tailwind-merge';

import ImageDepartement from '@/app/components/ImageDepartement';

import Car from '@/assets/icons/car.svg';
import Region from '@/assets/icons/region.svg';
import Commune from '@/assets/icons/commune.svg';
import IconCross from '@/assets/icons/Cross.svg';
import PointAdresse from '@/assets/icons/icon_point_adresse.svg';

import { useCoordStore } from '@/store/selectedCoordStore';
import { useFilesArianeStore } from '@/store/ariane';
import { isTransport } from '@/utils/activeEntite';
import { getIconTrain } from './searchResult';
import { isMobile } from '@/service/window';
import { useSearchStore } from '@/store/search';

interface InfoProps {
  title?: string;
  className?: string;
}

export default function ButtonInfo({ title, className }: InfoProps) {
  const { selectedTerritoire, selectTerritoire } = useCoordStore();
  const { setFilesAriane } = useFilesArianeStore();
  const { setSelectedData } = useSearchStore();
  const IsMobile = isMobile();

  const clearSelectedTerritoire = () => {
    selectTerritoire(null);
    setFilesAriane([]);
    setSelectedData(false);
  };

  let iconToRender;

  if (
    selectedTerritoire.entite === 'Département' ||
    selectedTerritoire.type === 'departement'
  ) {
    iconToRender = (
      <ImageDepartement
        departementCode={
          selectedTerritoire.insee_dep ||
          selectedTerritoire.properties.insee_dep
        }
        className='h-7 w-7'
      />
    );
  } else if (
    selectedTerritoire.entite === 'Commune' ||
    selectedTerritoire.type === 'commune'
  ) {
    iconToRender = <Commune />;
  } else if (
    selectedTerritoire.entite === 'Région' ||
    selectedTerritoire.type === 'region'
  ) {
    iconToRender = <Region />;
  } else if (
    selectedTerritoire.entite === 'Adresse' ||
    selectedTerritoire.type === 'adresse' ||
    selectedTerritoire.entite === 'Localisation' ||
    selectedTerritoire.type === 'localisation'
  ) {
    iconToRender = <PointAdresse />;
  } else if (
    selectedTerritoire.entite === 'Train' ||
    selectedTerritoire.type === 'train'
  ) {
    iconToRender = getIconTrain(selectedTerritoire);
  } else if (
    selectedTerritoire.entite === 'Route' ||
    selectedTerritoire.type === 'route'
  ) {
    iconToRender = <Car />;
  } else {
    iconToRender = (
      <ImageDepartement
        departementCode={selectedTerritoire.dept}
        className='h-7 w-7'
      />
    );
  }

  let textToDisplay;

  if (selectedTerritoire.properties?.nom) {
    if (isTransport()) {
      textToDisplay = selectedTerritoire?.properties?.selected_title;
    } else if (
      selectedTerritoire.entite === 'Adresse' ||
      selectedTerritoire.type === 'adresse' ||
      selectedTerritoire.entite === 'Localisation' ||
      selectedTerritoire.type === 'localisation'
    ) {
      textToDisplay = selectedTerritoire.properties.label_adress;
    } else {
      textToDisplay = selectedTerritoire.properties.nom;
    }
  } else {
    textToDisplay = selectedTerritoire.label;
  }

  return (
    <div
      className={twMerge(
        'absolute flex top-1.5 left-28 h-[35px] py-2.5 px-2 rounded-full text-center bg-stone-20 items-center text-bg-secondary-text',
        className
      )}
    >
      {iconToRender}
      <span
        className={`flex flex-col px-1 text-left xl:text-left text-bg-secondary-text whitespace-nowrap text-ellipsis overflow-hidden ${
          IsMobile ? 'max-w-[100px]' : 'max-w-[200px]'
        }`}
      >
        {textToDisplay}
      </span>
      <button onClick={clearSelectedTerritoire} className='pt-0.5'>
        <IconCross className=''></IconCross>
      </button>
    </div>
  );
}
