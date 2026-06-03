import {
  getRandomInt,
  clearMapVectorHexa,
} from '@/app/components/map/drawMap/utils';

import { PREFIX_LAYER } from '@/app/constant/constant';
export default class drawMapHexa {
  mapObj;
  geojson;
  idSrcLayer = '';
  idLayer = '';
  prefixeLayer = `${PREFIX_LAYER}-quality-hexa`;
  constructor(mapObj: any, geojson: any) {
    this.mapObj = mapObj;
    this.geojson = geojson;
  }

  setIdSourceLayer() {
    this.idSrcLayer = `${this.prefixeLayer}-${getRandomInt(50000)}`;
  }
  getIdSourceLayer() {
    return this.idSrcLayer;
  }
  getTypeGeojson() {
    return this.geojson['type'];
  }
  getCoordinates() {
    return this.geojson['coordinates'];
  }
  addSourceLayer() {
    this.setIdSourceLayer();

    const idSrcLayer = this.getIdSourceLayer();

    if (!this.mapObj.getSource(idSrcLayer)) {
      const dataGeojson = {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: this.getTypeGeojson(),
                coordinates: this.getCoordinates(),
              },
            },
          ],
        },
      };
      this.mapObj.addSource(idSrcLayer, dataGeojson);
    }
  }
  setIdLayer() {
    this.idLayer = `${this.prefixeLayer}-${getRandomInt(50000)}`;
  }
  getIdLayer() {
    return this.idLayer;
  }
  addLayer() {
    this.setIdLayer();
    this.mapObj.addLayer({
      id: this.getIdLayer(),
      type: 'line',
      source: this.getIdSourceLayer(),
      layout: {
        visibility: 'visible',
      },
      paint: {
        'line-color': '#8F8DD4',
        'line-width': 2,
      },
    });
    this.mapObj.addLayer({
      id: this.getIdLayer() + '_fill',
      type: 'fill',
      source: this.getIdSourceLayer(),
      layout: {
        visibility: 'visible',
      },
      paint: {
        'fill-color': '#D5D4FF',
        'fill-opacity': 0.25,
      },
    });
    if (this.mapObj.getLayer('3d-building')) {
      this.mapObj.moveLayer('3d-building');
      this.mapObj.addLayer({
        id: this.getIdLayer() + '_fill_extrusion',
        type: 'fill-extrusion',
        source: this.getIdSourceLayer(),
        layout: {
          visibility: 'visible',
        },
        paint: {
          'fill-extrusion-color': 'hsla(5,98%,85%, 0.5)',
          'fill-extrusion-height': 80,
          'fill-extrusion-opacity': 0.5,
        },
      });
    }
  }
  draw() {
    clearMapVectorHexa(this.mapObj);
    this.addSourceLayer();
    this.addLayer();
  }
}
