import { isMobile } from '@/service/window';
import { useLoadingStore } from '@/store/store';
import React from 'react';
import MoonLoader from 'react-spinners/MoonLoader';
import { twMerge } from 'tailwind-merge';

export default function Loading() {
  const { bLoading } = useLoadingStore();
  const bMobile = isMobile();
  return (
    <div
      className={twMerge(
        'flex  items-center justify-center pb-10 !z-50',
        !bMobile && 'h-[calc(100vh-365px)]'
      )}
    >
      <MoonLoader color='#232253' loading={bLoading} size={150} />
    </div>
  );
}
