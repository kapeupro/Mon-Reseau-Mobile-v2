import { create } from 'zustand';

interface TogglePanelState {
  showPanel: boolean;
  togglePanel: (showPanel: boolean) => void;
}

interface ShowSearchState {
  showSearchPanel: boolean;
  setShowPanelSearch: (showSearchPanel: boolean) => void;
}

export const useTogglePanelStore = create<TogglePanelState>((set) => ({
  showPanel: true,
  togglePanel: (newShowState) => set({ showPanel: newShowState }),
}));

export const useShowFilterSearch = create<ShowSearchState>((set) => ({
  showSearchPanel: false,
  setShowPanelSearch: (newShowState) => set({ showSearchPanel: newShowState }),
}));
