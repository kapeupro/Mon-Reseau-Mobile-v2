'use client';
import React from 'react';
import Link from 'next/link';

import Icon from '@/app/components/iconcmp';
import OperatorsAndAllComponent from '@/app/components/operatorsAndAll';

import ArrowBack from '@/assets/icons/arrow_back.svg';

export default function OperatorsAndAll() {
  return (
    <div className='space-y-2 space-x-2'>
      <Link href='/doc'>
        <Icon icon={<ArrowBack />} />
      </Link>
      <OperatorsAndAllComponent
        toggleOperators={() => {}}
        aSelectedOperators={[]}
      />
      <OperatorsAndAllComponent
        toggleOperators={() => {}}
        aSelectedOperators={[]}
        isAll={false}
      />
    </div>
  );
}
