import Metropole from '@/assets/icons/metropoleRegion.svg';
import IconTerritoire from '@/assets/icons/iconTerritoire.svg';
import IconTrain from '@/assets/icons/train.svg';
import IconCar from '@/assets/icons/car.svg';
import Success from '@/assets/icons/success.svg';
import PartialSuccess from '@/assets/icons/partialSuccess.svg';
import Fail from '@/assets/icons/fail.svg';
import CurrentLocation from '@/assets/icons/currentLocation.svg';
import IconUnitedKingdom from '@/assets/icons/united_kingdom.svg';
import Iconfrench from '@/assets/icons/french.svg';

import IconGuyane from '@/assets/icons/guyane.svg';
import IconReunion from '@/assets/icons/reunion.svg';
import IconMartinique from '@/assets/icons/martinique.svg';
import IconMayotte from '@/assets/icons/mayotte.svg';
import IconSaintBart from '@/assets/icons/saint_bart.svg';
import IconSaintMart from '@/assets/icons/saint_mart.svg';
import IconGuadeloupe from '@/assets/icons/guadeloupe.svg';

export const TECHNOLOGIES_INTERNET = [
  {
    text: '3G',
    name: '3g',
  },
  {
    text: '4G',
    name: '4g',
  },
  // {
  //     text: "5G",
  //     name: "5g",
  // },
];

export const TESTS_INTERNET = [
  {
    text: 'webBrowsing',
    titleProgressBar: 'testWebBrowsing',
    legend: {
      titleLegend: 'testWebBrowsing',
      items: [
        {
          id: 'success',
          icon: <Success />,
          attribute: 'test.success',
        },
        {
          id: 'partial_success',
          icon: <PartialSuccess />,
          attribute: 'test.partialSuccess',
        },
        {
          id: 'fail',
          icon: <Fail />,
          attribute: 'test.fails',
        },
      ],
    },
    name: 'WEB',
    description: 'webBrowsingDescription',
    more: 'webBrowsingDescriptionMore',
  },
  {
    text: 'streaming',
    titleProgressBar: 'testStreaming',
    legend: {
      titleLegend: 'testStreaming',
      items: [
        {
          id: 'success',
          icon: <Success />,
          attribute: 'test.perfectQuality',
        },
        {
          id: 'partial_success',
          icon: <PartialSuccess />,
          attribute: 'test.correctQuality',
        },
        {
          id: 'fail',
          icon: <Fail />,
          attribute: 'test.fails',
        },
      ],
    },
    name: 'STREAM',
    description: 'streamingDescription',
    more: '',
  },
  {
    text: 'download',
    titleProgressBar: 'testDownload',
    legend: {
      titleLegend: 'testDownload',
      items: [
        {
          color: '#eebb45',
          attribute: 'test.debit-inf-3',
        },
        {
          color: '#7ccc98',
          attribute: 'test.debit-in-3-8',
        },
        {
          color: '#41b6c4',
          attribute: 'test.debit-in-8-30',
        },
        {
          color: '#225ea8',
          attribute: 'test.debit-sup-30',
        },
      ],
    },
    name: 'DOWNLOAD',
    description: 'downloadDescription',
    more: '',
  },
  {
    text: 'upload',
    titleProgressBar: 'testUpload',
    legend: {
      titleLegend: 'testUpload',
      items: [
        {
          id: 'success',
          icon: <Success />,
          attribute: 'test.success',
        },
        {
          id: 'fail',
          icon: <Fail />,
          attribute: 'test.fails',
        },
      ],
    },
    name: 'UPLOAD',
    description: 'uploadDescription',
    more: '',
  },
];

export const TECHNOLOGIES_APPEL = [
  {
    text: '2G',
    name: '2g',
  },
  {
    text: '2G/3G',
    name: '2G3G',
  },
];

export const DEFAULT_ACTIVE_TESTS_APPEL = 'Voix';
export const TESTS_APPEL = [
  {
    text: DEFAULT_ACTIVE_TESTS_APPEL,
    titleProgressBar: 'testCalls',
    legend: {
      titleLegend: 'testCalls',
      items: [
        {
          id: 'success',
          icon: <Success />,
          attribute: 'test.success',
        },
        {
          id: 'partial_success',
          icon: <PartialSuccess />,
          attribute: 'test.partialSuccess',
        },
        {
          id: 'fail',
          icon: <Fail />,
          attribute: 'test.fails',
        },
      ],
    },
    name: DEFAULT_ACTIVE_TESTS_APPEL,
    description: 'typetestdescvoix',
    more: '',
  },
  {
    text: 'sms',
    titleProgressBar: 'testSms',
    legend: {
      titleLegend: 'testSms',
      items: [
        {
          id: 'success',
          icon: <Success />,
          attribute: 'test.success',
        },
        {
          id: 'fail',
          icon: <Fail />,
          attribute: 'test.fails',
        },
      ],
    },
    name: 'sms',
    description: 'typetestdescsms',
    more: '',
  },
];

