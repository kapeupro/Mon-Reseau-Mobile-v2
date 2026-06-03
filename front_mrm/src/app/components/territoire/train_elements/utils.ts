import * as turf from '@turf/turf';

import { useCoordStore } from '@/store/selectedCoordStore';
import { useMapTerritoryStore } from '@/store/map';

function getLevel(selectedTerritoireArgs?: any) {
  const { selectedTerritoire } = useCoordStore.getState();
  return selectedTerritoireArgs?.level ?? selectedTerritoire?.level;
}

function getTerritory(selectedTerritoireArgs?: any) {
  const { selectedTerritoire } = useCoordStore.getState();
  return selectedTerritoireArgs ?? selectedTerritoire;
}

export function isLevelOne(selectedTerritoireArgs?: any) {
  return getLevel(selectedTerritoireArgs) === 1;
}

export function isLevelTwo(selectedTerritoireArgs?: any) {
  return getLevel(selectedTerritoireArgs) === 2;
}

export function isLevelThree(selectedTerritoireArgs?: any) {
  return getLevel(selectedTerritoireArgs) === 3;
}
export function castToComboOptionTerritory(selectedTerritoireArgs?: any) {
  const { selectedTerritoire } = useCoordStore.getState();
  const oTerritory = selectedTerritoireArgs ?? selectedTerritoire;
  const properties = oTerritory?.properties;
  return {
    id: properties?.axis,
    label: properties?.nom,
    level: oTerritory?.level,
  };
}
export function isTransport(selectedTerritoireArgs?: any) {
  const territory = getTerritory(selectedTerritoireArgs);
  return ['Train', 'Route'].includes(territory?.entite);
}

export function onSelectSearchResult(territoire: any) {
  const { setTerritorySearch } = useMapTerritoryStore.getState();
  const { selectTerritoire } = useCoordStore.getState();

  const extent = getExtentForZoom(territoire);

  const territoryParams = {
    extent: extent,
    valueIdent: getValueIdent(territoire),
    typeterritory: getTypeTerritory(territoire),
  };

  setTerritorySearch(territoryParams);
  selectTerritoire(territoire);
}

function getExtentForZoom(territoire: any) {
  let extent: any;
  if (isTransport(territoire) && territoire.level !== 3) {
    extent = undefined;
  } else if (isAdresse(territoire)) extent = getAdresseExtent(territoire);
  else {
    extent = {
      minx: territoire.coordinates.xmin,
      maxx: territoire.coordinates.xmax,
      miny: territoire.coordinates.ymin,
      maxy: territoire.coordinates.ymax,
    };
  }
  return extent;
}

function getAdresseExtent(territoire: any) {
  const bufferDistance = 3;
  const point = [territoire.coordinates.xmin, territoire.coordinates.ymin];
  const buffer = turf.buffer(turf.point(point), bufferDistance, {
    units: 'kilometers',
  });
  const bbox = turf.bbox(buffer);

  const extent = {
    minx: bbox[0],
    miny: bbox[1],
    maxx: bbox[2],
    maxy: bbox[3],
  };
  return extent;
}

function isAdresse(territoire: any) {
  return territoire.entite.toLowerCase() === 'adresse';
}

function getValueIdent(territoire: any) {
  if (!territoire?.properties) {
    return '';
  }

  const type = getTypeTerritory(territoire);
  let ident = '';

  switch (type) {
    case 'region':
      ident = territoire.properties.insee_reg;
      break;
    case 'departement':
      ident = territoire.insee_dep;
      break;
    case 'commune':
    case 'adresse':
      ident = territoire.properties.insee_com;
      break;
    case 'train':
    case 'route':
      ident = territoire.properties.axis;
      break;
  }

  return ident;
}

function getTypeTerritory(territoire: any) {
  if (!territoire?.entite) {
    return '';
  }

  const entite = territoire.entite;
  let type = '';

  switch (entite) {
    case 'Région':
      type = 'region';
      break;
    case 'Département':
      type = 'departement';
      break;
    case 'Commune':
      type = 'commune';
      break;
    case 'Adresse':
      type = 'adresse';
      break;
    case 'Train':
      type = 'train';
      break;
    case 'Route':
      type = 'route';
      break;
  }
  return type;
}
