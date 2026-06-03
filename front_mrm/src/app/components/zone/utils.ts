import { usePageStore } from '@/store/store';

export function isZac() {
  const { page } = usePageStore.getState();
  return page === 'zones-a-couvrir';
}
