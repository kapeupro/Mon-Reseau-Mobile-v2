'use client';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import Switcher from '@/app/components/switcher';
import GeometricShape from '@/app/components/geometricShape';

import { useOperatorsStore } from '@/store/operators';
import { useTranslations } from 'next-intl';

interface OperatorsAndAllProps {
  isAll?: boolean;
  toggleOperators: Function;
  aSelectedOperators: any[];
  dataTest?: string;
}

const getIdentifiantOperators = (listOperators: any[]) => {
  return Array.isArray(listOperators) && listOperators.length
    ? listOperators.map((operator: any) => operator.identifiant)
    : [];
};

export default function Operators({
  isAll = true,
  toggleOperators,
  aSelectedOperators,
  dataTest = '',
}: Readonly<OperatorsAndAllProps>) {
  const { operators: listOperators } = useOperatorsStore();
  const antenneTranslations = useTranslations('antenne');

  const allOperators: any = useMemo(
    () => getIdentifiantOperators(listOperators),
    [listOperators]
  );

  const bSelectAll = allOperators.length === aSelectedOperators.length;

  return (
    <div
      className={twMerge(
        'flex items-center justify-between gap-1.5 overflow-x-auto whitespace-nowrap w-full '
      )}
      data-test={dataTest}
    >
      {isAll && (
        <Switcher
          type='radio'
          classname='w-1/6 h-20 cursor-pointer'
          checked={bSelectAll}
          onToggle={() => {
            toggleOperators(allOperators);
          }}
        >
          <GeometricShape
            color={{
              color: '#000000',
              isHexaDecimal: true,
            }}
            size='md'
          />
          <span className='text-[10px] font-medium text-color-primary text-center'>
            {antenneTranslations('all')}
          </span>
        </Switcher>
      )}

      {Array.isArray(listOperators) &&
        Boolean(listOperators.length) &&
        listOperators.map((operator: any) => {
          const isChecked = aSelectedOperators.includes(operator.identifiant);
          return (
            <React.Fragment key={operator.nomAffichage}>
              <Switcher
                type='radio'
                classname={twMerge('w-1/6 h-20 cursor-pointer')}
                checked={isChecked && !bSelectAll}
                onToggle={() => {
                  toggleOperators([operator.identifiant]);
                }}
              >
                <GeometricShape
                  color={{
                    color: operator.couleurDefaut,
                    isHexaDecimal: true,
                  }}
                  size='md'
                />
                <span className='text-[10px] font-medium text-color-primary text-center'>
                  {operator.nomAffichage}
                </span>
              </Switcher>
            </React.Fragment>
          );
        })}
    </div>
  );
}
