import React, { useState, useEffect, useRef } from 'react';

import ActiveRadio from '@/app/components/activeRadio';

import { LIST_TYPE_AXES } from '@/app/constant/train';

import { useCoordStore } from '@/store/selectedCoordStore';
import { getListTrainByAxis } from '@/service/territoire_train';
import { isMobile } from '@/service/window';
import Icon from '@/app/components/iconcmp';
import IconCaretLeft from '@/assets/icons/caret_left.svg';
import {
  isLevelOne,
  castToComboOptionTerritory,
  isLevelTwo,
  onSelectSearchResult,
  isLevelThree,
} from './utils';
import { useIsFirstMount } from '@/utils/useIsFirstMount';

export default function TypeAxe() {
  const [loading, setLoading] = useState(false);

  const { selectedTerritoire } = useCoordStore();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollPosition, setScrollPosition] = useState<number>(0);

  const handleScroll = (direction: string) => {
    const container = containerRef.current;
    const step = container!.clientWidth; // Largeur d'un élément
    let curScrollPosition;

    if (direction === 'left') {
      curScrollPosition = Math.max(scrollPosition - step, 0);
    } else if (direction === 'right') {
      curScrollPosition = Math.min(
        scrollPosition + step,
        container!.scrollWidth - container!.clientWidth
      );
    }

    if (typeof curScrollPosition !== 'undefined') {
      container!.scrollTo({
        left: curScrollPosition,
        behavior: 'smooth',
      });
      setScrollPosition(curScrollPosition);
    }
  };

  const showIconScrollRight = () => {
    if (!containerRef.current) {
      return true;
    }
    const container = containerRef.current;
    return scrollPosition + container.clientWidth !== container.scrollWidth;
  };

  const fetchData = async (oType: any) => {
    setLoading(true);
    const aNames = oType.name.split(',');
    const response = await getListTrainByAxis({
      level: oType.level,
      axis: aNames[0],
    });

    if (response) {
      onSelectSearchResult(response);
    }

    setLoading(false);
  };

  return (
    <>
      {isMobile() ? (
        <div className='flex justify-start items-center overflow-x-auto gap-3 pt-8 w-full '>
          {LIST_TYPE_AXES.map((type) => {
            const name = type.name;
            let bActive =
              name === selectedTerritoire?.properties?.axis ||
              name.split(',').includes(selectedTerritoire?.properties?.axis);

            return (
              <div key={type.name}>
                <ActiveRadio
                  key={name}
                  classname='w-[88px]'
                  icon={type.icon}
                  iconPosition='top-7'
                  classContent='h-28 flex justify-center items-center'
                  active={bActive}
                  onClick={() => {
                    if (!loading) {
                      fetchData(type);
                    }
                  }}
                  IsactiveButton={false}
                >
                  <div className='mt-8 text-center text-xs font-semibold whitespace-normal'>
                    {type.label}
                  </div>
                </ActiveRadio>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className='flex justify-start items-center overflow-x-auto gap-3 pt-8 w-full'
          ref={containerRef}
        >
          {scrollPosition > 0 && (
            <Icon
              icon={<IconCaretLeft />}
              width={20}
              shadow
              onClick={() => handleScroll('left')}
              className={
                'bg-white absolute z-[5] left-1 opacity-100 ml-2.5 shadow-scroll-left'
              }
            />
          )}
          {LIST_TYPE_AXES.map((type) => {
            const name = type.name;
            let bActive =
              name === selectedTerritoire?.properties?.axis ||
              name.split(',').includes(selectedTerritoire?.properties?.axis);

            return (
              <div key={type.name}>
                <ActiveRadio
                  key={name}
                  classname='w-[88px]'
                  icon={type.icon}
                  iconPosition='top-7'
                  classContent='h-28 flex justify-center items-center'
                  active={bActive}
                  onClick={() => {
                    if (!loading) {
                      fetchData(type);
                    }
                  }}
                  IsactiveButton={false}
                >
                  <div className='mt-8 text-center text-xs font-semibold whitespace-normal'>
                    {type.label}
                  </div>
                </ActiveRadio>
              </div>
            );
          })}
          {showIconScrollRight() && (
            <Icon
              icon={<IconCaretLeft />}
              width={20}
              shadow
              onClick={() => handleScroll('right')}
              className={
                'bg-white transform rotate-180 absolute z-[5] right-1 opacity-100 mr-2.5 shadow-scroll-right'
              }
            />
          )}
        </div>
      )}
      {!isLevelOne() && <ComboTrain />}
    </>
  );
}

function ComboTrain() {
  const { selectedTerritoire } = useCoordStore();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const bFirstMount = useIsFirstMount();

  const comboOptionTerritory = castToComboOptionTerritory(selectedTerritoire);

  const fetchData = async (paramsbFirstMount = false) => {
    setLoading(true);
    let response: never[] = [];
    const axis_params = selectedTerritoire?.properties?.axis;

    response = await getListTrainByAxis({
      axis: ['tgv', 'tgv_internationaux'].includes(axis_params)
        ? 'tgv,tgv_internationaux'
        : axis_params,
    });

    response = response || [];

    if (isLevelTwo()) {
      response = [comboOptionTerritory as never, ...response];
    } else if (isLevelThree() && paramsbFirstMount) {
      const aTypes = LIST_TYPE_AXES.filter((oType) =>
        oType.name.split(',').includes(axis_params)
      );

      if (aTypes.length) {
        const dtType = aTypes[0];
        response = [
          {
            id: dtType.name,
            label: dtType.combo_label,
            level: 2,
          } as never,
          ...response,
        ];
      }
    }

    setData(response);
    setLoading(false);
  };

  useEffect(() => {
    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (bFirstMount) {
      return;
    }

    if (selectedTerritoire.level !== 3) {
      fetchData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTerritoire]);

  const getDataLevelThree = async (axis_name: string) => {
    const aOptions = data.filter((dt) => dt.label === axis_name);
    if (!aOptions.length) {
      return;
    }

    const oOption = aOptions[0];

    setLoading(true);
    const response = await getListTrainByAxis({
      level: oOption.level,
      axis: oOption.id,
      axis_name: oOption.label,
    });

    if (response) {
      onSelectSearchResult(response);
    }

    setLoading(false);
  };

  return (
    <select
      onChange={(event: any) => {
        getDataLevelThree(event.target.value);
      }}
      value={
        isLevelTwo()
          ? comboOptionTerritory?.label
          : (selectedTerritoire.properties?.nom ?? '')
      }
      className='px-3 rounded-xl border-gray-400 border w-full h-[45px] focus:outline-none pr-8'
    >
      {loading ? (
        <option value=''>En chargement ...</option>
      ) : (
        data.map((item: any, index: any) => {
          return (
            <option key={index} value={item.label}>
              {item.label}
            </option>
          );
        })
      )}
    </select>
  );
}
