import React from 'react';

import Badge from '@/app/components/badge';

import { useOperatorsStore } from '@/store/operators';
import { useZacStore } from '@/store/zone';

export default function OperatorsZoneDetails() {
  const { operators: listOperators } = useOperatorsStore();
  const { data_zac } = useZacStore();

  const data_zac_operator_list = data_zac.data.operator_data
    ? data_zac.data.operator_data
    : [];

  const newDataOperatorsList = data_zac_operator_list.map((operatorId: any) => {
    const operator = listOperators.find(
      (op: any) => op.identifiant === operatorId
    );

    return operator ? operator : false;
  });

  return (
    <>
      <div className='flex flex-row gap-2 mb-2 mt-2'>
        {newDataOperatorsList.length > 0 ? (
          newDataOperatorsList.map((operator: any, index: any) => {
            return (
              <Badge
                key={index}
                text={operator.nomAffichage}
                color={{
                  color: operator.couleurDefaut,
                  isHexaDecimal: true,
                }}
                classname='w-[70px] rounded-lg p-1'
              />
            );
          })
        ) : (
          <span className='text-gray-400 font-normal text-base'>
            Opérateurs indisponibles
          </span>
        )}
      </div>
    </>
  );
}
