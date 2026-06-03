export default function filterProtocole(mapGlobalParameters: any) {
  const getfilter = (mapGlobalParametersParams: any) => {
    if (
      typeof mapGlobalParametersParams !== 'object' ||
      !Object.keys(mapGlobalParametersParams).includes('service')
    ) {
      return false;
    }

    var situation = mapGlobalParametersParams['service'];
    let value = '';
    if (situation === 'internet') {
      value = mapGlobalParametersParams['typeTest']['testInternet'];
    } else {
      value = mapGlobalParametersParams['typeTest']['testAppel'];
    }

    return ['==', ['get', 'protocole'], value];
  };

  return getfilter(mapGlobalParameters);
}
