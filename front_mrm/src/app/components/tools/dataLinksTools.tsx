import React from 'react';
import { twMerge } from 'tailwind-merge';

import Icon from '@/app/components/iconcmp';

import IconLink from '@/assets/icons/iconLink.svg';

interface DataLinksProps {
  icon?: any;
  title: string;
  description?: string;
  item: {
    urlName: string;
    link: string;
    target?: string;
  }[];
  className?: any;
  isDivider?: boolean;
  isSeparator?: boolean;
  onClick?: void;
}

export default function DataLinksTools({
  icon,
  title,
  description,
  item,
  className,
}: DataLinksProps) {
  const oClass = className || {};
  return (
    <div className={twMerge('flex flex-col gap-3 mt-2', oClass.main)}>
      <div className='flex flex-col gap-2'>
        <div className={twMerge('', oClass.icon)}>{icon}</div>
        <span
          className={twMerge(
            'font-bold text-color-primary leading-none',
            oClass.title
          )}
        >
          {title}
        </span>
        <span
          className={twMerge(
            'text-sm font-semibold leading-none',
            oClass.description
          )}
        >
          {description}
        </span>
      </div>
      <div className={twMerge('flex flex-wrap gap-2', oClass.list)}>
        {item.map((item, index, array) => (
          <a
            href={item.link}
            key={index}
            className={twMerge(
              'cursor-pointer shadow-custom w-auto inline-flex items-center  flex-none p-1 px-4 rounded-2xl font-paragraphe text-color-primary bg-white hover:bg-primary hover:text-white  transition duration-300 ease-in-out',
              oClass.items
            )}
            target={item.target ?? '_self'}
          >
            <div className='flex justify-between space-x-2'>
              {icon && <Icon icon={icon} />}
              <span
                className={twMerge(
                  'whitespace-no-wrap truncate text-sm mt-0.5'
                )}
              >
                {item.urlName}
              </span>
              <Icon icon={<IconLink />} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
