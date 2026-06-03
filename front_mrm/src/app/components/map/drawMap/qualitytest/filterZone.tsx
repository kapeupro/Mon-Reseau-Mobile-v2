export default function filterZone(mapGlobalParameters: any) {
  const getfilter = (mapGlobalParametersParams: any) => {
    if (
      typeof mapGlobalParametersParams !== 'object' ||
      !Object.keys(mapGlobalParametersParams).includes('typeZone')
    ) {
      return false;
    }
    var aTypeZone = mapGlobalParametersParams['typeZone'];

    if (isAllChecked(aTypeZone)) {
      return false;
    }

    const aFilter = [];
    for (const keyZone in aTypeZone) {
      var filter = ['==', ['get', 'strate'], aTypeZone[keyZone]];
      aFilter.push(filter);
    }

    return aFilter;
  };

  const isAllChecked = (aTypeZone: any) => {
    if (aTypeZone.length === 0) {
      return true;
    }

    return Object.values(aTypeZone).includes('toutes');
  };

  return getfilter(mapGlobalParameters);
}
