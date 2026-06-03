import React from 'react';

import ArrowButton from '@/app/components/arrowButton';

import Mountain from '@/assets/icons/moutain.svg';

import { useToolsStore } from '@/store/tools';
import { useControleStore, useMapStore } from '@/store/map';
import Info from '@/app/components/info';
import Icon from '@/app/components/iconcmp';
import IconInfo from '@/assets/icons/iconInfo.svg';

export default function ToolsDistance() {
  const { setSubPageTools } = useToolsStore();
  const { oMeasure } = useControleStore();
  const { oMap } = useMapStore();

  let distance = '';
  if (oMeasure?.hasCoordinates()) {
    distance = oMeasure.getLabelDistance();
    oMap.getCanvas().style.cursor = '';
  }

  function onOpenAltimetrie() {
    setSubPageTools({
      isActive: true,
      show: true,
      subPageTools: 'tools_altimetrie',
    });
  }

  return (
    <div className={''}>
      {oMeasure?.hasCoordinates() ? (
        <>
          <span className='text-color-primary'>
            La distance entre A et B est de :{' '}
            <span className='font-semibold'>{distance}.</span>{' '}
          </span>
          <ArrowButton
            icon={<Mountain />}
            className='font-semibold mt-4'
            text={'Calculer le profil altimétrique'}
            onClick={onOpenAltimetrie}
          />
        </>
      ) : (
        <Help>
          <span className='text-xs leading-4'>
            Cliquez deux fois sur la carte pour mesurer la distance entre deux
            points.
          </span>
        </Help>
      )}
    </div>
  );
}

export function Help({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Info className='rounded-2xl mb-4'>
      <div className='flex flex-row items-center justify-center space-x-2'>
        <Icon icon={<IconInfo />} className='cursor-default' />
        {children}
      </div>
    </Info>
  );
}
