'use client';
import React from 'react';

import Operators from '../operatorsAndAll';
import { useOperatorAndAllStore } from '@/store/store';

export default function OperatorsAntennes() {
  const { operatorsAndAll, toggleOperatorAndAll } = useOperatorAndAllStore();

  return (
    <Operators
      toggleOperators={toggleOperatorAndAll}
      aSelectedOperators={operatorsAndAll}
      isAll
      dataTest='antennas-operator-buttons'
    />
  );
}
