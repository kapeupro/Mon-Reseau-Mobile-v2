'use client';
import React from 'react';

import Operators from '@/app/components/operatorsAndAll';
import { useOperatorsTrainStore } from '@/store/train';

export default function OperatorsTrain() {
  const { operators, toggleOperators } = useOperatorsTrainStore();

  return (
    <Operators
      toggleOperators={toggleOperators}
      aSelectedOperators={operators}
      isAll
    />
  );
}
