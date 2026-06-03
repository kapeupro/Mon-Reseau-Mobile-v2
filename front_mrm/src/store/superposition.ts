import { create } from 'zustand';

import { DEFAULT_ACTIVE_BASEMAP, THEMES } from '@/app/constant/superposition';

type BasemapStore = {
  oBasemap: any;
};
type BasemapAction = {
  setoBasemap: (oBasemap: any) => void;
};

export const useBasemapStore = create<BasemapStore & BasemapAction>((set) => ({
  oBasemap: DEFAULT_ACTIVE_BASEMAP,
  setoBasemap: (oBasemap) =>
    set(() => ({
      oBasemap,
    })),
}));

type SuperpositionStore = {
  show: boolean;
  isActive: boolean;
};
type SuperpositionAction = {
  setShow: (bValue: boolean) => void;
  setActive: (bValue: boolean) => void;
  setState: (oValue: SuperpositionStore) => void;
};

export const useSuperpositionStore = create<
  SuperpositionStore & SuperpositionAction
>((set) => ({
  show: false,
  isActive: false,
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
  setState: (oValue) => set(() => oValue),
}));

type ModeStore = {
  mode: string;
};
type ModeAction = {
  setMode: (sValue: string) => void;
};

export const useModeStore = create<ModeStore & ModeAction>((set) => ({
  mode: 'superposer',
  setMode: (sValue) =>
    set(() => ({
      mode: sValue,
    })),
}));

type ThemesStore = {
  themes: any;
  action?: any;
};
type ThemesAction = {
  toggleProperty: (property: string, name: string, action: string) => void;
  reOrder: (result: any) => void;
  reset: () => void;
};

export const useThemesStore = create<ThemesStore & ThemesAction>((set) => ({
  themes: THEMES,
  toggleProperty: (property, name, action) =>
    set((state) => {
      let oAction: any;

      const newThemes = state.themes.map((theme: any) => {
        if (theme.name !== name) {
          return theme;
        }
        const bValue = !theme[property];
        theme[property] = bValue;

        oAction = {
          action,
          value: bValue,
          name: theme.name,
        };

        return theme;
      });

      return { themes: newThemes, action: oAction };
    }),
  reOrder: (result: any) =>
    set((state) => {
      const startIndex = result.source.index;
      const endIndex = result.destination.index;

      if (startIndex === endIndex) {
        return state;
      }

      const newThemes = state.themes;
      const [removed] = newThemes.splice(startIndex, 1);
      newThemes.splice(endIndex, 0, removed);

      const oAction = {
        action: 'reorder',
        order: endIndex,
        name: removed.name,
      };

      return { themes: newThemes, action: oAction };
    }),
  reset: () =>
    set(() => {
      return {
        themes: THEMES.map((theme) => ({
          ...theme,
          bFiltered: false,
          bSuperposer: false,
        })),
        action: undefined,
      };
    }),
}));

type PageState = {
  page?: string;
};
type PageAction = {
  setPage: (page: PageState['page']) => void;
};

export const usePageSuperpositionStore = create<PageState & PageAction>(
  (set) => ({
    page: undefined,
    setPage: (page) =>
      set(() => {
        const { themes, toggleProperty } = useThemesStore.getState();

        const aFilteredThemesSuperposition = themes.filter(
          (theme: any) => theme.name === page
        );

        if (
          aFilteredThemesSuperposition.length &&
          !aFilteredThemesSuperposition[0].bSuperposer
        ) {
          toggleProperty('bSuperposer', page!, 'superposer');
        }

        return { page };
      }),
  })
);
