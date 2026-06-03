export default function filterOperator(mapGlobalParameters: any) {
  const getfilter = (mapGlobalParametersParams: any) => {
    if (
      typeof mapGlobalParametersParams !== 'object' ||
      !Object.keys(mapGlobalParametersParams).includes('operatorAndAll')
    ) {
      return false;
    }

    var aOperators = mapGlobalParametersParams['operatorAndAll'];
    if (aOperators.length > 1) {
      return false;
    }

    const identifiantOperator = mapGlobalParametersParams['operatorAndAll'][0];
    if (!identifiantOperator) {
      return false;
    }
    return ['==', ['get', 'mcc_mnc'], identifiantOperator];
  };

  return getfilter(mapGlobalParameters);
}