export const SERVICES = [
  {
    text: 'Internet mobile',
    name: 'internet',
  },
  {
    text: 'Appels et SMS',
    name: 'appel_sms',
  },
];

export const DEFAULT_ACTIVE_TERRITORY = {
  label: 'Métropole',
  name: 'perimetreMetro',
  dept: 'metropole',
  extent: {
    minx: -5.141,
    maxx: 9.56,
    miny: 41.333,
    maxy: 51.088,
  },
};

export const LIST_TERRITOIRES = [
  {
    icon: <Metropole />,
    label: 'Métropole',
    name: 'perimetreMetro',
    dept: 'metropole',
    extent: {
      minx: -5.141,
      maxx: 9.56,
      miny: 41.333,
      maxy: 51.088,
    },
  },
  {
    icon: <IconGuyane height={35} width={40} />,
    label: 'Guyane',
    name: 'perimetre973',
    dept: '973',
    extent: {
      minx: -54.602,
      maxx: -51.634,
      miny: 2.11,
      maxy: 5.7507,
    },
  },
  {
    icon: <IconGuadeloupe height={35} width={40} />,
    label: 'Guadeloupe',
    name: 'perimetre971',
    dept: '971',
    extent: {
      minx: -61.81,
      maxx: -61.0,
      miny: 15.832,
      maxy: 16.514,
    },
  },
  {
    icon: <IconReunion height={35} width={40} />,
    label: 'La Réunion',
    name: 'perimetre974',
    dept: '974',
    extent: {
      minx: 55.216,
      maxx: 55.836,
      miny: -21.389,
      maxy: -20.871,
    },
  },
  {
    icon: <IconMayotte height={35} width={40} />,
    label: 'Mayotte',
    name: 'perimetre976',
    dept: '976',
    extent: {
      minx: 45.018,
      maxx: 45.299,
      miny: -13.021,
      maxy: -12.636,
    },
  },
  {
    icon: <IconSaintBart height={35} width={40} />,
    label: 'Saint-Barthélemy',
    name: 'perimetre977',
    dept: '977',
    extent: {
      minx: -62.874,
      maxx: -62.789,
      miny: 17.88,
      maxy: 17.929,
    },
  },
  {
    icon: <IconSaintMart height={35} width={40} />,
    label: 'Saint-Martin',
    name: 'perimetre978',
    dept: '978',
    extent: {
      minx: -63.179,
      maxx: -62.938,
      miny: 18.001,
      maxy: 18.1348,
    },
  },
  {
    icon: <IconMartinique height={35} width={40} />,
    label: 'La Martinique',
    name: 'perimetre972',
    dept: '972',
    extent: {
      minx: -61.229,
      maxx: -60.809,
      miny: 14.388,
      maxy: 14.878,
    },
  },
];

export const LIST_TERRITOIRES_DEPT = [
  '973',
  '971',
  '974',
  '976',
  '977',
  '978',
  '972',
];

export const LIST_TYPEZONE = [
  {
    text: 'others',
    name: 'others',
  },
  {
    text: 'rural',
    name: 'zones rurales',
  },
  {
    text: 'intermmediate',
    name: 'zones intermediaires',
  },
  {
    text: 'dense',
    name: 'zones denses',
  },
  {
    text: 'touristic',
    name: 'zones touristiques',
  },
];

export const LIST_SITUATION = [
  {
    text: 'indoor',
    name: 'indoor',
  },
  {
    text: 'outdoor',
    name: 'outdoor',
  },
  {
    text: 'inCar',
    name: 'incar',
  },
];

export const DEFAULT_ACTIVE_OPERATOR = 20820;

export const DEFAULT_ACTIVE_TECHNOLOGIES_INTERNET = '4g';
export const DEFAULT_ACTIVE_TESTS_INTERNET = 'WEB';

export const DEFAULT_ACTIVE_TECHNOLOGIES_APPEL = '2G3G';

export const DEFAULT_ACTIVE_TYPEZONE = 'toutes';

export const DEFAULT_ACTIVE_ENTITE = 'territoire';

export const DEFAULT_ACTIVE_SITUATION = 'toutes';

export const LIST_LANGUAGE = [
  {
    icon: <Iconfrench height={24} width={24} />,
    value: 'fr',
    label: '',
  },
  {
    icon: <IconUnitedKingdom height={24} width={24} />,
    value: 'en',
    label: '',
  },
];
export const DEFAULT_LANGUAGE = 'fr';
export const PREFIX_LAYER = 'layer-arcep';
export const PREFIX_SOURCE_LAYER = `src-${PREFIX_LAYER}`;
