export const getDefaultValueUrl = (element: any, defaultValue: any) => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const queryString = window.location.search;
  const oURLSearchParams = new URLSearchParams(queryString);

  const urlElement = oURLSearchParams.get(element);
  return urlElement ?? defaultValue;
};
