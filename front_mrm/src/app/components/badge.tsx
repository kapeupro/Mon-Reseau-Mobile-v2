import React from 'react';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  text?: string;
  textColor?: 'black' | 'white' | 'primary';
  classname?: string;
  description?: string;
  color: {
    color?: string;
    isHexaDecimal?: boolean;
  };
  dataTest?: string;
}

export default function Badge({
  text,
  textColor = 'black',
  classname,
  description,
  color: { color, isHexaDecimal },
  dataTest = '',
}: BadgeProps) {
  const default_style =
    'inline-block px-1 pt-1.5 pb-2.5 rounded-2xl text-center';

  const style = isHexaDecimal
    ? {
        backgroundColor: color,
      }
    : {};

  return (
    <div
      className={twMerge(
        default_style,
        color ? '' : 'border',
        !isHexaDecimal && `bg-${color}`,
        `text-${textColor}`,
        classname
      )}
      style={style}
    >
      <span
        className='flex justify-center items-center text-sl font-medium'
        data-test={dataTest}
      >
        {text}
      </span>
      <span className='flex justify-center items-center  font-medium'>
        {description}
      </span>
    </div>
  );
}
