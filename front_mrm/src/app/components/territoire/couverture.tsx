import React, { useEffect } from 'react';

import MoonLoader from 'react-spinners/MoonLoader';

import Title from '@/app/components/title';
import NetworkLevelGrid from '@/app/components/netWorkLevelGrid';

import ButtonServices from '@/app/components/territoire/couverture_elements/buttonServices';

import { useOperatorsStore } from '@/store/operators';
import { useServiceCouvTerritory } from '@/store/serviceCouvTerritory';
import { useStatCouvTerritoryStore } from '@/store/stat';
import { useTerritoryCouvertureState } from '@/store/couverture';
import { useCoordStore } from '@/store/selectedCoordStore';

import { getStatCouverture } from '@/service/territory';

import { getLabelEntite, isAdresse } from '@/utils/activeEntite';
import { getTitleTerritoire } from '@/utils/titleTerritoire';
import { getCurrentInsee } from '@/utils/currentInsee';
import { isLoadingOperators } from '@/utils/utils';

export default function Couverture() {
  const { selectedTerritoire } = useCoordStore();
  const { operators: listOperators } = useOperatorsStore();
  const { selectedServiceCouvTerritory } = useServiceCouvTerritory();
  const { statCouvTerritory, setStatCouvTerritory } =
    useStatCouvTerritoryStore();
  const { loadingCouverture, setloadingCouverture } =
    useTerritoryCouvertureState();

  useEffect(() => {
    const fetchData = async () => {
      setloadingCouverture(true);
      const listOperator = [...listOperators].map((op: any) => {
        return op.identifiant;
      });
      try {
        const data = await getStatCouverture({
          id: getCurrentInsee(),
          operators: listOperator.join(',').toUpperCase(),
          service: selectedServiceCouvTerritory,
          entite: getLabelEntite(),
          x:
            selectedTerritoire.coordinates?.xmin ??
            selectedTerritoire.extent?.minx,
          y:
            selectedTerritoire.coordinates?.ymin ??
            selectedTerritoire.extent?.miny,
        });
        setStatCouvTerritory(data);
      } catch (error) {
        console.error("Une erreur s'est produite : ", error);
      }
      setloadingCouverture(false);
    };

    if (!isLoadingOperators()) {
      fetchData();
    }
  }, [
    listOperators,
    setStatCouvTerritory,
    selectedServiceCouvTerritory,
    setloadingCouverture,
    selectedTerritoire,
  ]);

  const title = isAdresse()
    ? 'Couverture du point par technologie et opérateurs'
    : 'Part de population très bien couverte :';

  return (
    <div className='flex flex-col gap-5'>
      <ButtonServices className='flex justify-center items-center' />
      <div className='flex flex-col gap-1'>
        <Title
          text={title}
          className='text-md text-black mb-0'
          underline={false}
        />
        <Title
          text={getTitleTerritoire()}
          underline={false}
          className='text-sm text-color-secondary'
        />
      </div>

      {loadingCouverture ? (
        <div className='flex items-center justify-center'>
          <MoonLoader color='#232253' loading={loadingCouverture} size={150} />
        </div>
      ) : (
        <NetworkLevelGrid
          type={isAdresse() ? 'triangle' : 'rectangle'}
          data={statCouvTerritory}
        />
      )}
    </div>
  );
}
