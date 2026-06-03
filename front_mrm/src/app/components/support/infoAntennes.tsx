import React from 'react';
import Title from '../title';
import ModalBubbleText from '../modalBubbleText';
import Help from '../help';
import CardAntenne from './cardAntenne';
import IconAntennetHelp from '@/assets/icons/icon_support_help.svg';

import { useTranslations } from 'next-intl';

interface InfoAntenneProps {
  antennes?: any;
}

export default function InfoAntenne({ antennes = [] }: InfoAntenneProps) {
  const translations = useTranslations('whatIsThis.support');
  return (
    <div className=''>
      <Title
        text={`${antennes ? antennes.length : 0} antennes`}
        textDataTest='antennas-site-antennas-number'
        underline={false}
        className='text-base font-bold'
      />
      <ModalBubbleText
        title={translations('title')}
        image={<IconAntennetHelp className='h-60 w-60' />}
        description={translations('description')}
        className='mb-4'
      >
        <Help className={{ main: '', text: 'text-xs' }} />
      </ModalBubbleText>
      <div className='flex flex-col gap-4 mb-4'>
        {antennes ? (
          antennes.map((antenne: any, index: number) => {
            return (
              <CardAntenne
                key={index}
                id={antenne.fidantenne}
                emetteurs={antenne.emetteurs}
                tilt={antenne.tilt}
                azimut={antenne.azimut}
              />
            );
          })
        ) : (
          <span className='text-gray-400 font-normal'>
            Antennes indisponibles
          </span>
        )}
      </div>
    </div>
  );
}
