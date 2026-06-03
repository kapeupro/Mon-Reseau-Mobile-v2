import React, { useState, useEffect } from 'react';

import { useMapTerritoryStore } from '@/store/map';
import { useCoordStore } from '@/store/selectedCoordStore';
import { getListTrainByAxis } from '@/service/territoire_train';
import {
  castToComboOptionTerritory,
  isLevelOne,
  onSelectSearchResult,
} from '../train_elements/utils';

export default function Routes() {
  const { territory: searchterritory } = useMapTerritoryStore();
  const { selectedTerritoire } = useCoordStore();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const comboOptionTerritory = castToComboOptionTerritory(selectedTerritoire);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let response: any[] = [];

      if (data.length) {
        if (isLevelOne()) {
          const aAllOption = data.filter((dt) => dt.id == 'all');
          if (!aAllOption.length) {
            response = [comboOptionTerritory, ...data];
            setData(response || []);
          }
        }
      } else {
        response = await getListTrainByAxis({
          axis: 'routes',
        });

        if (isLevelOne()) {
          response = [comboOptionTerritory, ...response];
        }

        setData(response || []);
      }
      setLoading(false);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchterritory]);

  const getDataByLevel = async (axis_name: string) => {
    const aOptions = data.filter((dt) => dt.label === axis_name);
    if (!aOptions.length) {
      return;
    }

    const oOption = aOptions[0];

    setLoading(true);
    const response = await getListTrainByAxis({
      level: oOption.level,
      axis: 'routes',
      axis_name: oOption.label,
    });

    if (response) {
      onSelectSearchResult(response);
    }

    setLoading(false);
  };

  return (
    <div className='flex flex-col justify-center items-center w-full gap-4'>
      <select
        onChange={(event: any) => {
          getDataByLevel(event.target.value);
        }}
        value={selectedTerritoire.properties?.nom ?? ''}
        className='px-3 rounded-xl border-gray-400 border w-full h-[45px] focus:outline-none pr-8'
      >
        {loading ? (
          <option value=''>En chargement ...</option>
        ) : (
          data.map((item: any, index: any) => {
            return (
              <option key={index} value={item.label}>
                {item.label}
              </option>
            );
          })
        )}
      </select>
    </div>
  );
}
