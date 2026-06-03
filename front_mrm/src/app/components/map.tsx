'use client';

import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapTools from '@/app/components//map/tools';
import MapGlobalFilter from './map/filter';
import { drawMap } from './map/drawMap';
import Legend from '@/app/components/map/legend';
import { usePageStore } from '@/store/store';
import {
  useMapStore,
  useMapTerritoryStore,
  useControleStore,
} from '@/store/map';
import { isMobile } from '@/service/window';
import { clearMapVectorTerritory } from '@/app/components/map/drawMap/utils';
import { useTranslations } from 'next-intl';
import { isTransport } from '@/utils/activeEntite';

import {
  Region as RegionSearchCarto,
  Departement as DepartementSearchCarto,
  Commune as CommuneSearchCarto,
} from '@/app/components/map/drawMap/searchterritory';
import { useCoordStore } from '@/store/selectedCoordStore';
import BasemapControl from './map/basemapControl';
import { DEFAULT_ACTIVE_BASEMAP } from '../constant/superposition';
import { onClickMap, hideCredit, onIdleMap, onDataloading } from './map/events';
import { useMesureToolsStore } from '@/store/tools';
import MeasureControlUx from './map/controler/measure';
import ToolInfoPoint from './map/infoPoint';
import Credit from './credit';
import MapLoading from './map/loading';

