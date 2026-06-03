import { create } from 'zustand';
import { getDefaultOperators } from './utils/qos';
import { getDefaultRouteService } from './utils/qos';

type OperatorsRouteState = {
  operators: number[];
};
type OperatorsRouteAction = {
  toggleOperators: (operators: number[]) => void;
  resetOperators: () => void;
};

export const useOperatorsRouteStore = create<
  OperatorsRouteState & OperatorsRouteAction
>((set) => ({
  operators: getDefaultOperators('route'),
  toggleOperators: (operators) =>
    set(() => {
      return { operators };
    }),
  resetOperators: () => set(() => ({ operators: [] })),
}));

type ServiceRouteState = {
  serviceRoute: string;
};
type ServiceRouteAction = {
  setServiceRoute: (serviceRoute: 'internet' | 'appel_sms') => void;
};

export const useServiceRouteStore = create<
  ServiceRouteState & ServiceRouteAction
>((set) => ({
  serviceRoute: getDefaultRouteService(),
  setServiceRoute: (newServiceRoute) =>
    set(() => {
      return { serviceRoute: newServiceRoute };
    }),
}));
