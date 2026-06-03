import React, { useState, useEffect } from 'react';

import { twMerge } from 'tailwind-merge';

import { useTranslations } from 'next-intl';

import MoonLoader from 'react-spinners/MoonLoader';

import Icon from '@/app/components/iconcmp';
import ActiveRadio from '@/app/components/activeRadio';
import Progressbar from '@/app/components/progressbar';
import DropDownBlock from '@/app/components/dropDownBlock';
import GeometricShape from '@/app/components/geometricShape';
import NetworkLevelGrid from '@/app/components/netWorkLevelGrid';

import Quit from '@/assets/icons/quit.svg';
import IconProgress from '@/assets/icons/bgpb.svg';
import Region from '@/assets/icons/departement.svg';
import ContactGroup from '@/assets/icons/contact_group.svg';
import MultiSquares from '@/assets/icons/multi_squares.png';

import { getStatsNbope } from '@/service/statsNbope';
import { getStatCouverture } from '@/service/territory';
import { getStatsCouvOperateur } from '@/service/statsCouvOperateur';

import { useCoordStore } from '@/store/selectedCoordStore';
import { getOperators, useOperatorsStore } from '@/store/operators';
import { useOperatorAndAllStore, useTechnologiesStore } from '@/store/store';
import { useServiceStore } from '@/store/store';

import { getCurrentInsee } from '@/utils/currentInsee';
import { getTitleTerritoire } from '@/utils/titleTerritoire';
import {
  getLabelEntite,
  isTrain,
  isRoute,
  isAdresse,
  isTransport,
} from '@/utils/activeEntite';

import Title from './title';
import Info from './info';
import { isTerritoryLoadedByUrl } from '@/utils/utils';

interface ModalProps {
  show?: boolean;
  type?: 'modal' | 'normal';
  region?: string;
  className?: string;
  onClose?: () => void;
}

