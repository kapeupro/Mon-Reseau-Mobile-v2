import { create } from 'zustand';
import {
  DEFAULT_ACTIVE_TERRITORY,
  LIST_TERRITOIRES,
} from '@/app/constant/constant';

import { useLoadingStore } from './store';

const getDefaultTerritory = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_ACTIVE_TERRITORY;
  }

  const queryString = window.location.search;
  const oURLSearchParams = new URLSearchParams(queryString);

  const territory = oURLSearchParams.get('territory');
  if (!territory) {
    return DEFAULT_ACTIVE_TERRITORY;
  }

  const aTerritory = LIST_TERRITOIRES.filter((dt) => dt.name === territory);
  return aTerritory.length ? aTerritory[0] : DEFAULT_ACTIVE_TERRITORY;
};

type Territory = {
  territory: any;
};
type ServiceAction = {
  setTerritory: (territory: any) => void;
};

export const useTerritoryStore = create<Territory & ServiceAction>((set) => ({
  territory: getDefaultTerritory(),

  // Définir le territoire avec une nouvelle valeur
  setTerritory: (newTerritory: any) =>
    set((state) => {
      const { setLoading } = useLoadingStore.getState();
      const curTerritory = state.territory;

      if (curTerritory.dept !== newTerritory.dept) {
        setLoading(true);
      }

      return { territory: newTerritory };
    }),
}));

type Filter = {
  filter: string;
};
type filterAction = {
  setFilter: (territory: any) => void;
  resetFilter: () => void;
};

export const useFilterStore = create<Filter & filterAction>((set) => ({
  filter: 'territoire',
  setFilter: (newFilter: any) => set({ filter: newFilter }),
  resetFilter: () => set({ filter: 'territoire' }),
}));

type TerritoryByUrlStore = {
  isLoaded: boolean;
};
type TerritoryByUrlAction = {
  setLoaded: (bValue: boolean) => void;
};

export const useTerritoryByUrlStore = create<
  TerritoryByUrlStore & TerritoryByUrlAction
>((set) => ({
  isLoaded: false,
  setLoaded: (bValue: any) => set({ isLoaded: bValue }),
}));
