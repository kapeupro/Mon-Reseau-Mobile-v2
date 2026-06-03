import {
  getRandomInt,
  clearMapVectorSite,
} from '@/app/components/map/drawMap/utils';

import { ZOOM_CLUSTER } from '@/app/constant/antennes';

export default class drawMapSite {
  mapObj;
  dataEmetteur;
  idSrcLayer = '';
  idLayer = '';
  prefixeLayer = 'layer-arcep-site';
  constructor(mapObj: any, dataEmetteur: any) {
    this.mapObj = mapObj;
    this.dataEmetteur = dataEmetteur[0];
  }

  setIdSourceLayer() {
    this.idSrcLayer = `src-${this.prefixeLayer}-${getRandomInt(50000)}`;
  }
  getIdSourceLayer() {
    return this.idSrcLayer;
  }
  getX() {
    return this.dataEmetteur['x'];
  }
  getY() {
    return this.dataEmetteur['y'];
  }
  addSourceLayer() {
    this.setIdSourceLayer();

    const idSrcLayer = this.getIdSourceLayer();

    if (!this.mapObj.getSource(idSrcLayer)) {
      this.mapObj.addSource(idSrcLayer, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [this.getX(), this.getY()],
              },
            },
          ],
        },
      });
    }
  }
  setIdLayer(antenne: any) {
    this.idLayer = `${this.prefixeLayer}-${
      antenne['fidantenne']
    }-${getRandomInt(50000)}`;
  }
  setIdMainLayer() {
    this.idLayer = `${this.prefixeLayer}-mainsite-${getRandomInt(50000)}`;
  }
  getIdLayer() {
    return this.idLayer;
  }
  getRotationEmetteur(antenne: any) {
    return parseInt(antenne['azimut']);
  }
  getRotationBeam(antenne: any) {
    return parseInt(antenne['azimut']);
  }
  addLayer(antenne: any) {
    this.setIdLayer(antenne);

    this.mapObj.addLayer({
      id: this.getIdLayer() + '-beam',
      type: 'symbol',
      source: this.getIdSourceLayer(),
      layout: {
        'icon-image': 'beam',
        'icon-overlap': 'always',
        'icon-rotate': this.getRotationBeam(antenne),
        'icon-offset': [0, -400],
        'icon-size': 0.15,
        'icon-rotation-alignment': 'map',
      },
      minzoom: ZOOM_CLUSTER,
    });

    this.mapObj.addLayer({
      id: this.getIdLayer(),
      type: 'symbol',
      source: this.getIdSourceLayer(),
      layout: {
        'icon-image': 'arrow',
        'icon-overlap': 'always',
        'icon-rotate': this.getRotationEmetteur(antenne),
        'icon-offset': [0, -25],
        'icon-rotation-alignment': 'map',
      },
      minzoom: ZOOM_CLUSTER,
    });
  }
  addLayerMain() {
    this.setIdMainLayer();
    this.mapObj.addLayer({
      id: this.getIdLayer(),
      type: 'symbol',
      source: this.getIdSourceLayer(),
      layout: {
        'icon-image': 'site',
        'icon-overlap': 'always',
        'icon-rotate': 0,
        'icon-offset': [0, 0],
      },
      minzoom: ZOOM_CLUSTER,
    });
  }
  draw() {
    clearMapVectorSite(this.mapObj);
    this.addSourceLayer();
    this.addLayerMain();

    if (this.dataEmetteur['antennes']) {
      for (const antenne of this.dataEmetteur['antennes']) {
        this.addLayer(antenne);
      }
    }
  }
}
