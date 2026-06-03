'use client';
import React from 'react';

import ButtonServices from '../buttonServices';
import { useServiceQosStore } from '@/store/qos';

interface ButtonServicesQos {
  children?: React.ReactNode;
}

export default function ButtonServicesQos({
  children,
}: Readonly<ButtonServicesQos>) {
  const { service, setService } = useServiceQosStore();
  return (
    <ButtonServices service={service} setService={setService}>
      {children}
    </ButtonServices>
  );
}
