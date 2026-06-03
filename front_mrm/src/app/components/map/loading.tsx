import React from 'react';

import { twMerge } from 'tailwind-merge';
import ClipLoader from 'react-spinners/ClipLoader';

import { isMobile } from '@/service/window';
import { useMapLoadingStore } from '@/store/map';

export default function MapLoading() {
  const { bLoading } = useMapLoadingStore();
  const bMobile = isMobile();

  if (!bLoading) {
    return null;
  }

  return (
    <div
      className={twMerge(
        'flex items-center justify-center rounded-lg bg-white shadow-xl absolute right-3 w-10 h-10',
        bMobile ? 'bottom-[175px] md:bottom-[145px]' : 'bottom-[210px]'
      )}
      data-test='loader'
    >
      <ClipLoader color='#232253' loading size={25} />
    </div>
  );
}
