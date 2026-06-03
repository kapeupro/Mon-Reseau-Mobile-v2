import { useTitleStore } from '@/store/store';
import React, { useEffect } from 'react';

import { twMerge } from 'tailwind-merge';
import { isModeDaltonien } from '@/utils/utils';

interface TitleProps {
  text: string;
  underline?: boolean;
  className?: string;
}

export default function TitlePage({
  text,
  underline = true,
  className,
}: TitleProps) {
  const { addTitle } = useTitleStore();
  const oStyleUnderline: any = underline
    ? { textDecorationSkipInk: 'none' }
    : {};

  useEffect(() => {
    if (text) {
      addTitle(text);
    }
  }, [addTitle, text]);

  return (
    <h1
      data-test={`title-${text}`}
      className={twMerge(
        'text-2xl font-bold text-color-primary ',
        underline
          ? 'underline underline-offset-[-2px] decoration-[9px] decoration-secondary'
          : '',
        className,
        isModeDaltonien() && 'no-underline'
      )}
      style={oStyleUnderline}
    >
      {text}
    </h1>
  );
}
