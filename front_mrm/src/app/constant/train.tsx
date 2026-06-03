import Train from '@/assets/icons/all_train.svg';
import IconMetro from '@/assets/icons/metros.svg';
import IconRer from '@/assets/icons/rer.svg';
import IconTgv from '@/assets/icons/tgv.svg';

export const LIST_TYPE_AXES = [
  {
    icon: <Train />,
    name: 'all',
    label: 'Tous les trains',
    combo_label: 'Tous les trains',
    level: 1,
  },
  {
    icon: <IconTgv />,
    name: 'tgv,tgv_internationaux',
    combo_label: 'Tous les TGV',
    label: 'TGV',
    level: 2,
  },
  {
    icon: <Train />,
    name: 'intercites_ter',
    label: 'Intercités et TER',
    combo_label: 'Tous les Intercités et les TER',
    level: 2,
  },
  {
    icon: <IconRer />,
    name: 'transiliens_rer',
    label: 'RER et Transiliens',
    combo_label: 'Tous les RER et les transiliens',
    level: 2,
  },
  {
    icon: <IconMetro />,
    name: 'metros',
    label: 'Métro',
    combo_label: 'Tous métros',
    level: 2,
  },
];

export const LIST_TGV = [
  {
    value: 'tgv_paris_bordeaux',
    label: 'TGV Paris-Bordeaux',
  },
  {
    value: 'tgv_1',
    label: 'TGV 1',
  },
  {
    value: 'tgv_2',
    label: 'TGV 2',
  },
];
