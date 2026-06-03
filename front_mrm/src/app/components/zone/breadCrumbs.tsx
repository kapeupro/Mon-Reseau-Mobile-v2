import React from 'react';

import BreadcrumbsComponent from '@/app/components/breadcrumbs';

import { usePageStore } from '@/store/store';
import { useZoneSubPagesStore } from '@/store/zone';
import { useZacStore } from '@/store/zone';

import HomeIcon from '@/assets/icons/home.svg';

export default function BreadcrumbsZone() {
  const { setPage } = usePageStore();
  const { setSubPage, subPage } = useZoneSubPagesStore();
  const { data_zac } = useZacStore();

  const data_zac_properties = data_zac ? data_zac.data.properties : false;
  const data_zac_nom_dossier = data_zac_properties
    ? data_zac_properties.nom_dossier
        .split(/(\s|-)/)
        .map(
          (segment: string) =>
            segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase()
        )
        .join('')
    : '';

  const setPages = () => {
    setPage('home');
    setSubPage('');
  };

  const aItems = [
    {
      iconHome: <HomeIcon />,
      onClick: () => setPages(),
    },
    {
      text: 'Zone à couvrir',
      onClick: () => setSubPage(''),
    },
    {
      text: data_zac_nom_dossier,
      onClick: () => setSubPage('zone_info'),
    },
  ];

  if (subPage === 'zone_site') {
    aItems.push({
      text: 'Support',
      onClick: () => setSubPage('zone_support'),
    });
  }

  return <BreadcrumbsComponent items={aItems} />;
}
