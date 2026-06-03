import React from 'react';

import { twMerge } from 'tailwind-merge';

import { isModeDaltonien } from '@/utils/utils';

interface TitleProps {
  text: string;
  textDataTest?: string;
  underline?: boolean;
  className?: string;
}

export default function Title({
  text,
  textDataTest = '',
  underline = true,
  className,
}: TitleProps) {
  const oStyleUnderline: any = underline
    ? { textDecorationSkipInk: 'none' }
    : { textDecoration: 'none' };

  return (
    <div
      data-test={textDataTest}
      className={twMerge(
        'text-2xl font-bold text-color-primary underline underline-offset-[-2px] decoration-[9px] decoration-secondary',
        className,
        isModeDaltonien() && 'no-underline'
      )}
      style={oStyleUnderline}
    >
      {text}
    </div>
  );
}
