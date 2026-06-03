import { create } from 'zustand';

import { useGlobalStore } from './store';
import { useNavigationStore } from './navigation';
import { getDefaultOperators, getDefaultService } from './utils/qos';

type ServiceState = {
  service: string;
};
type ServiceAction = {
  setService: (service: 'internet' | 'appel_sms') => void;
};

export const useServiceQosStore = create<ServiceState & ServiceAction>(
  (set) => ({
    service: getDefaultService(),
    setService: (service) =>
      set((state) => {
        const { bInitStoreByUrl } = useGlobalStore.getState();
        const { bListenChangeOfUrl } = useNavigationStore.getState();

        if (bInitStoreByUrl || bListenChangeOfUrl) {
          return { ...state, service: service };
        }

        return { ...state, service: service };
      }),
  })
);

type OperatorsQosState = {
  operators: number[];
};
type OperatorsQosAction = {
  toggleOperators: (operatorAndAll: number[]) => void;
  resetOperators: () => void;
};

export const useOperatorsQosStore = create<
  OperatorsQosState & OperatorsQosAction
>((set) => ({
  operators: getDefaultOperators(),
  toggleOperators: (operators) =>
    set(() => {
      return { operators };
    }),
  resetOperators: () => set(() => ({ operators: [] })),
}));

type ResumeQosState = {
  showLegendHelp: boolean;
};
type ResumeQosAction = {
  setShowLegendHelp: (bValue: boolean) => void;
};

export const useResumeQosStore = create<ResumeQosState & ResumeQosAction>(
  (set) => ({
    showLegendHelp: false,
    setShowLegendHelp: (showLegendHelp) =>
      set(() => {
        return { showLegendHelp };
      }),
  })
);

type DataQosAvailableState = {
  data: any;
};
type DataQosAvailableAction = {
  add: (operator: number, data: string[]) => void;
};

export const useDataQosAvailableStore = create<
  DataQosAvailableState & DataQosAvailableAction
>((set) => ({
  data: {},
  add: (operator, data) =>
    set((state) => {
      return {
        data: {
          ...state.data,
          [operator]: data,
        },
      };
    }),
}));
