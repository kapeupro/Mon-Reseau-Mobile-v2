'use client';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import IconDown from '@/assets/icons/iconDown.svg';

interface DropDownBlockProps {
  classname?: string;
  headerClassname?: string;
  header?: React.ReactNode;
  children: React.ReactNode;
  separator?: boolean;
  show?: boolean;
}

export default function DropDownBlock({
  classname,
  headerClassname,
  header,
  children,
  separator = false,
  show = false,
}: DropDownBlockProps) {
  const [showContent, setShow] = useState(show);

  const onToggle = () => {
    setShow(!showContent);
  };

  return (
    <div className={twMerge('flex flex-col', classname)}>
      <div
        className={twMerge(
          'flex flex-row justify-between items-center cursor-pointer',
          headerClassname
        )}
        onClick={onToggle}
      >
        {header}
        <IconDown
          className={
            showContent
              ? 'transform transition-transform duration-500 rotate-180'
              : 'transform transition-transform duration-500'
          }
        />
      </div>
      {separator && <hr className='border-gray-400' />}
      <div
        className={twMerge(
          'transition-grid-template-rows grid ',
          showContent ? 'grid-rows-1fr' : 'grid-rows-0fr'
        )}
      >
        <div className='overflow-hidden'>{children}</div>
      </div>
    </div>
  );
}
