import { create } from 'zustand';

type PrintMapState = {
  loading: boolean;
};
type PrintMapAction = {
  setLoading: (bValue: boolean) => void;
};

export const usePrintMapStore = create<PrintMapState & PrintMapAction>(
  (set) => ({
    loading: false,
    setLoading: (bValue) =>
      set(() => {
        return { loading: bValue };
      }),
  })
);
