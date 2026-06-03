import { create } from 'zustand';
import { resetScroll } from '@/service/window';
import { useNavigationStore } from '@/store/navigation';
import { useOperatorsStore } from '@/store/operators';
import { useOperatorsZoneStore } from '@/store/zone';
import { useOperatorsQosStore } from './qos';
import { useOperatorsTrainStore } from './train';
import { useOperatorsRouteStore } from './route';
import { useOperatorsSignalementStore } from './signalement';

import {
  getDefaultTechnologies,
  getDefaultService,
  getDefaultOperators,
  getDefaultSuperposer,
} from './utils/couverture';

import {
  getDefaultTestAppel,
  getDefaultTestInternet,
  getDefaultEntite,
  getDefaultTypeZone,
  getDefaultSituation,
} from './utils/qos';
import {
  DEFAULT_ACTIVE_TECHNOLOGIES_APPEL,
  DEFAULT_ACTIVE_TECHNOLOGIES_INTERNET,
  DEFAULT_ACTIVE_TESTS_APPEL,
  DEFAULT_ACTIVE_TESTS_INTERNET,
  DEFAULT_ACTIVE_TYPEZONE,
  DEFAULT_ACTIVE_ENTITE,
  DEFAULT_ACTIVE_SITUATION,
} from '@/app/constant/constant';
import { getDefaultOperators as getDefaultOperatorsAntenne } from './utils/antenne';
import { getDefaultValueUrl } from './utils/valueUrl';

const initOperatorsStore = (page: string) => {
  const { toggleOperatorAndAll } = useOperatorAndAllStore.getState();
  const { toggleOperators } = useOperatorsQosStore.getState();
  const { toggleOperators: toggleOperatorZone } =
    useOperatorsZoneStore.getState();
  const { toggleOperators: toggleOperatorsTrain } =
    useOperatorsTrainStore.getState();
  const { toggleOperators: toggleOperatorsRoute } =
    useOperatorsRouteStore.getState();
  const { toggleOperators: toggleOperatorsSignalement } =
    useOperatorsSignalementStore.getState();
  const { operators: listOperators } = useOperatorsStore.getState();
  const aOperators = getAllOperators(listOperators);

  switch (page) {
    case 'qualite-reseau':
      toggleOperators(aOperators);
      toggleOperatorsTrain(aOperators);
      toggleOperatorsRoute(aOperators);
      break;
    case 'antennes-deploiements':
      toggleOperatorAndAll(aOperators);
      break;
    case 'zones-a-couvrir':
      toggleOperatorZone(aOperators);
      break;
    case 'signalements':
      toggleOperatorsSignalement(aOperators);
      break;
  }
};

type HomeMenuStore = {
  show: boolean;
};
type HomeMenuAction = {
  setShow: (show: boolean) => void;
};

export const useHomeMenuStore = create<HomeMenuStore & HomeMenuAction>(
  (set) => ({
    show: false,
    setShow: (show) =>
      set(() => ({
        show,
      })),
  })
);

type PageState = {
  page: string;
};
type PageAction = {
  setPage: (page: PageState['page']) => void;
};

export const usePageStore = create<PageState & PageAction>((set) => ({
  page: getDefaultValueUrl('page', 'home'),
  setPage: (page, bToggleOperatorAndAll = true) =>
    set((state) => {
      const { show: showHomeMenu, setShow: setShowHomeMenu } =
        useHomeMenuStore.getState();
      resetScroll();

      if (bToggleOperatorAndAll) {
        initOperatorsStore(page);
      }

      if (showHomeMenu) {
        setShowHomeMenu(false);
      }

      return { page: page };
    }),
}));

type ServiceState = {
  service: string;
};
type ServiceAction = {
  setService: (service: 'internet' | 'appel_sms') => void;
};

export const useServiceStore = create<ServiceState & ServiceAction>((set) => ({
  service: getDefaultService(),
  setService: (service) =>
    set((state) => {
      const { resetTechnologieInternet, resetTechnologieAppel } =
        useTechnologiesStore.getState();
      const { bInitStoreByUrl } = useGlobalStore.getState();
      const { bListenChangeOfUrl } = useNavigationStore.getState();

      if (bInitStoreByUrl || bListenChangeOfUrl) {
        return { ...state, service: service };
      }

      if (service === 'internet') {
        resetTechnologieInternet();
      } else {
        resetTechnologieAppel();
      }
      return { ...state, service: service };
    }),
}));

