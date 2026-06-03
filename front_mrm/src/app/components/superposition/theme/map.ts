import { useMapStore } from '@/store/map';
import { useThemesStore } from '@/store/superposition';
import { getMapGlobalParameters } from './filter';
import { usePageStore } from '@/store/store';
import { useLegendStore } from '@/store/legend';

import drawMapCouverture from '@/app/components/map/drawMap/couverture';
import drawMapQualityTest from '@/app/components/map/drawMap/qualitytest';
import drawMapAntenne from '@/app/components/map/drawMap/antenne';
import drawMapZone from '@/app/components/map/drawMap/zone';
import drawMapSignalement from '@/app/components/map/drawMap/signalement';

import {
  setLegendCouverture,
  setLegendQualityTest,
  setLegendAntenne,
  setLegendZone,
  setLegendSignalement,
  manageLayerPositionSearchTerritory,
} from '../../map/drawMap';

import { PREFIX_LAYER } from '@/app/constant/constant';

export default class ActionMap {
  oAction;
  oMap: any;
  translations: any;
  mapGlobalParameters: any;
  constructor(oAction: any, translations: any) {
    this.oAction = oAction;
    this.translations = translations;
    this.initoMap();
    this.initMapGlobalParameters();
  }
  getTheme() {
    return this.oAction.name;
  }
  isDraw() {
    return this.oAction.value;
  }
  isReorder() {
    return this.oAction.action === 'reorder';
  }
  initoMap() {
    const { oMap } = useMapStore.getState();
    this.oMap = oMap;
  }
  initMapGlobalParameters() {
    this.mapGlobalParameters = getMapGlobalParameters();
  }

  getConfig() {
    let prefixLayers: any = null;
    let fndrawMap: any = null;

    switch (this.getTheme()) {
      case 'couverture-theorique': {
        prefixLayers = `${PREFIX_LAYER}-couverture`;
        fndrawMap = drawMapCouverture;
        break;
      }
      case 'qualite-reseau': {
        prefixLayers = `${PREFIX_LAYER}-quality`;
        fndrawMap = drawMapQualityTest;
        break;
      }
      case 'antennes-deploiements': {
        prefixLayers = `${PREFIX_LAYER}-antenne`;
        fndrawMap = drawMapAntenne;
        break;
      }
      case 'zones-a-couvrir': {
        prefixLayers = `${PREFIX_LAYER}-zone`;
        fndrawMap = drawMapZone;
        break;
      }
      case 'signalements': {
        prefixLayers = `${PREFIX_LAYER}-signalement`;
        fndrawMap = drawMapSignalement;
        break;
      }
    }

    return {
      prefixLayers,
      fndrawMap,
    };
  }

  drawMap() {
    const { prefixLayers, fndrawMap } = this.getConfig();
    if (!prefixLayers) {
      return;
    }

    if (this.isReorder()) {
      this.reorderLayers();
    } else if (this.isDraw()) {
      this.addLayers(fndrawMap);
      this.reorderLayers();
    } else {
      this.removeLayers(prefixLayers);
    }

    this.setLegend();
  }

  removeLayers(prefixLayers: string) {
    const oRemoveLayers = new RemoveLayers(this.oMap, prefixLayers);
    oRemoveLayers.remove();
  }

  addLayers(fndrawMap: Function) {
    if (this.getTheme() === 'zones-a-couvrir') {
      fndrawMap(this.oMap, this.mapGlobalParameters, false);
    } else {
      fndrawMap(this.mapGlobalParameters, this.oMap, false, this.translations);
    }
  }

  reorderLayers() {
    const oReorderLayers = new ReorderLayers(this.oMap);
    oReorderLayers.reorder();

    manageLayerPositionSearchTerritory(this.oMap);
  }

  setLegend() {
    const oSuperpositionLegend = new SuperpositionLegend(this.translations);
    oSuperpositionLegend.setLegend();
  }
}

