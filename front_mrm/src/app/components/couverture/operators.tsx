'use client';
import React from 'react';

import Switcher from '@/app/components/switcher';
import GeometricShape from '@/app/components/geometricShape';

import { useOperatorStore, useSuperposerStore } from '@/store/store';
import { useOperatorsStore } from '@/store/operators';
import { twMerge } from 'tailwind-merge';

interface OperatorProps {
  classname?: string;
  children?: React.ReactNode;
}

export default function Operators({
  children,
  classname,
}: Readonly<OperatorProps>) {
  const { operators: storeOperators, toggleOperator } = useOperatorStore();
  const { active: isActiveSuperposer } = useSuperposerStore();
  const { operators: listOperators } = useOperatorsStore();

  return (
    <div
      className={twMerge(
        'flex items-center justify-between gap-1.5 overflow-x-auto whitespace-nowrap pt-8',
        classname
      )}
      data-test='coverage-operator-buttons'
    >
      {listOperators.map((operator: any) => {
        const isChecked = storeOperators.includes(operator.identifiant);
        const isDisabled = !isChecked && storeOperators.length >= 2;
        return (
          <React.Fragment key={operator.nomAffichage}>
            <Switcher
              type={isActiveSuperposer ? 'switcher' : 'radio'}
              classname='w-1/6 h-20 cursor-pointer'
              checked={isChecked}
              onToggle={() => {
                if (!isDisabled) {
                  toggleOperator(operator.identifiant);
                }
              }}
              disabled={isDisabled}
            >
              <GeometricShape
                color={{
                  color: operator.couleurDefaut,
                  isHexaDecimal: true,
                }}
                size='md'
                // classname={className}
              />
              <span className='text-[10px] font-medium text-color-primary text-center'>
                {operator.nomAffichage}
              </span>
            </Switcher>
          </React.Fragment>
        );
      })}
      {children}
    </div>
  );
}
