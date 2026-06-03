/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';

import { useTranslations } from 'next-intl';

import {
  useToolsStore,
  useToolInfoPointStore,
  useAltimetriqueToolsStore,
} from '@/store/tools';
import Tools from './tools/tools';
import { isMobile } from '@/service/window';
import { usePageStore } from '@/store/store';
import { usePageSuperpositionStore } from '@/store/superposition';
import IconCross from '@/assets/icons/close.svg';
import Title from './title';
import ToolsAltimetric from './tools/toolsAltimetric';
import ToolsDistance from './tools/toolsDistance';
import LeftArrow from '@/assets/icons/leftArrow.svg';
import { useControleStore, useMapStore } from '@/store/map';
import Action from './action';
import { generateUrlPrefilledForm } from '@/service/alert';

export default function tools() {
  const { show, subPageTools, setSubPageTools } = useToolsStore();
  const { oMeasure } = useControleStore();
  const { oMap } = useMapStore();
  const bIsMobile = isMobile();
  const toolsTranslation = useTranslations('measuretools');

  const closeTools = () => {
    const { page, setPage } = usePageStore.getState();
    const { setPage: setPageSuperposition } =
      usePageSuperpositionStore.getState();

    setPage(page);
    setPageSuperposition(undefined);

    setSubPageTools({
      isActive: false,
      show: false,
      subPageTools: '',
    });
    oMeasure.onRemove();

    oMap.getCanvas().style.cursor = '';
  };

  const titlePage = (): string => {
    let title = '';
    if (subPageTools === 'tools') {
      title = toolsTranslation('tools');
    } else if (subPageTools === 'tools_distance') {
      title = toolsTranslation('distance');
    } else if (subPageTools === 'tools_altimetrie') {
      title = toolsTranslation('altimeter');
    } else if (subPageTools === 'tools_alert') {
      title = toolsTranslation('alerte');
    }
    return title;
  };

  const handlerBack = () => {
    const { aPoints } = useAltimetriqueToolsStore.getState();

    if (
      ['tools_distance', 'tools_alert'].includes(subPageTools) ||
      (subPageTools === 'tools_altimetrie' && aPoints.length !== 2)
    ) {
      setSubPageTools({
        isActive: true,
        show: true,
        subPageTools: 'tools',
      });
      oMeasure.onRemove();
    } else if (subPageTools === 'tools_altimetrie') {
      setSubPageTools({
        isActive: true,
        show: true,
        subPageTools: 'tools_distance',
      });
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div
      className={`fixed z-50 right-0 px-5 ${
        bIsMobile
          ? 'left-0  bottom-0 m-2 h-min rounded-lg p-2 pb-2 mb-2 shadow-md'
          : 'mr-14 mt-14 bottom-3  max-w-[360px] rounded-lg p-4 shadow-md'
      } ${subPageTools === 'tools_alert' ? 'bg-secondary' : 'bg-white'} `}
    >
      {subPageTools === 'tools' && (
        <div className='bg-primary absolute top-4 z-20 right-0 left-0 pt-1.5 w-1/3 m-auto rounded-lg'>
          {' '}
        </div>
      )}
      <div className='flex justify-between'>
        <div className='flex'>
          {subPageTools !== 'tools' && (
            <LeftArrow className='my-5 mr-2' onClick={() => handlerBack()} />
          )}
          <Title text={titlePage()} underline={false} className='py-4' />
        </div>
        <CloseButtonDesktop closeTools={closeTools} />
      </div>
      {subPageTools === 'tools' && <Tools></Tools>}
      {subPageTools === 'tools_distance' && <ToolsDistance></ToolsDistance>}
      {subPageTools === 'tools_altimetrie' && (
        <ToolsAltimetric></ToolsAltimetric>
      )}
      {subPageTools === 'tools_alert' && <ToolAlert onClose={closeTools} />}
    </div>
  );
}

interface CloseButtonProps {
  closeTools: Function;
}

function CloseButtonDesktop({ closeTools }: Readonly<CloseButtonProps>) {
  return <IconCross onClick={closeTools} className='cursor-pointer mt-0.5' />;
}

interface ToolAlertProps {
  onClose: Function;
}
function ToolAlert({ onClose }: Readonly<ToolAlertProps>) {
  const signalementTranslation = useTranslations('signalement');
  return (
    <Action
      title=''
      action={{
        text: 'Signaler un problème à cet endroit',
        onClick: async () => {
          const { oData } = useToolInfoPointStore.getState();
          const url = await generateUrlPrefilledForm({
            localisation: {
              geolocalisation: {
                latitude: oData.lat.toFixed(6),
                longitude: oData.lng.toFixed(6),
                epsg: '4326',
              },
            },
          });
          if (url) {
            window.open(url, '_blank');
            onClose();
          }
        },
      }}
      className={{
        main: 'p-0',
        button: 'ml-0',
      }}
    >
      {signalementTranslation('reportDescription')}
      <p className='pt-6 pb-1'>{signalementTranslation('help')}</p>
    </Action>
  );
}
