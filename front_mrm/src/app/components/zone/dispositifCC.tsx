import React from 'react';
import Title from '../title';
import DropDownBlock from '../dropDownBlock';
import StatistiquesZone from './statistiquesZone';
import { useTranslations } from 'next-intl';

export default function Dcc() {
  const zoneTranslation = useTranslations('zone');
  return (
    <DropDownBlock
      header={
        <Title
          text={zoneTranslation('zac-number-site-gov')}
          underline={false}
          className='text-base'
        />
      }
      show={true}
      classname='flex flex-col gap-2 mt-4  pb-4'
    >
      <StatistiquesZone />
    </DropDownBlock>
  );
}
