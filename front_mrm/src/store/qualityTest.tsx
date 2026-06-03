import { create } from 'zustand';

import { getCrowd } from '@/service/crowd';
import { useCrowdState } from './crowd';

type TestSubPagesStore = {
  subPage: string;
};
type TestSubPagesAction = {
  setSubPage: (subPage: string) => void;
};

export const useTestSubPagesStore = create<
  TestSubPagesStore & TestSubPagesAction
>((set) => ({
  subPage: '',
  setSubPage: (newSubPage) =>
    set(() => ({
      subPage: newSubPage,
    })),
}));

type EmplacementTestStore = {
  dataEmplacementTest: any;
  bLoading: boolean;
};
type EmplacementTestAction = {
  setDataEmplacementTest: (dataEmplacementTest: any) => void;
  setLoading: (value: boolean) => void;
};

export const useEmplacementTestStore = create<
  EmplacementTestStore & EmplacementTestAction
>((set) => ({
  dataEmplacementTest: [],
  bLoading: false,
  setLoading: (value) =>
    set((state) => ({
      ...state,
      bLoading: value,
    })),
  setDataEmplacementTest: (newDataEmplacementTest) => {
    set({ dataEmplacementTest: newDataEmplacementTest });
  },
}));

type DatasourceState = {
  aDatasources: any;
};
type DatasourceAction = {
  fetch: () => void;
};

export const useDatasourcesStore = create<DatasourceState & DatasourceAction>(
  (set) => ({
    aDatasources: [],
    fetch: async () => {
      const { setselectedCrowd } = useCrowdState.getState();
      let aDatasources = [];
      try {
        aDatasources = await getCrowd();
      } catch (e) {
        console.log(e);
      }

      if (!aDatasources) {
        aDatasources = [];
      }

      setselectedCrowd(getDefaultDatasource(aDatasources));
      set({ aDatasources });
    },
  })
);

export function getDefaultDatasource(aDatasources: any) {
  let defaultDatasource = null;
  for (const oDatatource of aDatasources) {
    const aLayers = oDatatource.layer;
    if (!(Array.isArray(aLayers) && aLayers.length)) {
      continue;
    }

    for (const oLayer of aLayers) {
      if (oLayer.default) {
        defaultDatasource = {
          id_crowd: oLayer.id_crowd,
          source: oDatatource.source,
        };
        break;
      }
    }

    if (defaultDatasource) {
      break;
    }
  }
  return defaultDatasource;
}
