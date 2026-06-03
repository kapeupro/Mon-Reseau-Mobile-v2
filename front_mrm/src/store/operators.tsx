import { create } from 'zustand';

import { fetchOperators } from '@/service/operators';
import {
  useOperatorStore,
  usePageStore,
  useLoadingStore,
  useOperatorAndAllStore,
} from '@/store/store';
import { useOperatorsQosStore } from '@/store/qos';
import { useOperatorsZoneStore } from '@/store/zone';
import { useOperatorsTrainStore } from '@/store/train';
import { useOperatorsRouteStore } from '@/store/route';
import { useOperatorsSignalementStore } from './signalement';
import { getRandomInteger, isModeDaltonien } from '@/utils/utils';
import { useTerritoryStore } from './filter';
import { useLegendStore } from './legend';
import { useThemeStore } from './themes';

type OperatorsState = {
  operators: any;
  originalOperators: any;
  date: any;
};
type OperatorsAction = {
  fetch: () => void;
  setNewOperatorsColor: (newoperators: any) => void;
  setOperatorsColors: (theme: string) => void;
};

type OperatorsAndAllState = {
  operatorsAndAll: any;
};
type OperatorsAndAllAction = {
  setOperatorsAndAll: (operatorsAndAll: any[]) => void;
};

export const useOperatorsStore = create<OperatorsState & OperatorsAction>(
  (set) => ({
    operators: false,
    originalOperators: false,
    date: {},
    setNewOperatorsColor: (newColors: any) =>
      set((state: any) => {
        const theme = useThemeStore.getState().theme;
        if (theme === 'default') {
          const defaultOperators = state.operators.map((op: any) => {
            const matchedIdOp = state.originalOperators.find(
              (nc: any) => nc.identifiant == op.identifiant
            );
            return {
              ...op,
              newColors: false,
              couleurDefaut: matchedIdOp.couleurDefaut,
              couleurNiveau1: matchedIdOp.couleurNiveau1,
              couleurNiveau2: matchedIdOp.couleurNiveau2,
              couleurNiveau3: matchedIdOp.couleurNiveau3,
              couleurNiveau4: matchedIdOp.couleurNiveau4,
            };
          });
          return { ...state, operators: defaultOperators };
        } else {
          const updatedOperators = state.operators.map((op: any) => {
            const matchedIdOp = newColors.find(
              (nc: any) => nc.id == op.identifiant
            );
            return {
              ...op,
              couleurDefaut: matchedIdOp.new_colors.couleurDefaut,
              couleurNiveau1: matchedIdOp.new_colors.couleurNiveau1,
              couleurNiveau2: matchedIdOp.new_colors.couleurNiveau2,
              couleurNiveau3: matchedIdOp.new_colors.couleurNiveau3,
              couleurNiveau4: matchedIdOp.new_colors.couleurNiveau4,
            };
          });

          return { ...state, operators: updatedOperators };
        }
      }),
    setOperatorsColors: (theme: string) =>
      set((state: any) => {
        return {
          ...state,
          operators: state.operators.map((op: any) => {
            const opOriginals = state.originalOperators.filter(
              (opOr: any) => opOr.identifiant === op.identifiant
            );

            if (!opOriginals.length) {
              return op;
            }

            const opOriginal = opOriginals[0];

            if (theme === 'default') {
              return {
                ...op,
                couleurDefaut: opOriginal.couleurDefaut,
                couleurNiveau1: opOriginal.couleurNiveau1,
                couleurNiveau2: opOriginal.couleurNiveau2,
                couleurNiveau3: opOriginal.couleurNiveau3,
                couleurNiveau4: opOriginal.couleurNiveau4,
              };
            } else {
              return {
                ...op,
                couleurDefaut: opOriginal.optCouleurDefaut,
                couleurNiveau1: opOriginal.optCouleurNiveau1,
                couleurNiveau2: opOriginal.optCouleurNiveau2,
                couleurNiveau3: opOriginal.optCouleurNiveau3,
                couleurNiveau4: opOriginal.optCouleurNiveau4,
              };
            }
          }),
        };
      }),
    fetch: async () => {
      const { territory } = useTerritoryStore.getState();
      const { setLoading } = useLoadingStore.getState();
      const { theme } = useThemeStore.getState();

      let data = [];
      try {
        data = await fetchOperators(territory.name, theme);
      } catch (e) {
        console.log(e);
      }

      const ids = data.operateurs.map((dt: any) => dt.identifiant);
      let defaultOperator = undefined;
      if (ids.length) {
        defaultOperator = ids[getRandomInteger(0, ids.length - 1)];
      }

      const legendColor = getOperatorColorByIdentifiant(defaultOperator);

      const legendItems = [
        {
          color: legendColor,
          attribute: 'Zone couverte',
        },
        {
          color: '#ffffff',
          attribute: 'Zone non couverte',
        },
      ];

      const dataLegend: any = {
        title: 'Niveau de couverture',
        items: legendItems,
      };

      useLegendStore.getState().setLegend(dataLegend);

      set({
        operators: getNewOperateurs(data.operateurs),
        originalOperators: data.operateurs,
        date: data.data_date,
      });

      const aIdsOperators = getAllOperators(data.operateurs);
      initOperators(aIdsOperators, defaultOperator);

      setLoading(false);
    },
  })
);

