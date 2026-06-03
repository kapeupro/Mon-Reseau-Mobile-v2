import React from 'react';
import Icon from './iconcmp';

interface BreadcrumbsProps {
  items: {
    iconHome?: any;
    text?: string;
    href?: string;
    onClick?: any;
  }[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className='flex'>
      <ol className='inline-flex flex-wrap space-x-1'>
        {items.map((item, index) => (
          <li key={index}>
            <a
              className='flex space-x-1 text-gray-400 text-sm font-normal'
              href={item.href}
              onClick={item.onClick} // Utilisez onClick pour déclencher la fonction
            >
              <div className='cursor-pointer'>
                {item.iconHome && (
                  <div className='mt-0.5'>
                    <Icon icon={item.iconHome} width={18} />
                  </div>
                )}
                <div className='underline'>{item.text}</div>
              </div>
              {index < items.length - 1 && (
                <div
                  className='text-gray-400 cursor-default'
                  style={{ pointerEvents: 'none' }}
                >
                  {' '}
                  ›{' '}
                </div>
              )}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
