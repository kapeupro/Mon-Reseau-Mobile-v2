import React, { useEffect, useState } from 'react';

import MoonLoader from 'react-spinners/MoonLoader';

import Title from '@/app/components/title';
import Progressbar from '@/app/components/progressbar';
import GeometricShape from '@/app/components/geometricShape';

import { getStatsZacOperateur } from '@/service/zac';

import { useOperatorsZoneStore } from '@/store/zone';
import { getOperators, useOperatorsStore } from '@/store/operators';

import { getTitleTerritoire } from '@/utils/titleTerritoire';
import { useTranslations } from 'next-intl';

export default function StatistiquesZone() {
  const { operators: operatorsZone } = useOperatorsZoneStore();
  const { date, operators: currentOps } = useOperatorsStore();
  const operators = getOperators(true, true);
  const zoneTranslation = useTranslations('zone');

  const [loadingStatOperateur, setLoadingStatOperateur] = useState(false);
  const [dataStatsOperateur, setDataStatsOperateur] = useState<any>();
  const [lastColors, setLastColors] = useState([
    '#880100',
    '#B54241',
    '#E47170',
    '#FFABAA',
  ]);

  const date_zone = date.find((date: any) => date.page === 'zones-a-couvrir');
  // let title = getTitleTerritoire()
  let title = 'Métropole';

  const formatParamsArray = (aData: any[]) => {
    return aData.map((dt) => dt.toString()).join(',');
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingStatOperateur(true);
      const formatted_operators = formatParamsArray(operatorsZone);
      const dataStatsOperateurParams =
        await getStatsZacOperateur(formatted_operators);
      setDataStatsOperateur(dataStatsOperateurParams.stats_operateur);
      setLoadingStatOperateur(false);
    };

    fetchData();
  }, [operatorsZone]);

  useEffect(() => {
    if (!dataStatsOperateur) return;

    const last_op = dataStatsOperateur.slice(-1)[0];

    const matchingOp = currentOps.find(
      (dt: any) => last_op.nom_affichage === dt.nomAffichage
    );

    const couleurNiveaux = [
      matchingOp?.couleurNiveau4,
      matchingOp?.couleurNiveau3,
      matchingOp?.couleurNiveau2,
      matchingOp?.couleurNiveau1,
    ];

    setLastColors(couleurNiveaux);
  }, [dataStatsOperateur]);

  const listLegends = [
    {
      label: zoneTranslation('zac-en-service'),
      color: lastColors[0],
    },
    {
      label: zoneTranslation('zac-ask-six-month'),
      color: lastColors[1],
    },
    {
      label: zoneTranslation('zac-ask-six-tw-month'),
      color: lastColors[2],
    },
    {
      label: zoneTranslation('zac-wating-deployement'),
      color: lastColors[3],
    },
  ];

  return (
    <>
      <Title
        text={title}
        underline={false}
        className='text-sm text-[#0891B2] my-2'
      />
      <div className='flex flex-col mb-6'>
        {!loadingStatOperateur ? (
          dataStatsOperateur ? (
            dataStatsOperateur.map((stat: any, index: number) => {
              const matchingOp = currentOps.find(
                (dt: any) => stat.nom_affichage === dt.nomAffichage
              );
              const couleurNiveaux = [
                matchingOp?.couleurNiveau4,
                matchingOp?.couleurNiveau3,
                matchingOp?.couleurNiveau2,
                matchingOp?.couleurNiveau1,
              ];
              return (
                <Progressbar
                  key={index}
                  title={stat.nom_affichage}
                  color={couleurNiveaux}
                  values={stat.valeur_stats}
                  ispercent={false}
                  iswithicon={false}
                  iswithtotal
                ></Progressbar>
              );
            })
          ) : (
            operators.map((operator) => {
              return (
                <Progressbar
                  key={operator.name}
                  title={operator.nomAffichage}
                  color={operator.progressbar.colors}
                  values={0}
                  ispercent={false}
                  iswithicon={false}
                  iswithtotal
                ></Progressbar>
              );
            })
          )
        ) : (
          <div className='flex items-center justify-center'>
            <MoonLoader
              color='#232253'
              loading={loadingStatOperateur}
              size={150}
            />
          </div>
        )}
      </div>
      {!loadingStatOperateur && (
        <div className='flex flex-col mb-4 gap-2'>
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
      )}

      <p className='text-[11px] font-semibold text-info mb-6'>
        {zoneTranslation('zac-data-arcep')}{' '}
        <span className='underline'>
          {zoneTranslation('zac-du-article')} {date_zone.date_build_start}
        </span>
      </p>
    </>
  );
}