export class RemoveLayers {
  prefixe;
  oMap;
  constructor(oMap: any, prefixe: any) {
    this.oMap = oMap;
    this.prefixe = prefixe;
  }
  remove() {
    for (let i = this.oMap.getStyle().layers.length - 1; 0 <= i; i--) {
      const layerId = this.oMap.getStyle().layers[i].id;
      if (layerId.substring(0, this.prefixe.length) === this.prefixe) {
        if (this.isLayerExist(layerId)) {
          this.removeLayer(layerId);
        }
      }
    }
  }
  isLayerExist(idlayer: string) {
    const styleLayer = this.oMap.getLayer(idlayer);
    if (typeof styleLayer === 'undefined') {
      return false;
    }
    return true;
  }
  removeLayer = (idlayer: string) => {
    this.oMap.removeLayer(idlayer);
  };
}

export class ReorderLayers {
  oMap;
  prefixeLayerArcep = PREFIX_LAYER;
  aOrderCurrentThemeCheck: any = null;
  constructor(oMap: any) {
    this.oMap = oMap;
  }
  getArcepLayers() {
    const aLayers = this.getLayers();
    return aLayers.filter(
      (layer: any) => layer.id && layer.id.startsWith(this.prefixeLayerArcep)
    );
  }
  getLayers() {
    const oStyle = this.oMap.getStyle();
    return oStyle.layers;
  }
  reorder() {
    const aInitGroupLayers = this.groupLayers();
    if (!(aInitGroupLayers && aInitGroupLayers.length)) {
      return;
    }

    const aOrderCurrentTheme = aInitGroupLayers.map(
      (oGroupLayer: any) => oGroupLayer.theme
    );
    let aOrderTheme = this.getThemes().map((oTheme: any) => oTheme.name);
    aOrderTheme = aOrderTheme.filter((theme: any) =>
      aOrderCurrentTheme.includes(theme)
    );
    aOrderTheme.reverse();

    let aGroupLayers = aInitGroupLayers;
    for (let curOrder = 0; curOrder < aOrderCurrentTheme.length; curOrder++) {
      if (this.checkIsOrdered(aGroupLayers, aOrderTheme)) {
        break;
      }

      const currentTheme = aOrderCurrentTheme[curOrder];

      for (let nextOrder = 0; nextOrder < aOrderTheme.length; nextOrder++) {
        const theme = aOrderTheme[nextOrder];
        if (currentTheme !== theme) {
          continue;
        }

        if (curOrder === nextOrder) {
          continue;
        }

        this.moveLayers(
          aInitGroupLayers,
          aGroupLayers,
          aOrderTheme,
          curOrder,
          nextOrder
        );

        aGroupLayers = this.groupLayers();

        break;
      }
    }
  }
  checkIsOrdered(aGroupLayers: any, aOrderTheme: any) {
    const aOrderCurrentTheme = aGroupLayers.map(
      (oGroupLayer: any) => oGroupLayer.theme
    );
    return aOrderCurrentTheme.join('_') === aOrderTheme.join('_');
  }
  moveLayers(
    aInitGroupLayers: any,
    aGroupLayers: any,
    aOrderTheme: any,
    curOrder: any,
    nextOrder: any
  ) {
    const aIdLayers = aInitGroupLayers[curOrder].id_layers;

    let beforeId: any = null;

    if (aOrderTheme.length - 1 !== nextOrder) {
      const aNextLayers = aGroupLayers.filter(
        (oGroupLayer: any) => oGroupLayer.theme === aOrderTheme[nextOrder + 1]
      );
      if (aNextLayers.length) {
        beforeId = aNextLayers[0].id_layers[0];
      }
    }

    aIdLayers.reverse();

    if (beforeId) {
      this.oMap.moveLayer(aIdLayers[0], beforeId);
    } else {
      this.oMap.moveLayer(aIdLayers[0]);
    }

    if (aIdLayers.length > 1) {
      for (let i = 1; i < aIdLayers.length; i++) {
        this.oMap.moveLayer(aIdLayers[i], aIdLayers[i - 1]);
      }
    }
  }
  getInfoLayer(idlayer: string) {
    const aInfos = [
      {
        theme: 'couverture-theorique',
        prefixe: `${PREFIX_LAYER}-couverture`,
      },
      {
        theme: 'qualite-reseau',
        prefixe: `${PREFIX_LAYER}-quality`,
      },
      {
        theme: 'antennes-deploiements',
        prefixe: `${PREFIX_LAYER}-antenne`,
      },
      {
        theme: 'zones-a-couvrir',
        prefixe: `${PREFIX_LAYER}-zone`,
      },
      {
        theme: 'signalements',
        prefixe: `${PREFIX_LAYER}-signalement`,
      },
    ].filter((oInfo) => idlayer.startsWith(oInfo.prefixe));

    return aInfos.length ? aInfos[0] : false;
  }
  groupLayers() {
    const aLayers = this.getArcepLayers();
    const countLayer = aLayers.length;
    if (!countLayer) {
      return false;
    }

    let currentTheme: any = '';
    let aIdLayers: any = [];
    const aGroupLayers: any = [];

    for (let i = 0; i < countLayer; i++) {
      const bEnd = i === countLayer - 1;

      const layer = aLayers[i];
      const layerId = layer.id;

      const oInfo = this.getInfoLayer(layerId);
      if (!oInfo) {
        continue;
      }

      const theme = oInfo.theme;

      if (!currentTheme) {
        currentTheme = theme;
        aIdLayers.push(layerId);

        if (bEnd) {
          aGroupLayers.push({
            id_layers: aIdLayers,
            theme: currentTheme,
          });
        }
        continue;
      }

      if (currentTheme === theme) {
        aIdLayers.push(layerId);
        if (bEnd) {
          aGroupLayers.push({
            id_layers: aIdLayers,
            theme: currentTheme,
          });
        }
        continue;
      }

      aGroupLayers.push({
        id_layers: aIdLayers,
        theme: currentTheme,
      });

      currentTheme = theme;
      aIdLayers = [layerId];
      if (bEnd) {
        aGroupLayers.push({
          id_layers: aIdLayers,
          theme: currentTheme,
        });
      }
    }

    return aGroupLayers;
  }
  getThemes() {
    const { themes } = useThemesStore.getState();
    return themes;
  }
}

