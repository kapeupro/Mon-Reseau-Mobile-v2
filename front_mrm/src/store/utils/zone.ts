import { getUrlParamsByKey } from '../utils';

const isPageZone = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  const page = getUrlParamsByKey('page');
  return page === 'zones-a-couvrir';
};

const hasUseDefaultValue = () => {
  return typeof window === 'undefined' || !isPageZone();
};

export const getDefaultOperators = () => {
  const defaultOperators: any = [];

  if (hasUseDefaultValue()) {
    return defaultOperators;
  }

  const operators = getUrlParamsByKey('operators');
  if (!operators) {
    return defaultOperators;
  }

  const aOperators = operators.split(',');
  return aOperators.length
    ? aOperators.map((op: any) => parseInt(op))
    : defaultOperators;
};

export const getDefaultAxe = () => {
  const defaultAxes: any = ['zac_poi'];
  if (hasUseDefaultValue()) {
    return defaultAxes;
  }

  const axes = getUrlParamsByKey('axes');
  if (!axes) {
    return defaultAxes;
  }
  return axes.split(',');
};
