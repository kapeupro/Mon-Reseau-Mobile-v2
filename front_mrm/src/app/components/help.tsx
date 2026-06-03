import React from 'react';

import { twMerge } from 'tailwind-merge';

import Icon from './iconcmp';
import IconHelp from '@/assets/icons/iconHelp.svg';
import { useTranslations } from 'next-intl';

interface HelpProps {
  onClick?: any;
  text?: string;
  className?: {
    main: string;
    text: string;
  };
}

export default function Help({
  onClick,
  className = { main: '', text: '' },
  text = '',
}: HelpProps) {
  const translations = useTranslations('whatIsThis');
  const title = text.length > 0 ? text : translations('title');
  return (
    <div
      onClick={onClick}
      className={twMerge(
        'flex text-gray-500 items-center cursor-pointer space-x-1 hover:underline  transition duration-300 ease-in-out',
        className.main
      )}
    >
      <Icon icon={<IconHelp />} width={15} />
      <span className={twMerge('text-sm font-medium', className.text)}>
        {title}
      </span>
    </div>
  );
}
