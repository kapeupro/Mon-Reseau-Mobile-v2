'use client';
import React from 'react';

import { useOperatorsSignalementStore } from '@/store/signalement';
import Operators from '../operatorsAndAll';

export default function OperatorsSignalement() {
  const { operators, toggleOperators } = useOperatorsSignalementStore();

  return (
    <Operators
      toggleOperators={toggleOperators}
      aSelectedOperators={operators}
      isAll
    />
  );
}