// mountStoreDevtool("OperatorsStore", useOperatorsStore)

const getNewOperateurs = (dataop: any) => {
  const theme = useThemeStore.getState().theme;

  if (theme === 'default') {
    return dataop;
  }

  return dataop.map((op: any) => {
    return {
      ...op,
      couleurDefaut: op.optCouleurDefaut,
      couleurNiveau1: op.optCouleurNiveau1,
      couleurNiveau2: op.optCouleurNiveau2,
      couleurNiveau3: op.optCouleurNiveau3,
      couleurNiveau4: op.optCouleurNiveau4,
    };
  });
};

const initOperators = (ids: any, defaultOperator: any) => {
  if (typeof window === 'undefined') {
    return;
  }

  const { page } = usePageStore.getState();
  const { setDefaultToggleOperator } = useOperatorStore.getState();
  const { toggleOperatorAndAll: toggleOperatorsAntennes } =
    useOperatorAndAllStore.getState();
  const { toggleOperators: toggleOperatorsQos } =
    useOperatorsQosStore.getState();
  const { toggleOperators: toggleOperatorsZone } =
    useOperatorsZoneStore.getState();
  const { toggleOperators: toggleOperatorsTrain } =
    useOperatorsTrainStore.getState();
  const { toggleOperators: toggleOperatorsRoute } =
    useOperatorsRouteStore.getState();
  const { toggleOperators: toggleOperatorsSignalements } =
    useOperatorsSignalementStore.getState();

  if (page !== 'antennes-deploiements') {
    toggleOperatorsAntennes(ids);
  }

  if (page !== 'zones-a-couvrir') {
    toggleOperatorsZone(ids);
  }

  if (page !== 'qualite-reseau') {
    toggleOperatorsQos(ids);
    toggleOperatorsTrain(ids);
    toggleOperatorsRoute(ids);
  }

  if (page !== 'couverture-theorique') {
    setDefaultToggleOperator(defaultOperator);
  }

  if (page !== 'signalements') {
    toggleOperatorsSignalements(ids);
  }
};

// mountStoreDevtool("ListOperators", useOperatorsStore)

export const useOperatorsAndAllStore = create<
  OperatorsAndAllState & OperatorsAndAllAction
>((set) => ({
  operatorsAndAll: false,
  setOperatorsAndAll: (operatorsAndAll) =>
    set(() => ({ operatorsAndAll: operatorsAndAll })),
}));

export const getOperatorNameByID = (identifiant: number) => {
  const aStoreOperators = useOperatorsStore.getState().operators;
  if (!aStoreOperators) {
    return '';
  }

  for (const storeOperator of aStoreOperators) {
    if (storeOperator.identifiant === identifiant) {
      return storeOperator.name;
    }
  }
  return '';
};

export const getOperatorColorByIdentifiant = (
  identifiant: number,
  niveau = 'default'
) => {
  const aStoreOperators = useOperatorsStore.getState().operators;
  if (!aStoreOperators) {
    return '#ffffff';
  }

  for (const storeOperator of aStoreOperators) {
    if (storeOperator.identifiant === identifiant) {
      switch (niveau) {
        case 'niveau4':
          return storeOperator.couleurNiveau4;
        case 'niveau3':
          return storeOperator.couleurNiveau3;
        case 'niveau2':
          return storeOperator.couleurNiveau2;
        case 'niveau1':
          return storeOperator.couleurNiveau1;
        default:
          return storeOperator.couleurDefaut;
      }
    }
  }
  return '#ffffff';
};

