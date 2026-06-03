import { create } from 'zustand';
import { getDefaultOperators } from './utils/signalements';

type SignalementSubPagesStore = {
  subPage: string;
};
type SignalementSubPagesAction = {
  setSubPage: (subPage: string) => void;
};

export const useSignalementSubPagesStore = create<
  SignalementSubPagesStore & SignalementSubPagesAction
>((set) => ({
  subPage: '',
  setSubPage: (newSubPage) =>
    set(() => ({
      subPage: newSubPage,
    })),
}));

type OperatorsSignalementState = {
  operators: number[];
};
type OperatorsSignalementAction = {
  toggleOperators: (operatorAndAll: number[]) => void;
  resetOperators: () => void;
};

export const useOperatorsSignalementStore = create<
  OperatorsSignalementState & OperatorsSignalementAction
>((set) => ({
  operators: getDefaultOperators(),
  toggleOperators: (operators) =>
    set(() => {
      return { operators };
    }),
  resetOperators: () => set(() => ({ operators: [] })),
}));

type SignalementStore = {
  idHexa?: number;
};
type SignalementAction = {
  setIdHexa: (idHexa: number) => void;
};

export const useSignalementStore = create<SignalementStore & SignalementAction>(
  (set) => ({
    idHexa: undefined,
    setIdHexa: (idHexa) =>
      set(() => ({
        idHexa,
      })),
  })
);
