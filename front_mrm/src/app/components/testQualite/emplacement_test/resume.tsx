import React, { useEffect, useState } from 'react';
import { useEmplacementTestStore } from '@/store/qualityTest';
import { useOperatorsQosStore } from '@/store/qos';
import { useOperatorsStore } from '@/store/operators';

import Success from '@/assets/icons/success.svg';
import PartialSuccess from '@/assets/icons/partialSuccess.svg';
import Fail from '@/assets/icons/fail.svg';
import { useTranslations } from 'next-intl';
import Detail from './details';
import { isMobile, getWidthWindow } from '@/service/window';
import { twMerge } from 'tailwind-merge';

export default function Resume() {
  const { operators: storeOperators } = useOperatorsQosStore();
  const { operators: listOperators } = useOperatorsStore();
  const { dataEmplacementTest } = useEmplacementTestStore();
  const [colorSuccess, setColorSuccess] = useState('#1A1A1A');
  const [colorPartial, setColorPartial] = useState('#CDCCFF');

  const [icon, setIcon] = useState<any>();
  const [label, setLabel] = useState<string>();
  const [labelvalue, setLabelValue] = useState<string>();
  const [taux, setTaux] = useState<number>();
  const translations = useTranslations('test');
  useEffect(() => {
    if (storeOperators.length > 1) {
      setColorSuccess('#1A1A1A');
      setColorPartial('#CDCCFF');
    } else {
      listOperators.map((operator: any) => {
        if (storeOperators[0] === operator.identifiant) {
          setColorSuccess(operator.couleurNiveau4);
          setColorPartial(operator.couleurNiveau3);
        }
      });
    }
  }, [storeOperators, listOperators]);

  const data_resume = dataEmplacementTest[0].resume;
  const typeqos = dataEmplacementTest[0].detail.type;
  const values = dataEmplacementTest[0].detail.values;
  const data = dataEmplacementTest[0];
  let classContenair = 'w-full text-color-primary ml-2.5';
  if (isMobile()) {
    classContenair = 'w-full text-color-primary ml-[5px]';
  }

  /*
    useEffect(() => {
        if (data_resume["icone"] === "success") {
            setIcon(
                <Success color={colorSuccess} className="mb-0.5 w-5 h-5 mx-4" />
            )
        } else if (data_resume["icone"] === "partial_success") {
            setIcon(
                <PartialSuccess
                    color={colorPartial}
                    className=" w-5 h-5 mx-4"
                />
            )
        } else {
            setIcon(<Fail className="mb-0.5 w-5 h-5 mx-4" />)
        }
    }, [colorPartial, colorSuccess, data_resume])

    */

  useEffect(() => {
    calculIcon(data);
    calculLabel(data);
    getTaux(data);
  }, [data]);

  const calculIcon = (dataEmplacementTest: any) => {
    const values = dataEmplacementTest.detail.values;
    const typeqos = dataEmplacementTest.detail.type;
    const rankmax = getRankMajority(values, typeqos);

    if (typeqos === 'web' || typeqos === 'voix' || typeqos === 'stream') {
      if (rankmax === 0) {
        setIcon(
          <Success color={colorSuccess} className='mb-0.5 w-5 h-5 mx-4' />
        );
      } else if (rankmax === 1) {
        setIcon(
          <PartialSuccess color={colorPartial} className=' w-5 h-5 mx-4' />
        );
      } else {
        setIcon(<Fail className='mb-0.5 w-5 h-5 mx-4' />);
      }
    } else if (typeqos === 'download') {
      const color = ['#eebb45', '#7ccc98', '#41b6c4', '#225ea8'];
      const coloricon = color[rankmax];
      setIcon(
        <div
          className={`rounded-full w-5 h-5 mx-4 mb-0.5 bg-[${coloricon}]`}
        ></div>
      );
    } else if (typeqos === 'upload' || typeqos === 'sms') {
      if (rankmax === 0) {
        setIcon(
          <Success color={colorSuccess} className='mb-0.5 w-5 h-5 mx-4' />
        );
      } else {
        setIcon(<Fail className='mb-0.5 w-5 h-5 mx-4' />);
      }
    } else {
      setIcon(<Success color={colorSuccess} className='mb-0.5 w-5 h-5 mx-4' />);
    }
  };

  const isMajorite30 = (values: number[]) => {
    if (values.length !== 4) {
      return false;
    }
    return getRankMajorityDownload(values) == 3;
  };

  const isMajorite8_30 = (values: number[]) => {
    if (values.length !== 4) {
      return false;
    }
    return getRankMajorityDownload(values) == 2;
  };

  const isMajorite3_8 = (values: number[]) => {
    if (values.length !== 4) {
      return false;
    }
    return getRankMajorityDownload(values) == 1;
  };

  const isMajorite3 = (values: number[]) => {
    if (values.length !== 4) {
      return false;
    }
    return getRankMajorityDownload(values) == 0;
  };

  const isMajoriteSucces = (values: number[]) => {
    if (values.length !== 3) {
      return false;
    }
    return getRankMajorityWeb(values) == 0;
  };
  const isMajoritePartialSucces = (values: number[]) => {
    if (values.length !== 3) {
      return false;
    }
    return getRankMajorityWeb(values) == 1;
  };
  const isMajoriteFail = (values: number[]) => {
    if (values.length !== 3) {
      return false;
    }
    return getRankMajorityWeb(values) == 2;
  };

  const calculLabel = (dataEmplacementTest: any) => {
    const values = dataEmplacementTest.detail.values;
    const taux = dataEmplacementTest.detail.taux;
    const rankmax = getRankMaxvalue(values);
    const typeqos = dataEmplacementTest.detail.type;

    if (typeqos === 'web' || typeqos === 'voix' || typeqos === 'stream') {
      if (isMajoriteSucces(values)) {
        setLabel('majorite-label-other');
        setLabelValue('majorite-value-success');
      } else if (isMajoritePartialSucces(values)) {
        setLabel('majorite-label-other');
        setLabelValue('majorite-value-partialSuccess');
      } else {
        setLabel('majorite-label-other');
        setLabelValue('majorite-value-fails');
      }
    } else if (typeqos === 'download') {
      if (isMajorite30(values)) {
        setLabel('majorite-label-dl');
        setLabelValue('majorite-value-30');
      } else if (isMajorite8_30(values)) {
        setLabel('majorite-label-dl');
        setLabelValue('majorite-value-8-30');
      } else if (isMajorite3_8(values)) {
        setLabel('majorite-label-dl');
        setLabelValue('majorite-value-3-8');
      } else {
        setLabel('majorite-label-dl');
        setLabelValue('majorite-value-3');
      }
    } else if (typeqos === 'upload' || typeqos === 'sms') {
      if (rankmax === 0 && taux > 50) {
        setLabel('majorite-label-other');
        setLabelValue('majorite-value-success');
      } else {
        setLabel('majorite-label-other');
        setLabelValue('majorite-value-fails');
      }
    } else {
      setLabel('testrealisedsuccess');
    }
  };

  const getRankMaxvalue = (array: number[]) => {
    const maxValue = Math.max(...array);
    const maxIndex = array.indexOf(maxValue);
    return maxIndex;
  };

  const getMajority = (array: number[]) => {
    let sum = 0;
    array.forEach((num) => {
      sum += num;
    });
    return Math.floor(sum / 2);
  };

  const getRankMajorityWeb = (array: number[]) => {
    const success = 0;
    const partial_success = 1;
    const fail = 2;
    if (array.length !== 3) {
      return fail;
    }

    const vsuccess = array[0];
    const vpartial_success = array[1];
    const vfail = array[2];
    const majority = getMajority(array);

    if (vsuccess > majority) {
      return success;
    }
    if (vpartial_success > majority) {
      return partial_success;
    }
    if (vfail > majority) {
      return fail;
    }
    if (vsuccess + vpartial_success > majority) {
      return partial_success;
    }
    if (vfail + vpartial_success > majority) {
      return fail;
    }
    if (vsuccess === fail && vpartial_success === 0) {
      return fail;
    }
    return fail;
  };

  const getRankMajorityStream = (array: number[]) => {
    const fail = 2;
    const success = 0;
    const partial_success = 1;
    if (array.length !== 3) {
      return fail;
    }

    const vparfaite = array[0];
    const vcorrecte = array[1];
    const majority = getMajority(array);

    if (vparfaite > majority) {
      return success;
    }
    if (!(vparfaite > majority) && vparfaite + vcorrecte > majority) {
      return partial_success;
    }
    return fail;
  };

  const getRankMajorityUpload = (array: number[]) => {
    const fail = 1;
    const success = 0;
    if (array.length !== 2) {
      return fail;
    }

    const vok = array[0];
    const vnok = array[1];
    if (vok > vnok) {
      return success;
    }
    return fail;
  };

  const getRankMajorityDownload = (array: number[]) => {
    const int0_3 = 0;
    const int3_8 = 1;
    const int8_30 = 2;
    const intsup30 = 3;
    if (array.length !== 4) {
      return int0_3;
    }

    const v3_8 = array[1];
    const v8_30 = array[2];
    const vsup30 = array[3];
    const majority = getMajority(array);

    if (vsup30 > majority) {
      return intsup30;
    }
    if (v8_30 > majority) {
      return int8_30;
    }
    if (v3_8 > majority) {
      return int3_8;
    }
    if (vsup30 + v8_30 > majority) {
      return int8_30;
    }
    if (vsup30 + v3_8 > majority || v8_30 + v3_8 > majority) {
      return int3_8;
    }
    if (vsup30 + v3_8 + v8_30 > majority) {
      return int3_8;
    }
    return int0_3;
  };

  const getRankMajority = (array: number[], typeqos: string) => {
    if (typeqos === 'web') {
      return getRankMajorityWeb(array);
    } else if (typeqos === 'stream') {
      return getRankMajorityStream(array);
    } else if (typeqos === 'upload') {
      return getRankMajorityUpload(array);
    } else if (typeqos === 'voix') {
      return getRankMajorityWeb(array); // same case of config web
    } else if (typeqos === 'sms') {
      return getRankMajorityUpload(array); // same case of config upload
    } else if (typeqos === 'download') {
      return getRankMajorityDownload(array); // same case of config upload
    }
    return 0;
  };

  const getTaux = (dataEmplacementTest: any) => {
    setTaux(dataEmplacementTest.detail.taux);
  };

  return (
    <div className='border rounded-lg w-full pb-2 px-2'>
      <div className='flex flex-row justify-between items-center gap-2 w-full pt-3 pr-3 pb-0 pl-3 text-color-primary'>
        <div className='flex'>
          <div className='border border-1 flex justify-center items-center bg-stone-20 rounded-lg h-14 mr-5'>
            {icon}
          </div>
          <div className='flex-1 leading-none pt-2.5'>
            <span className='leading-none text-sm text-color-primary font-semibold'>
              {label && `${translations(label)} `}
              <span className='font-bold'>
                {labelvalue && translations(labelvalue)}
              </span>
            </span>
          </div>
        </div>
      </div>
      <div className={classContenair}>
        <Detail type={typeqos} values={values}></Detail>
      </div>
    </div>
  );
}
