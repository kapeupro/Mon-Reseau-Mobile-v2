import React from 'react';
import { twMerge } from 'tailwind-merge';

import Badge from '@/app/components/badge';
import NetworkLevel from '@/app/components/networkLevel';
import NetworkLevelLegend from '@/app/components/networkLevelLegend';

import { useOperatorsStore } from '@/store/operators';

interface NetworkLevelGridProps {
  className?: string;
  type?: 'rectangle' | 'triangle';
  data: any;
}

export default function NetworkLevelGrid({
  className,
  type = 'rectangle',
  data = [],
}: NetworkLevelGridProps) {
  const { operators: listOperators } = useOperatorsStore();

  let statNetwork = null;
  let networks = null;
  if (data) {
    if (data.success) {
      statNetwork = data.stat.value;
      networks = data.stat.techno.map((item: any) => {
        const [name, description = ''] = item.split(/\s(.+)/);
        return {
          name,
          description,
        };
      });
    }
  }

  const gridNbr = listOperators.length + 1;

  return (
    <div className={twMerge('flex flex-col gap-5 ', className)}>
      {listOperators.length > 1 && (
        <div className={`grid grid-cols-${gridNbr} `}>
          <div className='header'></div>
          {listOperators.map((operator: any, index: any) => {
            return (
              <div key={index} className='header px-1'>
                <Badge
                  text={operator.nomAffichage}
                  color={{
                    color: operator.couleurDefaut,
                    isHexaDecimal: true,
                  }}
                  classname='w-full'
                />
              </div>
            );
          })}
          {statNetwork && networks ? (
            <>
              <div className='flex flex-col content'>
                {networks.map((network: any, index: any) => {
                  return (
                    <div
                      key={index}
                      className={`even:bg-[#f8f6f2] odd:bg-white rounded-l-lg ${
                        type === 'triangle' ? 'h-[45px]' : 'h-[52px]'
                      }`}
                    >
                      <div className='flex flex-col justify-center items-center mt-3 mb-4'>
                        <span className='text-sm font-medium leading-3'>
                          {network.name}
                        </span>
                        <span className='text-ss font-medium leading-3 whitespace-nowrap'>
                          {network.description}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {statNetwork
                .slice(0, listOperators.length)
                .map((val: any, index: any) => (
                  <div
                    className='flex flex-col content  font-[600] text-info'
                    key={index}
                  >
                    <>
                      {val.map((value: any, innerIndex: any) => (
                        <NetworkLevel
                          key={innerIndex}
                          value={value}
                          classname={`py-3 ${
                            innerIndex === 1 && index === 3
                              ? 'rounded-r-lg'
                              : ''
                          } odd:bg-white even:bg-[#f8f6f2]`}
                          type={type}
                        />
                      ))}
                    </>
                  </div>
                ))}
            </>
          ) : (
            <span className='text-sm font-medium text-center mx-auto '>
              Aucun résultat ...
            </span>
          )}
        </div>
      )}

      <NetworkLevelLegend type={type} />
    </div>
  );
}
