import { create } from 'zustand';
import { getDefaultOperators } from './utils/qos';
import { getDefaultTrainService } from './utils/qos';

type OperatorsTrainState = {
  operators: number[];
};
type OperatorsTrainAction = {
  toggleOperators: (operators: number[]) => void;
  resetOperators: () => void;
};

export const useOperatorsTrainStore = create<
  OperatorsTrainState & OperatorsTrainAction
>((set) => ({
  operators: getDefaultOperators('train'),
  toggleOperators: (operators) =>
    set(() => {
      return { operators };
    }),
  resetOperators: () => set(() => ({ operators: [] })),
}));

type TypeAxeState = {
  type_axe: string;
};
type TypeAxeAction = {
  setTypeAxe: (type_axe: string) => void;
};

export const useTypeAxeStore = create<TypeAxeState & TypeAxeAction>((set) => ({
  type_axe: 'all',
  setTypeAxe: (new_type_axe) =>
    set(() => ({
      type_axe: new_type_axe,
    })),
}));

type TGVState = {
  tgv: string;
};
type TGVAction = {
  setTGV: (tgv: string) => void;
};

export const useTGVStore = create<TGVState & TGVAction>((set) => ({
  tgv: 'tgv_paris_bordeaux',
  setTGV: (new_tgv) =>
    set(() => ({
      tgv: new_tgv,
    })),
}));

type ServiceTrainState = {
  serviceTrain: string;
};
type ServiceTrainAction = {
  setServiceTrain: (serviceTrain: 'internet' | 'appel_sms') => void;
};

export const useServiceTrainStore = create<
  ServiceTrainState & ServiceTrainAction
>((set) => ({
  serviceTrain: getDefaultTrainService(),
  setServiceTrain: (newServiceTrain) =>
    set(() => {
      return { serviceTrain: newServiceTrain };
    }),
}));
