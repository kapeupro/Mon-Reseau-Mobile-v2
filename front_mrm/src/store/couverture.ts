import { create } from 'zustand';

type territoryCouvertureState = {
  loadingCouverture: boolean;
};
type territoryCouvertureAction = {
  setloadingCouverture: (loadingCouverture: boolean) => void;
};

export const useTerritoryCouvertureState = create<
  territoryCouvertureState & territoryCouvertureAction
>((set) => ({
  loadingCouverture: false,
  setloadingCouverture: (newLoadingCouverture) => {
    set({ loadingCouverture: newLoadingCouverture });
  },
}));