type OperatorState = {
  operators: number[];
};
type OperatorAction = {
  toggleOperator: (operator: number) => void;
  resetOperator: () => void;
  setDefaultToggleOperator: (operator?: number) => void;
  setOperator: (operator: any) => void;
};

export const useOperatorStore = create<OperatorState & OperatorAction>(
  (set) => ({
    operators: getDefaultOperators(),
    toggleOperator: (operator) =>
      set((state) => {
        const { active: isActiveSuperposer } = useSuperposerStore.getState();

        let operators: any[] = [];

        if (isActiveSuperposer) {
          operators = [...state.operators];
          if (operators.includes(operator)) {
            operators = operators.filter((op) => op !== operator);
          } else {
            operators.push(operator);
          }
        } else {
          operators.push(operator);
        }

        return { ...state, operators };
      }),
    resetOperator: () =>
      set((state) => {
        const operator = [...state.operators];
        const lastToggleOperator = operator.pop();
        return {
          operators: lastToggleOperator ? [lastToggleOperator] : [],
        };
      }),
    setDefaultToggleOperator: (operator) =>
      set(() => {
        const defaultOperator = operator ? [operator] : [];
        return { operators: defaultOperator };
      }),
    setOperator: (operator) =>
      set(() => {
        return { operators: operator };
      }),
  })
);

type OperatorAndAllState = {
  operatorsAndAll: number[];
};
type OperatorAndAllAction = {
  toggleOperatorAndAll: (operatorAndAll: number[]) => void;
  resetOperatorAndAll: () => void;
};

export const useOperatorAndAllStore = create<
  OperatorAndAllState & OperatorAndAllAction
>((set) => ({
  operatorsAndAll: getDefaultOperatorsAntenne(),
  toggleOperatorAndAll: (operatorAndAll) =>
    set(() => {
      return { operatorsAndAll: operatorAndAll };
    }),
  resetOperatorAndAll: () => set(() => ({ operatorsAndAll: [] })),
}));

type TechnologiesState = {
  technologies: string[];
};
type TechnologiesAction = {
  toggleTechnology: (technology: string) => void;
  resetTechnologieInternet: () => void;
  resetTechnologieAppel: () => void;
};

export const useTechnologiesStore = create<
  TechnologiesState & TechnologiesAction
>((set) => ({
  technologies: getDefaultTechnologies(),
  toggleTechnology: (technology) =>
    set((state) => {
      const technologies = [];
      technologies.push(technology);
      return { technologies: technologies };
    }),
  resetTechnologieInternet: () =>
    set(() => ({ technologies: [DEFAULT_ACTIVE_TECHNOLOGIES_INTERNET] })),
  resetTechnologieAppel: () =>
    set(() => ({ technologies: [DEFAULT_ACTIVE_TECHNOLOGIES_APPEL] })),
}));

type TestsState = {
  testInternet: string;
  testAppel: string;
};
type TestsAction = {
  toggleTestInternet: (testInternet: string) => void;
  toggleTestAppel: (testAppel: string) => void;
  resetTestInternet: () => void;
  resetTestAppel: () => void;
};

export const useTestStore = create<TestsState & TestsAction>((set) => ({
  testInternet: getDefaultTestInternet(),
  testAppel: getDefaultTestAppel(),
  toggleTestInternet: (testInternet) =>
    set(() => ({
      testInternet: testInternet,
    })),
  toggleTestAppel: (testAppel) =>
    set(() => ({
      testAppel: testAppel,
    })),
  resetTestInternet: () =>
    set(() => ({ testInternet: DEFAULT_ACTIVE_TESTS_INTERNET })),
  resetTestAppel: () => set(() => ({ testAppel: DEFAULT_ACTIVE_TESTS_APPEL })),
}));

type LoadingStore = {
  bLoading: boolean;
};
type LoadingAction = {
  setLoading: (value: boolean) => void;
};

export const useLoadingStore = create<LoadingStore & LoadingAction>((set) => ({
  bLoading: true,
  setLoading: (value) =>
    set((state) => ({
      ...state,
      bLoading: value,
    })),
}));

type TypeZoneState = {
  typeZone: string[];
};
type TypeZoneAction = {
  toggleTypeZone: (typeZone: string[]) => void;
  setTypeZone: (aTypeZone: string[]) => void;
  resetTypeZone: () => void;
};

