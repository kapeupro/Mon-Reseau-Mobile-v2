import { create } from 'zustand';

interface ArianeState {
  filesAriane: any[];
  setFilesAriane: (newAriane: any[]) => void;
}

export const useFilesArianeStore = create<ArianeState>((set) => ({
  filesAriane: [],
  setFilesAriane: (newAriane) => {
    set((state) => {
      if (state.filesAriane !== newAriane) {
        return { filesAriane: newAriane };
      }
      return state;
    });
  },
}));
