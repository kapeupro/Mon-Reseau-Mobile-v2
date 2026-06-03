import { useCoordStore } from '@/store/selectedCoordStore';
import { useTerritoryStore } from '@/store/filter';

export const getTitleTerritoire = () => {
  const selectedTerritoire = useCoordStore.getState().selectedTerritoire;
  const territory = useTerritoryStore.getState().territory;

  let title = '';

  if (selectedTerritoire) {
    title = selectedTerritoire.label
      ? selectedTerritoire.label
      : selectedTerritoire.properties?.nom;
  } else if (territory) {
    title = territory.label;
  }

  return title;
};
