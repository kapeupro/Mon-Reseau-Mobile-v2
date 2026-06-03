'use client';
import React, { useState } from 'react';
import Link from 'next/link';

import ArrowBack from '@/assets/icons/arrow_back.svg';

import Icon from '@/app/components/iconcmp';
import NetworkLevelComponent from '@/app/components/networkLevel';

export default function NetworkLevel() {
  return (
    <div className='space-y-2'>
      <Link href='/doc'>
        <Icon icon={<ArrowBack />} />
      </Link>
      <div className='flex flex-col gap-5'>
        Type rectangle :
        <NetworkLevelComponent value={0} />
        <NetworkLevelComponent value={25} />
        <NetworkLevelComponent value={55} />
        <NetworkLevelComponent value={95} />
      </div>
      <div className='flex flex-col gap-5'>
        Type triangle :
        <NetworkLevelComponent type='triangle' value={0} />
        <NetworkLevelComponent type='triangle' value={25} />
        <NetworkLevelComponent type='triangle' value={55} />
        <NetworkLevelComponent type='triangle' value={95} />
      </div>
    </div>
  );
}
