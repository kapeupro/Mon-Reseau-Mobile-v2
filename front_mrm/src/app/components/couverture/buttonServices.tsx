'use client';
import React from 'react';

import ButtonServices from '../buttonServices';
import { useServiceStore } from '@/store/store';

interface ButtonServicesCouverture {
  children?: React.ReactNode;
}

export default function ButtonServicesCouverture({
  children,
}: Readonly<ButtonServicesCouverture>) {
  const { service, setService } = useServiceStore();
  return (
    <ButtonServices service={service} setService={setService}>
      {children}
    </ButtonServices>
  );
}
