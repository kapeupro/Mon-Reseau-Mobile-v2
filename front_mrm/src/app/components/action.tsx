import React from 'react';
import { twMerge } from 'tailwind-merge';

import Button from './button';
import ArrowButton from '@/app/components/arrowButton';
import Icon from './iconcmp';

import IconRight from '@/assets/icons/iconRight.svg';

interface ActionProps {
  title?: string;
  children?: React.ReactNode;
  action?: {
    text: string;
    onClick: Function;
  };
  className?: {
    main?: string;
    title?: string;
    content?: string;
    button?: string;
  };
}

export default function Action({
  title,
  children,
  action,
  className,
}: ActionProps) {
  return (
    <div
      className={twMerge(
        'bg-secondary text-secondary-text py-4 px-[22px] space-y-3 rounded-2xl',
        className?.main
      )}
    >
      {title && (
        <h1 className={twMerge('text-[17px] font-bold', className?.title)}>
          {title}
        </h1>
      )}
      {children && (
        <div
          className={twMerge(
            'font-semibold text-xs text-justify',
            className?.content
          )}
        >
          {children}
        </div>
      )}
      {action && (
        <ArrowButton
          text={action.text}
          onClick={action.onClick}
          className={className?.button}
        />
      )}
    </div>
  );
}
