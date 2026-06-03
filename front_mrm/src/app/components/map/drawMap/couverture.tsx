import { getMapCouvertureOperatorColorByIdentifiant } from '@/store/operators';
import {
  clearMapVector,
  getDeptNotInMetropole,
  getIdDeptTerritory,
  isMetropole,
  getRandomInt,
} from '@/app/components/map/drawMap/utils';

const NEXT_PUBLIC_SCHEMA = process.env.NEXT_PUBLIC_SCHEMA;
import { TECNO_NON_CLASSIFIABLE } from '@/app/constant/couverture';

export default function drawMapCouverture(
  mapGlobalParameters: any,
  mapObj: any,
  bClearMapVector = true
) {
  const TILESERV_URL = process.env.NEXT_PUBLIC_TILESERV_URL;
  const aTechnologiesSelected = mapGlobalParameters['technology'];
  const aOperatorSelected = mapGlobalParameters['operator'];

  const formatParams = (data: any[]) => {
    return '{' + data.join(',').toUpperCase() + '}';
  };

  const getPrefixLayerCouverture = () => {
    return 'layer-arcep-couverture';
  };

  const getIdLayerByIdentifiant = (identifiant: number, techno: string) => {
    var prefixLayerIdent = getPrefixLayerCouverture();
    var layerIdent =
      prefixLayerIdent + '-' + identifiant + '-' + techno + getRandomInt(50000);
    return layerIdent;
  };

  const getSourceByIdentifiant = (identifiant: number, techno: string) => {
    var prefixLayerIdent = getPrefixLayerCouverture();
    var source =
      'src-' +
      prefixLayerIdent +
      '-' +
      identifiant +
      '-' +
      techno +
      getRandomInt(50000);
    return source;
  };

  const getFilterByTerritory = (mapGlobalParametersParams: any) => {
    let filter = null;
    if (isMetropole(mapGlobalParametersParams)) {
      filter = [
        '!',
        ['in', ['get', 'dept'], ['literal', getDeptNotInMetropole()]],
      ];
    } else {
      filter = [
        'in',
        ['get', 'dept'],
        ['literal', [getIdDeptTerritory(mapGlobalParametersParams)]],
      ];
    }
    return filter;
  };
  const buildFilter = (mapGlobalParametersParams: any) => {
    var aFilter = [];
    aFilter.push('all');
    var filterTerritory = getFilterByTerritory(mapGlobalParametersParams);
    if (filterTerritory !== null) {
      aFilter.push(filterTerritory);
    }
    return aFilter;
  };

  const addCouvertureLayer = (identifiant: number) => {
    var layerIdent = getIdLayerByIdentifiant(
      identifiant,
      aTechnologiesSelected[0]
    );
    var layerSource = getSourceByIdentifiant(
      identifiant,
      aTechnologiesSelected[0]
    );
    var source = `${NEXT_PUBLIC_SCHEMA}.couvertures`;

    var listeOperateur = formatParams([identifiant]);
    var listeTechno = formatParams(aTechnologiesSelected);

    if (!mapObj.getSource(layerSource)) {
      mapObj.addSource(layerSource, {
        type: 'vector',
        tiles: [
          TILESERV_URL +
            source +
            '/{z}/{x}/{y}.pbf?properties=dept,niveau&liste_operateur=' +
            listeOperateur +
            '&liste_techno=' +
            listeTechno,
        ],
      });
    }

    if (!isCouvertureClassifiable()) {
      layerIdent += 'no-class';

      var color = getMapCouvertureOperatorColorByIdentifiant(
        Number(identifiant),
        'default'
      );

      mapObj.addLayer({
        id: layerIdent,
        type: 'fill',
        source: layerSource,
        'source-layer': 'default',
        layout: {
          visibility: 'visible',
        },
        filter: buildFilter(mapGlobalParameters),
        paint: {
          'fill-outline-color': 'transparent',
          'fill-color': color,
          'fill-opacity': 0.5,
        },
      });
    } else {
      layerIdent += 'with-class';
      mapObj.addLayer({
        id: layerIdent,
        type: 'fill',
        source: layerSource,
        'source-layer': 'default',
        layout: {
          visibility: 'visible',
        },
        filter: buildFilter(mapGlobalParameters),
        paint: {
          'fill-outline-color': 'transparent',
          'fill-color': [
            'match',
            ['get', 'niveau'],
            'TBC',
            getMapCouvertureOperatorColorByIdentifiant(
              Number(identifiant),
              'niveau4'
            ),
            'BC',
            getMapCouvertureOperatorColorByIdentifiant(
              Number(identifiant),
              'niveau3'
            ),
            'CL',
            getMapCouvertureOperatorColorByIdentifiant(
              Number(identifiant),
              'niveau2'
            ),
            getMapCouvertureOperatorColorByIdentifiant(
              Number(identifiant),
              'niveau1'
            ),
          ],
          'fill-opacity': 0.5,
        },
      });
    }
  };

  const isCouvertureClassifiable = () => {
    return !TECNO_NON_CLASSIFIABLE.includes(
      aTechnologiesSelected[0].toUpperCase()
    );
  };

  const draw = (mapObjParams: any) => {
    if (bClearMapVector) {
      clearMapVector(mapObjParams);
    }

    for (var i = 0; i < aOperatorSelected.length; i++) {
      var identifiant = aOperatorSelected[i];
      addCouvertureLayer(Number(identifiant));
    }
  };

  draw(mapObj);
}
