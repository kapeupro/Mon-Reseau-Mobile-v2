import { getUrlParamsByKey } from '../utils';

const isPageSignalements = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  const page = getUrlParamsByKey('page');
  return page === 'signalements';
};

const hasUseDefaultValue = () => {
  return typeof window === 'undefined' || !isPageSignalements();
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