export default function ModalStat({
  show = false,
  type = 'normal',
  region,
  className,
  onClose,
}: ModalProps) {
  const { service } = useServiceStore();
  const { date, operators: currentOps } = useOperatorsStore();
  const { operatorsAndAll } = useOperatorAndAllStore();
  const { technologies } = useTechnologiesStore();
  const { selectedTerritoire } = useCoordStore();
  const [loading, setLoading] = useState(false);
  const antenneTranslations = useTranslations('antenne');
  const [loadingStatOperateur, setLoadingStatOperateur] = useState(false);
  const [selectedValue, setSelectedValue] = useState('population');
  const [dataStats, setDataStats] = useState<any | undefined>();
  const [dataStatsOperateur, setDataStatsOperateur] = useState<
    any | undefined
  >();
  const [dataStatsState, setDataStatsState] = useState(false);
  const [lastColors, setLastColors] = useState([
    '#B54241',
    '#E47170',
    '#FFABAA',
    '#F1EDE6',
  ]);

  const operators = getOperators();
  const nb_op = operators.length;

  const fullcolornbope = [
    '#3E3D7F',
    '#5E5DA0',
    '#7170B2',
    '#8A88C9',
    '#A7A6E0',
    '#F1EDE6',
  ];

  const fullInfoLegendNbope = [
    {
      label: '5 opérateurs',
      color: '#3E3D7F',
    },
    {
      label: '4 opérateurs',
      color: '#5E5DA0',
    },
    {
      label: '3 opérateurs',
      color: '#7170B2',
    },
    {
      label: '2 opérateurs',
      color: '#8A88C9',
    },
    {
      label: '1 opérateur',
      color: '#A7A6E0',
    },
    {
      label: '0 opérateur',
      color: '#F1EDE6',
    },
  ];

  const infoLegendNbope = fullInfoLegendNbope
    .slice(fullInfoLegendNbope.length - nb_op - 1)
    .map((item, index) => ({
      ...item,
      label: `${nb_op - index} opérateurs`,
    }));

  const colornbope = fullcolornbope.slice(fullcolornbope.length - nb_op - 1);

  const classNameEnteteLegende = 'text-xs font-medium text-gray-500';
  const classNameContentTitleLegende = 'text-xs font-bold text-black';
  const classNameContentDescriptionLegende = `${classNameEnteteLegende}`;

  const couvertureTranslation = useTranslations('couverture');

  const formatParamsArray = (aData: any[]) => {
    return aData.map((dt) => dt.toString()).join(',');
  };

  const onClick = (value: any) => {
    setSelectedValue(value);
  };

  const getIdOps = () => {
    const ids: any = [];

    operators.forEach((op: any) => {
      ids.push(op.identifiant);
    });

    const formatted_ids = formatParamsArray(ids);

    return formatted_ids;
  };

  const current_insee = getCurrentInsee();

  useEffect(() => {
    if (!isTerritoryLoadedByUrl()) {
      return;
    }

    const fetchData = async () => {
      setLoadingStatOperateur(true);
      try {
        const list_id_operators = getIdOps();
        const dataStatsOperateurParams = await getStatsCouvOperateur(
          current_insee,
          selectedValue,
          list_id_operators,
          technologies[0],
          getLabelEntite()
        );
        setDataStatsOperateur(dataStatsOperateurParams.stats_operateur);
        setDataStatsState(dataStatsOperateurParams.success);
      } catch (e) {
        console.log('Error get stats operateurs : ', e);
      }
      setLoadingStatOperateur(false);
    };

    if (!isAdresse()) fetchData();
  }, [selectedValue, technologies, current_insee]);

  useEffect(() => {
    if (!isTerritoryLoadedByUrl()) {
      return;
    }

    const fetchData = async () => {
      setLoadingStatOperateur(true);
      try {
        const list_id_operators = getIdOps();
        const dataStatsOperateurParams = await getStatCouverture({
          id: getCurrentInsee(),
          operators: list_id_operators,
          service: service,
          entite: getLabelEntite(),
          x: selectedTerritoire.coordinates.xmin,
          y: selectedTerritoire.coordinates.ymin,
        });

        setDataStatsOperateur(dataStatsOperateurParams);
      } catch (e) {
        console.log('Error get stats operateurs : ', e);
      }
      setLoadingStatOperateur(false);
    };

    if (isAdresse()) fetchData();
  }, [current_insee, service]);

  useEffect(() => {
    if (!isTerritoryLoadedByUrl()) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const dataStatsNbope = await getStatsNbope(
          current_insee,
          selectedValue,
          technologies[0],
          nb_op,
          getLabelEntite()
        );
        setDataStats(dataStatsNbope);
      } catch (e) {
        console.log('Error get stats nbope : ', e);
      }
      setLoading(false);
    };

    fetchData();
  }, [selectedValue, technologies, current_insee, nb_op]);

  useEffect(() => {
    if (!dataStatsOperateur || isAdresse()) return;

    const last_op = dataStatsOperateur.slice(-1)[0];

    const matchingOp = currentOps.find(
      (dt: any) => last_op.nom_affichage === dt.nomAffichage
    );

    let couleurNiveaux = [
      matchingOp?.couleurNiveau3,
      matchingOp?.couleurNiveau2,
      matchingOp?.couleurNiveau1,
      '#F1EDE6',
    ];

    setLastColors(couleurNiveaux);
  }, [dataStatsOperateur]);

  let title = getTitleTerritoire();

  const date_couverture = date.find(
    (date: any) => date.page === 'couverture-theorique'
  );

  return (
    <>
      {type === 'modal' ? (
        show && (
          <div className={twMerge('fixed z-50', className)}>
            <div className='flex flex-col bg-white overflow-auto relative px-5 pb-8 space-y-8 rounded-lg shadow-[0_0px_10px_0_rgba(0,0,0,0.3)] max-h-[600px] max-w-[375px]'>
              <div className='absolute top-0.5 left-0 right-0 flex justify-center'>
                <Icon icon={MultiSquares} width={40} />
              </div>
              <div
                className='absolute top-[-15px] right-4 cursor-pointer'
                onClick={onClose}
              >
                <Icon icon={<Quit />} />
              </div>
              <div className='flex flex-col'>
                <span className='font-bold'>Statistiques de couverture</span>
                <span className='text-sky-600 font-medium'>{region}</span>
              </div>
              <div className='flex justify-center items-center space-x-2'>
                <ActiveRadio
                  classname='w-[160px]'
                  icon={<ContactGroup />}
                  text={couvertureTranslation('populationCovered')}
                  active={selectedValue === 'population'}
                  onClick={() => onClick('population')}
                />
                <ActiveRadio
                  classname='w-[160px]'
                  icon={<Region />}
                  text={couvertureTranslation('surfaceCovered')}
                  active={selectedValue === 'surface'}
                  onClick={() => onClick('surface')}
                />
              </div>
              <div className='flex flex-col space-y-2.5'>
                {selectedValue === 'population' ? (
                  <>
                    <span className='font-bold'>
                      {couvertureTranslation('populationCoveredByOperator')}
                    </span>
                    <Title
                      text={`${antenneTranslations('in')} ${title}`}
                      underline={false}
                      className='text-sm text-[#084E8E]'
                    />
                    <div className='flex flex-col space-y-1'>
                      {operators.map((operator) => {
                        return (
                          <Progressbar
                            key={operator.name}
                            title={operator.nomAffichage}
                            color={operator.progressbar.colors}
                            values={operator.progressbar.values}
                          ></Progressbar>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <span className='font-bold'>
                      {couvertureTranslation('surfaceCoveredByOperator')}
                    </span>
                    <div className='flex flex-col space-y-1'>
                      {operators.map((operator) => {
                        return (
                          <Progressbar
                            key={operator.name}
                            title={operator.nomAffichage}
                            color={operator.progressbar.colors}
                            values={operator.progressbar.values}
                          ></Progressbar>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        <div className={twMerge('flex flex-col space-y-7', className)}>
          {!isAdresse() && (
            <div className='flex justify-center items-center space-x-2'>
              <ActiveRadio
                classname='w-[160px]'
                icon={<ContactGroup />}
                text={couvertureTranslation('populationCovered')}
                active={selectedValue === 'population'}
                onClick={() => onClick('population')}
                dataTest='coverage-population-button'
              />
              <ActiveRadio
                classname='w-[160px]'
                icon={<Region />}
                text={couvertureTranslation('surfaceCovered')}
                active={selectedValue === 'surface'}
                onClick={() => onClick('surface')}
                dataTest='coverage-surface-button'
              />
            </div>
          )}
          <div className='flex justify-center items-center flex-col'>
            <div className='flex flex-col gap-5 mb-4 w-full'>
              <div className='flex flex-col gap-1 w-full'>
                <span className='font-bold'>
                  {!isAdresse()
                    ? selectedValue === 'population'
                      ? couvertureTranslation('populationCoveredByOperator')
                      : couvertureTranslation('surfaceCoveredByOperator')
                    : couvertureTranslation('pointCoveredByTechnoAndOp')}
                </span>
                <Title
                  text={title}
                  underline={false}
                  className='text-sm text-color-secondary'
                />
              </div>
              {isTransport() ? (
                <Info className='rounded-2xl w-full'>
                  <div className='flex flex-col gap-1.5'>
                    <span className='text-xs leading-4'>
                      {antenneTranslations('notAvailableTransport')}
                    </span>
                  </div>
                </Info>
              ) : (
                <>
                  {!loadingStatOperateur ? (
                    !isAdresse() ? (
                      <>
                        <div className='space-y-0'>
                          {dataStatsOperateur &&
                            dataStatsOperateur.map(
                              (stat: any, index: number) => {
                                const matchingOp = currentOps.find(
                                  (dt: any) =>
                                    stat.nom_affichage === dt.nomAffichage
                                );
                                const couleurNiveaux = [
                                  matchingOp?.couleurNiveau3,
                                  matchingOp?.couleurNiveau2,
                                  matchingOp?.couleurNiveau1,
                                  '#F1EDE6',
                                ];
                                const valuesLabel = ['TBC', 'BC', 'CL', 'NC'];

                                return (
                                  <Progressbar
                                    key={index}
                                    dataTestCouverture={`coverage-operator-${
                                      index + 1
                                    }-pourcentage-container`}
                                    title={stat.nom_affichage}
                                    color={couleurNiveaux}
                                    values={stat.valeur_stats}
                                    valuesLabel={valuesLabel}
                                    dataTestName={`coverage-operator-${
                                      index + 1
                                    }-pourcentage-`}
                                    activeicon={
                                      selectedValue === 'population' ? (
                                        <IconProgress />
                                      ) : (
                                        <Region />
                                      )
                                    }
                                  ></Progressbar>
                                );
                              }
                            )}
                          {dataStatsOperateur && dataStatsState && (
                            <DropDownBlock
                              header={
                                <div className='flex flex-col gap-2'>
                                  <div className='flex flex-row gap-4'>
                                    <GeometricShape
                                      color={{
                                        color: lastColors[0],
                                        isHexaDecimal: true,
                                      }}
                                      type='rectangle'
                                    >
                                      <span className={classNameEnteteLegende}>
                                        {couvertureTranslation(
                                          'veryGoodCoverage'
                                        )}
                                      </span>
                                    </GeometricShape>
                                    <GeometricShape
                                      color={{
                                        color: lastColors[1],
                                        isHexaDecimal: true,
                                      }}
                                      type='rectangle'
                                    >
                                      <span className={classNameEnteteLegende}>
                                        {couvertureTranslation('goodCoverage')}
                                      </span>
                                    </GeometricShape>
                                  </div>
                                  <div className='flex flex-row gap-4'>
                                    <GeometricShape
                                      color={{
                                        color: lastColors[2],
                                        isHexaDecimal: true,
                                      }}
                                      type='rectangle'
                                    >
                                      <span className={classNameEnteteLegende}>
                                        {couvertureTranslation(
                                          'limitedCoverage'
                                        )}
                                      </span>
                                    </GeometricShape>
                                    <GeometricShape
                                      color={{
                                        color: lastColors[3],
                                        isHexaDecimal: true,
                                      }}
                                      type='rectangle'
                                    >
                                      <span className={classNameEnteteLegende}>
                                        {couvertureTranslation('notCoverage')}
                                      </span>
                                    </GeometricShape>
                                  </div>
                                </div>
                              }
                              headerClassname='pb-2 pt-5'
                            >
                              <div className='flex flex-col pt-2 gap-4 text-gray-500'>
                                <div className='flex flex-col'>
                                  <p className={classNameContentTitleLegende}>
                                    {couvertureTranslation('veryGoodCoverage')}
                                    <span
                                      className={
                                        classNameContentDescriptionLegende
                                      }
                                    >
                                      {' '}
                                      {couvertureTranslation(
                                        'veryGoodCoverageDescription'
                                      )}
                                    </span>
                                  </p>
                                </div>
                                <div className='flex flex-col'>
                                  <p className={classNameContentTitleLegende}>
                                    {couvertureTranslation('goodCoverage')}
                                    <span
                                      className={
                                        classNameContentDescriptionLegende
                                      }
                                    >
                                      {' '}
                                      {couvertureTranslation(
                                        'goodCoverageDescription'
                                      )}
                                    </span>
                                  </p>
                                </div>
                                <div className='flex flex-col'>
                                  <p className={classNameContentTitleLegende}>
                                    {couvertureTranslation('limitedCoverage')}
                                    <span
                                      className={
                                        classNameContentDescriptionLegende
                                      }
                                    >
                                      {' '}
                                      {couvertureTranslation(
                                        'limitedCoverageDescription'
                                      )}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </DropDownBlock>
                          )}
                        </div>
                        <span className={classNameContentDescriptionLegende}>
                          Données Arcep du {date_couverture.date_build_start}
                        </span>
                      </>
                    ) : (
                      <NetworkLevelGrid
                        type='triangle'
                        data={dataStatsOperateur}
                      />
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
                </>
              )}
            </div>

            {/* progressbar par operateur */}
            {!isTransport() && !isAdresse() && (
              <div className='flex flex-col gap-5 mb-4 w-full'>
                <div className='flex flex-col gap-1 w-full'>
                  <span className='font-bold'>
                    {selectedValue === 'population'
                      ? couvertureTranslation('populationByNumberOperator')
                      : couvertureTranslation('surfaceByNumberOperator')}
                  </span>
                  <Title
                    text={title}
                    underline={false}
                    className='text-sm text-color-secondary'
                  />
                </div>
                <div className='flex flex-col gap-0'>
                  {!loading ? (
                    <>
                      {dataStats &&
                        dataStats.stats_nbope.map(
                          (stat: any, index: number) => {
                            if (stat.niveau === 'Très bonne couverture') {
                              return (
                                <Progressbar
                                  key={index}
                                  dataTestCouverture='coverage-all-operators-TBC'
                                  title={`${stat.niveau}`}
                                  color={colornbope}
                                  values={stat.pourcentage}
                                  activeicon={
                                    selectedValue === 'population' ? (
                                      <IconProgress />
                                    ) : (
                                      <Region />
                                    )
                                  }
                                ></Progressbar>
                              );
                            }
                          }
                        )}
                    </>
                  ) : (
                    <div className='flex items-center justify-center'>
                      <MoonLoader
                        color='#232253'
                        loading={loading}
                        size={150}
                      />
                    </div>
                  )}
                </div>

                <div className='flex flex-col gap-2'>
                  <div className='flex flex-row gap-4'>
                    {infoLegendNbope.slice(0, 3).map((item, index) => {
                      return (
                        <GeometricShape
                          key={index}
                          color={{
                            color: item.color,
                            isHexaDecimal: true,
                          }}
                          type='rectangle'
                        >
                          <span className={classNameEnteteLegende}>
                            {item.label}
                          </span>
                        </GeometricShape>
                      );
                    })}
                  </div>
                  <div className='flex flex-row gap-4'>
                    {infoLegendNbope.slice(3).map((item, index) => {
                      return (
                        <GeometricShape
                          key={index}
                          color={{
                            color: item.color,
                            isHexaDecimal: true,
                          }}
                          type='rectangle'
                        >
                          <span className={classNameEnteteLegende}>
                            {item.label}
                          </span>
                        </GeometricShape>
                      );
                    })}
                  </div>
                </div>
                <span className={classNameContentDescriptionLegende}>
                  Données Arcep du {date_couverture.date_build_start}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
