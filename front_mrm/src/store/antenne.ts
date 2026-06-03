import { create } from 'zustand';

import { getDefaultTechno, getDefaultStatus } from './utils/antenne';

import { DEFAULT_DISPOSITIF } from '@/app/constant/antennes';

type StatusStore = {
  status: string[];
};
type StatusAction = {
  toggleStatus: (value: string) => void;
  setStatus: (aValues: any) => void;
};

export const useStatusStore = create<StatusStore & StatusAction>((set) => ({
  status: getDefaultStatus(),
  toggleStatus: (value) =>
    set((state) => {
      let tmpStatus = [...state.status];
      if (tmpStatus.includes(value)) {
        tmpStatus = tmpStatus.filter((st) => st !== value);
      } else {
        tmpStatus.push(value);
      }

      return { status: tmpStatus };
    }),
  setStatus: (aValues) =>
    set(() => ({
      status: aValues,
    })),
}));

type TechnologiesStore = {
  technologies: string[];
};
type TechnologiesAction = {
  toggleTechnology: (technology: string) => void;
  setTechnology: (aTechnology: any) => void;
};

export const useTechnologiesStore = create<
  TechnologiesStore & TechnologiesAction
>((set) => ({
  technologies: getDefaultTechno(),
  toggleTechnology: (value) =>
    set((state) => {
      let tmpTechnologies = [...state.technologies];
      if (tmpTechnologies.includes(value)) {
        tmpTechnologies = tmpTechnologies.filter((tec) => tec !== value);
      } else {
        tmpTechnologies.push(value);
      }

      return { technologies: tmpTechnologies };
    }),
  setTechnology: (aTechnology) =>
    set(() => ({
      technologies: aTechnology,
    })),
}));

type DispositifStore = {
  dispositif: string;
};
type DispositifAction = {
  setDispositif: (dispositif: string) => void;
};

const getDefaultDispositif = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_DISPOSITIF;
  }

  const queryString = window.location.search;
  const oURLSearchParams = new URLSearchParams(queryString);

  const dispositif = oURLSearchParams.get('dispositif');
  return dispositif ?? DEFAULT_DISPOSITIF;
};

export const useDispositifStore = create<DispositifStore & DispositifAction>(
  (set) => ({
    dispositif: getDefaultDispositif(),
    setDispositif: (dispositif) =>
      set(() => ({
        dispositif: dispositif,
      })),
  })
);

type AntenneSubPagesStore = {
  subPage: string;
};
type AntenneSubPagesAction = {
  setSubPage: (subPage: string) => void;
};

export const useAntenneSubPagesStore = create<
  AntenneSubPagesStore & AntenneSubPagesAction
>((set) => ({
  subPage: '',
  setSubPage: (newSubPage) =>
    set(() => ({
      subPage: newSubPage,
    })),
}));

type AntenneSiteOperator = {
  operatorSite: any;
  index: number;
  techno: string;
  statutOperator: string;
  id_site: string;
  color_status: string;
  code_dep?: string;
};
type AntenneSubOperatorAction = {
  setOperatorSite: (subPage: string) => void;
  setData: (data: {
    index: number;
    techno: string;
    statutOperator: string;
    id_site: string;
    color_status: string;
    code_dep?: string;
  }) => void;
};

export const useAntenneSiteOperatorStore = create<
  AntenneSiteOperator & AntenneSubOperatorAction
>((set) => ({
  operatorSite: '',
  index: 0,
  techno: '',
  statutOperator: '',
  id_site: '',
  color_status: '',
  code_dep: undefined,
  setOperatorSite: (newOperator) =>
    set(() => ({
      operatorSite: newOperator,
    })),
  setData: (new_data) =>
    set(() => ({
      index: new_data.index,
      techno: new_data.techno,
      statutOperator: new_data.statutOperator,
      id_site: new_data.id_site,
      color_status: new_data.color_status,
      code_dep: new_data.code_dep,
    })),
}));

type SupportStore = {
  id?: number;
  code_dep?: string;
  nom_site_operateurs?: string;
  bLoading: boolean;
};
type SupportAction = {
  setId: (id: number) => void;
  setData: (data: {
    id?: number;
    code_dep?: string;
    nom_site_operateurs?: string;
  }) => void;
  setLoading: (value: boolean) => void;
};

export const useSupportStore = create<SupportStore & SupportAction>((set) => ({
  id: undefined,
  bLoading: false,
  setId: (id) =>
    set((state) => ({
      ...state,
      id: id,
    })),
  setLoading: (value) =>
    set((state) => ({
      ...state,
      bLoading: value,
    })),
  setData: (data) =>
    set((state) => ({
      ...state,
      ...data,
    })),
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

type ClickedFromTerritoryStore = {
  isClickedFromTerritory: boolean;
};
type ClickedFromTerritoryAction = {
  setIsClickedFromTerritory: (isClickedFromTerritory: boolean) => void;
};

export const useClickedFromTerritoryStore = create<
  ClickedFromTerritoryStore & ClickedFromTerritoryAction
>((set) => ({
  isClickedFromTerritory: false,
  setIsClickedFromTerritory: (newIsClickedFromTerritory) =>
    set(() => ({
      isClickedFromTerritory: newIsClickedFromTerritory,
    })),
}));
