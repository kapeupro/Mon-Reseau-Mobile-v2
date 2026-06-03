import { create } from 'zustand';

type ToolsSubPagesStore = {
  subPageTools: string;
  show: boolean;
  isActive: boolean;
};

type MesureToolsStore = {
  isMesure: boolean;
};

type MesureToolsActionStore = {
  setMesure: (bValue: boolean) => void;
};
type ToolsSubPagesAction = {
  setShow: (bValue: boolean) => void;
  setActive: (bValue: boolean) => void;
  setSubPageTools: (oValue: ToolsSubPagesStore) => void;
};

export const useToolsStore = create<ToolsSubPagesAction & ToolsSubPagesStore>(
  (set) => ({
    show: false,
    isActive: false,
    subPageTools: '',
    setShow: (bValue) =>
      set((state) => ({
        ...state,
        show: bValue,
      })),
    setActive: (bValue) =>
      set((state) => ({
        ...state,
        isActive: bValue,
      })),
    setSubPageTools: (oValue) => set(() => oValue),
  })
);

export const useMesureToolsStore = create<
  MesureToolsStore & MesureToolsActionStore
>((set) => ({
  isMesure: false,
  setMesure: (bValue) =>
    set((state) => ({
      isMesure: bValue,
    })),
}));

type AltimetriqueToolsStore = {
  aPoints: any[];
};

type AltimetriqueToolsActionStore = {
  setPoints: (aValue: any[]) => void;
};
export const useAltimetriqueToolsStore = create<
  AltimetriqueToolsStore & AltimetriqueToolsActionStore
>((set) => ({
  aPoints: [],
  setPoints: (aValue) =>
    set(() => ({
      aPoints: aValue,
    })),
}));
type CrowdsourcingStore = {
  aData: any[];
};
type CrowdsourcingAction = {
  setData: (aValues: any[]) => void;
};

export const useCrowdsourcingStore = create<
  CrowdsourcingStore & CrowdsourcingAction
>((set) => ({
  aData: [],
  setData: (aData) => set({ aData }),
}));

type ToolInfoPointStore = {
  isActive: boolean;
  show: boolean;
  oData: any;
  coords: any;
  startDrag: boolean;
};
type ToolInfoPointAction = {
  setData: (oData: any) => void;
  setActive: (bActive: boolean) => void;
  setShow: (bShow: boolean) => void;
  toggleTool: () => void;
  setCoordonne: (coords: any) => void;
  setStartDrag: (startDrag: boolean) => void;
};

export const useToolInfoPointStore = create<
  ToolInfoPointStore & ToolInfoPointAction
>((set) => ({
  isActive: false,
  show: false,
  oData: false,
  coords: false,
  startDrag: false,
  setData: (oData) =>
    set((state) => ({
      ...state,
      oData,
    })),
  setActive: (bActive) =>
    set((state) => ({
      ...state,
      isActive: bActive,
    })),
  toggleTool: () =>
    set((state) => ({
      ...state,
      isActive: !state.isActive,
    })),
  setShow: (bShow) =>
    set((state) => ({
      ...state,
      show: bShow,
    })),
  setCoordonne: (coords) =>
    set((state) => ({
      ...state,
      coords,
    })),
  setStartDrag: (startDrag) =>
    set((state) => ({
      ...state,
      startDrag,
    })),
}));
