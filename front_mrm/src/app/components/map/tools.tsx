import React, { useEffect } from 'react';

import Icon from '@/app/components/iconcmp';

import IconCurrentLocation from '@/assets/icons/currentLocation.svg';
import IconMoreVert from '@/assets/icons/moreVert.svg';
import IconStack from '@/assets/icons/stack.svg';
import { isMobile } from '@/service/window';
import { useSuperpositionStore, useThemesStore } from '@/store/superposition';
import { useAttributionStore } from '@/store/toolAttribute';
import { useControleStore, useMapStore } from '@/store/map';
import { usePageStore } from '@/store/store';
import { useToolsStore } from '@/store/tools';
import { getDataGeolocalisation } from '@/service/geolocalisation';
import { useCoordStore, useSelectionStore } from '@/store/selectedCoordStore';

const getCountSuperposition = (aThemes: any) => {
  let count = 0;
  const { page } = usePageStore.getState();

  for (const theme of aThemes) {
    if (theme.bSuperposer || theme.name === page) {
      count += 1;
    }
  }

  return count;
};

export default function MapTools() {
  const IsMobile = isMobile();
  const { showAttribution, toggleAttribution } = useAttributionStore();
  const {
    subPageTools,
    setSubPageTools,
    isActive: isActiveTools,
    show: isShowTools,
  } = useToolsStore();

  const {
    isActive: isActiveSuperposition,
    show: isShowSuperposition,
    setState: setStateSuperposition,
    setShow: setShowSuperposition,
  } = useSuperpositionStore();

  const { oMap } = useMapStore();
  const { themes: aThemesSuperposition } = useThemesStore();
  const countSuperposition = getCountSuperposition(aThemesSuperposition);
  const { oMeasure, setControle } = useControleStore();
  const { selectTerritoire } = useCoordStore();
  const { setIsSelect } = useSelectionStore();

  const onClickSuperposition = () => {
    const isCurrentActiveSuperposition =
      isActiveSuperposition === isShowSuperposition
        ? !isActiveSuperposition
        : true;

    setStateSuperposition({
      isActive: isCurrentActiveSuperposition,
      show: isCurrentActiveSuperposition,
    });
    if (isShowTools || isActiveTools) {
      setSubPageTools({
        isActive: false,
        show: false,
        subPageTools: '',
      });
    }
  };

  const onClickGeolocalisation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let geolocalisationResults;

        try {
          geolocalisationResults = await getDataGeolocalisation(
            `${longitude},${latitude}`
          );
        } catch (erreur) {
          console.error("Une erreur s'est produite : ", erreur);
        }

        oMap.flyTo({
          center: [longitude, latitude],
          zoom: 16,
          essential: true,
        });

        const oTerritoire =
          Array.isArray(geolocalisationResults) && geolocalisationResults.length
            ? geolocalisationResults[0]
            : null;

        selectCoord(oTerritoire);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          alert(
            'Veuillez activer la géolocalisation de votre appareil pour accéder à cette fonctionnalité.'
          );
        } else {
          alert('Erreur lors de la récupération de la position.');
        }
      }
    );
  };

  const selectCoord = (data: any) => {
    selectTerritoire(data);
    setIsSelect(true);
  };

  const onClickTools = () => {
    const isCurrentActiveTools =
      isActiveTools === isShowTools ? !isActiveTools : true;
    setSubPageTools({
      isActive: isCurrentActiveTools,
      show: isCurrentActiveTools,
      subPageTools: 'tools',
    });
    if (isShowSuperposition) {
      setShowSuperposition(false);
    }
  };

  const aToolsDestop = [
    {
      icon: <IconStack />,
      onclick: onClickSuperposition,
      name: 'stack',
    },
    {
      icon: <IconMoreVert />,
      onclick: onClickTools,
      name: 'more',
    },
  ];

  const aToolsMobile = [
    {
      icon: <IconStack />,
      onclick: onClickSuperposition,
      name: 'stack',
    },
    {
      icon: <IconCurrentLocation />,
      onclick: onClickGeolocalisation,
      name: 'location',
    },
    {
      icon: <IconMoreVert />,
      onclick: onClickTools,
      name: 'more',
    },
  ];

  useEffect(() => {
    if (!oMap) {
      return;
    }
    const attributionControl: any = document.querySelector(
      '.maplibregl-ctrl-attrib'
    );
    const attributionButton: any = document.querySelector(
      '.maplibregl-ctrl-attrib-button'
    );
    const attribctrlBottomRight: any = document.querySelector(
      '.maplibregl-ctrl-bottom-right'
    );
    const scaleElement: any = document.querySelector('.maplibregl-ctrl-scale');

    if (scaleElement) {
      scaleElement.setAttribute('data-test', 'scale');
    }

    if (attribctrlBottomRight) {
      attribctrlBottomRight.setAttribute('data-test', 'zoom-buttons');
    }

    if (!attributionControl) {
      return;
    }
    if (!attributionButton) {
      return;
    }

    if (IsMobile) {
      attribctrlBottomRight.style.display = 'none';
    }

    attributionControl.style.display = 'none';

    if (!showAttribution) {
      // attributionControl.classList.add("maplibregl-compact-show")
      attributionControl.style.display = 'none';
      attributionButton.style.display = 'none';
    } else {
      // attributionControl.classList.remove("maplibregl-compact-show")
      attributionControl.style.display = 'block';
      attributionButton.style.display = 'none';
    }
  }, [showAttribution, oMap, IsMobile]);

  const aTools = IsMobile ? aToolsMobile : aToolsDestop;

  return oMeasure?.activate && IsMobile ? null : (
    <>
      <div
        className='absolute bottom-10  lg:bottom-3 right-3 w-10 md:h-24 h-32 rounded-lg bg-white flex flex-col shadow-xl '
        data-test='tools-buttons'
      >
        {isActiveSuperposition && Boolean(countSuperposition) && (
          <div className='bg-primary text-white  w-[17px] h-[17px] absolute text-xs text-center left-[-2px] top-[-4px] rounded-[100%]'>
            {countSuperposition}
          </div>
        )}
        {aTools.map((tool, index) => {
          let classBoder =
            index === aToolsMobile.length - 1 ? '' : 'border-b border-grey-20';
          return (
            <Icon
              key={tool.name}
              icon={tool.icon}
              className={`w-full grow flex justify-center items-center text-color-primary ${classBoder} ${
                isActiveSuperposition && tool.name === 'stack' && !isActiveTools
                  ? 'bg-purple-20 rounded-t-lg '
                  : ''
              } ${
                isActiveTools && tool.name === 'more'
                  ? 'bg-purple-20 rounded-b-lg'
                  : ''
              }`}
              onClick={tool.onclick}
            />
          );
        })}
      </div>
    </>
  );
}
