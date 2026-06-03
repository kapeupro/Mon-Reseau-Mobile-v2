import { useSuperpositionStore } from '@/store/superposition';

export const isActiveSuperposer = () => {
  const { isActive } = useSuperpositionStore.getState();
  return isActive;
};
