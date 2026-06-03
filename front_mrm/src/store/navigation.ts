import { create } from 'zustand';

type NavigationStore = {
  bListenChangeOfUrl: boolean;
};
type NavigationAction = {
  setListenChangeOfUrl: (bValue: boolean) => void;
};

export const useNavigationStore = create<NavigationStore & NavigationAction>(
  (set) => ({
    bListenChangeOfUrl: false,
    setListenChangeOfUrl: (bValue) =>
      set(() => ({
        bListenChangeOfUrl: bValue,
      })),
  })
);

type FinishedInitStore = {
  bFinished: boolean;
};
type FinishedInitAction = {
  setFinished: (bValue: boolean) => void;
};

export const useFinishedInitStore = create<
  FinishedInitStore & FinishedInitAction
>((set) => ({
  bFinished: false,
  setFinished: (bValue) =>
    set(() => ({
      bFinished: bValue,
    })),
}));
