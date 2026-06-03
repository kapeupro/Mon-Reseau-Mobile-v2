import React from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/app/components/button';
import Icon from '@/app/components/iconcmp';
import { isModeDaltonien } from '@/utils/utils';

import IconRight from '@/assets/icons/iconRight.svg';

interface ButtonProps {
  text: string;
  icon?: any;
  className?: string;
  children?: any;
  onClick?: any;
  textClassName?: string;
  secondary?: boolean;
}

export default function ArrowButton({
  text,
  icon,
  className = '',
  children,
  onClick,
  textClassName,
  secondary = false,
}: ButtonProps) {
  const bIsCustomButton = isModeDaltonien() && icon && !secondary;

  return (
    <Button
      title=''
      className={twMerge(
        'inline-flex items-center w-fit',
        className,
        bIsCustomButton
          ? 'border border-border-primary bg-btn-bg-primary'
          : 'shadow-custom'
      )}
      onClick={onClick}
    >
      <div
        className={twMerge(
          'flex justify-between space-x-2',
          bIsCustomButton && 'text-btn-bg-primary-text'
        )}
      >
        {icon && <Icon icon={icon} />}
        {children}
        <span
          className={twMerge(
            'whitespace-no-wrap truncate text-sm mt-0.5',
            textClassName
          )}
        >
          {text}
        </span>
        <Icon icon={<IconRight />} />
      </div>
    </Button>
  );
}
