import { create } from 'zustand';
import { DEFAULT_LANGUAGE } from '@/app/constant/constant';

type Language = {
  language: string;
};
type LanguageAction = {
  setLanguage: (language: string) => void;
};

const getDefaultLanguage = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const queryString = window.location.search;
  const oURLSearchParams = new URLSearchParams(queryString);

  const language = oURLSearchParams.get('lang');
  if (!language) {
    return DEFAULT_LANGUAGE;
  }

  return language.trim() ? language : DEFAULT_LANGUAGE;
};

export const useLanguageStore = create<Language & LanguageAction>((set) => ({
  language: getDefaultLanguage(),
  setLanguage: (language: string) => set({ language: language }),
}));
