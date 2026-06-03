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
  isLink?: boolean;
  dataTest?: string;
}

export default function DataLinks({
  icon,
  title,
  description,
  item,
  className,
  isDivider = true,
  isSeparator = false,
  isLink = true,
  dataTest = '',
}: DataLinksProps) {
  const oClass = className || {};
  return (
    <div className={twMerge('flex flex-col gap-3', oClass.main)}>
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
      {isDivider && <hr />}
      {item.map((item, index, array) => (
        <div key={index}>
          {isLink ? (
            <a
              href={item.link}
              className={twMerge(
                'flex flex-row justify-between cursor-pointer',
                oClass.items
              )}
              target={item.target ?? '_self'}
              data-test={dataTest}
            >
              <span
                className={twMerge('text-sm font-semibold', oClass.itemUrl)}
              >
                {item.urlName}
              </span>
              <Icon icon={<IconLink />} />
            </a>
          ) : (
            <div
              className={twMerge(
                'flex flex-row justify-between cursor-pointer',
                oClass.items
              )}
            >
              {' '}
              <span
                className={twMerge('text-sm font-semibold', oClass.itemUrl)}
                data-test={dataTest}
              >
                {item.urlName}
              </span>
            </div>
          )}

          {index < array.length - 1 && isSeparator && <hr />}
        </div>
      ))}
    </div>
  );
}
