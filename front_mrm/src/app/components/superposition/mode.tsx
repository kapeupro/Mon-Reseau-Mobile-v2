import React from 'react';

import { useModeStore } from '@/store/superposition';

import IconStack from '@/assets/icons/stack.svg';

const aModes = [
  {
    name: 'superposer',
  },
  {
    name: 'juxtaposer',
  },
];

export default function Mode() {
  const { mode, setMode } = useModeStore();

  let nameChecked = 'superposer';
  let nameUnchecked = 'juxtaposer';

  let valueChecked = false;

  aModes.forEach((button, index) => {
    if (button.name === 'superposer') {
      nameChecked = button.name;
    } else if (button.name === 'juxtaposer') {
      nameUnchecked = button.name;
    }
    if (nameUnchecked === mode) {
      valueChecked = true;
    }
  });

  return (
    <div className='relative flex w-full'>
      <label className='flex-grow cursor-pointer'>
        <input
          checked={valueChecked}
          className='sr-only peer'
          value=''
          type='checkbox'
          onChange={(e) =>
            setMode(e.target?.checked ? nameUnchecked : nameChecked)
          }
        />
        <div
          className={`shadow font-paragraphe peer rounded-md outline-none duration-100 
            bg-white h-[35px] flex flex-row items-center relative
            `}
        >
          <div
            className={`absolute w-[calc(50%)]  h-[35px] rounded-lg duration-300 bg-primary z-[5] transition-transform ${
              mode === 'superposer'
                ? 'transition-transform ease-in-out duration-300 translate-x-[0%]'
                : `transition-transform ease-in-out duration-300 translate-x-[100%]`
            }`}
          ></div>
          <span
            className={`w-1/2 rounded-md duration-300 text-sm text-center text-gray-400 z-[5] flex  space-x-2 justify-center items-center ${
              mode === 'superposer' ? 'text-white' : ''
            }`}
          >
            <IconStack />
            <h4>Superposer</h4>
          </span>
          <span
            className={`w-1/2 rounded-md duration-300 text-sm text-center text-gray-400 z-[5] space-x-2 flex justify-center items-center ${
              mode === 'juxtaposer' ? 'text-white' : ''
            }`}
          >
            <IconStack />
            <h4>Juxtaposer</h4>
          </span>
        </div>
      </label>
    </div>
  );
}
