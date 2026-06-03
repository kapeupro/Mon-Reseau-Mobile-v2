import { create } from 'zustand';

type SearchState = {
  selectedData: any;
};
type SearchAction = {
  setSelectedData: (selectedData: any) => void;
};

export const useSearchStore = create<SearchState & SearchAction>((set) => ({
  selectedData: false,
  setSelectedData: (selectedData) =>
    set(() => {
      return { selectedData };
    }),
}));
