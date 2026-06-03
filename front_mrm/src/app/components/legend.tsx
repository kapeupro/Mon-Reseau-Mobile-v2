import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import GeometricShape from '@/app/components/geometricShape';

import IconLeft from '@/assets/icons/iconLeft.svg';

import { useLegendStore } from '@/store/legend';
import { useOperatorsStore } from '@/store/operators';
import { usePageStore } from '@/store/store';
import { useOperatorsQosStore } from '@/store/qos';
import { useOperatorsTrainStore } from '@/store/train';
import { useOperatorsRouteStore } from '@/store/route';
import { isTrain, isRoute } from '@/utils/activeEntite';

import { isMobile } from '@/service/window';
import { usePrintMapStore } from '@/store/print';

interface LegendProps {
  classname?: string;
}

export default function Legend({ classname }: Readonly<LegendProps>) {
  const { operators: storeOperatorsQos } = useOperatorsQosStore();
  const { operators: storeOperatorsTrain } = useOperatorsTrainStore();
  const { operators: storeOperatorsRoute } = useOperatorsRouteStore();
  const { operators: listOperators } = useOperatorsStore();
  const { page } = usePageStore();
  const { legend } = useLegendStore();
  const { loading: loadPrint } = usePrintMapStore();
  const [show, setShow] = useState(false);
  const [colorSuccess, setColorSuccess] = useState('#1A1A1A');
  const [colorPartial, setColorPartial] = useState('#CDCCFF');

  const bMobile = isMobile();

  useEffect(() => {
    if (!bMobile) {
      setShow(true);
    }
  }, [page, bMobile]);

  const onToggle = () => {
    setShow(!show);
  };

  useEffect(() => {
    let storeOperators: any[] = [];

    if (isRoute()) {
      storeOperators = storeOperatorsRoute;
    } else if (isTrain()) {
      storeOperators = storeOperatorsTrain;
    } else {
      storeOperators = storeOperatorsQos;
    }

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
  }, [
    storeOperatorsQos,
    storeOperatorsTrain,
    storeOperatorsRoute,
    listOperators,
    page,
  ]);

  const bShow = show || loadPrint;

  return (
    <div
      className={twMerge(
        'bg-white rounded-md p-2 inline-block',
        loadPrint ? '' : 'shadow bg-opacity-75',
        classname
      )}
      data-test='legend'
      id='id_legend'
    >
      <div className='flex flex-row justify-between items-center gap-2 pb-1'>
        {bShow && <span className='text-ss font-bold'>{legend.title}</span>}
        {!loadPrint && (
          <IconLeft
            className={show ? '' : 'transform rotate-180'}
            onClick={onToggle}
          />
        )}
      </div>
      {legend.items!.map((item: any, index: any) => {
        let iconColor = null;
        if (item.icon) {
          iconColor =
            page === 'signalements'
              ? item.icon
              : React.cloneElement(item.icon, {
                  color: `${
                    item.id === 'success' ? colorSuccess : colorPartial
                  }`,
                });
        }

        return (
          <div className='flex flex-col gap-1 pb-1' key={index}>
            {item.color && (
              <GeometricShape
                key={index}
                color={{
                  color: item.color,
                  isHexaDecimal: true,
                }}
                size='xs'
                opacity={item.opacity}
                classname={{
                  geometry: loadPrint ? 'mt-3' : '',
                }}
              >
                {bShow && <span className='text-ss'>{item.attribute}</span>}
              </GeometricShape>
            )}
            {item.icon && (
              <div className='flex flex-row items-center gap-2'>
                {loadPrint ? (
                  <div className='w-4 h-4 pt-[6px]'>{iconColor}</div>
                ) : (
                  iconColor
                )}
                {bShow && <span className='text-ss'>{item.attribute}</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
