import { useEffect } from 'react';

import maplibregl, { LngLatLike } from 'maplibre-gl';

import { useToolsStore, useToolInfoPointStore } from '@/store/tools';
import { getAltitudes } from '@/service/altimetrie';
import DOMPurify from 'dompurify';

interface BasemapControlProps {
  oMap: any;
}

function createMarker() {
  const el = document.createElement('div');
  el.className = 'marker';
  el.style.backgroundImage =
    'url("assets/icons/measure-a.png"), url("assets/icons/quadruple-fleches.png")';
  el.style.backgroundSize = '70%, 70%';
  el.style.backgroundRepeat = 'no-repeat, no-repeat';
  el.style.backgroundPosition = '50% 48%, 50% -2%';
  el.style.width = '50px';
  el.style.height = '100px';

  return new maplibregl.Marker({ element: el, draggable: true });
}

const popup = new maplibregl.Popup({
  closeButton: false,
  closeOnClick: true,
  className: 'alert',
});

const marker = typeof window === 'undefined' ? undefined : createMarker();
if (marker) {
  marker.on('dragend', onDragEndMarker);
  marker.on('dragstart', onDragStartMarker);
}

function onDragEndMarker() {
  if (!marker) return;
  const { setCoordonne } = useToolInfoPointStore.getState();

  setCoordonne(marker.getLngLat());
}

function onDragStartMarker() {
  const { setStartDrag } = useToolInfoPointStore.getState();
  setStartDrag(true);
}

export default function ToolInfoPoint({ oMap }: BasemapControlProps) {
  const { show, subPageTools } = useToolsStore();
  const { coords, oData, startDrag, setStartDrag, setCoordonne, setData } =
    useToolInfoPointStore();

  const isActive = () => {
    return show && subPageTools === 'tools_alert';
  };

  useEffect(() => {
    if (!isActive()) {
      popup.remove();
      marker?.remove();
      return;
    }

    const coords = oMap.getCenter();
    setCoordonne(coords);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, subPageTools]);

  useEffect(() => {
    if (!isActive() || !coords) {
      popup.remove();
      marker?.remove();
      return;
    }

    const fetchAltitude = async () => {
      const lng = coords.lng;
      const lat = coords.lat;

      const aData = await getAltitudes(lng, lat);
      const oData: any = {
        lng,
        lat,
        lng_txt: lng.toFixed(6),
        lat_txt: lat.toFixed(6),
      };

      let z = '';
      if (aData) {
        z = aData[0].z === -99999 ? 0 : aData[0].z;
      }
      oData.z = z;

      setStartDrag(false);
      setData(oData);
    };

    fetchAltitude();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  useEffect(() => {
    if (!isActive() || !oData) {
      popup.remove();
      marker?.remove();
      return;
    }

    const coords: LngLatLike = [oData.lng, oData.lat];
    popup
      .setLngLat(coords)
      .setDOMContent(toDomElement(mergeTemplateInfoPoint(oData)))
      .addTo(oMap);

    marker?.setLngLat(coords).addTo(oMap);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oData]);

  useEffect(() => {
    if (startDrag) {
      popup.remove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDrag]);

  return null;
}

function buildTemplateInfoPoint() {
  const template = `
        <span class="text-color-primary">Altitude: [z] m</span>
        <div class="flex text-color-primary-500 mt-2">
            <div class="flex flex-col grow">
                <span>Lat. [lat_txt]</span>
                <span>Lon. [lng_txt]</span>
            </div>
            <button type="button" class="btn-copy-info-point"><img class="" src="assets/icons/copy_icon.svg" /></button>
        </div>
    `;
  return template;
}

function mergeTemplateInfoPoint(oData: any) {
  let template = buildTemplateInfoPoint();
  for (const [search, replacement] of Object.entries(oData)) {
    template = template.replace(`[${search}]`, replacement as string);
  }
  return template;
}

function toDomElement(template: any) {
  const divElement = document.createElement('div');
  divElement.className = 'flex flex-col text-xs font-semibold';
  divElement.innerHTML = DOMPurify.sanitize(template);

  const aBtn = divElement.getElementsByClassName('btn-copy-info-point');
  if (aBtn.length) {
    aBtn[0].addEventListener('click', copyInfoPoint);
  }
  return divElement;
}

function copyInfoPoint() {
  const { oData } = useToolInfoPointStore.getState();
  try {
    const textarea = document.createElement('textarea');
    textarea.value = `
Lat. ${oData.lat}
Lon. ${oData.lng}
`;

    textarea.style.position = 'absolute';
    textarea.style.left = '-99999999px';

    document.body.prepend(textarea);

    textarea.select();

    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Unable to copy text using execCommand:', err);
    } finally {
      textarea.remove();
    }
  } catch (error) {
    console.error('Error copying text to clipboard:', error);
  }
}
