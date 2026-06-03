import { create } from 'zustand';

type SupportsState = {
  supports: any;
};
type SupportsAction = {
  setSupports: (supports: any) => void;
};

export const useSupportsStore = create<SupportsState & SupportsAction>(
  (set) => ({
    supports: false,
    setSupports: (newSupports) => {
      set({ supports: newSupports });
    },
  })
);
