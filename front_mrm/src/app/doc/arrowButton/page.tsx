'use client';
import React from 'react';
import Link from 'next/link';

import ArrowButtonComponent from '@/app/components/arrowButton';
import Icon from '@/app/components/iconcmp';

import ArrowBack from '@/assets/icons/arrow_back.svg';
import MapIcon from '@/assets/icons/iconMap.svg';

export default function ArrowButton() {
  return (
    <div className='space-y-2'>
      <Link href='/doc'>
        <Icon icon={<ArrowBack />} />
      </Link>
      <ArrowButtonComponent
        text='Explorer la carte des zones à couvrir'
        icon={<MapIcon />}
        onClick={() => alert('Exploration activée')}
      />
      <br />
      <ArrowButtonComponent text="J'alerte l'Arcep" />
    </div>
  );
}
