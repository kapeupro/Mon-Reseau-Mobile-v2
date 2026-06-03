import React from 'react';

import { twMerge } from 'tailwind-merge';

interface ToggleProps {
  label: string;
  checked: boolean;
  onToggle: any;
  className?: string;
  children?: React.ReactNode;
}

export default function Toggle({
  label,
  checked,
  onToggle,
  className = '',
  children,
}: Readonly<ToggleProps>) {
  return (
    <div
      className={twMerge(
        'border border-gray-400 rounded-xl p-4 flex justify-between items-center bg-white cursor-pointer',
        className
      )}
      onClick={onToggle}
    >
      <div>
        <h1 className='text-xs font-semibold'>{label}</h1>
        {children}
      </div>
      <div className='flex items-center'>
        <button
          className='h-4 relative'
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <input
            type='checkbox'
            className='sr-only peer '
            checked={checked}
            onChange={() => {
              return;
            }}
          />
          <div className="w-8 h-4 bg-grey-20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[2px] after:bg-white after:border-grey-20 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary"></div>
        </button>
      </div>
    </div>
  );
}
