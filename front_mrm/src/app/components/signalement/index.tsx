import React from 'react';

import TitlePage from '@/app/components/titlePage';
import Help from '@/app/components/help';
import ModalBubbleText from '@/app/components/modalBubbleText';
import Info from '@/app/components/info';
import MoreInfo from '@/app/components/moreInfo';

import OperatorsSignalements from '@/app/components/signalement/operatorsAndAll';
import StatsSignalements from '@/app/components/signalement/statistiques';
import Links from '@/app/components/signalement/links';

import BreadcrumbsPage from '@/app/components/pages/BreadcrumbsPage';

import { useTranslations } from 'next-intl';

import IconAlertHelp from '@/assets/icons/icon_alert_help.svg';
import Alert from '../alert';

export default function SignalementsFullPage() {
  const translations = useTranslations('whatIsThis.signalement');
  const translationsSignalement = useTranslations('signalement');

  return (
    <>
      <div className='flex flex-col gap-5'>
        <BreadcrumbsPage />
        <TitlePage
          text={translationsSignalement('reportingTitle')}
          className='mb-4'
        />
      </div>
      <ModalBubbleText
        title={translations('title')}
        image={<IconAlertHelp className='h-60 w-60' />}
        description={translations('description')}
      >
        <Help />
      </ModalBubbleText>
      <div className='my-5 w-full'>
        <OperatorsSignalements />
      </div>
      <Info className='rounded-2xl w-full mb-5'>
        <div className='flex flex-col gap-1.5'>
          <span className='text-xs leading-4'>
            {translationsSignalement('descritpionResume')}
          </span>
          <MoreInfo>
            <span className='text-xs leading-4'>
              {translationsSignalement('descritpionMore')}
            </span>
          </MoreInfo>
        </div>
      </Info>
      <StatsSignalements />
      <Alert
        className={{
          main: 'mt-6',
        }}
      />
      <Links />
    </>
  );
}
