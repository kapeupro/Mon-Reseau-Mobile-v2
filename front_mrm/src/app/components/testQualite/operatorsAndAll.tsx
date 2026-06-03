'use client';
import React from 'react';

import { useOperatorsQosStore } from '@/store/qos';
import Operators from '../operatorsAndAll';

export default function OperatorsQos() {
  const { operators, toggleOperators } = useOperatorsQosStore();

  return (
    <Operators
      toggleOperators={toggleOperators}
      aSelectedOperators={operators}
      isAll
    />
  );
}
