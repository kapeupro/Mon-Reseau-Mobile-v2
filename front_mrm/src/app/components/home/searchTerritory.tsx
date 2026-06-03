import React from 'react';

export default function SearchTerritory() {
  return (
    <div className='bg-white pb-8 pl-5'>
      <h2 className='text-color-primary font-semibold mb-4 '>
        Rechercher un territoire :
      </h2>
      <div className='flex gap-2'>
        <div className='bg-transparent  text-color-primary border-[1.5px]  px-4 py-2 hover:bg-primary hover:text-white hover:border-transparent hover:shadow-md transition duration-300 ease-in-out w-min rounded-full btn-btn-outline-primary'>
          Commune
        </div>
        <div className='bg-transparent  text-color-primary border-[1.5px]  px-4 py-2 hover:bg-primary hover:text-white hover:border-transparent hover:shadow-md transition duration-300 ease-in-out w-min rounded-full btn-btn-outline-primary'>
          Région
        </div>
        <div className='bg-transparent  text-color-primary border-[1.5px]  px-4 py-2 hover:bg-primary hover:text-white hover:border-transparent hover:shadow-md transition duration-300 ease-in-out w-min rounded-full btn-btn-outline-primary'>
          Département
        </div>
      </div>
    </div>
  );
}