export default React.memo(function Map() {
  const { extent, oMap: map, setMap } = useMapStore();
  const { territory } = useMapTerritoryStore();
  const { page: currentPage } = usePageStore();
  const { selectedTerritoire } = useCoordStore();
  const mapContainer = useRef<any>(null);
  const mapobjRef = useRef<any>(null);
  const [lng] = useState(2.19);
  const [lat] = useState(48.52);
  const [zoom] = useState(5);
  const { isMesure } = useMesureToolsStore();
  const { setControle } = useControleStore();

  const translations = useTranslations();

  useEffect(() => {
    if (mapobjRef.current) {
      return; // stops map from intializing more than once
    }

    const { style } = DEFAULT_ACTIVE_BASEMAP;

    const mapObj = new maplibregl.Map({
      container: mapContainer.current,
      style: style,
      center: [lng, lat],
      zoom: zoom,
      attributionControl: false,
      antialias: true,
    });
    mapObj.addControl(
      new maplibregl.AttributionControl({
        compact: false,
      })
    );

    const measuresControl = new MeasureControlUx({});
    mapObj.addControl(measuresControl);
    setControle(measuresControl);

    mapobjRef.current = mapObj;

    mapObj.on('style.load', () => {
      loadImages(mapObj);

      const { oMap: map, setMap } = useMapStore.getState();

      if (!map) {
        setMap(mapObj);
        addScalebar(mapObj);

        mapObj.addControl(new maplibregl.NavigationControl(), 'bottom-right');
      }
    });

    mapObj.on('click', onClickMap);
    mapObj.on('dataloading', onDataloading);
    mapObj.on('idle', onIdleMap);
  }, [lng, lat, zoom, map, setMap]);

  useEffect(() => {
    if (!map) {
      return;
    }

    const bbox = [
      [extent['minx'], extent['miny']],
      [extent['maxx'], extent['maxy']],
    ];
    map.resize();
    map.fitBounds(bbox);
  }, [extent, map]);

  useEffect(() => {
    if (!map) {
      return;
    }
  }, [isMesure]);

  useEffect(() => {
    const extent = territory.extent;
    if (!map || !extent) {
      return;
    }

    const bbox = [
      [extent['minx'], extent['miny']],
      [extent['maxx'], extent['maxy']],
    ];

    const zoomOptions = isTransport()
      ? {
          padding: { top: 125, bottom: 125, left: 125, right: 125 },
        }
      : {};

    map.fitBounds(bbox, zoomOptions);

    if (territory.typeterritory === 'region') {
      const oReg = new RegionSearchCarto(map);
      oReg.setValueIdent(territory.valueIdent);
      oReg.draw();
    }
    if (territory.typeterritory === 'departement') {
      const oDept = new DepartementSearchCarto(map);
      oDept.setValueIdent(territory.valueIdent);
      oDept.draw();
    }
    if (territory.typeterritory === 'commune') {
      const oCom = new CommuneSearchCarto(map);
      oCom.setValueIdent(territory.valueIdent);
      oCom.draw();
    }
  }, [territory, map]);

  useEffect(() => {
    if (!map) {
      return;
    }
    if (!selectedTerritoire) {
      clearMapVectorTerritory(map);
    }
  }, [selectedTerritoire, map]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      hideCredit();
    }, 10000);

    return () => {
      if (map) {
        setMap(null);
      }
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addScalebar = (mapObj: any) => {
    const scale = new maplibregl.ScaleControl({
      maxWidth: 80,
      unit: 'metric',
    });
    mapObj.addControl(scale);
  };

  const loadImages = (mapObj: any) => {
    let aImages = [
      {
        id: 'quality-success',
        url: 'assets/icons/success.png',
      },
      {
        id: 'quality-success_partiel',
        url: 'assets/icons/success_partiel.png',
      },
      {
        id: 'quality-echec',
        url: 'assets/icons/echec.png',
      },
      {
        id: 'quality-active',
        url: 'assets/icons/quality_active.png',
      },
      {
        id: 'poi-out-zone',
        url: 'assets/icons/poi_out_zone.png',
      },
      {
        id: 'zone-active',
        url: 'assets/icons/quality_active.png',
      },
      {
        id: 'antenne-en-service',
        url: 'assets/icons/antenne_en_service.png',
      },
      {
        id: 'antenne-en-maintenance',
        url: 'assets/icons/antenne_en_maintenance.png',
      },
      {
        id: 'antenne-a-venir',
        url: 'assets/icons/antenne_a_venir.png',
      },
      {
        id: 'antenne-active',
        url: 'assets/icons/antenna-active.png',
      },
      {
        id: 'address-active',
        url: 'assets/icons/poi_selected.png',
      },
      {
        id: 'antenne-cluster-step-1',
        url: 'assets/icons/cluster_step_1.png',
      },
      {
        id: 'antenne-cluster-step-2',
        url: 'assets/icons/cluster_step_2.png',
      },
      {
        id: 'antenne-cluster-step-3',
        url: 'assets/icons/cluster_step_3.png',
      },
      {
        id: 'antenne-cluster-step-4',
        url: 'assets/icons/cluster_step_4.png',
      },
      {
        id: 'antenne-cluster-step-5',
        url: 'assets/icons/cluster_step_5.png',
      },
      {
        id: 'antenne-cluster-step-6',
        url: 'assets/icons/cluster_step_6.png',
      },
      {
        id: 'antenne-cluster-step-all-1',
        url: 'assets/icons/cluster_all_step_1.png',
      },
      {
        id: 'antenne-cluster-step-all-2',
        url: 'assets/icons/cluster_all_step_2.png',
      },
      {
        id: 'antenne-cluster-step-all-3',
        url: 'assets/icons/cluster_all_step_3.png',
      },
      {
        id: 'antenne-cluster-step-all-4',
        url: 'assets/icons/cluster_all_step_4.png',
      },
      {
        id: 'antenne-cluster-step-all-5',
        url: 'assets/icons/cluster_all_step_5.png',
      },
      {
        id: 'antenne-cluster-step-all-6',
        url: 'assets/icons/cluster_all_step_6.png',
      },
      {
        id: 'antenne-en-service-light',
        url: 'assets/icons/antenne_en_service_light.png',
      },
      {
        id: 'check',
        url: 'assets/icons/check.png',
      },
      {
        id: 'arrow',
        url: 'assets/icons/arrow.png',
      },
      {
        id: 'site',
        url: 'assets/icons/site.png',
      },
      {
        id: 'beam',
        url: 'assets/icons/beam.png',
      },
      {
        id: 'antenne-en-maintenance-light',
        url: 'assets/icons/antenne_en_maintenance_light.png',
      },
      {
        id: 'poi-arrete',
        url: 'assets/icons/poi-arrete.png',
      },
      {
        id: 'poi-arrete-icon',
        url: 'assets/icons/poi-arrete-icon.png',
      },
      {
        id: 'poi-selected',
        url: 'assets/icons/poi_selected.png',
      },
      {
        id: 'measure-a',
        url: 'assets/icons/measure-a.png',
      },
      {
        id: 'measure-b',
        url: 'assets/icons/measure-b.png',
      },
      {
        id: 'site-in-zone',
        url: 'assets/icons/InZone.png',
      },
      {
        id: 'site-in-zone-load',
        url: 'assets/icons/InZoneLoad.png',
      },
      {
        id: 'a_venir-cluster-step-all-1',
        url: 'assets/icons/a_venir/cluster_all_step_1.png',
      },
      {
        id: 'a_venir-cluster-step-all-2',
        url: 'assets/icons/a_venir/cluster_all_step_2.png',
      },
      {
        id: 'a_venir-cluster-step-all-3',
        url: 'assets/icons/a_venir/cluster_all_step_3.png',
      },
      {
        id: 'a_venir-cluster-step-all-4',
        url: 'assets/icons/a_venir/cluster_all_step_4.png',
      },
      {
        id: 'a_venir-cluster-step-all-5',
        url: 'assets/icons/a_venir/cluster_all_step_5.png',
      },
      {
        id: 'a_venir-cluster-step-all-6',
        url: 'assets/icons/a_venir/cluster_all_step_6.png',
      },
      {
        id: 'a_venir-cluster-step-1',
        url: 'assets/icons/a_venir/cluster_step_1.png',
      },
      {
        id: 'a_venir-cluster-step-2',
        url: 'assets/icons/a_venir/cluster_step_2.png',
      },
      {
        id: 'a_venir-cluster-step-3',
        url: 'assets/icons/a_venir/cluster_step_3.png',
      },
      {
        id: 'a_venir-cluster-step-4',
        url: 'assets/icons/a_venir/cluster_step_4.png',
      },
      {
        id: 'a_venir-cluster-step-5',
        url: 'assets/icons/a_venir/cluster_step_5.png',
      },
      {
        id: 'a_venir-cluster-step-6',
        url: 'assets/icons/a_venir/cluster_step_6.png',
      },
      {
        id: 'antenne-a_venir',
        url: 'assets/icons/a_venir/antenne_a_venir.png',
      },
      {
        id: 'antenne-a_venir-light',
        url: 'assets/icons/a_venir/antenne_a_venir-light.png',
      },
    ];

    const aImagesAntennesMaintenance = [];

    for (let i = 1; i < 7; i++) {
      aImagesAntennesMaintenance.push({
        id: `antenne-maintenance-dark-${i}`,
        url: `assets/icons/antenne_maintenance_dark_char_${i}.png`,
      });

      aImagesAntennesMaintenance.push({
        id: `antenne-maintenance-light-${i}`,
        url: `assets/icons/antenne_maintenance_light_char_${i}.png`,
      });
    }

    aImages = [...aImages, ...aImagesAntennesMaintenance];

    for (const oImg of aImages) {
      mapObj.loadImage(oImg.url, function (err: any, image: any) {
        const imgId = oImg.id;
        if (!mapObj.getImage(imgId)) {
          mapObj.addImage(imgId, image);
        }
      });
    }
  };

  const drawMapListener = (filter: any) => {
    drawMap(filter, map, translations);
  };

  return (
    <div
      className={isMobile() ? 'fixed top-0 w-full h-[calc(100vh-70px)]' : ''}
    >
      <div
        ref={mapContainer}
        className={
          isMobile()
            ? 'map relative w-full h-[calc(100vh)]'
            : 'map relative w-full h-[calc(100vh)]'
        }
      />
      {[
        'couverture-theorique',
        'qualite-reseau',
        'antennes-deploiements',
        'zones-a-couvrir',
        'territory',
        'home',
        'signalements',
      ].includes(currentPage) && <Legend />}
      <MapTools />
      <MapLoading />
      {map && (
        <>
          <MapGlobalFilter drawMap={drawMapListener} />
          <BasemapControl oMap={map} />
          <ToolInfoPoint oMap={map} />
        </>
      )}
      {/* <MapSuperposer /> */}
      <Credit />
    </div>
  );
});
