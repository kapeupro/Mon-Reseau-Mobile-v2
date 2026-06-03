import React from 'react';

import Icon from '@/app/components/iconcmp';
import IconGroup from '@/assets/icons/group.svg';

export default function MapSuperposer() {
  return (
    <div className='absolute top-32 right-5 rounded-lg bg-white shadow'>
      <div className='relative pt-2 pl-3 text-color-primary'>
        <Icon icon={<IconGroup />} />
        <div className='absolute w-5 h-5 bg-primary top-1 left-1 text-white flex rounded-full'>
          <span className='font-semibold text-xs m-auto'>1</span>
        </div>
      </div>
    </div>
  );
}
