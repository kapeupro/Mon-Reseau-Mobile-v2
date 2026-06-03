'use client';
import React from 'react';

import { useTranslations } from 'next-intl';

import ModalBubbleText from '@/app/components/modalBubbleText';
import ButtonServices from '@/app/components/buttonServices';
import Title from '@/app/components/title';
import Help from '@/app/components/help';

import IconQualityTestHelp from '@/assets/icons/icon_test_qualite_help.svg';

import { useServiceTrainStore } from '@/store/train';

export default function ButtonServicesTrain() {
  const { serviceTrain, setServiceTrain } = useServiceTrainStore();

  const translations = useTranslations('whatIsThis.test');

  return (
    <>
      <div className='flex flex-col justify-start w-full'>
        <Title
          text='Tests de qualité'
          className='text-md text-left'
          underline={false}
        />
        <ModalBubbleText
          title={translations('title')}
          image={<IconQualityTestHelp className='h-60 w-60' />}
          description={translations('description')}
          className='mb-0'
        >
          <Help />
        </ModalBubbleText>
      </div>
      <ButtonServices service={serviceTrain} setService={setServiceTrain} />
    </>
  );
}
