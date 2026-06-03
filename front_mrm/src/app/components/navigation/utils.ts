import { isTransport } from '@/utils/activeEntite';
export interface ComponentNavigationProps {
  page: string;
}

export const castArrayToString = (value: any) => {
  return Array.isArray(value) ? value.join(',') : '';
};

export const isTransportParamsTerritoryInUrl = (oSearchParams: any) => {
  const aKeys = ['train', 'route'];

  for (const key of aKeys) {
    const paramsUrl = oSearchParams.get(key);
    if (paramsUrl) {
      return true;
    }
  }

  return false;
};

export const getParamsTerritoryInUrl = (searchParams: any) => {
  const aKeysTerritory = [
    'departement',
    'commune',
    'region',
    'adresse',
    'train',
    'route',
    'localisation',
  ];

  const oSearchParams = new URLSearchParams(searchParams);
  const bolTransportParamsTerritoryInUrl =
    isTransportParamsTerritoryInUrl(searchParams);

  let keyId;

  if (bolTransportParamsTerritoryInUrl) {
    keyId = 'axis';
  } else if (oSearchParams.get('localisation')) {
    keyId = 'localisation';
  } else {
    keyId = 'id';
  }

  //const keyId = bolTransportParamsTerritoryInUrl ? "axis" : "id"
  const id = oSearchParams.get(keyId);
  if (!id) {
    return false;
  }
  const params: any = {};

  for (const key of aKeysTerritory) {
    const paramsUrl = oSearchParams.get(key);
    if (!paramsUrl) {
      continue;
    }

    params['type'] = key;

    if (bolTransportParamsTerritoryInUrl) {
      params[key] = paramsUrl;
    }
  }

  if (!Object.keys(params).length) {
    return false;
  }

  if (oSearchParams.get('adresse')) {
    params['adresse'] = oSearchParams.get('adresse');
    params['type_adresse'] = oSearchParams.get('type');
  }

  if (bolTransportParamsTerritoryInUrl) {
    params['level'] = oSearchParams.get('level');
  }

  params[keyId] = id;
  return params;
};

export const formatSelectedTerritory = (
  territorySearch: any,
  selectedTerritoire: any
) => {
  if (!selectedTerritoire) {
    return {};
  }

  if (selectedTerritoire.label) {
    return {
      departement: selectedTerritoire.label,
      id: selectedTerritoire.dept,
    };
  }

  let oTerritory: any = {
    [territorySearch.typeterritory]: selectedTerritoire.properties?.nom ?? '',
  };

  if (selectedTerritoire.entite?.toLowerCase() === 'localisation') {
    oTerritory = {
      localisation: selectedTerritoire.properties?.nom ?? '',
    };
  }

  const valueIdent = territorySearch.valueIdent;
  const keyIdent = isTransport() ? 'axis' : 'id';
  if (valueIdent !== '') {
    oTerritory[keyIdent] = valueIdent;
  }

  if (territorySearch.typeterritory === 'adresse') {
    oTerritory['type'] = selectedTerritoire?.properties?.type ?? '';
  }

  if (isTransport()) {
    oTerritory['level'] = selectedTerritoire?.level;
  }

  return oTerritory;
};
