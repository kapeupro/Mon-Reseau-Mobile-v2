import React, { useEffect } from 'react';
import AltimetricDraw from './altimetric/draw';
import { useMapStore } from '@/store/map';
import { useAltimetriqueToolsStore } from '@/store/tools';
import { Help } from './toolsDistance';
export default function ToolsAltimetric() {
  const { oMap } = useMapStore();
  const { aPoints } = useAltimetriqueToolsStore();

  useEffect(() => {
    if (aPoints.length !== 2) {
      return;
    }

    oMap.getCanvas().style.cursor = '';

    const oAltimetricDraw = new AltimetricDraw(aPoints[0], aPoints[1]);
    oAltimetricDraw.setMap(oMap);
    oAltimetricDraw.build();

    return () => {
      oAltimetricDraw.destroyChart();
    };
  }, [aPoints]);

  return aPoints.length === 2 ? (
    <div className={'h-64'}>
      <canvas id='canvas-altimetrie'></canvas>
    </div>
  ) : (
    <Help>
      <span className='text-xs leading-4'>
        Cliquez deux fois sur la carte pour calculer le profil
        altim&eacute;trique entre deux points.
      </span>
    </Help>
  );
}
