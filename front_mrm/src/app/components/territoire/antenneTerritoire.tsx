import React, { useEffect, useState } from 'react';

import MoonLoader from 'react-spinners/MoonLoader';

import Info from '@/app/components/info';
import Title from '@/app/components/title';
import Progressbar from '@/app/components/progressbar';
import GeometricShape from '@/app/components/geometricShape';

import { getOperators, useOperatorsStore } from '@/store/operators';

import { isCommune, isAdresse, getLabelEntite } from '@/utils/activeEntite';
import { formatThousandSeparator } from '@/utils/utils';
import { getTitleTerritoire } from '@/utils/titleTerritoire';
import { getCurrentInsee } from '@/utils/currentInsee';
import ArrowButtonComponent from '@/app/components/arrowButton';

import { useTranslations } from 'next-intl';

import { getStatsAntenneOperateur } from '@/service/antennes';
import { getNbSite } from '@/service/antennes';
import IconMap from '@/assets/icons/iconMap.svg';
import { usePageStore } from '@/store/store';

export default function AntenneTerritoire() {
  const { date, operators: listOperators } = useOperatorsStore();

  const antenneTranslations = useTranslations('antenne');

  const { setPage: handleChangeThematique } = usePageStore();

  const [statAntenneTerritory, setStatAntenneTerritory] = useState<any>();
  const [loadAntenne, setLoadAntenne] = useState(false);
  const [nbSite, setNbSite] = useState(0);
  const [lastColors, setLastColors] = useState([
    '#FFABAA',
    '#E47170',
    '#B54241',
  ]);

  const operators = getOperators(true, true);

  useEffect(() => {
    if (!statAntenneTerritory) return;

    const last_op = statAntenneTerritory.slice(-1)[0];

    const matchingOp = listOperators.find(
      (dt: any) => last_op.nom_affichage === dt.nomAffichage
    );

    const couleurNiveaux = [
      matchingOp?.couleurNiveau1,
      matchingOp?.couleurNiveau2,
      matchingOp?.couleurNiveau3,
    ];

    setLastColors(couleurNiveaux);
  }, [statAntenneTerritory]);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoadAntenne(true);
      const listOperator = [...listOperators].map((op: any) => {
        return op.identifiant;
      });
      const dataStatsOperateurParams = await getStatsAntenneOperateur(
        getCurrentInsee(),
        listOperator.join(','),
        getLabelEntite()
      );
      setStatAntenneTerritory(dataStatsOperateurParams.stats_operateur);
      setLoadAntenne(false);
    };

    fetchData();
  }, [listOperators]);

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

  const infoFrance = antenneTranslations('infoFrance').replace(
    '[nbSites]',
    `${formatThousandSeparator(nbSite)}`
  );

  const date_antenne = date.find(
    (date: any) => date.page === 'antennes-deploiements'
  );

  return (
    <div className='flex flex-col'>
      {loadAntenne ? (
        <div className='flex items-center justify-center'>
          <MoonLoader color='#232253' loading={loadAntenne} size={150} />
        </div>
      ) : (
        <>
          {isCommune() || isAdresse() ? (
            <>
              <ArrowButtonComponent
                text={'Explorer les antennes à proximité'}
                icon={<IconMap />}
                className='mt-3'
                onClick={() => handleChangeThematique('antennes-deploiements')}
              />
            </>
          ) : (
            <>
              <Info className='rounded-2xl w-full mt-4'>
                <div className='flex flex-col gap-1.5'>
                  <span className='text-xs leading-4'>{infoFrance}</span>
                </div>
              </Info>
              <div className='flex flex-col gap-1'>
                <Title
                  text='Nombre total de sites par opérateur et par meilleure technologie disponible'
                  className='text-md text-black mt-0'
                  underline={false}
                />
                <Title
                  text={getTitleTerritoire()}
                  underline={false}
                  className='text-sm text-color-secondary'
                />
              </div>

              <div className='flex flex-col mb-6'>
                {statAntenneTerritory
                  ? statAntenneTerritory.map((stat: any, index: number) => {
                      const matchingOp = listOperators.find(
                        (dt: any) => stat.nom_affichage === dt.nomAffichage
                      );

                      let couleurNiveaux;
                      if (!matchingOp) {
                        couleurNiveaux = stat.couleurNiveaux;
                      } else {
                        couleurNiveaux = [
                          matchingOp?.couleurNiveau1,
                          matchingOp?.couleurNiveau2,
                          matchingOp?.couleurNiveau3,
                        ];
                      }

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
                  : operators.map((operator) => {
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
                    })}
              </div>
              <div className='flex flex-row gap-4'>
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
            </>
          )}
        </>
      )}
      {isCommune() || isAdresse() ? (
        <></>
      ) : (
        <p className='text-[11px] font-semibold text-info mb-4'>
          {antenneTranslations('legend-stat')}
        </p>
      )}
      <p className='text-[11px] font-semibold text-info mt-4 mb-2'>
        {antenneTranslations('legend-datasource')}{' '}
        <span className='underline'>{date_antenne.date_build_start}</span>
      </p>
      <p className='text-[11px] font-semibold text-info mb-2'>
        {antenneTranslations('legend-maj')}{' '}
        <span className='underline'>{date_antenne.date_maj}</span>{' '}
        {antenneTranslations('legend-a-article')}{' '}
        <span className='underline'>{date_antenne.hour_maj}</span>
      </p>
      {/* <p className="text-[11px] font-semibold text-info">
                Données sur les pannes mises a jour le{" "}
                <span className="underline">{date_antenne.date_maj}</span> à{" "}
                <span className="underline">{date_antenne.date_maj}</span>
            </p> */}
    </div>
  );
}
