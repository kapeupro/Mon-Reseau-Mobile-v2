import { create } from 'zustand';
import { getDefaultValueUrl } from './utils/valueUrl';

type ThemeState = {
  theme: string;
};
type ThemeAction = {
  setTheme: (theme: ThemeState['theme']) => void;
};

export const useThemeStore = create<ThemeState & ThemeAction>((set) => ({
  theme: getDefaultValueUrl('theme', 'default'),
  setTheme: (newTheme) => {
    set({ theme: newTheme });
  },
}));
