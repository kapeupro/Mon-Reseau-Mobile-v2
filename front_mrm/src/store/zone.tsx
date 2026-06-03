import { create } from 'zustand';
import { getDefaultOperators, getDefaultAxe } from './utils/zone';

type ZoneSubPagesStore = {
  subPage: string;
};
type ZoneSubPagesAction = {
  setSubPage: (subPage: string) => void;
};

export const useZoneSubPagesStore = create<
  ZoneSubPagesStore & ZoneSubPagesAction
>((set) => ({
  subPage: '',
  setSubPage: (newSubPage) =>
    set(() => ({
      subPage: newSubPage,
    })),
}));

type OperatorsZoneState = {
  operators: number[];
};
type OperatorsZoneAction = {
  toggleOperators: (operatorAndAll: number[]) => void;
  resetOperators: () => void;
};

export const useOperatorsZoneStore = create<
  OperatorsZoneState & OperatorsZoneAction
>((set) => ({
  operators: getDefaultOperators(),
  toggleOperators: (operators) =>
    set(() => {
      return { operators };
    }),
  resetOperators: () => set(() => ({ operators: [] })),
}));

type PopUpStore = {
  show: boolean;
};
type PopUpAction = {
  setShow: (value: boolean) => void;
};

export const usePopUpStore = create<PopUpStore & PopUpAction>((set) => ({
  show: true,
  setShow: (value) =>
    set((state) => ({
      ...state,
      show: value,
    })),
}));

type ZacStore = {
  data_zac?: any;
  loading?: boolean;
};
type ZacAction = {
  setDataZac: (data_zac: any) => void;
  setLoading: (value: boolean) => void;
};

export const useZacStore = create<ZacStore & ZacAction>((set) => ({
  data_zac: false,
  loading: false,
  setDataZac: (new_data_zac) =>
    set((state) => ({
      ...state,
      data_zac: new_data_zac,
    })),
  setLoading: (value) =>
    set((state) => ({
      ...state,
      loading: value,
    })),
}));

type AxesTransportsStore = {
  axe: string[];
};
type AxesTransportsAction = {
  toggleAxe: (value: string) => void;
  setAxe: (value: string[]) => void;
};

export const useAxesTransportsStore = create<
  AxesTransportsStore & AxesTransportsAction
>((set) => ({
  axe: getDefaultAxe(),
  toggleAxe: (value) =>
    set((state) => {
      let tmpAxe = [...state.axe];
      if (tmpAxe.includes(value)) {
        tmpAxe = tmpAxe.filter((st) => st !== value);
      } else {
        tmpAxe.push(value);
      }

      return { axe: tmpAxe };
    }),
  setAxe: (aValues) =>
    set(() => ({
      axe: aValues,
    })),
}));
