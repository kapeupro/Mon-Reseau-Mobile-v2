import React from 'react';
import { twMerge } from 'tailwind-merge';

import Icon from './iconcmp';
import IconLink from '@/assets/icons/iconLink.svg';

interface InfoProps {
  title?: string;
  icon?: any;
  children?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  IsIconLink?: boolean;
  contentClassName?: string;
  iconLinkClassName?: string;
  contenairClassName?: string;
  link?: string;
  action?: any;
}

export default function Info({
  title,
  children,
  icon = '',
  className,
  titleClassName,
  IsIconLink = false,
  contentClassName,
  iconLinkClassName,
  contenairClassName,
  link,
  action,
}: Readonly<InfoProps>) {
  return (
    <div
      className={twMerge(
        'inline-block py-3 rounded-lg text-center bg-stone-20 items-center',
        className
      )}
    >
      <div
        className={twMerge(
          'flex flex-row justify-between relative text-bg-secondary-text',
          contenairClassName
        )}
      >
        {icon && (
          <>
            <div className='h-full ml-4 absolute flex items-center'>
              <Icon icon={icon} width={50} className='cursor-default' />
            </div>
            <div className='h-full mx-8'></div>
          </>
        )}
        <div
          className={twMerge('flex flex-col mx-5 text-left', contentClassName)}
        >
          <div
            className={twMerge(
              'whitespace-normal font-bold text-lg',
              titleClassName
            )}
          >
            {title}
          </div>
          <span className='text-sm whitespace-normal font-medium leading-3 text-clip overflow-hidden'>
            {children}
          </span>
        </div>
        <div className=''>
          {IsIconLink && (
            <Link
              iconLinkClassName={iconLinkClassName}
              link={link}
              action={action}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface LinkProps {
  iconLinkClassName?: string;
  link?: string;
  action?: any;
}

function LinkIcon() {
  return <Icon icon={<IconLink />} width={50} className='cursor-pointer' />;
}

function Link({ iconLinkClassName, link, action }: Readonly<LinkProps>) {
  const mainClassName = twMerge(
    'h-full mx-8  my-auto flex items-center',
    iconLinkClassName
  );

  if (action) {
    return (
      <button type='button' className={mainClassName} onClick={action}>
        <LinkIcon />
      </button>
    );
  }

  return (
    <a className={mainClassName} href={link ?? '#'} target='_blank'>
      <LinkIcon />
    </a>
  );
}
