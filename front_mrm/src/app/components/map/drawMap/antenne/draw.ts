import {
  isMetropole,
  getDeptNotInMetropole,
  getIdDeptTerritory,
} from '@/app/components/map/drawMap/utils';

import { PREFIX_LAYER, PREFIX_SOURCE_LAYER } from '@/app/constant/constant';

export class Draw {
  mapObj;
  mapGlobalParameters;
  constructor(mapObj: any, mapGlobalParameters: any) {
    this.mapObj = mapObj;
    this.mapGlobalParameters = mapGlobalParameters;
  }
  getFilterByTerritory(fieldDep: string) {
    let filter = null;
    if (isMetropole(this.mapGlobalParameters)) {
      filter = [
        '!',
        ['in', ['get', fieldDep], ['literal', getDeptNotInMetropole()]],
      ];
    } else {
      filter = [
        'in',
        ['get', fieldDep],
        ['literal', [getIdDeptTerritory(this.mapGlobalParameters)]],
      ];
    }
    return filter;
  }
  buildFilter(fieldDep: string) {
    const aFilter = [];
    aFilter.push('all');
    const filterTerritory = this.getFilterByTerritory(fieldDep);
    if (filterTerritory !== null) {
      aFilter.push(filterTerritory);
    }
    return aFilter;
  }
  getPrefixLayer() {
    return `${PREFIX_LAYER}-antenne`;
  }
  getPrefixSourceLayer() {
    return `${PREFIX_SOURCE_LAYER}-antenne`;
  }
  formatParams(data: any[], bForTileserve = true) {
    const sData = data.join(',').toUpperCase();
    return bForTileserve ? `{${sData}}` : sData;
  }
  formatNames(data: any[]) {
    return data.join('-');
  }
}
