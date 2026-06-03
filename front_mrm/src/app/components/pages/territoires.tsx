import React, { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import MoonLoader from 'react-spinners/MoonLoader';

import TitlePage from '@/app/components/titlePage';
import DropDownBlock from '@/app/components/dropDownBlock';
import ModalBubbleText from '@/app/components/modalBubbleText';
import Help from '@/app/components/help';
import ArrowButtonComponent from '@/app/components/arrowButton';
import Title from '@/app/components/title';

import Couverture from '@/app/components/territoire/couverture';
import QualityTest from '@/app/components/territoire/qualityTest';
import AntenneTerritoire from '@/app/components/territoire/antenneTerritoire';
import ZoneTerritoire from '@/app/components/territoire/zoneTerritoire';
import SignalementTerritoire from '@/app/components/territoire/signalementTerritoire';
import More from '@/app/components/territoire/more';
import TransportTrain from '@/app/components/territoire/transportTrain';
import TransportRoute from '@/app/components/territoire/transportRoute';

import BreadcrumbsPage from '@/app/components/pages/BreadcrumbsPage';

import Density from '@/app/components/testQualite/density';

import IconCouvertureHelp from '@/assets/icons/Icon_couverture_help.svg';
import IconQualityTestHelp from '@/assets/icons/icon_test_qualite_help.svg';
import IconAntennetHelp from '@/assets/icons/icon_support_help.svg';
import IconZonesHelp from '@/assets/icons/icon_zone_help.svg';
import IconAlertHelp from '@/assets/icons/icon_alert_help.svg';
import IconMap from '@/assets/icons/iconMap.svg';
import IconTrain from '@/assets/icons/train.svg';
import IconCar from '@/assets/icons/car.svg';

import { usePageStore } from '@/store/store';
import { useCoordStore } from '@/store/selectedCoordStore';
import { useStatCouvTerritoryStore } from '@/store/stat';
import { useTerritoryCouvertureState } from '@/store/couverture';
import { useTerritoryByUrlStore } from '@/store/filter';

import {
  getLabelEntite,
  isCommune,
  isAdresse,
  isTrain,
  isRoute,
  isTransport,
  isLocalisation,
  isRegion,
  isDepartement,
  isTerritoire,
} from '@/utils/activeEntite';
import Alert from '../alert';
import { isMetropole } from '@/utils/utils';

export default function Territoire() {
  const { isLoaded: isLoadedTerritory } = useTerritoryByUrlStore();
  const { selectedTerritoire } = useCoordStore();
  const { setPage: handleChangeThematique } = usePageStore();
  const { statCouvTerritory } = useStatCouvTerritoryStore();
  const { loadingCouverture } = useTerritoryCouvertureState();
  const [subTitleText, setSubTitleText] = useState('');

  const translationsCouverture = useTranslations('whatIsThis.couverture');
  const translationsTest = useTranslations('whatIsThis.test');
  const translationsSupport = useTranslations('whatIsThis.support');
  const translationsZone = useTranslations('whatIsThis.zone');
  const translationsSignalement = useTranslations('whatIsThis.signalement');
  const testTranslation = useTranslations('test');
  const territoireTranslation = useTranslations('territoire');

  const entite =
    selectedTerritoire?.entite || selectedTerritoire?.type || 'Territoire';

  let name = selectedTerritoire?.properties?.nom || selectedTerritoire?.label;
  let nomDep;
  let subtitle;
  let textEntite = '';

  useEffect(() => {
    if (statCouvTerritory) {
      const stat_4g = statCouvTerritory.stat.values_4g;
      const nbr_stat4g = stat_4g.filter((value: any) => value > 90).length;
      const adjectives = ['charmante', 'ravissante', 'belle', 'magnifique'];
      const randomIndex = Math.floor(Math.random() * adjectives.length);
      if (nbr_stat4g > 0) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setSubTitleText(
          `Cette ${adjectives[randomIndex]} adresse est très bien couverte en 4G par ${nbr_stat4g} opérateur(s).`
        );
      } else {
        setSubTitleText(
          `Aucun opérateur ne propose une très bonne couverture 4G à cette adresse. `
        );
      }
    }
  }, [selectedTerritoire, statCouvTerritory, subTitleText]);

  if (isTransport()) {
    if (isTrain()) name = 'Lignes de trains';
    if (isRoute()) name = 'Axes routiers';
  } else {
    if (
      selectedTerritoire?.entite === 'Adresse' ||
      selectedTerritoire?.type === 'adresse' ||
      selectedTerritoire?.entite === 'Localisation' ||
      selectedTerritoire?.type === 'localisation'
    ) {
      name = selectedTerritoire.properties.nom;
      nomDep = selectedTerritoire.nomDep;
    }

    if (
      entite.toLowerCase() === 'territoire' ||
      entite.toLowerCase() === 'département' ||
      entite.toLowerCase() === 'departement'
    ) {
      textEntite = `${territoireTranslation(
        'de_ce'
      )} ${territoireTranslation(`entite_${getLabelEntite()}`)}`;
    } else {
      textEntite = `${territoireTranslation(
        'de_cette'
      )} ${territoireTranslation(`entite_${getLabelEntite()}`)}`;
    }

    if (selectedTerritoire?.dept || selectedTerritoire?.insee_dep) {
      if (!isCommune()) {
        if (
          (['971', '972', '973', '974', '976'].includes(
            selectedTerritoire.dept
          ) ||
            ['971', '972', '973', '974', '976'].includes(
              selectedTerritoire.insee_dep
            )) &&
          !isAdresse()
        ) {
          subtitle = territoireTranslation('region_departement');
          textEntite = `${territoireTranslation(
            'de_ce'
          )} ${territoireTranslation('entite_territoire')}`;
        } else if (
          (['977', '978'].includes(selectedTerritoire.dept) ||
            ['977', '978'].includes(selectedTerritoire.insee_dep)) &&
          !isAdresse()
        ) {
          subtitle = territoireTranslation('collectivite');
          textEntite = `${territoireTranslation(
            'de_ce'
          )} ${territoireTranslation('entite_territoire')}`;
        } else {
          subtitle = `${territoireTranslation(`entite_${getLabelEntite()}`)}`;
        }
      } else {
        subtitle = `${territoireTranslation(`entite_${getLabelEntite()}`)}`;
      }
    } else {
      subtitle = `${territoireTranslation(`entite_${getLabelEntite()}`)}`;
    }

    if (
      selectedTerritoire?.entite === 'Localisation' ||
      selectedTerritoire?.type === 'localisation'
    ) {
      subtitle = `${territoireTranslation(`entite_localisation`)}`;
    }
  }

  if (!isLoadedTerritory) {
    return null;
  }

  return (
    <div className='relative  rounded-2xl w-full p-5'>
      <div className='flex flex-col pt-8 gap-5'>
        <BreadcrumbsPage />
        <div>
          <TitlePage text={name} underline={false} />
          {!isTransport() && (
            <span className='text-color-secondary font-medium'>
              {subtitle && subtitle.charAt(0).toUpperCase() + subtitle.slice(1)}
            </span>
          )}
        </div>
        {isTransport() ? (
          <></>
        ) : (
          <>
            {!loadingCouverture ? (
              <span className='text-sm font-medium'>
                {!isAdresse() ? (
                  <>
                    {territoireTranslation('entete_text')
                      .replace('[entite]', `${textEntite}`)
                      .replace(
                        '[pourcentage_1]',
                        `${statCouvTerritory ? statCouvTerritory.tauxCover : 0}`
                      )
                      .replace(
                        '[pourcentage_2]',
                        `${
                          statCouvTerritory
                            ? statCouvTerritory.tauxCoverByOperator
                            : 0
                        }`
                      )}
                  </>
                ) : (
                  subTitleText && <span>{subTitleText}</span>
                )}
              </span>
            ) : (
              <div className='flex items-center justify-center'>
                <MoonLoader
                  color='#232253'
                  loading={loadingCouverture}
                  size={50}
                />
              </div>
            )}
          </>
        )}
      </div>
      {isTransport() ? (
        isTrain() ? (
          <TransportTrain />
        ) : (
          <TransportRoute />
        )
      ) : (
        <>
          <hr className='border-gray-400 mt-8' />
          <DropDownBlock
            header={<Title text='Couverture théorique' className='mb-4' />}
            headerClassname='pt-5'
            show={true}
          >
            <ModalBubbleText
              title={translationsCouverture('title')}
              description={translationsCouverture('description')}
              image={<IconCouvertureHelp className='h-60 w-60' />}
            >
              <Help />
            </ModalBubbleText>
            <Couverture />
            <ArrowButtonComponent
              text={
                isAdresse()
                  ? 'Carte de couverture'
                  : `Couverture ${isCommune() ? 'à' : 'en'} ${name}`
              }
              icon={<IconMap />}
              className='my-5'
              onClick={() => handleChangeThematique('couverture-theorique')}
            />
          </DropDownBlock>
          <hr className='border-gray-400 mt-5' />
          <DropDownBlock
            header={<Title text='Tests de qualité réseau' className='mb-4' />}
            headerClassname='pt-5'
            show={true}
          >
            <ModalBubbleText
              title={translationsTest('title')}
              image={<IconQualityTestHelp className='h-60 w-60' />}
              description={translationsTest('description')}
              className='mb-0'
            >
              <Help />
            </ModalBubbleText>
            {isCommune() || isAdresse() ? (
              <div className='flex flex-col'>
                <Density />
                <div className='flex flex-col gap-2'>
                  {isLocalisation() ? (
                    <></>
                  ) : (
                    <Title
                      text='Voir les tests à proximité'
                      className='text-base'
                      underline={false}
                    />
                  )}

                  <ArrowButtonComponent
                    text={
                      isLocalisation()
                        ? 'Explorer les tests à proximité'
                        : 'Carte des tests'
                    }
                    textClassName='text-sm'
                    icon={<IconMap />}
                    className='my-2'
                    onClick={() => handleChangeThematique('qualite-reseau')}
                  />
                </div>
                {/* <Action
                                    title="Réaliser un test à cet endroit"
                                    action={{
                                        text: "Réaliser un test de qualité",
                                        onClick: () => "#",
                                    }}
                                    className={{
                                        main: "mt-2",
                                    }}
                                >
                                    {`Participez à l'évaluation de la qualité du réseau sur ce point en réalisant un test auprès de l'un de nos partenaires`}
                                </Action> */}
              </div>
            ) : (
              <>
                <QualityTest />
                <ArrowButtonComponent
                  text={`Tests de qualité ${isCommune() ? 'à' : 'en'} ${name}`}
                  icon={<IconMap />}
                  className='my-5'
                  onClick={() => handleChangeThematique('qualite-reseau')}
                />
              </>
            )}
            {isAdresse() && isMetropole() && (
              <div className='flex flex-col gap-4 pt-2 pb-4'>
                <Title
                  text='Tests sur des axes de transports'
                  className='text-base'
                  underline={false}
                />
                <ArrowButtonComponent
                  text={testTranslation('trains')}
                  icon={<IconTrain />}
                  onClick={() => ''}
                />
                <ArrowButtonComponent
                  text={testTranslation('roads')}
                  icon={<IconCar />}
                  onClick={() => ''}
                />
              </div>
            )}
          </DropDownBlock>
          <hr className='border-gray-400 mt-5' />
          <DropDownBlock
            header={<Title text='Antennes et déploiements' className='mb-4' />}
            headerClassname='pt-5'
            show={true}
          >
            <ModalBubbleText
              title={translationsSupport('title')}
              image={<IconAntennetHelp className='h-60 w-60' />}
              description={translationsSupport('description')}
              className='mb-0'
            >
              <Help />
            </ModalBubbleText>
            <AntenneTerritoire />
            {isCommune() || isAdresse() ? (
              <></>
            ) : (
              <>
                <Title
                  text={'Antennes à proximité'}
                  className='no-underline mt-3 mb-0 text-lg'
                />
                <ArrowButtonComponent
                  text={
                    isAdresse()
                      ? 'Carte des antennes'
                      : `Antennes ${isCommune() ? 'à' : 'en'} ${name}`
                  }
                  icon={<IconMap />}
                  className='my-5'
                  onClick={() =>
                    handleChangeThematique('antennes-deploiements')
                  }
                />
              </>
            )}
          </DropDownBlock>
          {isCommune() || isAdresse() ? (
            <></>
          ) : (
            <>
              <hr className='border-gray-400 mt-5' />
              <DropDownBlock
                header={<Title text='Zones à couvrir' className='mb-4' />}
                headerClassname='pt-5'
                show={true}
              >
                <ModalBubbleText
                  title={translationsZone('title')}
                  image={<IconZonesHelp className='h-60 w-60' />}
                  description={translationsZone('description')}
                  className='mb-2'
                >
                  <Help />
                </ModalBubbleText>
                <ZoneTerritoire />
                <ArrowButtonComponent
                  text={`Zones à couvrir ${isCommune() ? 'à' : 'en'} ${name}`}
                  icon={<IconMap />}
                  className='my-5'
                  onClick={() => handleChangeThematique('zones-a-couvrir')}
                />
              </DropDownBlock>
            </>
          )}
          <hr className='border-gray-400 mt-5' />
          <DropDownBlock
            header={<Title text={getTitleSignalement()} className='mb-4' />}
            headerClassname='pt-5'
            show={true}
          >
            <ModalBubbleText
              title={translationsSignalement('title')}
              image={<IconAlertHelp className='h-60 w-60' />}
              description={translationsSignalement('description')}
              className='mb-2'
            >
              <Help />
            </ModalBubbleText>
            {!isCommune() && (
              <>
                <SignalementTerritoire />
                {!isAdresse() && (
                  <ArrowButtonComponent
                    text={`Signalements Arcep ${
                      isCommune() ? 'à' : 'en'
                    } ${name}`}
                    icon={<IconMap />}
                    className='my-5'
                    onClick={() => handleChangeThematique('signalements')}
                  />
                )}
              </>
            )}
            <Alert
              className={{
                main: 'mt-2',
              }}
            />
          </DropDownBlock>
          <hr className='border-gray-400 mt-5' />
          <DropDownBlock
            header={<Title text='Pour aller plus loin' className='' />}
            headerClassname='pt-5'
            show={true}
          >
            <More />
          </DropDownBlock>
        </>
      )}
    </div>
  );
}

export function isSignalement() {
  return isRegion() || isDepartement() || isTerritoire();
}

function getTitleSignalement() {
  if (isSignalement()) {
    return 'Signalements';
  }

  return "J'alerte l'Arcep";
}
