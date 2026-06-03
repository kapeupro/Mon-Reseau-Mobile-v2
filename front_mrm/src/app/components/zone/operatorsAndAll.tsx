'use client';
import React from 'react';

import { useOperatorsZoneStore } from '@/store/zone';
import Operators from '@/app/components/operatorsAndAll';

export default function OperatorsZones() {
  const { operators, toggleOperators } = useOperatorsZoneStore();

  return (
    <Operators
      toggleOperators={toggleOperators}
      aSelectedOperators={operators}
      isAll
    />
  );
}
