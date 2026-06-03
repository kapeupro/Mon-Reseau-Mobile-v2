import { useLoadingStore } from '@/store/store';
import { useTerritoryByUrlStore, useTerritoryStore } from '@/store/filter';
import { useOperatorsStore } from '@/store/operators';
import { useThemeStore } from '@/store/themes';

export const getRandomInteger = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const formatThousandSeparator = (value: any) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const isLoadingOperators = () => {
  const { bLoading } = useLoadingStore.getState();
  return bLoading;
};

export const isMetropole = () => {
  const { territory } = useTerritoryStore.getState();
  return territory.dept === 'metropole';
};

export const getDefaultColorOperator = (identifiant: number) => {
  const { operators } = useOperatorsStore.getState();
  if (!operators) {
    return false;
  }
  const aFilteredOperator = operators.filter(
    (dt: any) => dt.identifiant === identifiant
  );
  return aFilteredOperator.length ? aFilteredOperator[0].couleurDefaut : false;
};

export const isModeDaltonien = () => {
  const { theme } = useThemeStore.getState();
  return theme !== 'default';
};

export const isTerritoryLoadedByUrl = () => {
  const { isLoaded } = useTerritoryByUrlStore.getState();
  return isLoaded;
};

export const getCookie = (name: string) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

export const getCsrfToken = () => {
  return getCookie('csrftoken');
};