export const useTypeZoneStore = create<TypeZoneState & TypeZoneAction>(
  (set) => ({
    typeZone: getDefaultTypeZone(),
    toggleTypeZone: ([type]) =>
      set((state) => {
        let newTypeZone: string[];

        if (state.typeZone.includes(type)) {
          newTypeZone = state.typeZone.filter((t) => t !== type);
        } else {
          newTypeZone = [...state.typeZone, type];
        }

        return { typeZone: newTypeZone };
      }),
    resetTypeZone: () => set(() => ({ typeZone: [DEFAULT_ACTIVE_TYPEZONE] })),
    setTypeZone: (aTypeZone) => set(() => ({ typeZone: aTypeZone })),
  })
);

type EntiteState = {
  entite: string;
};
type EntiteAction = {
  toggleEntite: (entite: string) => void;
  resetEntite: () => void;
};

export const useEntiteStore = create<EntiteState & EntiteAction>((set) => ({
  entite: getDefaultEntite(),
  toggleEntite: (entite) =>
    set(() => {
      return { entite: entite };
    }),
  resetEntite: () => set(() => ({ entite: DEFAULT_ACTIVE_ENTITE })),
}));

type SituationState = {
  situation: string[];
};
type SituationAction = {
  toggleSituation: (situation: string) => void;
  setSituation: (aSituation: string[]) => void;
};

export const useSituationStore = create<SituationState & SituationAction>(
  (set) => ({
    situation: getDefaultSituation(),
    toggleSituation: (paramsSituation) =>
      set(({ situation }) => {
        let newSituation: string[];

        if (situation.includes(paramsSituation)) {
          newSituation = situation.filter((t) => t !== paramsSituation);
        } else {
          newSituation = [...situation, paramsSituation];
        }

        return { situation: newSituation };
      }),
    setSituation: (aSituation) => set(() => ({ situation: aSituation })),
  })
);

type SuperposerState = {
  active: boolean;
};
type SuperposerAction = {
  toggleSuperposer: () => void;
  setSuperposer: (bValue: boolean) => void;
};

export const useSuperposerStore = create<SuperposerState & SuperposerAction>(
  (set) => ({
    active: getDefaultSuperposer(),
    toggleSuperposer: () =>
      set((state) => {
        const { resetOperator } = useOperatorStore.getState();

        if (state.active) {
          resetOperator();
        }

        return { active: !state.active };
      }),
    setSuperposer: (bValue) =>
      set(() => {
        return { active: bValue };
      }),
  })
);
type TitleStore = {
  title: string;
  addTitle: (title: string) => void;
  clearTitles: () => void;
};

export const useTitleStore = create<TitleStore>((set) => ({
  title: '',
  addTitle: (title) => set((state) => ({ title: title })),
  clearTitles: () => set({ title: '' }),
}));

type GradientStore = {
  isGradient: boolean;
  setIsGradient: (isGradient: boolean) => void;
};

export const useGradientStore = create<GradientStore>((set) => ({
  isGradient: false,
  setIsGradient: (isGradient) => set((state) => ({ isGradient: isGradient })),
}));

type GlobalState = {
  bInitStoreByUrl: boolean;
};
type GlobalAction = {
  setInitStoreByUrl: (bValue: boolean) => void;
};

export const useGlobalStore = create<GlobalState & GlobalAction>((set) => ({
  bInitStoreByUrl: true,
  setInitStoreByUrl: (bValue) =>
    set(() => {
      return { bInitStoreByUrl: bValue };
    }),
}));

function getAllOperators(listOperators: any) {
  const operators: any = [];
  if (listOperators && Array.isArray(listOperators)) {
    listOperators.forEach((operator: any) => {
      operators.push(operator.identifiant);
    });
  }
  return operators;
}

type HeaderPanelStore = {
  bHeaderPanel: boolean;
};
type HeaderPanelAction = {
  setHeaderPanel: (bValue: boolean) => void;
};

export const useHeaderPanelStore = create<HeaderPanelStore & HeaderPanelAction>(
  (set) => ({
    bHeaderPanel: false,
    setHeaderPanel: (bValue) =>
      set((state) => ({
        bHeaderPanel: bValue,
      })),
  })
);

type CountNavigationStore = {
  count: number;
};
type CountNavigationAction = {
  incrementeCount: () => void;
  decrementCount: () => void;
};

export const useCountNavigationStore = create<
  CountNavigationStore & CountNavigationAction
>((set) => ({
  count: 0,
  incrementeCount: () =>
    set((state) => ({
      count: state.count + 1,
    })),
  decrementCount: () =>
    set((state) => ({
      count: state.count - 1,
    })),
}));