export class SuperpositionLegend {
  translations: any;
  mapGlobalParameters: any;

  constructor(translations: any) {
    this.translations = translations;
    this.initMapGlobalParameters();
  }

  initMapGlobalParameters() {
    this.mapGlobalParameters = getMapGlobalParameters();
  }

  getSuperposedThemes() {
    const { themes } = useThemesStore.getState();
    const { page } = usePageStore.getState();

    const aSuperposedThemes = themes.filter((theme: any) => theme.bSuperposer);
    let aSuperposedNameThemes = aSuperposedThemes.map(
      (theme: any) => theme.name
    );

    if (!aSuperposedNameThemes.includes(page)) {
      aSuperposedNameThemes = [page, ...aSuperposedNameThemes];
    }
    return aSuperposedNameThemes;
  }

  getListFunctionSetLegend() {
    const aFnLegend: any = [];

    for (const name of this.getSuperposedThemes()) {
      switch (name) {
        case 'couverture-theorique':
          aFnLegend.push(setLegendCouverture);
          break;

        case 'qualite-reseau':
          aFnLegend.push(setLegendQualityTest);
          break;

        case 'antennes-deploiements':
          aFnLegend.push(setLegendAntenne);
          break;

        case 'zones-a-couvrir':
          aFnLegend.push(setLegendZone);
          break;
        case 'signalements':
          aFnLegend.push(setLegendSignalement);
          break;
      }
    }

    return aFnLegend;
  }

  setLegend() {
    let aLegends: any = [];

    for (const fnSetLegend of this.getListFunctionSetLegend()) {
      aLegends = [
        ...aLegends,
        ...fnSetLegend(this.mapGlobalParameters, true, this.translations),
      ];
    }

    useLegendStore.getState().setLegend({
      title: 'Superposition',
      items: aLegends,
    });
  }
}
