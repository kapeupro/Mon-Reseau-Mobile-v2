import React, { useRef, useState, useEffect } from 'react';

import { twMerge } from 'tailwind-merge';

import Icon from '@/app/components/iconcmp';
import ImageDepartement from '@/app/components/ImageDepartement';

import { aTerritoryFilter, aTransportFilter } from '@/app/constant/search';

import Region from '@/assets/icons/region.svg';
import Commune from '@/assets/icons/commune.svg';
import IconLeft from '@/assets/icons/iconLeft.svg';
import IconCaretLeft from '@/assets/icons/caret_left.svg';
import Train from '@/assets/icons/train.svg';
import IconMetro from '@/assets/icons/metros.svg';
import IconRer from '@/assets/icons/rer.svg';
import IconTgv from '@/assets/icons/tgv.svg';
import Car from '@/assets/icons/car.svg';
import PointAdresse from '@/assets/icons/icon_point_adresse.svg';
import CircularProgress from '@/assets/icons/loading-circle.gif';

import { useFilterStore } from '@/store/filter';
import { useMapTerritoryStore } from '@/store/map';
import { useCoordStore, useSelectionStore } from '@/store/selectedCoordStore';
import { useOperatorsRouteStore } from '@/store/route';
import { useOperatorsTrainStore } from '@/store/train';
import { resetScroll, isMobile } from '@/service/window';
import { useOperatorsStore, getAllOperators } from '@/store/operators';
import * as turf from '@turf/turf';
import { useSearchStore } from '@/store/search';
import { getInfoSelectedData } from '@/service/search';
import { isMetropole } from '@/utils/utils';

interface SearchProps {
  className?: string;
  data?: any;
  closeFilter?: any;
  loading?: boolean;
  setLoading: any;
  textFilter?: string;
}

