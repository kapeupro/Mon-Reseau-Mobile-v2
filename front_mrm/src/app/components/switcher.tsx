import React from 'react';
import { twMerge } from 'tailwind-merge';

interface SwitcherProps {
  onToggle?: React.ChangeEventHandler<HTMLInputElement>;
  checked?: boolean;
  classname?: string;
  children?: React.ReactNode;
  type?: 'switcher' | 'radio';
  disabled?: boolean;
  dataTest?: string;
}

export default function Switcher({
  onToggle = () => {},
  checked = false,
  classname,
  children,
  type = 'switcher',
  disabled = false,
  dataTest = '',
}: SwitcherProps) {
  return (
    <label
      className={twMerge(
        'flex flex-col border justify-center cursor-pointer items-center space-y-2 rounded-2xl py-3 px-3 w-full',
        checked ? 'border-primary' : 'border-grey-20',
        classname
      )}
      data-test={dataTest}
    >
      {children}
      <div className={'w-[40px] flex justify-center'}>
        {type === 'switcher' ? (
          <div className={`h-4 relative`}>
            <input
              type='checkbox'
              value=''
              className='sr-only peer '
              checked={checked}
              onChange={onToggle}
              disabled={disabled}
            />
            <div
              className={`w-8 h-4 bg-grey-20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[2px] after:bg-white after:border-grey-20 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary`}
            ></div>
          </div>
        ) : (
          <div className='h-4'>
            <input
              type='radio'
              value=''
              className='cursor-pointer '
              checked={checked}
              onChange={onToggle}
              style={{ width: '16px', height: '16px' }}
              disabled={disabled}
            />
          </div>
        )}
      </div>
    </label>
  );
}