export const getOperatorById = (aIdentifiant: number[]) => {
  const aStoreOperators = useOperatorsStore.getState().operators;
  if (!aStoreOperators) {
    return '';
  }

  if (aIdentifiant.length > 1) {
    return '';
  }

  for (const storeOperator of aStoreOperators) {
    if (aIdentifiant === storeOperator.identifiant) {
      return storeOperator;
    }
  }
  return '';
};

export const getOperatorIdentifiantByName = (name: string) => {
  const aStoreOperators = useOperatorsStore.getState().operators;
  if (!aStoreOperators) {
    return '';
  }

  for (const storeOperator of aStoreOperators) {
    if (formatString(storeOperator.nomEntier) === formatString(name)) {
      return storeOperator.identifiant;
    }
  }
  return '';
};

export const getOperatorNameByIdentifiant = (identifiant: string) => {
  const aStoreOperators = useOperatorsStore.getState().operators;
  if (!aStoreOperators) {
    return '';
  }

  for (const storeOperator of aStoreOperators) {
    if (formatString(storeOperator.identifiant) === formatString(identifiant)) {
      return storeOperator.nomAffichage;
    }
  }
  return '';
};

export const getOperators = (
  threeValues = false,
  isAntenneDeploiement = false
) => {
  const aStoreOperators = useOperatorsStore.getState().operators;
  if (!aStoreOperators) {
    return [];
  }
  const aOperators = [];

  for (const storeOperator of aStoreOperators) {
    aOperators.push({
      ...storeOperator,
      name: formatString(storeOperator.nomAffichage),
      progressbar: {
        values: getValuesProgressBar(threeValues),
        colors: getColors(storeOperator, threeValues, isAntenneDeploiement),
      },
    });
  }

  return aOperators;
};

function getColors(
  storeOperator: any,
  threeValues: any,
  isAntenneDeploiement: any
) {
  if (threeValues && isAntenneDeploiement) {
    return [
      storeOperator.couleurNiveau1,
      storeOperator.couleurNiveau2,
      storeOperator.couleurNiveau3,
    ];
  }

  return threeValues
    ? [storeOperator.couleurNiveau3, storeOperator.couleurNiveau1, '#e3e3e3']
    : [
        storeOperator.couleurNiveau3,
        storeOperator.couleurNiveau2,
        storeOperator.couleurNiveau1,
        '#e3e3e3',
      ];
}

function formatString(value: any) {
  return String(value).trim().toLowerCase();
}

function getValuesProgressBar(threeValues = false) {
  if (threeValues) {
    return [92, 6, 2];
  } else {
    return [82, 10, 6, 2];
  }
}
export function getAllOperators(listOperators: any) {
  const operators: any = [];
  if (listOperators && Array.isArray(listOperators)) {
    listOperators.forEach((operator: any) => {
      operators.push(operator.identifiant);
    });
  }
  return operators;
}

export const getMapCouvertureOperatorColorByIdentifiant = (
  identifiant: number,
  niveau = 'default'
) => {
  const aStoreOperators = useOperatorsStore.getState().operators;
  if (!aStoreOperators) {
    return '#ffffff';
  }

  for (const storeOperator of aStoreOperators) {
    if (storeOperator.identifiant === identifiant) {
      switch (niveau) {
        case 'niveau4':
          return isModeDaltonien()
            ? storeOperator.mapOptCouleurNiveau4
            : storeOperator.mapCouleurNiveau4;
        case 'niveau3':
          return isModeDaltonien()
            ? storeOperator.mapOptCouleurNiveau3
            : storeOperator.mapCouleurNiveau3;
        case 'niveau2':
          return isModeDaltonien()
            ? storeOperator.mapOptCouleurNiveau2
            : storeOperator.mapCouleurNiveau2;
        case 'niveau1':
          return isModeDaltonien()
            ? storeOperator.mapOptCouleurNiveau1
            : storeOperator.mapCouleurNiveau1;
        default:
          return isModeDaltonien()
            ? storeOperator.mapOptCouleurDefaut
            : storeOperator.mapCouleurDefaut;
      }
    }
  }
  return '#ffffff';
};
