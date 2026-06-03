import { create } from 'zustand';

type NewsStore = {
  aData: any[];
};
type NewsAction = {
  setData: (aValues: any[]) => void;
};

export const useNewsStore = create<NewsStore & NewsAction>((set) => ({
  aData: [],
  setData: (aData) => set({ aData }),
}));
