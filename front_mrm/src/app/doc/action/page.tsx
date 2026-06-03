'use client';
import React from 'react';
import Link from 'next/link';

import ArrowBack from '@/assets/icons/arrow_back.svg';

import Icon from '@/app/components/iconcmp';
import Action from '@/app/components/action';

export default function Switcher() {
  return (
    <div className='space-y-2'>
      <Link href='/doc'>
        <Icon icon={<ArrowBack />} />
      </Link>
      <div className='w-[291px]'>
        <Action
          title='Signalez un problème réseau'
          action={{
            text: "J'alerte l'Arcep",
            onClick: () => {
              return;
            },
          }}
        >
          Vous rencontrez un problème de couverture, de qualité de réseau, ou en
          lien avec ces données ?
        </Action>
      </div>
    </div>
  );
}
