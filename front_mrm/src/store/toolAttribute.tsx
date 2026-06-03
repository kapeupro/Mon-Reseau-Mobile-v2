import { create } from 'zustand';

type State = {
  showAttribution: boolean; // Typage précis pour showAttribution
};

type StateAction = {
  toggleAttribution: () => void;
};

export const useAttributionStore = create<State & StateAction>((set) => ({
  showAttribution: false,
  toggleAttribution: () =>
    set((state) => ({ showAttribution: !state.showAttribution })),
}));
