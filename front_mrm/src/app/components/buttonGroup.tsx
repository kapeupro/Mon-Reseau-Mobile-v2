import React from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/app/components/button';

interface buttonInterface {
  text: string;
  name: string;
}

interface buttonGroupProps {
  buttons: buttonInterface[];
  active: string;
  setActive: Function;
}

export default function ButtonGroup({
  buttons = [],
  active,
  setActive,
}: buttonGroupProps) {
  const listButtons = buttons.map((button, index) => {
    return (
      <Button
        key={button.name}
        title={button.name}
        className={twMerge(
          'flex-grow bg-none text-color-primary-500 shadow rounded-lg  hover:bg-white hover:text-color-primary-500 ',
          index > 0 && 'ml-[-15px] mt-0',
          active === button.name &&
            'bg-primary text-white z-10 hover:bg-primary hover:text-white'
        )}
        onClick={() => setActive(button.name)}
      >
        {button.text}
      </Button>
    );
  });
  return <div className='flex flex-grow'>{listButtons}</div>;
}
