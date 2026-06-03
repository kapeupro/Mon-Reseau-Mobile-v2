import { DEFAULT_STATUS, DEFAULT_TECHNOLOGIES } from '@/app/constant/antennes';
import { getUrlParamsByKey } from '../utils';

const isPageAntenne = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  const page = getUrlParamsByKey('page');
  return page === 'antennes-deploiements';
};

const hasUseDefaultValue = () => {
  return typeof window === 'undefined' || !isPageAntenne();
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

export const getDefaultTechno = () => {
  if (hasUseDefaultValue()) {
    return DEFAULT_TECHNOLOGIES;
  }

  const techno = getUrlParamsByKey('techno');
  if (!techno) {
    return DEFAULT_TECHNOLOGIES;
  }
  const aTecno = techno.split(',');
  return aTecno.length ? aTecno : DEFAULT_TECHNOLOGIES;
};

export const getDefaultStatus = () => {
  if (hasUseDefaultValue()) {
    return DEFAULT_STATUS;
  }

  const status = getUrlParamsByKey('status');
  if (!status) {
    return DEFAULT_STATUS;
  }
  const aStatus = status.split(',');
  return aStatus.length ? aStatus : DEFAULT_STATUS;
};
