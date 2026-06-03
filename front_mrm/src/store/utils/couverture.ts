import { DEFAULT_ACTIVE_TECHNOLOGIES_INTERNET } from '@/app/constant/constant';
import { getUrlParamsByKey } from '../utils';

const isPageCouverture = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  const page = getUrlParamsByKey('page');
  return page === 'couverture-theorique';
};

const hasUseDefaultValue = () => {
  return typeof window === 'undefined' || !isPageCouverture();
};

export const getDefaultTechnologies = () => {
  if (hasUseDefaultValue()) {
    return [DEFAULT_ACTIVE_TECHNOLOGIES_INTERNET];
  }

  const techno = getUrlParamsByKey('techno');
  return techno ? [techno] : [DEFAULT_ACTIVE_TECHNOLOGIES_INTERNET];
};

export const getDefaultService = () => {
  const defaultService = 'internet';

  if (hasUseDefaultValue()) {
    return defaultService;
  }

  const service = getUrlParamsByKey('service');
  return service ?? defaultService;
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

export const getDefaultSuperposer = () => {
  const defaultSuperposer = false;
  if (hasUseDefaultValue()) {
    return defaultSuperposer;
  }

  const operators = getUrlParamsByKey('operators');
  if (!operators) {
    return defaultSuperposer;
  }

  const aOperators = operators.split(',');
  return aOperators.length > 1;
};
