import React, { Fragment } from 'react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

interface IconProps {
  icon: any;
  width?: number;
  height?: number;
  shadow?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export default function Icon({
  icon,
  width = 24,
  height = 24,
  shadow = false,
  className,
  onClick = () => {
    return true;
  },
}: IconProps) {
  return (
    <div
      className={twMerge(
        'cursor-pointer',
        className,
        shadow && 'shadow-lg p-1 rounded-full'
      )}
      onClick={onClick}
    >
      {icon &&
        (icon.src ? (
          <Image src={icon} width={width} height={height} alt='icon' />
        ) : (
          <Fragment>{icon}</Fragment>
        ))}
    </div>
  );
}
