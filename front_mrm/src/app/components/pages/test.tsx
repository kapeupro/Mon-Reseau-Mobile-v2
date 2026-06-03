import React from 'react';

import TestFullPage from '@/app/components/testQualite/index';
import EmplacementTest from '@/app/components/pages/subPages/qualitytest/emplacement_test';
import { useTestSubPagesStore } from '@/store/qualityTest';
import TransportTrain from '@/app/components/territoire/transportTrain';
import TransportRoute from '@/app/components/territoire/transportRoute';
import BreadcrumbsPage from '@/app/components/pages/BreadcrumbsPage';
import TitlePage from '@/app/components/titlePage';
import { isTrain } from '@/utils/activeEntite';
import { useCoordStore } from '@/store/selectedCoordStore';
import { useFilesArianeStore } from '@/store/ariane';
import IconArrowBack from '@/assets/icons/arrow_back.svg';
import { isLevelOne } from '@/app/components/territoire/train_elements/utils';
import { useTerritoryByUrlStore } from '@/store/filter';

export default function Test() {
  const { subPage } = useTestSubPagesStore();
  const { selectedTerritoire } = useCoordStore();
  const { isLoaded: isLoadedTerritory } = useTerritoryByUrlStore();

  if (!isLoadedTerritory) {
    return null;
  }

  return (
    <>
      {['Train', 'Route'].includes(selectedTerritoire?.entite) &&
      subPage === '' ? (
        <div className='relative  rounded-2xl w-full  px-3 pb-3'>
          <Transport />
        </div>
      ) : (
        <Qos subPage={subPage} />
      )}
    </>
  );
}

function Qos({ subPage }: Readonly<{ subPage: string }>) {
  return (
    <>
      {subPage === '' && (
        <div className='relative  rounded-2xl w-full pt-12 px-5 pb-3'>
          <TestFullPage />
        </div>
      )}
      {subPage === 'emplacement_test' && <EmplacementTest />}
    </>
  );
}

function Transport() {
  const { selectedTerritoire } = useCoordStore();
  return (
    <div className='flex flex-col pt-8 gap-5'>
      <BreadcrumbsPage />
      <div className='flex space-x-2 items-center text-color-primary'>
        <Back />
        <TitlePage
          text={selectedTerritoire?.properties?.title}
          underline={false}
        />
      </div>
      {isTrain() ? <TransportTrain /> : <TransportRoute />}
    </div>
  );
}

function Back() {
  const { filesAriane, setFilesAriane } = useFilesArianeStore();

  const onClickBackButton = () => {
    const { selectedTerritoire, selectTerritoire } = useCoordStore.getState();

    if (isLevelOne()) {
      selectTerritoire(null, false);
      setFilesAriane([]);
      return;
    }

    const index = filesAriane.findIndex(
      (item: any) => item.text === selectedTerritoire.nom
    );

    if (index === -1) {
      return;
    }

    const prevIndex = index - 1;
    if (prevIndex >= 0 && filesAriane.length > prevIndex) {
      const prevData = filesAriane[prevIndex];
      prevData.onClick();
    }
  };

  return (
    <button onClick={onClickBackButton}>
      <IconArrowBack />
    </button>
  );
}
