import { usePageStore } from '@/store/store';
import { useAntenneSubPagesStore } from '@/store/antenne';
import { useTestSubPagesStore } from '@/store/qualityTest';
import { useZoneSubPagesStore } from '@/store/zone';
import { useToolInfoPointStore } from '@/store/tools';
import { getAltitudes } from '@/service/altimetrie';
import { useSignalementSubPagesStore } from '@/store/signalement';
import { useCreditStore, useMapLoadingStore, useMapStore } from '@/store/map';

export const onClickMap = (e: any) => {
  setStorePage();
  hideCredit();
};

export const onIdleMap = (e: any) => {
  const { oMap } = useMapStore.getState();
  const { bLoading, setLoading } = useMapLoadingStore.getState();

  if (!oMap) {
    return;
  }

  if (oMap.areTilesLoaded()) {
    if (bLoading) {
      setLoading(false);
    }
  }
};

export const onDataloading = (e: any) => {
  const { oMap } = useMapStore.getState();
  const { bLoading, setLoading } = useMapLoadingStore.getState();

  if (!oMap) {
    return;
  }

  if (!bLoading) {
    setLoading(true);
  }
};

const setStorePage = () => {
  const { page } = usePageStore.getState();
  switch (page) {
    case 'qualite-reseau':
      setStorePageQos();
      break;
    case 'antennes-deploiements':
      setStorePageAntennes();
      break;
    case 'zones-a-couvrir':
      setStorePageZone();
      break;
    case 'signalements':
      setStorePageSignalements();
      break;
  }
};

const setStorePageQos = () => {
  const { subPage, setSubPage } = useTestSubPagesStore.getState();
  if (!subPage) {
    return;
  }
  setSubPage('');
};

const setStorePageAntennes = () => {
  const { subPage, setSubPage } = useAntenneSubPagesStore.getState();
  if (!subPage) {
    return;
  }
  setSubPage('');
};

const setStorePageZone = () => {
  const { subPage, setSubPage } = useZoneSubPagesStore.getState();
  if (!subPage) {
    return;
  }
  setSubPage('');
};

const setDataToolInfoPoint = async (e: any) => {
  const { isActive, setData, setShow } = useToolInfoPointStore.getState();
  if (!isActive) return;

  const {
    lngLat: { lng, lat },
  } = e;

  const aData = await getAltitudes(lng, lat);
  const oData: any = {
    lng,
    lat,
  };
  oData.z = aData ? aData[0].z : '';

  setData(oData);
  setShow(true);
};

const setStorePageSignalements = () => {
  const { subPage, setSubPage } = useSignalementSubPagesStore.getState();
  if (!subPage) {
    return;
  }
  setSubPage('');
};

export const hideCredit = () => {
  const { show, setShow } = useCreditStore.getState();
  if (show) {
    setShow(false);
  }
};
