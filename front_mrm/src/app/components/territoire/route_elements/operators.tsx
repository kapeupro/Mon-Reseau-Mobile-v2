'use client';
import React from 'react';

import Operators from '@/app/components/operatorsAndAll';
import { useOperatorsRouteStore } from '@/store/route';

export default function OperatorsRoute() {
  const { operators, toggleOperators } = useOperatorsRouteStore();

  return (
    <Operators
      toggleOperators={toggleOperators}
      aSelectedOperators={operators}
      isAll
    />
  );
}
