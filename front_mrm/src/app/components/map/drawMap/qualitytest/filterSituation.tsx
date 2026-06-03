export default function filterSituation(mapGlobalParameters: any) {
  const getfilter = (mapGlobalParametersParams: any) => {
    if (
      typeof mapGlobalParametersParams !== 'object' ||
      !Object.keys(mapGlobalParametersParams).includes('situation')
    ) {
      return false;
    }
    var situation = mapGlobalParametersParams['situation'];
    if (situation === 'toutes') {
      return false;
    }

    return ['==', ['get', 'situation'], situation];
  };

  return getfilter(mapGlobalParameters);
}
