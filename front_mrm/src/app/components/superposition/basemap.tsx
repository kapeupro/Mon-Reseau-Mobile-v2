import React from 'react';

import BasemapItem from './basemapitem';

import { useBasemapStore } from '@/store/superposition';
import { BASEMAPS } from '@/app/constant/superposition';

export default function Basemap() {
  const { oBasemap, setoBasemap } = useBasemapStore();

  const onToggleBasemap = (data: any) => {
    setoBasemap(data);
  };

  return (
    <div className='flex space-x-4'>
      {BASEMAPS.map((data) => (
        <BasemapItem
          key={data.name}
          checked={data.name === oBasemap.name}
          onToggle={onToggleBasemap}
          data={data}
        />
      ))}
    </div>
  );
}
