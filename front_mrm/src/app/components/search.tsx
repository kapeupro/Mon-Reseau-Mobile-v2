import React, { useEffect, useState } from 'react';
import IconCurrentLocation from '@/assets/icons/currentLocation.svg';
import { useFilterStore, useTerritoryStore } from '@/store/filter';
import SearchResult from './searchResult';
import { SearchDepRegCom } from '@/service/search';
import { useMapStore } from '@/store/map';
import { isMobile, resetScroll } from '@/service/window';
import LogoArcep from '@/assets/logoArcep.png';
import IconMenu from '@/assets/icons/menu.svg';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Territory from '@/app/components/territory';
import { aTerritoryFilter, aTransportFilter } from '../constant/search';
import { useCoordStore, useSelectionStore } from '@/store/selectedCoordStore';
import DataFilter from './DataFilter';
import { useShowFilterSearch } from '@/store/togglePanel';
import { usePageStore, useHomeMenuStore } from '@/store/store';
import { getDataGeolocalisation } from '@/service/geolocalisation';
import CircularProgress from '@/assets/icons/loading-circle.gif';
import Icon from './iconcmp';
import { isMetropole } from '@/utils/utils';
import { useSearchStore } from '@/store/search';

interface SearchProps {
  text?: string;
  closeFilter?: any;
}

export default function Search({
  text = '',
  closeFilter,
}: Readonly<SearchProps>) {
  const [isSearch, setIsSearch] = useState(false);
  const [result, setResult] = useState<any>();
  const { setTerritory } = useTerritoryStore();
  const { filter, setFilter } = useFilterStore();
  const [loading, setLoading] = useState(false);
  const { oMap, setExtent } = useMapStore();
  const bMobile = isMobile();
  const translations = useTranslations('home');
  const { selectTerritoire } = useCoordStore();
  const { setIsSelect } = useSelectionStore();
  const { setShowPanelSearch } = useShowFilterSearch();
  const { setPage } = usePageStore();
  const { setSelectedData } = useSearchStore();
  const { setShow: setShowHomeMenu } = useHomeMenuStore();

  const [errorGeolocalisation, setErrorGeolocalisation] = useState('');
  const [coordsLocation, setCoordsLocation] = useState<any>([]);

  const bCategorized = [...aTerritoryFilter, ...aTransportFilter]
    .map((territory) => territory.id)
    .includes(filter);

  // const bNoData = aTransportFilter
  //     .map((transport) => transport.id)
  //     .includes(filter)

  const textFilter = text.trim();

  useEffect(() => {
    if (textFilter.length >= 3 || bCategorized) {
      setIsSearch(true);
    } else {
      setResult([]);
      setIsSearch(false);
    }
  }, [textFilter, bCategorized]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setSelectedData(false);
      try {
        const combinedResults = await SearchDepRegCom(textFilter, filter);

        setResult(combinedResults);
      } catch (erreur) {
        console.error("Une erreur s'est produite : ", erreur);
      }
      setLoading(false);
    };

    // if (bNoData) {
    if (textFilter.length >= 3 || bCategorized) {
      setResult([]);
      fetchData();
    }
  }, [filter, textFilter, bCategorized]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const formattedCoords = formatParamsArray(coordsLocation);
        const geolocalisationResults =
          await getDataGeolocalisation(formattedCoords);

        selectCoord(geolocalisationResults[0]);
      } catch (erreur) {
        console.error("Une erreur s'est produite : ", erreur);
      }
      setLoading(false);
    };

    if (coordsLocation.length > 0) {
      fetchData();
      setCoordsLocation('');
    }
  }, [coordsLocation]);

  const formatParamsArray = (aData: any[]) => {
    return aData.map((dt) => dt.toString()).join(',');
  };

  const selectCoord = (data: any) => {
    selectTerritoire(data);
    setIsSelect(true);
    closeFilter();
  };

  const onClickTerritory = (data: any) => {
    setTerritory(data);
    setIsSelect(true);
    selectTerritoire(data);
    setExtent(data.extent);
    resetScrollInMobile();
    closeFilter();
  };

  const resetScrollInMobile = () => {
    if (bMobile) {
      resetScroll();
    }
  };

  const afficherPosition = (e: any) => {
    e.preventDefault();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setCoordsLocation([longitude, latitude]);

        oMap.flyTo({
          center: [longitude, latitude],
          zoom: 16,
          essential: true,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setErrorGeolocalisation(
            'Veuillez activer la géolocalisation de votre appareil pour accéder à cette fonctionnalité.'
          );
        } else {
          setErrorGeolocalisation(
            'Erreur lors de la récupération de la position.'
          );
        }
        setTimeout(() => {
          setErrorGeolocalisation('');
        }, 5000);
      }
    );
  };

  const goHome = () => {
    setPage('home');
    setShowPanelSearch(false);
  };

  return (
    <div
      className={
        bMobile
          ? 'fixed top-0 left-0 right-0 bottom-0 transform overflow-hidden w-screen bg-white text-left shadow-xl transition-all h-screen z-[7]'
          : 'fixed top-0 bg-white rounded-r-lg  left-0  w-120 h-full z-[6]'
      }
    >
      {!bMobile && (
        <div className='relative bg-secondary w-full flex px-10 gap-0 h-28 pb-7'>
          <div className='flex items-center m-auto h-12'>
            <IconMenu
              onClick={() => setShowHomeMenu(true)}
              className='cursor-pointer'
            ></IconMenu>
          </div>
          <div className='m-auto h-12 '>
            <Image
              alt='LogoArcep'
              src={LogoArcep}
              className='w-auto h-12 cursor-pointer'
              onClick={goHome}
            />
          </div>
          <div className='flex items-center'>
            <div
              className=' px-4 text-secondary-text font-title font-semibold text-lg border-l-2 border-gray-500 cursor-pointer'
              data-test='title-home'
              onClick={goHome}
            >
              {translations('title')}
            </div>
          </div>
        </div>
      )}

      {isSearch ? (
        <SearchResult
          className='bg-white  pb-10  sm:pb-4 mt-24 xl:mt-10'
          data={result}
          closeFilter={closeFilter}
          loading={loading}
          setLoading={setLoading}
          textFilter={textFilter}
        />
      ) : loading ? (
        <Icon
          icon={CircularProgress}
          className='flex justify-center items-center mt-7'
        ></Icon>
      ) : (
        <div className='bg-white pb-4  sm:pb-4 mt-24 xl:mt-10'>
          <div className='flex flex-col gap-2 justify-center items-center mt-4'>
            <button
              onClick={afficherPosition}
              className='flex justify-center items-center text-center text-color-primary'
            >
              <IconCurrentLocation />
              <span className='ml-2 '>Utiliser la position actuelle</span>
            </button>
            <div className='text-red-500 text-xs text-center'>
              {errorGeolocalisation}
            </div>
          </div>
          <div className='bg-white w-full py-6 px-5 space-y-6'>
            <Territory
              isActiveButton={false}
              onClickTerritory={onClickTerritory}
            />
            <DataFilter
              title='Données par territoire'
              aData={aTerritoryFilter}
              setFilter={setFilter}
            />
            {isMetropole() && (
              <DataFilter
                title='Données par axe de transport'
                aData={aTransportFilter}
                setFilter={setFilter}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
