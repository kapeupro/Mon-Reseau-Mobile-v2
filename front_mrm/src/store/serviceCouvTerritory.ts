import { create } from 'zustand';

type serviceCouvTerritoryState = {
  selectedServiceCouvTerritory: any;
};
type serviceCouvTerritoryAction = {
  setselectedServiceCouvTerritory: (selectedServiceCouvTerritory: any) => void;
};

export const useServiceCouvTerritory = create<
  serviceCouvTerritoryState & serviceCouvTerritoryAction
>((set) => ({
  selectedServiceCouvTerritory: 'internet',
  setselectedServiceCouvTerritory: (newSelectedServiceCouvTerritory) => {
    set({ selectedServiceCouvTerritory: newSelectedServiceCouvTerritory });
  },
}));
