'use client';
import React, { useState } from 'react';
import Link from 'next/link';

import ArrowBack from '@/assets/icons/arrow_back.svg';

import Icon from '@/app/components/iconcmp';
import GeometricShape from '@/app/components/geometricShape';

export default function Switcher() {
  return (
    <div className='space-y-2'>
      <Link href='/doc'>
        <Icon icon={<ArrowBack />} />
      </Link>
      <div className='space-y-4'>
        <GeometricShape
          color={{
            color: 'red-800',
            isHexaDecimal: false,
          }}
          size='md'
        />
        <GeometricShape
          type='rectangle'
          color={{
            color: 'primary',
            isHexaDecimal: false,
          }}
          size='md'
        />
        <GeometricShape
          color={{
            color: 'red-800',
            isHexaDecimal: false,
          }}
          type='rectangle'
        >
          <span className='text-xs'>5G Autres bandes</span>
        </GeometricShape>
      </div>
    </div>
  );
}
