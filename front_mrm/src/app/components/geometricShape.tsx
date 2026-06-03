import React from 'react';
import { twMerge } from 'tailwind-merge';

interface GeometricShapeProps {
  type?: 'rectangle' | 'circle';
  size?: 'xs' | 'sm' | 'md' | 'xl';
  color: {
    color: string;
    isHexaDecimal: boolean;
  };
  classname?: {
    main?: string;
    geometry?: string;
  };
  children?: React.ReactNode;
  opacity?: any;
}

const oClassType = {
  rectangle: 'rounded-sm',
  circle: 'rounded-full',
};

const oClassSize = {
  xs: 'w-2.5 h-2.5',
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  xl: 'w-4 h-4',
};

export default function GeometricShape({
  type = 'circle',
  color: { color, isHexaDecimal },
  size = 'xs',
  classname,
  children,
  opacity,
}: GeometricShapeProps) {
  const style: any = isHexaDecimal
    ? {
        backgroundColor: color,
      }
    : {};

  if (opacity) {
    style['opacity'] = opacity;
  }

  return (
    <div className={twMerge('flex space-x-2 items-center', classname?.main)}>
      <div
        className={twMerge(
          !isHexaDecimal && `bg-${color}`,
          oClassType[type],
          oClassSize[size],
          classname?.geometry
        )}
        style={style}
      ></div>
      {children}
    </div>
  );
}
