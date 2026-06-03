'use client';
import React, { useState } from 'react';
import Link from 'next/link';

import ArrowBack from '@/assets/icons/arrow_back.svg';
import Stack from '@/assets/icons/stack.svg';
import SettingsInputAntenna from '@/assets/icons/settings_input_antenna.svg';

import SwitcherComponent from '@/app/components/switcher';
import Icon from '@/app/components/iconcmp';
import GeometricShape from '@/app/components/geometricShape';

export default function Switcher() {
  const [checked, setChecked] = useState(false);
  const [selectedValue, setSelectedValue] = useState('3G');

  const onToggle = () => {
    setChecked(!checked);
  };

  const onClick = (value: any) => {
    setSelectedValue(value);
  };

  return (
    <div className='space-y-2'>
      <Link href='/doc'>
        <Icon icon={<ArrowBack />} />
      </Link>
      <div>Switcher type :</div>
      <div>
        <SwitcherComponent
          checked={checked}
          onToggle={onToggle}
          type='switcher'
        >
          <Icon icon={<Stack />} />
          <span className='text-sm font-medium text-color-primary pb-1'>
            En service
          </span>
        </SwitcherComponent>
      </div>
      <div>
        <SwitcherComponent
          checked={checked}
          onToggle={onToggle}
          type='switcher'
        >
          <Icon icon={<SettingsInputAntenna />} width={16} height={16} shadow />
          <span className='text-sm font-medium text-color-primary pb-1'>
            En service
          </span>
        </SwitcherComponent>
      </div>
      <div className='flex space-x-2 w-[150px]'>
        <SwitcherComponent
          checked={checked}
          onToggle={onToggle}
          type='switcher'
          classname='max-w-none flex-1'
        >
          <span className='text-sm font-medium text-color-primary text-center leading-4 h-9'>
            4G
          </span>
        </SwitcherComponent>
        <SwitcherComponent
          checked={checked}
          onToggle={onToggle}
          type='switcher'
          classname='max-w-none flex-1'
        >
          <span className='text-sm font-medium text-color-primary text-center leading-4 h-9'>
            5G <br />
            Autres
          </span>
        </SwitcherComponent>
      </div>
      <div>Radio type :</div>
      <div className='flex space-x-2 w-[150px]'>
        <SwitcherComponent
          checked={selectedValue === '3G'}
          onToggle={() => onClick('3G')}
          type='radio'
          classname='max-w-none flex-1'
        >
          <span className='text-sm font-medium text-color-primary text-center leading-4 h-9'>
            3G
          </span>
        </SwitcherComponent>
        <SwitcherComponent
          checked={selectedValue === '4G'}
          onToggle={() => onClick('4G')}
          type='radio'
          classname='max-w-none flex-1'
        >
          <span className='text-sm font-medium text-color-primary text-center leading-4 h-9'>
            4G
          </span>
        </SwitcherComponent>
        <SwitcherComponent
          checked={selectedValue === '5G_autres'}
          onToggle={() => onClick('5G_autres')}
          type='radio'
          classname='max-w-none flex-1'
        >
          <span className='text-sm font-medium text-color-primary text-center leading-4 h-9'>
            5G <br />
            Autres
          </span>
        </SwitcherComponent>
        <SwitcherComponent
          checked={selectedValue === '4G'}
          onToggle={() => onClick('4G')}
          type='radio'
          classname='max-w-none flex-1'
        >
          <GeometricShape
            color={{
              color: '#4BE1BB',
              isHexaDecimal: true,
            }}
            size='md'
          />
          <span className='text-sm font-medium text-color-primary text-center'>
            Free
          </span>
        </SwitcherComponent>
      </div>
    </div>
  );
}
