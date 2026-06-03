/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react';

import { twMerge } from 'tailwind-merge';

import Title from '@/app/components/title';
import { usePageStore } from '@/store/store';

import IconArrowDown from '@/assets/icons/caret_down.svg';

import IconCouvertureHelp from '@/assets/icons/Icon_couverture_help.svg';
import IconQualityTestHelp from '@/assets/icons/icon_test_qualite_help.svg';
import IconAntennetHelp from '@/assets/icons/icon_support_help.svg';
import IconZonesHelp from '@/assets/icons/icon_zone_help.svg';
import IconAlertHelp from '@/assets/icons/icon_alert_help.svg';

import { useTranslations } from 'next-intl';

function WithExpand(Component: any, theme: any) {
  const [bExpand, setExpand] = useState(true);

  return <Component bExpand={bExpand} setExpand={setExpand} theme={theme} />;
}

function Theme(props: any) {
  const { theme, bExpand, setExpand } = props;
  const { setPage } = usePageStore();

  return (
    <div
      className='bg-white px-5 border-y pt-4  cursor-pointer'
      key={theme.name}
      onClick={() => setPage(theme.action.link)}
    >
      <div className='flex mb-4'>
        <Title text={theme.title} className='grow text-xl ' underline={false} />
        <IconArrowDown
          className={twMerge('transition duration-300 ease-out rotate-90')}
        />
      </div>
    </div>
  );
}

export default function ThemesBurger() {
  const couvertureTranslation = useTranslations('couverture');
  const testTranslation = useTranslations('test');
  const antenneTranslation = useTranslations('antenne');
  const zoneTranslation = useTranslations('zone');
  const signalementTranslation = useTranslations('signalement');

  const aThemes = [
    {
      name: 'Accueil',
      title: 'Accueil',
      action: {
        text: couvertureTranslation('action'),
        link: 'home',
      },
    },
    {
      name: 'couverture-theorique',
      title: couvertureTranslation('title'),
      action: {
        text: couvertureTranslation('action'),
        link: 'couverture-theorique',
      },
    },
    {
      name: 'qualite-reseau',
      title: testTranslation('title'),
      action: {
        text: testTranslation('action'),
        link: 'qualite-reseau',
      },
    },
    {
      name: 'antennes-deploiements',
      title: antenneTranslation('title'),
      action: {
        text: antenneTranslation('action'),
        link: 'antennes-deploiements',
      },
    },
    {
      name: 'zones-a-couvrir',
      title: zoneTranslation('title'),
      action: {
        text: zoneTranslation('action'),
        link: 'zones-a-couvrir',
      },
    },
    {
      name: 'signalements',
      title: signalementTranslation('reportingTitle'),
      action: {
        text: signalementTranslation('action'),
        link: 'signalements',
      },
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
