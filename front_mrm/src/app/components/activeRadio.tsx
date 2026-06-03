import React, { useState, useEffect, MouseEventHandler } from 'react';
import { twMerge } from 'tailwind-merge';

import Icon from '@/app/components/iconcmp';
import IconCaretLeft from '@/assets/icons/caret_left.svg';
import IconLeft from '@/assets/icons/iconLeft.svg';

interface ActiveRadioProps {
  onClick: MouseEventHandler<HTMLDivElement>;
  active?: boolean;
  IsactiveButton?: boolean;
  classname?: string;
  icon: any;
  iconPosition?: string;
  text?: string;
  children?: React.ReactNode;
  classContent?: string;
  dataTest?: string;
}

export default function ActiveRadio({
  onClick,
  active = false,
  classname,
  icon,
  iconPosition = 'top-4',
  text,
  children,
  IsactiveButton = true,
  classContent,
  dataTest = '',
}: ActiveRadioProps) {
  const [isChecked, setIsChecked] = useState(active);

  return (
    <div
      className={twMerge('inline-block w-full cursor-pointer', classname)}
      onClick={onClick}
    >
      <div
        className={twMerge(
          'flex flex-col relative border items-center rounded-2xl px-3 h-auto',
          active ? 'bg-stone-20 border-stone-400' : 'border-grey-20',
          classContent
        )}
        data-test={dataTest}
        // style={{ height: "auto" }}
      >
        {IsactiveButton ? (
          <div className='absolute top-1.5 right-3'>
            <input
              type='radio'
              value=''
              className='w-[15px] h-[15px]'
              checked={active}
              onChange={() => setIsChecked(!isChecked)}
            />
          </div>
        ) : (
          !active && (
            <IconLeft className='text-color-primary transform rotate-180 absolute top-1.5 right-1' />
          )
        )}
        <div
          className={twMerge(
            'absolute',
            iconPosition,
            active ? 'text-bg-secondary-text' : 'text-color-primary'
          )}
        >
          <Icon icon={icon} width={24} />
        </div>
        <div
          className={twMerge(
            'mt-9 mb-4 text-center text-sm font-medium whitespace-normal',
            active ? 'text-bg-secondary-text' : 'text-color-primary'
          )}
        >
          {text}
          {children}
        </div>
      </div>
    </div>
  );
}
