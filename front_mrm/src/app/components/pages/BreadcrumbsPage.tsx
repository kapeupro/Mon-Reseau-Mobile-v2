import React, { useEffect } from 'react';
import BreadcrumbsComponent from '@/app/components/breadcrumbs';
import { useFilterStore, useTerritoryStore } from '@/store/filter';
import { isMobile, resetScroll } from '@/service/window';
import HomeIcon from '@/assets/icons/home.svg';
import { useCoordStore, useSelectionStore } from '@/store/selectedCoordStore';
import { useMapStore, useMapTerritoryStore } from '@/store/map';
import { usePageStore } from '@/store/store';
import { useShowFilterSearch } from '@/store/togglePanel';
import { useFilesArianeStore } from '@/store/ariane';
import { clearMapVectorTerritory } from '@/app/components/map/drawMap/utils';
import ImageDepartement from '@/app/components/ImageDepartement';
import { isTransport } from '@/app/components/territoire/train_elements/utils';

import Car from '@/assets/icons/car.svg';
import Train from '@/assets/icons/train.svg';
import Region from '@/assets/icons/region.svg';
import Commune from '@/assets/icons/commune.svg';
import PointAdresse from '@/assets/icons/icon_point_adresse.svg';

export default function BreadcrumbsPage() {
  const IsMobile = isMobile();
  const { territory } = useTerritoryStore();
  const { selectedTerritoire, selectTerritoire } = useCoordStore();
  const { setTerritorySearch } = useMapTerritoryStore();
  const { setIsSelect } = useSelectionStore();
  const { setPage } = usePageStore();
  const { setShowPanelSearch } = useShowFilterSearch();
  const { resetFilter } = useFilterStore();
  const { filesAriane, setFilesAriane } = useFilesArianeStore();

  const clearMap = () => {
    const { oMap } = useMapStore.getState();
    clearMapVectorTerritory(oMap);
  };

  const getTypeTerritory = (territoire: any) => {
    if (!territoire || !territoire.entite) {
      return '';
    }

    const entite = territoire.entite;
    if (entite === 'Région') {
      return 'region';
    } else if (entite === 'Département') {
      return 'departement';
    } else if (entite === 'Commune') {
      return 'commune';
    } else if (entite === 'Adresse') {
      return 'adresse';
    } else if (entite === 'Train') {
      return 'train';
    } else if (entite === 'Route') {
      return 'route';
    }
    return '';
  };

  const handleSelect = (territoire: any) => {
    const { filesAriane: file } = useFilesArianeStore.getState();
    const index = file.findIndex(
      (item: any) =>
        item.text === territoire.nom || item.text === territoire.label
    );
    if (index !== -1) {
      let updatedBreadcrumbItems;
      if (index === 1) {
        updatedBreadcrumbItems = file.slice(0, 2);
      } else {
        updatedBreadcrumbItems = file.slice(0, index + 1);
      }
      const { setFilesAriane: setFilesArianeUpdated } =
        useFilesArianeStore.getState();
      setFilesArianeUpdated(updatedBreadcrumbItems);
    }
    if (territoire && territoire.coordinates) {
      const territoryParams = {
        extent: getExtent(territoire),
        valueIdent: getValueIdent(territoire),
        typeterritory: isTransport(territoire)
          ? getTypeTerritory(territoire)
          : territoire.type,
      };

      setTerritorySearch(territoryParams);
      selectTerritoire(territoire);
      setShowPanelSearch(false);
      if (selectedTerritoire) {
        setIsSelect(true);
      }
      resetFilter();

      if (IsMobile) {
        resetScroll();
      }
    } else if (territoire && territoire.extent) {
      const extent = {
        minx: territoire.extent.minx,
        maxx: territoire.extent.maxx,
        miny: territoire.extent.miny,
        maxy: territoire.extent.maxy,
      };

      const territoryParams = {
        extent: extent,
        valueIdent: getValueIdent(territoire),
        typeterritory: getTypeTerritory(territoire),
      };

      setTerritorySearch(territoryParams);
      selectTerritoire(territoire);
      setShowPanelSearch(false);
      clearMap();
      if (selectedTerritoire) {
        setIsSelect(true);
      }
      resetFilter();

      if (IsMobile) {
        resetScroll();
      }
    }
  };

  const getValueIdent = (territoire: any) => {
    if (!territoire) {
      return '';
    }
    if (territoire.type === 'region') {
      return territoire.properties.insee_reg;
    }
    if (territoire.type === 'departement') {
      return territoire.properties.insee_dep;
    }
    if (territoire.type === 'commune' || territoire.type === 'adresse') {
      return territoire.properties.insee_com;
    }
    if (territoire.type === 'train' || territoire.type === 'route') {
      return territoire.properties.axis;
    }
    return '';
  };

  const getIconRender = (item: any) => {
    let iconToRender;

    if (item.entite === 'Département' || item.type === 'departement') {
      iconToRender = (
        <ImageDepartement
          departementCode={
            selectedTerritoire.insee_dep ||
            selectedTerritoire.properties.insee_dep
          }
          className='h-7 w-7'
        />
      );
    } else if (item.entite === 'Commune' || item.type === 'commune') {
      iconToRender = <Commune />;
    } else if (item.entite === 'Région' || item.type === 'region') {
      iconToRender = <Region />;
    } else if (item.entite === 'Adresse' || item.type === 'adresse') {
      iconToRender = <PointAdresse />;
    } else if (item.entite === 'Train' || item.type === 'train') {
      iconToRender = <Train />;
    } else if (item.entite === 'Route' || item.type === 'route') {
      iconToRender = <Car />;
    } else {
      iconToRender = (
        <ImageDepartement departementCode={item.dept} className='h-7 w-7' />
      );
    }
    return iconToRender;
  };

  const BreadcrumbItems: any[] = [
    {
      text: '',
      iconHome: <HomeIcon />,
      onClick: () => setPage('home'),
    },
  ];

  if (!isTransport()) {
    BreadcrumbItems.push({
      text: territory.label,
      onClick: () => handleSelect(territory),
      icon: getIconRender(territory),
    });
  }

  useEffect(() => {
    if (selectedTerritoire?.ariane) {
      let breadcrumbInselectedTerritoire = [];
      if (Array.isArray(selectedTerritoire.ariane)) {
        const aArianes = [...selectedTerritoire.ariane];
        if (isTransport(selectedTerritoire)) {
          aArianes.push(selectedTerritoire);
        }
        const nonMatchingItems = aArianes.filter(
          (item: any) => item.nom != territory.label
        );

        breadcrumbInselectedTerritoire = nonMatchingItems.map((item: any) => ({
          text: item.nom,
          onClick: () => handleSelect(item),
          icon: getIconRender(item),
          url: item.url,
        }));
      } else if (territory.label != selectedTerritoire.properties.nom) {
        breadcrumbInselectedTerritoire.push({
          text: isTransport(selectedTerritoire)
            ? selectedTerritoire.nom
            : selectedTerritoire.properties.nom,
          onClick: () => handleSelect(selectedTerritoire),
          icon: getIconRender(selectedTerritoire),
          url: selectedTerritoire.url,
        });
      }
      const AllBreadcrumbItems = [
        ...BreadcrumbItems,
        ...breadcrumbInselectedTerritoire,
      ];
      setFilesAriane(AllBreadcrumbItems);
    } else if (territory && selectedTerritoire?.label && territory.label) {
      setFilesAriane(BreadcrumbItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTerritoire, setFilesAriane]);

  return <>{!IsMobile && <BreadcrumbsComponent items={filesAriane} />}</>;
}

function getExtent(territoire: any) {
  if (!isTransport(territoire)) {
    return {
      minx: territoire.coordinates.minx,
      maxx: territoire.coordinates.maxx,
      miny: territoire.coordinates.miny,
      maxy: territoire.coordinates.maxy,
    };
  }

  if (territoire.level !== 3 || !Object.keys(territoire.coordinates).length) {
    return undefined;
  }

  return {
    minx: territoire.coordinates.xmin,
    maxx: territoire.coordinates.xmax,
    miny: territoire.coordinates.ymin,
    maxy: territoire.coordinates.ymax,
  };
}
