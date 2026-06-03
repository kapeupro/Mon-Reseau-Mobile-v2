'use client';
import React, { useEffect } from 'react';

import Title from '@/app/components/title';
import DropDownBlock from '@/app/components/dropDownBlock';
import ZoneFilter from '@/app/components/testQualite/filter/zone';
import LocationFilter from '@/app/components/testQualite/filter/location';

import IconDown from '@/assets/icons/iconDown.svg';
import { useTranslations } from 'next-intl';
import { useCrowdState } from '@/store/crowd';
import { useDatasourcesStore } from '@/store/qualityTest';
import { useDataQosAvailableStore, useServiceQosStore } from '@/store/qos';
import { useTestStore } from '@/store/store';
import { TESTS_APPEL, TESTS_INTERNET } from '@/app/constant/constant';
import { getDataAvailableQos } from '@/service/qos';

function setDefaultFilterMap(typeTestAvailable: any) {
  if (!typeTestAvailable.length) {
    return;
  }

  const { setService } = useServiceQosStore.getState();
  const { toggleTestInternet, toggleTestAppel } = useTestStore.getState();

  const dataTest = [
    {
      service: 'internet',
      typeTest: TESTS_INTERNET,
      fnToggle: toggleTestInternet,
    },
    {
      service: 'appel_sms',
      typeTest: TESTS_APPEL,
      fnToggle: toggleTestAppel,
    },
  ];

  for (const data of dataTest) {
    let isOk = false;
    for (const test of data.typeTest) {
      if (typeTestAvailable.includes(test.name.toLowerCase())) {
        setService(data.service as 'internet' | 'appel_sms');
        data.fnToggle(test.name);
        isOk = true;
        break;
      }
    }

    if (isOk) {
      break;
    }
  }
}

export default function ModalStat() {
  const testTranslation = useTranslations('test');
  const { setselectedCrowd, crowdselect } = useCrowdState();

  const { aDatasources: listCrowd } = useDatasourcesStore();

  const handleChange = (event: any) => {
    const selectedOption = JSON.parse(event.target.value);
    setselectedCrowd(selectedOption);
  };

  useEffect(() => {
    const { data: dataAvailable, add: addDataAvailable } =
      useDataQosAvailableStore.getState();

    const initDataAvailable = async () => {
      const idCrowd = crowdselect.id_crowd;
      let typeTestAvailable = [];

      if (dataAvailable.hasOwnProperty(idCrowd)) {
        typeTestAvailable = dataAvailable[idCrowd];
      } else {
        let data = await getDataAvailableQos(idCrowd);
        data = data.map((dt: string) => dt.toLowerCase());

        addDataAvailable(idCrowd, data);
        typeTestAvailable = data;
      }

      setDefaultFilterMap(typeTestAvailable);
    };

    if (crowdselect) {
      initDataAvailable();
    }
  }, [crowdselect]);

  return (
    <DropDownBlock
      header={
        <Title
          text={testTranslation('filtering')}
          className='text-md text-black'
          underline={false}
        />
      }
      headerClassname='pb-4'
      separator={true}
    >
      <hr className='border-gray-400' />
      <div className='flex flex-col bg-stone-20 p-4 gap-3'>
        <div className='relative bg-gray-200'>
          <select
            onChange={handleChange}
            value={crowdselect ? JSON.stringify(crowdselect) : ''}
            className='px-3 rounded-xl border-gray-400 border w-full h-[50px] appearance-none focus:outline-none pr-8'
          >
            {listCrowd.length ? (
              listCrowd.map((group: any) => (
                <optgroup key={group.id} label={group.title}>
                  {group.layer.map((layer: any) => (
                    <option
                      key={layer.id_crowd}
                      value={JSON.stringify({
                        id_crowd: layer.id_crowd,
                        source: group.source,
                      })}
                    >
                      {layer.title}
                    </option>
                  ))}
                </optgroup>
              ))
            ) : (
              <option value='no_data'>Aucune donnée</option>
            )}
          </select>
          <IconDown className='pointer-events-none absolute right-2 top-3.5' />
        </div>
        <LocationFilter />
        <ZoneFilter />
      </div>
    </DropDownBlock>
  );
}
