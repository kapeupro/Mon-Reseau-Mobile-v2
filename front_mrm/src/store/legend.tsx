import { create } from 'zustand';

interface LegendState {
  legend: any;
  setLegend: (legend: any) => void;
}

export const useLegendStore = create<LegendState>((set) => ({
  legend: null,
  setLegend: (newLegend) => set({ legend: newLegend }),
}));
