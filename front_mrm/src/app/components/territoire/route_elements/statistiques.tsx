import React, { useState, useEffect } from 'react';

import MoonLoader from 'react-spinners/MoonLoader';

import Title from '@/app/components/title';
import Progressbar from '@/app/components/progressbar';
import DropDownBlock from '@/app/components/dropDownBlock';
import GeometricShape from '@/app/components/geometricShape';

import { useOperatorsRouteStore } from '@/store/route';
import { useServiceRouteStore } from '@/store/route';
import { useCoordStore } from '@/store/selectedCoordStore';
import { getStatTerritoireTrain } from '@/service/territoire_train';
import { getDatasource } from '../train_elements/statistiques';
import { useOperatorsStore } from '@/store/operators';
import { useTranslations } from 'next-intl';

export default function StatistiquesRoute() {
  const { serviceRoute } = useServiceRouteStore();
  const { operators } = useOperatorsRouteStore();
  const { selectedTerritoire } = useCoordStore();
  const { date, operators: currentOps } = useOperatorsStore();

  const [loading, setLoading] = useState(false);
  const [dataStat, setDataStat] = useState<any>();
  const [lastColors, setLastColors] = useState([
    '#232351',
    '#CDCCFD',
    '#F1EDE6',
  ]);

  const testTranslation = useTranslations('test');
  useEffect(() => {
    if (!dataStat) return;

    const last_op = dataStat.slice(-1)[0];

    const matchingOp = currentOps.find(
      (dt: any) => last_op.nom_affichage === dt.nomAffichage
    );

    let couleurNiveaux;
    if (!matchingOp) {
      couleurNiveaux = last_op.couleur_niveaux;
    } else {
      couleurNiveaux = [
        matchingOp?.couleurNiveau3,
        matchingOp?.couleurNiveau2,
        '#F1EDE6',
      ];
    }

    setLastColors(couleurNiveaux);
  }, [dataStat]);

  const listLegends = [
    {
      label: testTranslation('success'),
      color: lastColors[0],
      description:
        serviceRoute === 'internet'
          ? testTranslation('success-web-description')
          : testTranslation('success-voix-description'),
    },
    {
      label: testTranslation('partialSuccess'),
      color: lastColors[1],
      description:
        serviceRoute === 'internet'
          ? testTranslation('partialsuccess-web-description')
          : testTranslation('partialsuccess-voix-description'),
    },
    {
      label: testTranslation('fails'),
      color: lastColors[2],
      description:
        serviceRoute === 'internet'
          ? testTranslation('fail-web-description')
          : testTranslation('fail-voix-description'),
    },
  ];
  const titleStat =
    serviceRoute === 'internet'
      ? testTranslation('stat-web-title')
      : testTranslation('stat-voix-title');

  const subTitleStat =
    serviceRoute === 'internet'
      ? testTranslation('stat-web-subtitle')
      : testTranslation('stat-voix-subtitle');
  const formatParamsArray = (aData: any[]) => {
    return aData.map((dt) => dt.toString()).join(',');
  };

  const date_qos = date.find((date: any) => date.page === 'qualite-reseau');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const properties = selectedTerritoire?.properties;
      const dataStatsTrainParams = await getStatTerritoireTrain({
        operators: formatParamsArray(operators),
        level: selectedTerritoire?.level,
        type: properties?.axis,
        nom: properties?.nom,
        entite: 'route',
        protocole: serviceRoute == 'internet' ? 'WEB' : 'VOIX',
        datasource: getDatasource(),
      });
      setDataStat(dataStatsTrainParams.stats);
      setLoading(false);
    };

    fetchData();
  }, [operators, serviceRoute, selectedTerritoire]);

  return (
    <div className='flex flex-col gap-5 w-full'>
      <div className='flex flex-col gap-1'>
        <Title
          text={titleStat}
          className='text-md text-black'
          underline={false}
        />
        <Title
          text={selectedTerritoire?.properties?.title}
          underline={false}
          className='text-sm text-[#0891B2]'
        />
      </div>

      <span className='text-xs font-medium text-gray-500'>{subTitleStat}</span>

      {loading ? (
        <div className='flex items-center justify-center'>
          <MoonLoader color='#232253' loading={loading} size={150} />
        </div>
      ) : (
        <>
          {dataStat ? (
            <>
              <div>
                {dataStat.map((stat: any, index: any) => {
                  const matchingOp = currentOps.find(
                    (dt: any) => stat.nom_affichage === dt.nomAffichage
                  );

                  let couleurNiveaux;
                  if (!matchingOp) {
                    couleurNiveaux = stat.couleurNiveaux;
                  } else {
                    couleurNiveaux = [
                      matchingOp?.couleurNiveau3,
                      matchingOp?.couleurNiveau2,
                      '#F1EDE6',
                    ];
                  }

                  return (
                    <Progressbar
                      key={index}
                      title={stat.nom_affichage}
                      color={couleurNiveaux}
                      values={stat.valeur_stats}
                      iswithicon={false}
                    ></Progressbar>
                  );
                })}
              </div>
              <DropDownBlock
                header={
                  <div className='flex flex-row gap-5'>
                    {listLegends.map((legend) => (
                      <GeometricShape
                        key={legend.label}
                        color={{
                          color: legend.color,
                          isHexaDecimal: true,
                        }}
                        type='rectangle'
                      >
                        <span className='text-[11px] font-semibold text-info'>
                          {legend.label}
                        </span>
                      </GeometricShape>
                    ))}
                  </div>
                }
                headerClassname='pb-2'
              >
                <div className='flex flex-col gap-3 text-gray-500'>
                  {listLegends.map((item: any, index: any) => (
                    <div key={index} className='flex flex-col'>
                      <p className='text-xs font-bold text-black'>
                        {item.label} :{' '}
                        <span className='text-xs font-medium text-gray-500'>
                          {item.description}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </DropDownBlock>
            </>
          ) : (
            <div className='flex items-center justify-center'>
              Aucune donnée
            </div>
          )}

          <span className='text-xs font-medium text-gray-500'>
            {`${testTranslation('test-date')} : ${
              date_qos.date_build_start
            } ${testTranslation('test-date-to')} ${date_qos.date_build_end}`}
          </span>
        </>
      )}
    </div>
  );
}