export default function SearchResult({
  className = '',
  data = [],
  closeFilter,
  loading,
  setLoading,
  textFilter = '',
}: Readonly<SearchProps>) {
  const { selectTerritoire } = useCoordStore();
  const { setIsSelect } = useSelectionStore();
  const { setTerritorySearch } = useMapTerritoryStore();
  const { filter, setFilter } = useFilterStore();
  const { selectedData, setSelectedData } = useSearchStore();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const bMobile = isMobile();

  const handleCategoryClick = (name: string) => {
    setFilter(name);
  };

  const getValueIdent = (territoire: any) => {
    if (!territoire || !territoire.properties) {
      return '';
    }
    if (getTypeTerritory(territoire) === 'region') {
      return territoire.properties.insee_reg;
    }
    if (getTypeTerritory(territoire) === 'departement') {
      return territoire.insee_dep;
    }
    if (
      getTypeTerritory(territoire) === 'commune' ||
      getTypeTerritory(territoire) === 'adresse'
    ) {
      return territoire.properties.insee_com;
    }
    if (
      getTypeTerritory(territoire) === 'train' ||
      getTypeTerritory(territoire) === 'route'
    ) {
      return territoire.properties.axis;
    }
    return '';
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

  const isAdresse = (territoire: any) => {
    return territoire.entite.toLowerCase() === 'adresse';
  };

  const getExtentForZoom = (territoire: any) => {
    if (isTransport(territoire) && territoire.level !== 3) {
      return undefined;
    }

    if (isAdresse(territoire)) {
      const bufferDistance = 0.5;
      const point = [territoire.coordinates.xmin, territoire.coordinates.ymin];
      const buffer = turf.buffer(turf.point(point), bufferDistance, {
        units: 'kilometers',
      });
      const bbox = turf.bbox(buffer);

      const extent = {
        minx: bbox[0],
        miny: bbox[1],
        maxx: bbox[2],
        maxy: bbox[3],
      };
      return extent;
    }
    const extent = {
      minx: territoire.coordinates.xmin,
      maxx: territoire.coordinates.xmax,
      miny: territoire.coordinates.ymin,
      maxy: territoire.coordinates.ymax,
    };
    return extent;
  };

  const handleSelect = (territoire: any) => {
    setLoading(true);
    setSelectedData(territoire);
  };

  const initStoreTransport = (territoire: any) => {
    if (!territoire || !territoire.entite) {
      return;
    }
    const { toggleOperators: toggleOperatorsTrain } =
      useOperatorsTrainStore.getState();
    const { toggleOperators: toggleOperatorsRoute } =
      useOperatorsRouteStore.getState();

    const { operators } = useOperatorsStore.getState();
    const entite = territoire.entite;
    const aIdsOperators = getAllOperators(operators);

    switch (entite) {
      case 'Train':
        toggleOperatorsTrain(aIdsOperators);
        break;

      case 'Route':
        toggleOperatorsRoute(aIdsOperators);
        break;
    }
  };

  const listCategory = getListSearchCategory();

  const showIconScrollRight = () => {
    if (!containerRef.current) {
      return true;
    }
    const container = containerRef.current;
    return scrollPosition + container.clientWidth !== container.scrollWidth;
  };

  const handleScroll = (direction: string) => {
    const container = containerRef.current;
    const step = container!.clientWidth; // Largeur d'un élément
    let curScrollPosition;

    if (direction === 'left') {
      curScrollPosition = Math.max(scrollPosition - step, 0);
    } else if (direction === 'right') {
      curScrollPosition = Math.min(
        scrollPosition + step,
        container!.scrollWidth - container!.clientWidth
      );
    }

    if (typeof curScrollPosition !== 'undefined') {
      container!.scrollTo({
        left: curScrollPosition,
        behavior: 'smooth',
      });
      setScrollPosition(curScrollPosition);
    }
  };

  useEffect(() => {
    if (!selectedData) {
      return;
    }

    const fetchInfoSelectedData = async () => {
      const info = await getInfoSelectedData({
        ...selectedData,
        textFilter,
      });
      if (!info) {
        return;
      }

      const extent = getExtentForZoom(info);
      const territoryParams = {
        extent: extent,
        valueIdent: getValueIdent(info),
        typeterritory: getTypeTerritory(info),
      };

      initStoreTransport(info);
      setTerritorySearch(territoryParams);
      selectTerritoire(info);
      setIsSelect(true);
      setLoading(false);
      closeFilter();

      if (bMobile) {
        resetScroll();
      }
    };

    fetchInfoSelectedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedData]);

  return (
    <div className={className} data-test='search-filter'>
      <div className='p-4 text-color-primary border-y-2'>
        {bMobile ? (
          <div className='flex gap-2 overflow-x-auto'>
            {listCategory.map((category) => {
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={twMerge(
                    'bg-transparent  text-color-primary border-[1.5px]  px-4 py-2',
                    'hover:bg-primary hover:text-white hover:border-transparent hover:shadow-md transition duration-300 ease-in-out',
                    'w-min rounded-full btn-btn-outline-primary',
                    filter === category.id ? 'bg-primary text-white' : ''
                  )}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div
            className='flex justify-start items-center overflow-x-auto gap-3 pt-8'
            ref={containerRef}
          >
            {scrollPosition > 0 && (
              <Icon
                icon={<IconCaretLeft />}
                width={20}
                shadow
                onClick={() => handleScroll('left')}
                className={
                  'bg-white absolute z-20 left-1 opacity-100 ml-2.5 shadow-scroll-left'
                }
              />
            )}
            {listCategory.map((category) => {
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={twMerge(
                    'bg-transparent  text-color-primary border-[1.5px]  px-4 py-2',
                    'hover:bg-primary hover:text-white hover:border-transparent hover:shadow-md transition duration-300',
                    'ease-in-out w-min rounded-full btn-btn-outline-primary',
                    filter === category.id ? 'bg-primary text-white' : ''
                  )}
                >
                  {category.label}
                </button>
              );
            })}
            {showIconScrollRight() && (
              <Icon
                icon={<IconCaretLeft />}
                width={20}
                shadow
                onClick={() => handleScroll('right')}
                className={
                  'bg-white transform rotate-180 absolute z-20 right-1 opacity-100 mr-2.5 shadow-scroll-right'
                }
              />
            )}
          </div>
        )}
      </div>
      <div className='md:h-[calc(100vh-315px)] h-screen overflow-y-scroll pb-60 md:pb-10'>
        {loading && data ? (
          <Icon
            icon={CircularProgress}
            className='flex justify-center items-center mt-7'
          ></Icon>
        ) : (
          <>
            {data.length > 0 ? (
              data.map((territoire: any, index: any) => (
                <div
                  key={index}
                  onClick={() => handleSelect(territoire)}
                  data-test={`search-result-${index + 1}`}
                  className='cursor-pointer'
                >
                  <div className='flex flex-row justify-between w-full p-2 gap-2 text-color-primary border-b-2'>
                    <div className='flex flex-row items-center pl-2 gap-5 my-auto'>
                      <div>{getIcon(territoire)}</div>
                      <div className=''>
                        <h1 className='text-[#084E8E] font-semibold text-xs py-1'>
                          {isTransport(territoire)
                            ? territoire.title
                            : territoire.entite}
                        </h1>
                        {territoire.entite === 'Département' ? (
                          <h2 className='font-bold text-sm'>
                            {' '}
                            {territoire.insee_dep} {' - '}{' '}
                            {territoire.properties.nom}
                          </h2>
                        ) : territoire.entite === 'Commune' ? (
                          <h2 className='font-bold text-sm text-color-primary'>
                            {' '}
                            {territoire.insee_dep} {' - '}{' '}
                            {territoire.properties.nom}
                          </h2>
                        ) : territoire.entite === 'Adresse' ? (
                          <h2 className='font-bold text-sm text-color-primary'>
                            {territoire.properties.nom}
                          </h2>
                        ) : (
                          <h2 className='font-bold text-sm text-color-primary'>
                            {territoire.properties.nom}
                          </h2>
                        )}
                        {territoire.entite === 'Département' ? (
                          <span className='text-xs font-normal text-info'>
                            {territoire.properties.statut}
                          </span>
                        ) : territoire.entite === 'Commune' ? (
                          <span className='text-xs font-normal text-info'>
                            {territoire.properties.insee_com}{' '}
                            {territoire.nomDep}
                          </span>
                        ) : territoire.entite === 'Adresse' ? (
                          <span className='text-xs font-normal text-info'>
                            {territoire.properties.post_code}{' '}
                            {territoire.properties.city}
                          </span>
                        ) : (
                          <>
                            {territoire?.depList?.length > 0 &&
                              territoire.depList.map(
                                (departement: any, index: number) => {
                                  return (
                                    <span
                                      key={index}
                                      className='text-xs font-normal text-info'
                                    >
                                      {departement}
                                      {index !== territoire.depList.length - 1
                                        ? ', '
                                        : '.'}
                                    </span>
                                  );
                                }
                              )}
                          </>
                        )}
                      </div>
                    </div>

                    <IconLeft className='text-color-primary transform rotate-180 h-6 w-6 my-auto' />
                  </div>
                </div>
              ))
            ) : (
              <span className='flex justify-center items-center mt-4'>
                Aucun resultat
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function isTransport(territoire: any) {
  return ['Train', 'Route'].includes(territoire?.entite);
}

function getIcon(territoire: any) {
  const entite = territoire?.entite;
  let elt = <PointAdresse />;

  switch (entite) {
    case 'Département':
      elt = <ImageDepartement departementCode={territoire.insee_dep} />;
      break;
    case 'Région':
      elt = <Region />;
      break;
    case 'Route':
      elt = <Car />;
      break;
    case 'Train':
      elt = getIconTrain(territoire);
      break;
    case 'Commune':
      elt = <Commune />;
      break;
  }

  return elt;
}

export function getIconTrain(territoire: any) {
  const type = territoire?.properties?.axis;
  let elt = <Train />;

  switch (type) {
    case 'metros':
      elt = <IconMetro />;
      break;
    case 'transiliens_rer':
      elt = <IconRer />;
      break;
    case 'tgv,tgv_internationaux':
    case 'tgv':
    case 'tgv_internationaux':
      elt = <IconTgv />;
      break;
  }
  return elt;
}

function getListSearchCategory() {
  let listCategory = [{ label: 'Tous', id: 'territoire' }];

  if (isMetropole()) {
    listCategory = [...listCategory, ...aTransportFilter];
  }

  listCategory = [...listCategory, ...aTerritoryFilter];
  return listCategory;
}
