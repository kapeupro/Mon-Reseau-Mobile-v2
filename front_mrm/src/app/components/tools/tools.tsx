import React, { useEffect, useState } from 'react';

import html2canvas from 'html2canvas';
import MoonLoader from 'react-spinners/MoonLoader';

import ActiveRadio from '@/app/components/activeRadio';
import ArrowButton from '@/app/components/arrowButton';

import Mountain from '@/assets/icons/moutain.svg';
import Ruler from '@/assets/icons/ruler.svg';

import { usePageStore } from '@/store/store';
import {
  useCrowdsourcingStore,
  useToolsStore,
  useMesureToolsStore,
  useAltimetriqueToolsStore,
  useToolInfoPointStore,
} from '@/store/tools';
import { useControleStore, useMapStore } from '@/store/map';

import { getListCrowdsourcing } from '@/service/altimetrie';

import DataLinksTools from './dataLinksTools';
import MapGenerator, { Size, Format, DPI, Unit } from './print/map-generator';
import { usePrintMapStore } from '@/store/print';
import Alert from '../alert';
import { useTranslations } from 'next-intl';

export default function Tools() {
  const { oMap: mapObj } = useMapStore();
  const { oMeasure } = useControleStore();
  const { setSubPageTools } = useToolsStore();
  const { page, setPage } = usePageStore.getState();
  const { isMesure, setMesure } = useMesureToolsStore();
  const { aData: dataCrowdsourcing, loading: bLoadingCrowdsourcing } =
    useFetchDataCrowdsourcing();
  const { loading: loadPrint, setLoading: setLoadPrint } = usePrintMapStore();
  const {
    isActive: isActiveToolInfoPoint,
    setActive: setActivateToolPoint,
    setShow: setShowInfoPoint,
  } = useToolInfoPointStore();
  const { setPoints } = useAltimetriqueToolsStore();

  const [activeDistance, setActiveDistance] = useState(false);
  const [activeAltimetrie, setActiveAltimetrie] = useState(false);
  const measureTranslation = useTranslations('measuretools');

  useEffect(() => {
    return () => {
      setShowInfoPoint(false);
      setActivateToolPoint(false);
    };
  }, []);

  const closeTools = () => {
    setPage(page);
    setSubPageTools({
      isActive: false,
      show: false,
      subPageTools: '',
    });
  };

  const handlerActiveMesure = () => {
    const bvalue = !isMesure;
    setMesure(bvalue);
    oMeasure.clearMap();
    oMeasure.setIsAltimetrie(false);
    oMeasure.setActivate(true);
    setActiveDistance(!activeDistance);

    // Change cursor to crosshair for the map canvas
    mapObj.getCanvas().style.cursor = activeDistance ? '' : 'crosshair';

    if (bvalue) {
      closeTools();
    }

    setSubPageTools({
      isActive: true,
      show: true,
      subPageTools: 'tools_distance',
    });

    if (activeDistance) {
      oMeasure.onRemove();
    } else {
      setActiveAltimetrie(false);
    }
  };

  const handlerGoToAltimetrique = () => {
    setPage(page);
    setPoints([]);
    oMeasure.clearMap();
    oMeasure.setIsAltimetrie(true);
    oMeasure.setActivate(true);
    setActiveAltimetrie(!activeAltimetrie);

    // Change cursor to crosshair for the map canvas
    mapObj.getCanvas().style.cursor = activeAltimetrie ? '' : 'crosshair';

    closeTools();
    setSubPageTools({
      isActive: true,
      show: true,
      subPageTools: 'tools_altimetrie',
    });

    if (activeAltimetrie) {
      oMeasure.onRemove();
    } else {
      setActiveDistance(false);
    }
  };

  const handleGenerer = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setLoadPrint(true);
  };

  useEffect(() => {
    if (!loadPrint) {
      return;
    }

    async function printMap() {
      const legendCanvas = await html2canvas(
        document.getElementById('id_legend')!
      );

      const eltScale: HTMLElement = document.querySelector(
        '.maplibregl-ctrl-scale'
      )!;

      eltScale.style.paddingBottom = '25px';
      eltScale.style.height = '15px';
      const scaleCanvas = await html2canvas(eltScale);
      eltScale.style.paddingBottom = '';
      eltScale.style.height = '';

      const mapGenerator = new MapGenerator(
        mapObj!,
        legendCanvas,
        scaleCanvas,
        Size.A4,
        Number(DPI[300]),
        Format.PNG,
        Unit.mm
      );

      await mapGenerator.generate();

      setLoadPrint(false);
    }

    try {
      printMap();
    } catch (e) {
      console.error(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPrint]);

  useEffect(() => {
    if (!isActiveToolInfoPoint) {
      setShowInfoPoint(false);
    }

    mapObj.getCanvas().style.cursor = isActiveToolInfoPoint ? 'crosshair' : '';
  }, [isActiveToolInfoPoint]);

  return (
    <div className={''}>
      <div className='flex justify-center items-center space-x-2'>
        <ActiveRadio
          classname=''
          classContent='h-24 flex justify-center items-center'
          icon={<Ruler />}
          text={measureTranslation('btn-measure')}
          onClick={handlerActiveMesure}
          active={activeDistance}
          IsactiveButton={false}
        />
        <ActiveRadio
          classname=''
          classContent='h-24 flex justify-center items-center'
          icon={<Mountain />}
          text={measureTranslation('btn-altimetrique')}
          onClick={handlerGoToAltimetrique}
          active={activeAltimetrie}
          IsactiveButton={false}
        />
      </div>

      {loadPrint ? (
        <div className='flex justify-center my-4'>
          <MoonLoader color='#232253' loading={loadPrint} size={25} />
        </div>
      ) : (
        <div className='flex justify-center'>
          <ArrowButton
            icon={<Mountain />}
            className='font-semibold my-4'
            text={measureTranslation('btn-exportmap')}
            onClick={(e: any) => handleGenerer(e)}
          />
        </div>
      )}
      <Alert />
      {bLoadingCrowdsourcing ? (
        <div className='flex justify-center mt-4'>
          <MoonLoader
            color='#232253'
            loading={bLoadingCrowdsourcing}
            size={50}
          />
        </div>
      ) : (
        <DataLinksTools
          title={measureTranslation('label-test')}
          item={dataCrowdsourcing}
          className={{ main: 'mb-4', items: '' }}
        />
      )}
    </div>
  );
}

function useFetchDataCrowdsourcing() {
  const { aData, setData } = useCrowdsourcingStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (aData.length) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      let data = await getListCrowdsourcing();
      data = data.map((dt: any) => ({
        link: dt.link_value,
        urlName: dt.label_value,
        target: '_blank',
      }));
      setData(data);
      setLoading(false);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { aData, loading: aData.length ? false : loading };
}
