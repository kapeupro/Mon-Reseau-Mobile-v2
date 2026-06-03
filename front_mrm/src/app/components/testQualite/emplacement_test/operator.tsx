import React, { useEffect, useState } from 'react';

import Badge from '@/app/components/badge';
import GeometricShape from '@/app/components/geometricShape';

import Success from '@/assets/icons/success.svg';
import PartialSuccess from '@/assets/icons/partialSuccess.svg';
import Fail from '@/assets/icons/fail.svg';

import { useEmplacementTestStore } from '@/store/qualityTest';
import { useOperatorsStore } from '@/store/operators';
import { useOperatorsQosStore } from '@/store/qos';

export default function Operator() {
  const { operators: storeOperators } = useOperatorsQosStore();
  const { operators: listOperators } = useOperatorsStore();
  const { dataEmplacementTest } = useEmplacementTestStore();
  const [status, setStatus] = useState(<></>);
  const [colorSuccess, setColorSuccess] = useState('#1A1A1A');
  const [colorPartial, setColorPartial] = useState('#CDCCFF');

  const data = dataEmplacementTest[0];

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

  useEffect(() => {
    if (!data || data.length <= 0) {
      return;
    }

    if (
      data.status_test['name'] === 'success' ||
      data.status_test['name'] === 'parfaite'
    ) {
      setStatus(
        <>
          <Success color={colorSuccess} />{' '}
          <span className='text-sm font-medium'>
            {data.status_test['label']}
          </span>
        </>
      );
    } else if (
      data.status_test['name'] === 'partial_success' ||
      data.status_test['name'] === 'correct'
    ) {
      setStatus(
        <>
          <PartialSuccess color={colorPartial} />{' '}
          <span className='text-sm font-medium'>
            {data.status_test['label']}
          </span>
        </>
      );
    } else if (data.status_test['name'] === 'fail') {
      setStatus(
        <>
          <Fail className='mb-0.5' />{' '}
          <span className='text-sm font-medium'>
            {data.status_test['label']}
          </span>
        </>
      );
    } else {
      setStatus(
        <>
          <GeometricShape
            color={{
              color: data.status_test['color'],
              isHexaDecimal: true,
            }}
            size='xs'
          >
            <span className='text-sm font-medium'>
              {data.status_test['label']}
            </span>
          </GeometricShape>{' '}
        </>
      );
    }
  }, [colorPartial, colorSuccess, data]);

  if (!data || data.length <= 0) {
    return <></>;
  }

  return (
    <div className='flex flex-row gap-5'>
      <Badge
        text={data.nom_affichage}
        color={{
          color: data.couleur_defaut,
          isHexaDecimal: true,
        }}
        classname='px-2 py-1 rounded-lg'
      />
      <div className='flex flex-row gap-2 items-center'>{status}</div>
    </div>
  );
}
