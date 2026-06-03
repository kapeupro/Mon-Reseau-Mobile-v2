import React, { useEffect } from 'react';

import SignalementsFullPage from '@/app/components/signalement/index';
import InfoSignalement from '@/app/components/signalement/info';
import { useSignalementSubPagesStore } from '@/store/signalement';
import { PREFIX_LAYER } from '@/app/constant/constant';
import { useMapStore } from '@/store/map';

export default function Signalements() {
  const { subPage, setSubPage } = useSignalementSubPagesStore();

  useEffect(() => {
    return () => {
      setSubPage('');
    };
  }, []);

  useEffect(() => {
    if (subPage === '') {
      resetSignalementLayer();
    }
  }, [subPage]);

  return (
    <div className='pt-12 px-5'>
      {subPage === '' && <SignalementsFullPage />}
      {subPage === 'info' && <InfoSignalement />}
    </div>
  );
}

function resetSignalementLayer() {
  const { oMap } = useMapStore.getState();
  if (!oMap) {
    return;
  }
  const aLayers = oMap.getStyle().layers;
  const aSignalementLayers = aLayers.filter((layer: any) =>
    layer.id?.startsWith(`${PREFIX_LAYER}-signalement`)
  );

  if (!aSignalementLayers.length) {
    return;
  }

  const selectedSignalementLayer = aSignalementLayers.find((layer: any) =>
    layer.id.endsWith('-selected')
  );
  if (selectedSignalementLayer && oMap.getLayer(selectedSignalementLayer.id)) {
    oMap.setFilter(selectedSignalementLayer.id, ['==', ['get', 'id'], '']);
  }

  const signalementLayer = aSignalementLayers.find(
    (layer: any) => !layer.id.endsWith('-selected')
  );
  if (signalementLayer && oMap.getLayer(signalementLayer.id)) {
    oMap.setFilter(signalementLayer.id, ['all']);
  }
}
