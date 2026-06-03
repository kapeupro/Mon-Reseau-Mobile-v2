import React from 'react';

import BreadcrumbsComponent from '@/app/components/breadcrumbs';

import { usePageStore } from '@/store/store';
import {
  useAntenneSubPagesStore,
  useClickedFromTerritoryStore,
} from '@/store/antenne';

import Home from '@/assets/icons/home.svg';

export default function Breadcrumbs() {
  const { setPage } = usePageStore();
  const { setSubPage } = useAntenneSubPagesStore();
  const { setIsClickedFromTerritory } = useClickedFromTerritoryStore();

  const setPages = () => {
    setPage('home');
    setSubPage('');
    setIsClickedFromTerritory(false);
  };

  const clickAntenne = () => {
    setSubPage('');
    setIsClickedFromTerritory(false);
  };

  const BreadcrumbItems = [
    {
      iconHome: <Home />,
      onClick: () => setPages(),
    },
    {
      text: 'Antennes et déploiements',
      onClick: () => clickAntenne(),
    },
    {
      text: '',
    },
  ];

  return (
    <>
      <BreadcrumbsComponent items={BreadcrumbItems} />
    </>
  );
}
