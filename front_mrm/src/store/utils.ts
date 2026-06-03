import {
  DEFAULT_ACTIVE_TERRITORY,
  LIST_TERRITOIRES,
} from '@/app/constant/constant';

export const getDefaultExtent = () => {
  const defaultExtent = DEFAULT_ACTIVE_TERRITORY.extent;
  if (typeof window === 'undefined') {
    return defaultExtent;
  }

  const paramsTerritory = getUrlParamsByKey('territory');
  if (!paramsTerritory) {
    return defaultExtent;
  }

  const aTerritory = LIST_TERRITOIRES.filter(
    (dt) => dt.name === paramsTerritory
  );

  return aTerritory.length ? aTerritory[0].extent : defaultExtent;
};

export const getUrlParamsByKey = (key: string) => {
  const queryString = window.location.search;
  const oURLSearchParams = new URLSearchParams(queryString);
  return oURLSearchParams.get(key);
};
