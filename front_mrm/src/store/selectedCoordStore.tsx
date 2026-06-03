import {
  LIST_TERRITOIRES,
  DEFAULT_ACTIVE_TERRITORY,
} from '@/app/constant/constant';
import { create } from 'zustand';
import { useTerritoryStore } from './filter';
import { useMapStore } from './map';
import { usePageStore } from './store';

interface CoordState {
  selectedTerritoire: any;
  selectTerritoire: (territoire: any, bSetPage?: boolean) => void;
}

interface SelectionState {
  isSelect: boolean;
  setIsSelect: (isSelect: boolean) => void;
}

export const useCoordStore = create<CoordState>((set) => ({
  selectedTerritoire: null,
  selectTerritoire: (territoire, bSetPage = true) => {
    const { setExtent } = useMapStore.getState();

    set({ selectedTerritoire: territoire });

    if (bSetPage) {
      let activePage: any;
      let newTerritory: any;

      if (territoire) {
        activePage = ['train', 'route'].includes(
          territoire?.entite?.toLowerCase()
        )
          ? 'qualite-reseau'
          : 'territory';

        newTerritory = LIST_TERRITOIRES.find(
          (data) =>
            data.dept === territoire.insee_dep || data.dept === territoire.dept
        );

        newTerritory = newTerritory ?? DEFAULT_ACTIVE_TERRITORY;
      } else {
        activePage = 'home';
        newTerritory = DEFAULT_ACTIVE_TERRITORY;
      }

      usePageStore.getState().setPage(activePage);
      useTerritoryStore.getState().setTerritory(newTerritory);
      setExtent(newTerritory.extent);
    }
  },
}));

export const useSelectionStore = create<SelectionState>((set) => ({
  isSelect: true,
  setIsSelect: (isSelect) => set({ isSelect }),
}));
