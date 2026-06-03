const BASE_URL_STYLE = 'https://api.maptiler.com/maps';
const key = process.env.NEXT_PUBLIC_BASEMAP_KEY;

export const DEFAULT_ACTIVE_BASEMAP = {
  name: 'classique',
  label: 'classic',
  background: 'bg-basemap-classique',
  style: 'https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json',
};

export const BASEMAPS = [
  DEFAULT_ACTIVE_BASEMAP,
  {
    name: 'satellite',
    label: 'satellite',
    background: 'bg-basemap-satellite',
    style: `/mapstyles/style_orthoIGN.json`,
  },
  {
    name: 'clair',
    label: 'clear',
    background: 'bg-basemap-clair',
    style: `/mapstyles/style_positron.json`,
  },
  {
    name: 'sombre',
    label: 'dark',
    background: 'bg-basemap-sombre',
    style: `/mapstyles/style_fiord_3d.json`,
  },
];

export const THEMES = [
  {
    name: 'couverture-theorique',
    label: 'antenne.couverture',
    bFiltered: false,
    bSuperposer: false,
  },
  {
    name: 'qualite-reseau',
    label: 'test.title',
    bFiltered: false,
    bSuperposer: false,
  },
  {
    name: 'antennes-deploiements',
    label: 'antenne.title',
    bFiltered: false,
    bSuperposer: false,
  },
  {
    name: 'zones-a-couvrir',
    label: 'zone.title',
    bFiltered: false,
    bSuperposer: false,
  },
  {
    name: 'signalements',
    label: 'signalement.reportingTitle',
    bFiltered: false,
    bSuperposer: false,
  },
];
