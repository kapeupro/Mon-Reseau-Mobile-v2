import { useCoordStore } from '@/store/selectedCoordStore';
import { isMetropole as isMetropoleByDept } from './utils';
import { LIST_TERRITOIRES } from '@/app/constant/constant';
export const getCurrentInsee = () => {
  const selectedTerritoire = useCoordStore.getState().selectedTerritoire;

  let current_insee = 'metropole';
  if (selectedTerritoire) {
    if (selectedTerritoire.dept) {
      current_insee = selectedTerritoire.dept;
    } else {
      if (selectedTerritoire.properties) {
        const properties = selectedTerritoire.properties;
        if (properties['insee_com']) {
          current_insee = properties['insee_com'];
        } else if (properties['insee_reg']) {
          current_insee = properties['insee_reg'];
        } else if (properties['insee_dep']) {
          current_insee = properties['insee_dep'];
        }
      }
    }
  }

  return current_insee;
};

export const isMetropole = () => {
  return isMetropoleByDept();
};

export const isOutremer = () => {
  return !isMetropole();
};

export const getDepartementOutremer = (id: string, entite: string) => {
  return id === 'metropole' && entite === 'territoire'
    ? {
        dept_outremer: LIST_TERRITOIRES.filter((dt) => dt.dept !== 'metropole')
          .map((dt) => dt.dept)
          .join(','),
      }
    : {};
};
