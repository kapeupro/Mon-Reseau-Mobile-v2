import React from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/app/components/button';
import Icon from '@/app/components/iconcmp';

import IconRight from '@/assets/icons/iconRight.svg';

interface ButtonProps {
  text?: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: any;
}

export default function ButtonOperator({
  text,
  className,
  children,
  onClick,
}: ButtonProps) {
  return (
    <Button
      title=''
      className={twMerge(
        'rounded-lg border-2 inline-flex items-center gap-4 justify-between w-full py-2 pr-4 mx-0',
        className
      )}
      onClick={onClick}
    >
      <span className='whitespace-no-wrap truncate text-sm'>{text}</span>
      <div className='flex flex-grow justify-between items-center'>
        {children}
      </div>
      <Icon icon={<IconRight />} />
    </Button>
  );
}
