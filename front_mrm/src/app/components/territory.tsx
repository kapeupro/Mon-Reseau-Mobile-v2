import React, { useState, useRef } from 'react';

import ActiveRadio from '@/app/components/activeRadio';
import { LIST_TERRITOIRES } from '@/app/constant/constant';
import { isMobile } from '@/service/window';
import { useTerritoryStore } from '@/store/filter';
import Icon from '@/app/components/iconcmp';
import IconCaretLeft from '@/assets/icons/caret_left.svg';

interface TerritoryProps {
  isActiveButton?: boolean;
  onClickTerritory?: Function;
}

export default function Territory({
  isActiveButton = false,
  onClickTerritory = () => {
    return;
  },
}: Readonly<TerritoryProps>) {
  const { territory } = useTerritoryStore();
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

  return (
    <>
      {isMobile() ? (
        <div className='flex justify-start items-center overflow-x-auto gap-3 pt-8'>
          {LIST_TERRITOIRES.map((data, index) => {
            return (
              <div key={data.name} data-test={`button_territory_${data.name}`}>
                <ActiveRadio
                  classname='w-[88px]'
                  icon={data.icon}
                  iconPosition='top-7'
                  classContent='h-28 flex justify-center items-center'
                  active={territory.name === data.name}
                  onClick={() => {
                    const { icon, ...restData } = data;
                    onClickTerritory(restData);
                  }}
                  IsactiveButton={isActiveButton}
                >
                  <div className='mt-8 text-center text-xs font-semibold whitespace-normal'>
                    {data.label}
                  </div>
                </ActiveRadio>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className='flex justify-start items-center overflow-x-auto gap-3 pt-8'
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
          {LIST_TERRITOIRES.map((data, index) => {
            return (
              <div key={data.name} data-test={`button_territory_${data.name}`}>
                <ActiveRadio
                  classname='w-[88px]'
                  icon={data.icon}
                  iconPosition='top-7'
                  classContent='h-28 flex justify-center items-center'
                  active={territory.name === data.name}
                  onClick={() => {
                    const { icon, ...restData } = data;
                    onClickTerritory(restData);
                  }}
                  IsactiveButton={isActiveButton}
                >
                  <div className='mt-8 text-center text-xs font-semibold whitespace-normal'>
                    {data.label}
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
    </>
  );
}
