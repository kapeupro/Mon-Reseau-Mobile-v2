import React from 'react';
import { twMerge } from 'tailwind-merge';

import FullNetLevelSquare from '@/assets/icons/fullNetLevelSquare.svg';
import MiddleNetLevelSquare from '@/assets/icons/middleNetLevelSquare.svg';
import MinNetLevelSquare from '@/assets/icons/minNetLevelSquare.svg';
import NoneNetLevelSquare from '@/assets/icons/noneNetLevelSquare.svg';

import FullNetLevelTriangle from '@/assets/icons/fullNetLevelTriangle.svg';
import MiddleNetLevelTriangle from '@/assets/icons/middleNetLevelTriangle.svg';
import MinNetLevelTriangle from '@/assets/icons/minNetLevelTriangle.svg';
import NoneNetLevelTriangle from '@/assets/icons/noneNetLevelTriangle.svg';

interface NetWorkLevelProps {
  type?: 'rectangle' | 'triangle';
  value: number;
  classname?: string;
  children?: React.ReactNode;
}

export default function NetWorkLevel({
  type = 'rectangle',
  value = 0,
  classname,
}: NetWorkLevelProps) {
  return (
    <div
      className={twMerge(
        'flex flex-col justify-center items-center',
        classname
      )}
    >
      {type === 'rectangle' ? (
        <>
          {value === 0 && <NoneNetLevelSquare />}
          {value > 0 && value < 50 && <MinNetLevelSquare />}
          {value >= 50 && value <= 90 && <MiddleNetLevelSquare />}
          {value > 90 && <FullNetLevelSquare />}
          <span className='text-sl pt-1'>{value} %</span>
        </>
      ) : (
        <>
          {value === 0 && <NoneNetLevelTriangle />}
          {value > 0 && value < 50 && <MinNetLevelTriangle />}
          {value >= 50 && value <= 90 && <MiddleNetLevelTriangle />}
          {value > 90 && <FullNetLevelTriangle />}
        </>
      )}
    </div>
  );
}
