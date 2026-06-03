'use client';
import React, { useState } from 'react';
import Link from 'next/link';

import ArrowBack from '@/assets/icons/arrow_back.svg';

import Icon from '../../components/iconcmp';
import ButtonGroup from '@/app/components/buttonGroup';

export default function Switcher() {
  const [active, setActive] = useState('internet');

  return (
    <div className='space-y-2'>
      <Link href='/doc'>
        <Icon icon={<ArrowBack />} />
      </Link>
      <div>
        <ButtonGroup
          buttons={[
            {
              text: 'Internet mobile',
              name: 'internet',
            },
            {
              text: 'Appels et SMS',
              name: 'appel_sms',
            },
          ]}
          active={active}
          setActive={setActive}
        />
      </div>
    </div>
  );
}
