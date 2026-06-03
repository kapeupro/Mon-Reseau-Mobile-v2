import React, { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import MoonLoader from 'react-spinners/MoonLoader';

import Title from '@/app/components/title';
import Info from '@/app/components/info';
import Progressbar from '@/app/components/progressbar';
import GeometricShape from '@/app/components/geometricShape';

import { getOperators, useOperatorsStore } from '@/store/operators';
import { useOperatorAndAllStore } from '@/store/store';

import { getStatsAntenneOperateur } from '@/service/antennes';
import { getNbSite } from '@/service/antennes';

import { formatThousandSeparator } from '@/utils/utils';
import { getLabelEntite } from '@/utils/activeEntite';
import { getCurrentInsee } from '@/utils/currentInsee';
import { getTitleTerritoire } from '@/utils/titleTerritoire';
import { isTrain, isRoute } from '@/utils/activeEntite';

export default function Statistiques() {
  const antenneTranslations = useTranslations('antenne');

  const operators = getOperators(true);

  const { operatorsAndAll } = useOperatorAndAllStore();
  const { date, operators: currentOps } = useOperatorsStore();

  const [nbSite, setNbSite] = useState(0);
  const [dataStatsOperateur, setDataStatsOperateur] = useState<any>();
  const [loadingStatOperateur, setLoadingStatOperateur] = useState(false);
  const [lastColors, setLastColors] = useState([
    '#FFABAA',
    '#E47170',
    '#B54241',
  ]);

  useEffect(() => {
    if (!dataStatsOperateur) return;

    const last_op = dataStatsOperateur.slice(-1)[0];

    const matchingOp = currentOps.find(
      (dt: any) => last_op.nom_affichage === dt.nomAffichage
    );

    const couleurNiveaux = [
      matchingOp?.couleurNiveau1,
      matchingOp?.couleurNiveau2,
      matchingOp?.couleurNiveau3,
    ];

    setLastColors(couleurNiveaux);
  }, [dataStatsOperateur]);

  const listLegends = [
    {
      label: '4G-3G-2G',
      color: lastColors[0],
    },
    {
      label: '5GOtherBands',
      color: lastColors[1],
    },
    {
      label: '5G-3,5GHz',
      color: lastColors[2],
    },
  ];

  const formatParamsArray = (aData: any[]) => {
    return aData.map((dt) => dt.toString()).join(',');
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingStatOperateur(true);
      const formatted_operators = formatParamsArray(operatorsAndAll);
      const dataStatsOperateurParams = await getStatsAntenneOperateur(
        getCurrentInsee(),
        formatted_operators,
        getLabelEntite()
      );
      setDataStatsOperateur(dataStatsOperateurParams.stats_operateur);
      setLoadingStatOperateur(false);
    };

    fetchData();
  }, [operatorsAndAll]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const nb = await getNbSite();
        setNbSite(nb.nbsite);
      } catch (e) {
        console.log('Error get nb stats : ', e);
        setNbSite(0);
      }
    };

    fetchData();
  }, []);

  const date_antenne = date.find(
    (date: any) => date.page === 'antennes-deploiements'
  );

  const infoFrance = antenneTranslations('infoFrance').replace(
    '[nbSites]',
    `${formatThousandSeparator(nbSite)}`
  );

  return (
    <>
      <Title
        text={antenneTranslations('nbrSitebyoprateur')}
        underline={false}
        className='text-base'
      />
      <Title
        text={getTitleTerritoire()}
        underline={false}
        className='text-sm text-[#0891B2]'
      />
      <Info className='rounded-2xl w-full my-6'>
        <div className='flex flex-col gap-1.5'>
          <span className='text-xs leading-4'>{infoFrance}</span>
        </div>
      </Info>

      <>
        <div
          className='flex flex-col mb-6'
          data-test='antennas-container-number'
        >
          {!loadingStatOperateur ? (
            dataStatsOperateur ? (
              dataStatsOperateur.map((stat: any, index: number) => {
                const matchingOp = currentOps.find(
                  (dt: any) => stat.nom_affichage === dt.nomAffichage
                );

                const couleurNiveaux = [
                  matchingOp?.couleurNiveau1,
                  matchingOp?.couleurNiveau2,
                  matchingOp?.couleurNiveau3,
                ];

                const valuesLabel = ['2G3G4G', '5G-other-bands', '5G-3500-MHz'];

                return (
                  <Progressbar
                    key={index}
                    title={stat.nom_affichage}
                    color={couleurNiveaux}
                    values={stat.valeur_stats}
                    valuesLabel={valuesLabel}
                    dataTestName={`antennas-number-operator-${index + 1}-`}
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
          <div className='flex space-x-4 mb-4'>
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
                  {antenneTranslations(legend.label)}
                </span>
              </GeometricShape>
            ))}
          </div>
        )}

        <p className='text-[11px] font-semibold text-info mb-4'>
          {antenneTranslations('legend-stat')}
        </p>

        <p className='text-[11px] font-semibold text-info'>
          {antenneTranslations('legend-datasource')}{' '}
          <span className='underline'>{date_antenne.date_build_start}</span>
        </p>
        <p className='text-[11px] font-semibold text-info mb-6'>
          {antenneTranslations('legend-maj')}{' '}
          <span className='underline'>{date_antenne.date_maj}</span>{' '}
          {antenneTranslations('legend-a-article')}{' '}
          <span className='underline'>{date_antenne.hour_maj}</span>
        </p>
      </>
    </>
  );
}
