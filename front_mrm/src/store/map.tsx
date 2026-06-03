import { create } from 'zustand';
import { getDefaultExtent } from './utils';

type Extent = {
  minx: number;
  miny: number;
  maxx: number;
  maxy: number;
};
type MapState = {
  extent: Extent;
  oMap: any;
};
type MapAction = {
  setExtent: (extent: Extent) => void;
  setMap: (oMap: any) => void;
};

type Territory = {
  extent?: Extent;
  valueIdent: string;
  typeterritory: string;
};

type TerritoryState = {
  territory: Territory;
};
type TerritoryAction = {
  setTerritorySearch: (territory: Territory) => void;
};

type ControlMeasureState = {
  oMeasure: any;
};
type ControlMeasureAction = {
  setControle: (oMeasure: any) => void;
};

export const useControleStore = create<
  ControlMeasureState & ControlMeasureAction
>((set) => ({
  oMeasure: null,
  setControle: (oMeasure: any) =>
    set((state) => {
      return { ...state, oMeasure };
    }),
}));

export const useMapStore = create<MapState & MapAction>((set) => ({
  extent: getDefaultExtent(),
  oMap: null,
  setExtent: (extent: Extent) =>
    set((state) => {
      return { ...state, extent };
    }),
  setMap: (oMap) =>
    set((state) => {
      return { ...state, oMap };
    }),
}));

export const useMapTerritoryStore = create<TerritoryState & TerritoryAction>(
  (set) => ({
    territory: {
      extent: undefined,
      valueIdent: '',
      typeterritory: '',
    },
    setTerritorySearch: (territory: Territory) => set({ territory: territory }),
  })
);

type CreditState = {
  show: boolean;
};
type CreditAction = {
  setShow: (show: boolean) => void;
};

export const useCreditStore = create<CreditState & CreditAction>((set) => ({
  show: true,
  setShow: (show) => set({ show }),
}));

type MapLoadingState = {
  bLoading: boolean;
};
type MapLoadingAction = {
  setLoading: (bLoading: boolean) => void;
};

export const useMapLoadingStore = create<MapLoadingState & MapLoadingAction>(
  (set) => ({
    bLoading: true,
    setLoading: (bLoading) => set({ bLoading }),
  })
);
