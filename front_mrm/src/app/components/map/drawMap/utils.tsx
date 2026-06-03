import { PREFIX_LAYER } from '@/app/constant/constant';

export const isLayerExist = (idlayer: string, mapObj: any) => {
  var styleLayer = mapObj.getLayer(idlayer);
  if (typeof styleLayer == 'undefined') {
    return false;
  }
  return true;
};

export const removeLayer = (idlayer: string, mapObj: any) => {
  mapObj.removeLayer(idlayer);
};

const getPrefixLayer = () => {
  return 'layer-arcep';
};

const getPrefixLayerTerritory = () => {
  return 'search-layer-arcep';
};

const getPrefixLayerSite = () => {
  return 'layer-arcep-site';
};

const getPrefixLayerHexa = () => {
  return 'layer-arcep-quality-hexa';
};

const getPrefixLayerTerritoryCouverture = () => {
  return `${PREFIX_LAYER}-territory-couverture`;
};

export const clearMapVectorSite = (mapObj: any) => {
  var bRemoved = false;
  for (var i = mapObj.getStyle().layers.length - 1; 0 <= i; i--) {
    var layerId = mapObj.getStyle().layers[i].id;
    if (
      layerId.substring(0, getPrefixLayerSite().length) === getPrefixLayerSite()
    ) {
      if (isLayerExist(layerId, mapObj)) {
        removeLayer(layerId, mapObj);
        bRemoved = true;
      }
    }
  }
  return bRemoved;
};

export const clearMapVectorHexa = (mapObj: any) => {
  var bRemoved = false;
  for (var i = mapObj.getStyle().layers.length - 1; 0 <= i; i--) {
    var layerId = mapObj.getStyle().layers[i].id;
    if (
      layerId.substring(0, getPrefixLayerHexa().length) === getPrefixLayerHexa()
    ) {
      if (isLayerExist(layerId, mapObj)) {
        removeLayer(layerId, mapObj);
        bRemoved = true;
      }
    }
  }
  return bRemoved;
};

export const clearMapVector = (mapObj: any) => {
  var bRemoved = false;
  for (var i = mapObj.getStyle().layers.length - 1; 0 <= i; i--) {
    var layerId = mapObj.getStyle().layers[i].id;
    if (layerId.substring(0, getPrefixLayer().length) === getPrefixLayer()) {
      if (isLayerExist(layerId, mapObj)) {
        removeLayer(layerId, mapObj);
        bRemoved = true;
      }
    }
  }
  return bRemoved;
};

export const clearMapVectorTerritory = (mapObj: any) => {
  var bRemoved = false;
  for (var i = mapObj.getStyle().layers.length - 1; 0 <= i; i--) {
    var layerId = mapObj.getStyle().layers[i].id;
    if (
      layerId.substring(0, getPrefixLayerTerritory().length) ===
      getPrefixLayerTerritory()
    ) {
      if (isLayerExist(layerId, mapObj)) {
        removeLayer(layerId, mapObj);
        bRemoved = true;
      }
    }
  }
  return bRemoved;
};

export const getDeptNotInMetropole = () => {
  return ['971', '972', '973', '974', '976', '977', '978'];
};

export const getIdDeptTerritory = (mapGlobalParameters: any) => {
  return mapGlobalParameters['territory']['dept'];
};

export const isMetropole = (mapGlobalParameters: any) => {
  return mapGlobalParameters['territory']['dept'] === 'metropole';
};

export const getRandomInt = (max: number) => {
  return Math.floor(Math.random() * max);
};

export const moveLayerSymbolFirst = (mapObj: any) => {
  mapObj
    .getStyle()
    .layers.filter((layer: any) => layer.type === 'symbol')
    .map((symbolLayer: any) => {
      mapObj.moveLayer(symbolLayer.id);
    });
};

export const clearMapVectorTerritoryCouverture = (mapObj: any) => {
  var bRemoved = false;
  for (var i = mapObj.getStyle().layers.length - 1; 0 <= i; i--) {
    var layerId = mapObj.getStyle().layers[i].id;
    if (
      layerId.substring(0, getPrefixLayerTerritoryCouverture().length) ===
      getPrefixLayerTerritoryCouverture()
    ) {
      if (isLayerExist(layerId, mapObj)) {
        removeLayer(layerId, mapObj);
        bRemoved = true;
      }
    }
  }
  return bRemoved;
};
