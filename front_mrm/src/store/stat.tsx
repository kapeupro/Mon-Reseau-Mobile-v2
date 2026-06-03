import { create } from 'zustand';

type StatCouvertureTerritoryState = {
  statCouvTerritory: any;
};
type StatCouvertureTerritoryAction = {
  setStatCouvTerritory: (statCouvTerritory: any) => void;
};

export const useStatCouvTerritoryStore = create<
  StatCouvertureTerritoryState & StatCouvertureTerritoryAction
>((set) => ({
  statCouvTerritory: null,
  setStatCouvTerritory: (newStatCouvTerritory) => {
    set({ statCouvTerritory: newStatCouvTerritory });
  },
}));

type StatTestTerritoryState = {
  statTestTerritory: any;
};
type StatTestTerritoryAction = {
  setStatTestTerritory: (statTestTerritory: any) => void;
};

export const useStatTestTerritoryStore = create<
  StatTestTerritoryState & StatTestTerritoryAction
>((set) => ({
  statTestTerritory: null,
  setStatTestTerritory: (newStatTestTerritory) => {
    set({ statTestTerritory: newStatTestTerritory });
  },
}));

type StatAntenneTerritoryState = {
  statAntenneTerritory: any;
};
type StatAntenneTerritoryAction = {
  setStatAntenneTerritory: (statAntenneTerritory: any) => void;
};

export const useStatAntenneTerritoryStore = create<
  StatAntenneTerritoryState & StatAntenneTerritoryAction
>((set) => ({
  statAntenneTerritory: null,
  setStatAntenneTerritory: (newStatAntenneTerritory) => {
    set({ statAntenneTerritory: newStatAntenneTerritory });
  },
}));

type StatZoneTerritoryState = {
  statZoneTerritory: any;
};
type StatZoneTerritoryAction = {
  setStatZoneTerritory: (statZoneTerritory: any) => void;
};

export const useStatZoneTerritoryStore = create<
  StatZoneTerritoryState & StatZoneTerritoryAction
>((set) => ({
  statZoneTerritory: null,
  setStatZoneTerritory: (newStatZoneTerritory) => {
    set({ statZoneTerritory: newStatZoneTerritory });
  },
}));

type StatSignalementTerritoryState = {
  statSignalementTerritory: any;
};
type StatSignalementTerritoryAction = {
  setStatSignalementTerritory: (statSignalementTerritory: any) => void;
};

export const useStatSignalementTerritoryStore = create<
  StatSignalementTerritoryState & StatSignalementTerritoryAction
>((set) => ({
  statSignalementTerritory: null,
  setStatSignalementTerritory: (newStatSignalementTerritory) => {
    set({ statSignalementTerritory: newStatSignalementTerritory });
  },
}));
