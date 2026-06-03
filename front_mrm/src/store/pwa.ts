import { create } from 'zustand';

type PwaState = {
  deferredPrompt: any;
};
type PwaAction = {
  setDeferredPrompt: (deferredPrompt: any) => void;
};

export const usePwaStore = create<PwaState & PwaAction>((set) => ({
  deferredPrompt: null,
  setDeferredPrompt: (deferredPrompt) =>
    set(() => {
      return { deferredPrompt };
    }),
}));
