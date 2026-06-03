export const formatParamsGetInfoSelectedData = (selectedData: any) => {
  let params = {};
  switch (selectedData.entite) {
    case 'Région':
      params = getParamsByTerritoire(selectedData, 'region');
      break;
    case 'Département':
      params = getParamsByTerritoire(selectedData, 'departement');
      break;
    case 'Commune':
      params = getParamsByTerritoire(selectedData, 'commune');
      break;
    case 'Adresse':
      params = getParamsByAdresse(selectedData, 'adresse');
      break;
    case 'Train':
      params = getParamsByTransport(selectedData, 'train');
      break;
    case 'Route':
      params = getParamsByTransport(selectedData, 'route');
      break;
  }
  return params;
};

function getParamsByTerritoire(selectedData: any, entity: string) {
  return {
    entity,
    id: selectedData.properties?.gid ?? '',
  };
}

function getParamsByAdresse(selectedData: any, entity: string) {
  const { properties } = selectedData;
  return {
    entity,
    type: properties?.type,
    id: properties?.id,
    filter: selectedData.textFilter,
  };
}

function getParamsByTransport(selectedData: any, entity: string) {
  const { properties } = selectedData;
  return {
    entity,
    level: selectedData.level,
    axis: properties.axis,
    axis_name: properties.nom ?? '',
  };
}
