/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react';

import { twMerge } from 'tailwind-merge';

import Title from '@/app/components/title';
import Help from '@/app/components/help';
import ModalBubbleText from '@/app/components/modalBubbleText';
import ArrowButtonComponent from '@/app/components/arrowButton';
import Icon from '@/app/components/iconcmp';
import { usePageStore } from '@/store/store';

import IconArrowDown from '@/assets/icons/caret_down.svg';
import IconMap from '@/assets/icons/iconMap.svg';
import IconCoverLevels from '@/assets/icons/coverLevels.svg';
import IconAntennes from '@/assets/icons/antenna-active.png';

import IconCouvertureHelp from '@/assets/icons/Icon_couverture_help.svg';
import IconQualityTestHelp from '@/assets/icons/icon_test_qualite_help.svg';
import IconAntennetHelp from '@/assets/icons/icon_support_help.svg';
import IconZonesHelp from '@/assets/icons/icon_zone_help.svg';
import IconAlertHelp from '@/assets/icons/icon_alert_help.svg';
import IconQosCheck from '@/assets/icons/qoscheck.svg';
import IconPoi from '@/assets/icons/poi.svg';

import Image from 'next/image';

import { useTranslations } from 'next-intl';
import Alert from '../alert';

interface ImageWithBackGroundProps {
  className: string;
  icon?: React.ReactNode;
}

function ImageWithBackGround({ className, icon }: ImageWithBackGroundProps) {
  return (
    <div>
      <div
        className={twMerge(
          'w-[140px] h-[90px] relative bg-cover bg-center bg-no-repeat',
          className
        )}
      >
        {icon && (
          <Icon
            icon={icon}
            className='cursor-default absolute bottom-2 right-2 text-color-primary'
          />
        )}
      </div>
    </div>
  );
}

function ImageCmp({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className='w-[60px] h-[60px] bg-stone-20 rounded-md flex justify-center items-center'>
        {children}
      </div>
    </div>
  );
}

interface SectionProps {
  image: React.ReactNode;
  children: React.ReactNode;
}

function Section({ image, children }: SectionProps) {
  return (
    <div className='flex space-x-6 mb-4'>
      {image}

      <p className='text-[13px] font-semibold leading-5'>{children}</p>
    </div>
  );
}

function CouvertureTheorique() {
  const couvertureTransalation = useTranslations('couverture');
  return (
    <Section
      image={
        <ImageWithBackGround
          className='bg-home-couverture-theorique rounded-md'
          icon={<IconCoverLevels />}
        />
      }
    >
      {couvertureTransalation('section')}
    </Section>
  );
}

interface ContentProps {
  help: {
    title: string;
    description: string;
    image: React.ReactNode;
  };
  children: React.ReactNode;
  extendComponent?: React.ReactNode;
  action: {
    text: string;
    link: string;
  };
}

function Content({ help, children, action, extendComponent }: ContentProps) {
  const { setPage: handleChangeThematique } = usePageStore();

  return (
    <div className='overflow-hidden'>
      <ModalBubbleText
        title={help.title}
        description={help.description}
        className='mb-4'
        image={<Icon icon={help.image} width={200} />}
      >
        <Help className={{ main: '', text: 'text-xs' }} />
      </ModalBubbleText>
      {children}
      <ArrowButtonComponent
        text={action.text}
        icon={<IconMap />}
        onClick={() => handleChangeThematique(action.link)}
        className='bg-secondary ml-0 mb-6 text-secondary-text hover:text-primary-text'
        secondary
      />
      {extendComponent}
    </div>
  );
}

function QualiteReseau() {
  const testTranslation = useTranslations('test');
  return (
    <>
      <Section
        image={
          <ImageWithBackGround
            className='bg-home-qualite-reseau rounded-md'
            icon={
              <div className='relative bg-[#232253] w-7 h-7 rounded-full flex items-center justify-center'>
                <IconQosCheck />
              </div>
            }
          />
        }
      >
        {testTranslation('section')}
      </Section>
      <p className='text-xs text-[#084E8E] font-semibold mb-4'>
        {testTranslation('note')}
      </p>
    </>
  );
}

function AntennesDeploiement() {
  const antenneTranslation = useTranslations('antenne');
  return (
    <Section
      image={
        <ImageWithBackGround
          className='bg-home-antenne rounded-md'
          icon={<Image alt='antenne' src={IconAntennes} width={40}></Image>}
        />
      }
    >
      {antenneTranslation('section')}
    </Section>
  );
}

