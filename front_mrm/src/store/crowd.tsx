import { create } from 'zustand';

type crowdState = {
  crowdselect: any;
};
type crowdAction = {
  setselectedCrowd: (crowdselect: any) => void;
};

export const useCrowdState = create<crowdState & crowdAction>((set) => ({
  crowdselect: null,
  setselectedCrowd: (newCrowd) => {
    set({ crowdselect: newCrowd });
  },
}));
