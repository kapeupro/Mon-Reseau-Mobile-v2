import React from 'react';

import { twMerge } from 'tailwind-merge';

import CreditComponent from './superposition/credits';

import { useCreditStore } from '@/store/map';
import { isMobile } from '@/service/window';

export default function Credit() {
  const { show } = useCreditStore();
  const bIsMobile = isMobile();

  if (!show) {
    return null;
  }

  return (
    <div
      className={twMerge(
        'absolute bg-white rounded-md py-2 px-4 shadow bg-opacity-75',
        bIsMobile ? 'bottom-10 right-16' : 'bottom-3 right-16'
      )}
    >
      <CreditComponent
        className={{
          main: twMerge('gap-1 pb-0', bIsMobile ? 'text-ss' : 'text-xs'),
          text: '',
        }}
      />
    </div>
  );
}