function ZonneACouvrir() {
  const zoneTranslation = useTranslations('zone');
  return (
    <Section
      image={
        <ImageWithBackGround
          className='bg-home-zac rounded-md'
          icon={
            <div className='w-10 h-10'>
              <IconPoi />
            </div>
          }
        />
      }
    >
      {zoneTranslation('section')}
    </Section>
  );
}

function Signalements() {
  const signalementTranslation = useTranslations('signalement');
  return (
    <Section
      image={<ImageWithBackGround className='bg-home-signalement rounded-md' />}
    >
      {signalementTranslation('section')}
    </Section>
  );
}

function SignalementExtendComponent() {
  return (
    <Alert
      className={{
        main: 'mb-8',
      }}
    />
  );
}

function WithExpand(Component: any, theme: any) {
  const [bExpand, setExpand] = useState(true);

  return <Component bExpand={bExpand} setExpand={setExpand} theme={theme} />;
}

function Theme(props: any) {
  const { theme, bExpand, setExpand } = props;

  return (
    <div className='bg-white px-5 border-y pt-4 ' key={theme.name}>
      <div className='flex mb-4'>
        <Title text={theme.title} className='grow' />
        <IconArrowDown
          className={twMerge(
            'transition duration-300 ease-out ' +
              (!bExpand && 'transform rotate-90')
          )}
          onClick={() => setExpand(!bExpand)}
        />
      </div>
      <div
        className={
          'transition-grid-template-rows grid ' +
          (bExpand ? 'grid-rows-1fr' : 'grid-rows-0fr')
        }
      >
        <Content {...theme} />
      </div>
    </div>
  );
}

export default function Themes() {
  const translationsCouverture = useTranslations('whatIsThis.couverture');
  const translationsTest = useTranslations('whatIsThis.test');
  const translationsSupport = useTranslations('whatIsThis.support');
  const translationsZone = useTranslations('whatIsThis.zone');
  const translationsSignalement = useTranslations('whatIsThis.signalement');
  const couvertureTranslation = useTranslations('couverture');
  const testTranslation = useTranslations('test');
  const antenneTranslation = useTranslations('antenne');
  const zoneTranslation = useTranslations('zone');
  const signalementTranslation = useTranslations('signalement');

  const aThemes = [
    {
      name: 'couverture-theorique',
      title: couvertureTranslation('title'),
      help: {
        title: translationsCouverture('title'),
        description: translationsCouverture('description'),
        image: <IconCouvertureHelp className='h-60 w-60' />,
      },
      children: <CouvertureTheorique />,
      action: {
        text: couvertureTranslation('action'),
        link: 'couverture-theorique',
      },
    },
    {
      name: 'qualite-reseau',
      title: testTranslation('title'),
      help: {
        title: translationsTest('title'),
        description: translationsTest('description'),
        image: <IconQualityTestHelp className='h-60 w-60' />,
      },
      children: <QualiteReseau />,
      action: {
        text: testTranslation('action'),
        link: 'qualite-reseau',
      },
    },
    {
      name: 'antennes-deploiements',
      title: antenneTranslation('title'),
      help: {
        title: translationsSupport('title'),
        description: translationsSupport('description'),
        image: <IconAntennetHelp className='h-60 w-60' />,
      },
      children: <AntennesDeploiement />,
      action: {
        text: antenneTranslation('action'),
        link: 'antennes-deploiements',
      },
    },
    {
      name: 'zones-a-couvrir',
      title: zoneTranslation('title'),
      help: {
        title: translationsZone('title'),
        description: translationsZone('description'),
        image: <IconZonesHelp className='h-60 w-60' />,
      },
      children: <ZonneACouvrir />,
      action: {
        text: zoneTranslation('action'),
        link: 'zones-a-couvrir',
      },
    },
    {
      name: 'signalements',
      title: signalementTranslation('title'),
      help: {
        title: translationsSignalement('title'),
        description: translationsSignalement('description'),
        image: <IconAlertHelp className='h-60 w-60' />,
      },
      children: <Signalements />,
      action: {
        text: signalementTranslation('action'),
        link: 'signalements',
      },
      extendComponent: <SignalementExtendComponent />,
    },
  ];

  return (
    <>
      {aThemes.map((theme) => (
        <React.Fragment key={theme.name}>
          {WithExpand(Theme, theme)}
        </React.Fragment>
      ))}
    </>
  );
}
