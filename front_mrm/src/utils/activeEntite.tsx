import { useCoordStore } from '@/store/selectedCoordStore';
import { usePageStore } from '@/store/store';

export const isPageTerritory = () => {
  const { page } = usePageStore.getState();
  return page === 'territory';
};

export const isTerritoire = () => {
  const entite = getLabelEntite();

  return entite === 'territoire' ? true : false;
};

export const isDepartement = () => {
  const entite = getLabelEntite();

  return entite === 'departement' ? true : false;
};

export const isRegion = () => {
  const entite = getLabelEntite();

  return entite === 'region' ? true : false;
};

export const isCommune = () => {
  const entite = getLabelEntite();

  return entite === 'commune' ? true : false;
};

export const isAdresse = () => {
  const entite = getLabelEntite();

  return entite === 'adresse' ? true : false;
};

export const isTrain = () => {
  const entite = getLabelEntite();

  return entite === 'train' ? true : false;
};

export const isLocalisation = () => {
  const selectedTerritoire = useCoordStore.getState().selectedTerritoire;

  const entite =
    selectedTerritoire?.entite || selectedTerritoire?.type || 'Territoire';

  return entite.toLowerCase() === 'localisation' ? true : false;
};

export const isRoute = () => {
  const entite = getLabelEntite();

  return entite === 'route' ? true : false;
};

export const isTransport = () => {
  if (isTrain() || isRoute()) return true;

  return false;
};

export const getLabelEntite = () => {
  const selectedTerritoire = useCoordStore.getState().selectedTerritoire;

  const entite =
    selectedTerritoire?.entite || selectedTerritoire?.type || 'Territoire';

  let label_entite = '';
  switch (entite.toLowerCase()) {
    case 'territoire':
      label_entite = 'territoire';
      break;
    case 'département':
      label_entite = 'departement';
      break;
    case 'région':
      label_entite = 'region';
      break;
    case 'region':
      label_entite = 'region';
      break;
    case 'departement':
      label_entite = 'departement';
      break;
    case 'commune':
      label_entite = 'commune';
      break;
    case 'adresse':
      label_entite = 'adresse';
      break;
    case 'localisation':
      label_entite = 'adresse';
      break;
    case 'train':
      label_entite = 'train';
      break;
    case 'route':
      label_entite = 'route';
      break;
    default:
      label_entite = 'territoire';
  }

  return label_entite;
};
