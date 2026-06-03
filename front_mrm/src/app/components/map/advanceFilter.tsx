import React from 'react';

import Switcher from '@/app/components/switcher';

export default function MapAdvanceFilter() {
  return (
    <Switcher
      type='switcher'
      classname='absolute bottom-8 left-5 w-auto h-10 rounded-lg bg-white flex-row-reverse border-0 pb-5'
    >
      <div className='text-color-primary font-semibold ml-3 mt-2 justify-center items-start'>
        <p className='text-[10px]'>Filtres avancés</p>
        <p className='text-[12px]'>Mode expert</p>
      </div>
    </Switcher>
  );
}
