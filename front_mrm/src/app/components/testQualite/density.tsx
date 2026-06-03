import React, { useState, useEffect } from 'react';

import { useTranslations } from 'next-intl';

import MoonLoader from 'react-spinners/MoonLoader';

import InfoComponent from '@/app/components/info';

import Dense from '@/assets/icons/buildings.png';
import Intermediaire from '@/assets/icons/intermediaire.png';
import Rurale from '@/assets/icons/rurale.png';
import Touristique from '@/assets/icons/touristique.png';

import { useCoordStore } from '@/store/selectedCoordStore';
import { useOperatorsQosStore, useServiceQosStore } from '@/store/qos';
import { useTestStore, usePageStore } from '@/store/store';

import { getDensity } from '@/service/density';
import { useOperatorsStore } from '@/store/operators';

export default function Density() {
  const { selectedTerritoire } = useCoordStore();
  const { operators } = useOperatorsQosStore();
  const { testInternet, testAppel } = useTestStore();
  const { service } = useServiceQosStore();
  const { page } = usePageStore();

  const [isLoading, setIsLoading] = useState(false);
  const [densityData, setDensityData] = useState<any>();
  const { date } = useOperatorsStore();
  const date_qos = date.find((date: any) => date.page === 'qualite-reseau');
  const testTranslation = useTranslations('test');

  const formatParamsArray = (aData: any[]) => {
    return aData.map((dt) => dt.toString());
  };

  useEffect(() => {
    const getOperator = () => {
      if (formatParamsArray(operators).length > 1) {
        return 'all';
      }

      return formatParamsArray(operators)[0];
    };

    const fetchData = async () => {
      setIsLoading(true);
      let protocole = '';
      if (service === 'internet') {
        protocole = testInternet;
      } else {
        protocole = testAppel;
      }

      const data = await getDensity(
        page === 'qualite-reseau' ? protocole : 'DOWNLOAD',
        selectedTerritoire.properties['insee_com'],
        page === 'qualite-reseau' ? getOperator() : 'all'
      );
      setDensityData(data);
      setIsLoading(false);
    };

    fetchData();
  }, [selectedTerritoire, service, testAppel, testInternet, operators, page]);

  let icon = Dense;
  if (densityData) {
    if (densityData.icon === 'dense') {
      icon = Dense;
    } else if (densityData.icon === 'intermediaire') {
      icon = Intermediaire;
    } else if (densityData.icon === 'rurale') {
      icon = Rurale;
    }
  }

  return (
    <div className='flex flex-col gap-2 mt-2'>
      {isLoading ? (
        <div className='flex items-center justify-center'>
          <MoonLoader color='#232253' loading={isLoading} size={150} />
        </div>
      ) : (
        densityData && (
          <>
            <InfoComponent
              icon={icon}
              title={`Vous-êtes en ${densityData.label_zone}`}
              titleClassName='text-sm'
              className='bg-stone-10'
              contenairClassName='text-black'
            >
              <div className='text-gray-500 text-xs semi-bold'>
                {`${densityData.label} ${densityData.result}`}
              </div>
            </InfoComponent>
            {densityData.data_touristic_zone && (
              <InfoComponent
                icon={Touristique}
                title='Cette commune possède des zones touristiques'
                titleClassName='text-sm'
                className='bg-stone-10'
              >
                <div className='text-gray-500 text-xs semi-bold'>
                  {`${densityData.data_touristic_zone.label} ${densityData.data_touristic_zone.result}`}
                </div>
              </InfoComponent>
            )}
            <span className='text-xs font-medium text-gray-500'>
              {`${testTranslation('test-date')} : ${
                date_qos.date_build_start
              } ${testTranslation('test-date-to')} ${date_qos.date_build_end}`}
            </span>
          </>
        )
      )}
    </div>
  );
}
