import React from 'react';
import { useTranslations } from 'next-intl';

import Info from '@/app/components/info';
import Help from '@/app/components/help';
import MoreInfo from '@/app/components/moreInfo';
import TitlePage from '@/app/components/titlePage';
import ModalBubbleText from '@/app/components/modalBubbleText';

import Links from '@/app/components/antenne/links';
import Deploiement from '@/app/components/antenne/deploiement';
import Technologies from '@/app/components/antenne/technologies';
import Statistiques from '@/app/components/antenne/statistiques';
import OperatorsAntennes from '@/app/components/antenne/operatorsAndAll';
import SwitchButtonService from '@/app/components/antenne/switchButtonService';

import BreadcrumbsPage from '@/app/components/pages/BreadcrumbsPage';

import IconAntennetHelp from '@/assets/icons/icon_support_help.svg';

import { isAdresse, isTransport } from '@/utils/activeEntite';

export default function AntennesFullPage() {
  const translations = useTranslations('whatIsThis.support');
  const antenneTranslations = useTranslations('antenne');
  return (
    <div>
      <div className=''>
        <div className='flex flex-col gap-5'>
          <BreadcrumbsPage />
          <TitlePage text={antenneTranslations('title')} className='mb-4' />
        </div>
        <ModalBubbleText
          title={translations('title')}
          image={<IconAntennetHelp className='h-60 w-60' />}
          description={translations('description')}
        >
          <Help />
        </ModalBubbleText>
      </div>
      <div className='my-5 w-full'>
        <OperatorsAntennes />
      </div>
      <div className='my-5 w-full'>
        <SwitchButtonService />
      </div>
      <div>
        <Info className='rounded-2xl w-full'>
          <div className='flex flex-col gap-1.5'>
            <span className='text-xs leading-4'>
              {antenneTranslations('info')}
            </span>
            <MoreInfo>
              <span className='text-xs leading-4'>
                {antenneTranslations('moreInfo')}
              </span>
            </MoreInfo>
          </div>
        </Info>
      </div>
      <Technologies />
      <Deploiement />
      {!isAdresse() && !isTransport() && <Statistiques />}
      <Info className='rounded-2xl w-full mb-6'>
        <div className='flex flex-col gap-1.5'>
          <span className='text-xs leading-4'>
            {antenneTranslations('moreInfoMap')}
          </span>
        </div>
      </Info>
      <Links />
    </div>
  );
}
