import React, { useEffect } from 'react';

import { useBasemapStore } from '@/store/superposition';
import { useIsFirstMount } from '@/utils/useIsFirstMount';

import { PREFIX_LAYER, PREFIX_SOURCE_LAYER } from '@/app/constant/constant';

interface BasemapControlProps {
  oMap: any;
}

export default function BasemapControl({ oMap }: BasemapControlProps) {
  const { oBasemap } = useBasemapStore();
  const bFirstMount = useIsFirstMount();

  useEffect(() => {
    if (bFirstMount) {
      return;
    }

    const { name, style } = oBasemap;
    oMap.setStyle(style, {
      diff: false,
      transformStyle: (previousStyle: any, nextStyle: any) => {
        let aArcepLayers = previousStyle.layers.filter(
          (layer: any) =>
            layer.id &&
            (layer.id.startsWith(PREFIX_LAYER) ||
              layer.id.startsWith(`search-${PREFIX_LAYER}`))
        );

        const prevSource = previousStyle.sources;
        const aKeyPrevSourceArcep = Object.keys(prevSource).filter(
          (key) =>
            key.startsWith(PREFIX_SOURCE_LAYER) ||
            key.startsWith(`src-search-${PREFIX_LAYER}`)
        );

        const aSourceArcep: any = {};
        if (aKeyPrevSourceArcep.length) {
          for (const keyPrevSourceArcep of aKeyPrevSourceArcep) {
            aSourceArcep[keyPrevSourceArcep] = prevSource[keyPrevSourceArcep];
          }
        }

        aArcepLayers = aArcepLayers.map((layer: any) => {
          if (!layer.layout) {
            return layer;
          }

          const layout = layer.layout;
          let curLayout = {};
          if (name === 'ign' && layout['text-field']) {
            curLayout = {
              ...layout,
              'text-font': ['Source Sans Pro Regular'],
            };
          } else {
            const { 'text-font': font, ...restLayout } = layout;
            curLayout = restLayout;
          }

          const newLayer = {
            ...layer,
            layout: curLayout,
          };
          return newLayer;
        });

        return {
          ...nextStyle,
          layers: [...nextStyle.layers, ...aArcepLayers],
          sources: { ...nextStyle.sources, ...aSourceArcep },
        };
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oBasemap]);

  return null;
}
