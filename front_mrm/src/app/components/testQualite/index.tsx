import React from 'react';

import TitlePage from '@/app/components/titlePage';
import Help from '@/app/components/help';
import OperatorsQos from './operatorsAndAll';
import Info from '@/app/components/info';
import Icon from '@/app/components/iconcmp';
import ModalBubbleText from '@/app/components/modalBubbleText';
import Title from '@/app/components/title';

import TypeTests from '@/app/components/testQualite/typeTests';
import FiltreTests from '@/app/components/testQualite/filtreTests';
import ProgressBar from '@/app/components/testQualite/progressBar';
import ArrowButton from '@/app/components/testQualite/arrowButton';

import ButtonServicesQos from './buttonServices';
import DataLinks from '@/app/components/couverture/dataLinks';
import Action from '@/app/components/couverture/action';

import BreadcrumbsPage from '@/app/components/pages/BreadcrumbsPage';

import IconInfo from '@/assets/icons/iconInfo.svg';
import IconQualityTestHelp from '@/assets/icons/icon_test_qualite_help.svg';
import { useTranslations } from 'next-intl';

export default function TestFullPage() {
  const translations = useTranslations('whatIsThis.test');
  const testTranslations = useTranslations('test');
  return (
    <>
      <div className='space-y-5'>
        <BreadcrumbsPage />
        <TitlePage text={testTranslations('title')} />
        <ModalBubbleText
          title={translations('title')}
          image={<IconQualityTestHelp className='h-60 w-60' />}
          description={translations('description')}
        >
          <Help />
        </ModalBubbleText>
      </div>
      <div className='flex flex-col items-center justify-center pt-8 space-y-4 w-full'>
        <OperatorsQos />
        <Info className='rounded-2xl'>
          <div className='flex flex-row items-center justify-center space-x-2'>
            <Icon icon={<IconInfo />} className='cursor-default' />
            <span className='text-xs leading-4'>
              {testTranslations('infoTest')}
            </span>
          </div>
        </Info>
      </div>
      <div className='flex flex-col gap-4 pt-5'>
        <Title
          text={testTranslations('typeTest')}
          className='text-md'
          underline={false}
        />
        <div className='flex items-center justify-center'>
          <ButtonServicesQos />
        </div>
        <div className='flex items-center justify-center'>
          <TypeTests />
        </div>
      </div>
      <div className='pt-8'>
        <FiltreTests />
      </div>
      <div className='pt-5'>
        <ProgressBar />
      </div>
      <div className='flex flex-col pt-5 gap-8'>
        <ArrowButton />
        <DataLinks />
        <Action />
      </div>
    </>
  );
}
