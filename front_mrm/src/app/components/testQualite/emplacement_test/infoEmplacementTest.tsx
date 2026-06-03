import React, { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import Title from '@/app/components/title';
import Badge from '@/app/components/badge';
import GeometricShape from '@/app/components/geometricShape';

import { useEmplacementTestStore } from '@/store/qualityTest';
import { useOperatorsQosStore, useResumeQosStore } from '@/store/qos';
import { useOperatorsStore } from '@/store/operators';

import { TESTS_INTERNET, TESTS_APPEL } from '@/app/constant/constant';

import Success from '@/assets/icons/success.svg';
import PartialSuccess from '@/assets/icons/partialSuccess.svg';
import Fail from '@/assets/icons/fail.svg';
import { useHeaderPanelStore } from '@/store/store';
import { isMobile } from '@/service/window';
import { twMerge } from 'tailwind-merge';
import { isTransport } from '@/utils/activeEntite';
import { getMapGlobalParameters } from '../../superposition/theme/filter';

const getHeaderClass = (showLegendHelpResumeQos: boolean) => {
  const {
    qos: { service },
    typeTest: { testInternet },
  } = getMapGlobalParameters();

  if (service === 'internet' && testInternet === 'DOWNLOAD') {
    return showLegendHelpResumeQos ? 'mt-96 ' : 'mt-80 ';
  } else {
    return 'mt-72 ';
  }
};

export default function InfoEmplacementTest() {
  const translations = useTranslations('test');
  const { operators: storeOperators } = useOperatorsQosStore();
  const { operators: listOperators } = useOperatorsStore();
  const { dataEmplacementTest } = useEmplacementTestStore();
  const [colorSuccess, setColorSuccess] = useState('#1A1A1A');
  const [colorPartial, setColorPartial] = useState('#CDCCFF');
  const { bHeaderPanel } = useHeaderPanelStore();
  const { showLegendHelp: showLegendHelpResumeQos } = useResumeQosStore();
  const bMobile = isMobile();

  const divsClassName = 'flex flex-row';
  const itemsClassName = 'flex flex-col gap-1.5 w-1/2';
  const labelClassName = 'text-sm font-medium text-gray-500';
  const contentClassName = 'text-sm font-medium text-color-primary';

  const data = dataEmplacementTest[0].qos;

  let headerClass = '';
  if (bMobile && bHeaderPanel) {
    headerClass = 'mt-[19rem]';
  } else if (!bMobile) {
    headerClass = getHeaderClass(showLegendHelpResumeQos);
  }

  useEffect(() => {
    if (storeOperators.length > 1) {
      setColorSuccess('#1A1A1A');
      setColorPartial('#CDCCFF');
    } else {
      listOperators.forEach((operator: any) => {
        if (storeOperators[0] === operator.identifiant) {
          setColorSuccess(operator.couleurNiveau4);
          setColorPartial(operator.couleurNiveau3);
        }
      });
    }
  }, [storeOperators, listOperators]);

  if (!data || data.length <= 0) {
    return <></>;
  }

  return (
    <div className={twMerge('px-3', isTransport() ? '' : headerClass)}>
      {data.map((item: any, index: any) => {
        let status: any = '';
        if (item.status_test === 'success') {
          status = (
            <div
              key={index}
              className='flex gap-2 justify-center items-center text-center'
            >
              <Success className='mt-0.5' color={colorSuccess} />{' '}
              <span className='text-sm font-medium'>Succès</span>
            </div>
          );
        } else if (item.status_test === 'partial success') {
          status = (
            <div key={index} className='flex gap-2'>
              <PartialSuccess className='mt-0.5' color={colorPartial} />{' '}
              <span className='text-sm font-medium'>Succès partiel</span>
            </div>
          );
        } else if (item.status_test === 'fail') {
          status = (
            <div key={index} className='flex gap-2'>
              <Fail className='mt-0.5' />{' '}
              <span className='text-sm font-medium'>Echec</span>
            </div>
          );
        } else {
          const value = parseInt(item.status_test.match(/\d+/)[0], 10);
          let color;
          if (value <= 3) {
            color = '#eebb45';
          } else if (value > 3 && value <= 8) {
            color = '#7ccc98';
          } else if (value > 8 && value <= 30) {
            color = '#41b6c4';
          } else {
            color = '#225ea8';
          }

          status = (
            <div key={index} className='flex gap-2'>
              <GeometricShape
                color={{
                  color: color,
                  isHexaDecimal: true,
                }}
                size='xs'
              >
                <span className='text-sm font-medium'>{item.status_test}</span>
              </GeometricShape>{' '}
            </div>
          );
        }

        const type_test_title = getTypeTestTitle(item.type_test);

        return (
          <div
            key={index}
            className='flex gap-5 border rounded-lg w-full flex-col p-5 text-color-primary mb-4'
          >
            <div className='flex'>
              <Title
                className='text-lg'
                text={`Test ${index + 1} - ${
                  type_test_title ? translations(type_test_title) : ''
                }`}
                underline={false}
              />
            </div>

            <div className='flex flex-row gap-5 items-center'>
              <Badge
                text={item.nom_affichage}
                color={{
                  color: item.couleur_defaut,
                  isHexaDecimal: true,
                }}
                classname='px-2 py-1 rounded-lg align-middle'
              />
              {status}
            </div>
            <div className='flex flex-col gap-5'>
              <div className={divsClassName}>
                <div className={itemsClassName}>
                  <span className={labelClassName}>
                    {"Système d'exploitation"}
                  </span>
                  <span className={contentClassName}>{item.user_os}</span>
                </div>
                <div className={itemsClassName}>
                  <span className={labelClassName}>Moment du test</span>
                  <span className={contentClassName}>
                    {item.date_test} {', '} {item.heure_test}
                  </span>
                </div>
              </div>
              <div className={divsClassName}>
                <div className={itemsClassName}>
                  <span className={labelClassName}>Type de test</span>
                  <span className={contentClassName}>{item.type_test}</span>
                </div>
                <div className={itemsClassName}>
                  <span className={labelClassName}>Source</span>
                  <span className={contentClassName}>{item.source_data}</span>
                </div>
              </div>
              <div className={divsClassName}>
                <div className={itemsClassName}>
                  <span className={labelClassName}>Type de lieu</span>
                  <span className={contentClassName}>{item.situation}</span>
                </div>
                <div className={itemsClassName}>
                  <span className={labelClassName}>Zone</span>
                  <span className={contentClassName}>{item.zone}</span>
                </div>
              </div>
              <div className={divsClassName}>
                <div className={itemsClassName}>
                  <span className={labelClassName}>Appareil utilisé</span>
                  <span className={contentClassName}>{item.user_device}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getTypeTestTitle(typeTest: string) {
  const aTests = [...TESTS_INTERNET, ...TESTS_APPEL];
  const aFilterTest = aTests.filter(
    (oTest) => oTest.name.toLowerCase() === typeTest?.toLowerCase()
  );
  return aFilterTest.length ? aFilterTest[0].text : false;
}
