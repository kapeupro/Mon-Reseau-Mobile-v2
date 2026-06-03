import {
  DEFAULT_ACTIVE_ENTITE,
  DEFAULT_ACTIVE_TESTS_APPEL,
  DEFAULT_ACTIVE_TESTS_INTERNET,
  LIST_TYPEZONE,
  LIST_SITUATION,
} from '@/app/constant/constant';
import { getUrlParamsByKey } from '../utils';

const isPageQos = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  const page = getUrlParamsByKey('page');
  return page === 'qualite-reseau';
};

const hasUseDefaultValue = () => {
  return typeof window === 'undefined' || !isPageQos();
};

export const getDefaultOperators = (tranport?: string) => {
  const defaultOperators: any = [];

  if (hasUseDefaultValue()) {
    return defaultOperators;
  }

  const operators = getUrlParamsByKey('operators');
  if (!operators) {
    return defaultOperators;
  }

  let aOperators: any[] = operators.split(',');
  aOperators = aOperators.map((op: any) => parseInt(op));

  const paramsTrain = getUrlParamsByKey('train');
  const paramsRoute = getUrlParamsByKey('route');

  if (tranport === 'train') {
    return paramsTrain ? aOperators : defaultOperators;
  } else if (tranport === 'route') {
    return paramsRoute ? aOperators : defaultOperators;
  } else {
    return !(paramsTrain || paramsRoute) ? aOperators : defaultOperators;
  }
};

export const getDefaultService = () => {
  const defaultService = 'internet';

  if (hasUseDefaultValue()) {
    return defaultService;
  }

  const service = getUrlParamsByKey('type_test');
  return service ?? defaultService;
};

export const getDefaultTrainService = () => {
  const defaultService = 'internet';

  if (hasUseDefaultValue()) {
    return defaultService;
  }

  const service = getUrlParamsByKey('service_train');
  return service ?? defaultService;
};

export const getDefaultRouteService = () => {
  const defaultService = 'internet';

  if (hasUseDefaultValue()) {
    return defaultService;
  }

  const service = getUrlParamsByKey('service_route');
  return service ?? defaultService;
};

export const getDefaultTestInternet = () => {
  if (hasUseDefaultValue()) {
    return DEFAULT_ACTIVE_TESTS_INTERNET;
  }

  const testParams = getUrlParamsByKey('test');
  if (!testParams) {
    return DEFAULT_ACTIVE_TESTS_INTERNET;
  }

  const service = getUrlParamsByKey('type_test');
  return service === 'internet' ? testParams : DEFAULT_ACTIVE_TESTS_INTERNET;
};
export const getDefaultTestAppel = () => {
  if (hasUseDefaultValue()) {
    return DEFAULT_ACTIVE_TESTS_APPEL;
  }

  const testParams = getUrlParamsByKey('test');
  if (!testParams) {
    return DEFAULT_ACTIVE_TESTS_APPEL;
  }

  const service = getUrlParamsByKey('type_test');
  return service === 'appel_sms' ? testParams : DEFAULT_ACTIVE_TESTS_APPEL;
};
export const getDefaultEntite = () => {
  if (hasUseDefaultValue()) {
    return DEFAULT_ACTIVE_ENTITE;
  }

  const entite = getUrlParamsByKey('entite');
  return entite ?? DEFAULT_ACTIVE_ENTITE;
};
export const getDefaultTypeZone = () => {
  const aDefaultActiveZone = LIST_TYPEZONE.map((dt) => dt.name);
  if (hasUseDefaultValue()) {
    return aDefaultActiveZone;
  }

  const zone = getUrlParamsByKey('zone');
  return zone ? zone.split(',') : [];
};
export const getDefaultSituation = () => {
  const aDefaultActiveSituation = LIST_SITUATION.map((dt) => dt.name);
  if (hasUseDefaultValue()) {
    return aDefaultActiveSituation;
  }
  const situation = getUrlParamsByKey('situation');
  return situation ? situation.split(',') : [];
};
