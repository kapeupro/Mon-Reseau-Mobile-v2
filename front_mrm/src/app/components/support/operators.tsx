import React from 'react';

import Badge from '@/app/components/badge';

import { useSupportsStore } from '@/store/support';

export default function Operators() {
  const { supports: foundSupport } = useSupportsStore();

  if (!foundSupport || foundSupport.length === 0) {
    return <></>;
  }

  const nb = foundSupport.map(() => {});

  return (
    <>
      {nb.length > 0 && (
        <div
          className='flex flex-row gap-2'
          data-test='antennas-support-container-operator'
        >
          {foundSupport.map((operator: any, index: any) => {
            return (
              <div key={index}>
                {operator.nom_affichage ? (
                  <Badge
                    text={operator.nom_affichage}
                    color={{
                      color: operator.couleur_defaut,
                      isHexaDecimal: true,
                    }}
                    classname='w-[70px] rounded-lg p-1'
                  />
                ) : (
                  <span className='text-gray-400 font-normal text-xs'>
                    Indisponible
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
