import React from 'react';

import TitlePage from '@/app/components/titlePage';
import Help from '@/app/components/help';
import SwitcherComponent from '@/app/components/switcher';
import ModalBubbleText from '../modalBubbleText';
import OperatorsZones from '../zone/operatorsAndAll';
import Info from '../info';
import MoreInfo from '../moreInfo';
import AxeSwitcher from '../zone/axeSwitcher';
import Dcc from '../zone/dispositifCC';
import LinksZone from '../zone/linksZone';

import BreadcrumbsPage from '@/app/components/pages/BreadcrumbsPage';
import { useTranslations } from 'next-intl';

import IconZonesHelp from '@/assets/icons/icon_zone_help.svg';
import IconPoi from '@/assets/icons/POI-outZone.svg';
import { useAxesTransportsStore } from '@/store/zone';
import DropDownBlock from '../dropDownBlock';
import Title from '../title';
import { isAdresse } from '@/utils/activeEntite';

export default function Zones() {
  const translations = useTranslations('whatIsThis.zone');
  const zoneTranslation = useTranslations('zone');
  const { axe, toggleAxe } = useAxesTransportsStore();
  function tooglepoi() {}
  return (
    <div className='pt-12 px-5'>
      <div className=''>
        <div className='flex flex-col gap-5'>
          <BreadcrumbsPage />
          <TitlePage text='Zones à couvrir' className='mb-4' />
        </div>
        <ModalBubbleText
          title={translations('title')}
          image={<IconZonesHelp className='h-60 w-60' />}
          description={translations('description')}
        >
          <Help />
        </ModalBubbleText>
      </div>
      <div className='my-5 w-full'>
        <OperatorsZones />
      </div>
      <div>
        <Info className='rounded-2xl w-full'>
          <div className='flex flex-col gap-1.5'>
            <span className='text-xs leading-4'>
              {zoneTranslation('zac-description')}
            </span>
            <MoreInfo>
              <span className='text-xs leading-4'>
                {zoneTranslation('zac-moredescription')}
              </span>
            </MoreInfo>
          </div>
        </Info>
      </div>
      <DropDownBlock
        header={
          <Title
            text={zoneTranslation('zac-point-interet-dcc')}
            underline={false}
            className='text-base'
          />
        }
        show={true}
        classname='flex flex-col gap-2 mt-4  pb-4'
      >
        <ModalBubbleText
          title={zoneTranslation('zac-question-poi-dcc')}
          description={zoneTranslation('zac-description-poi-dcc')}
          className='mt-4 mb-6'
        >
          <Help />
        </ModalBubbleText>
        <SwitcherComponent
          type='switcher'
          classname='flex-row pt-2 my-2'
          checked={axe.includes('zac_poi')}
          onToggle={() => toggleAxe('zac_poi')}
        >
          <div className='flex flex-grow space-x-2.5'>
            <div className='w-10 flex items-center justify-center mt-2'>
              <IconPoi />
            </div>
            <span className='text-sm font-medium text-color-primary pt-2.5'>
              {zoneTranslation('zac-poi-label')}
            </span>
          </div>
        </SwitcherComponent>
      </DropDownBlock>
      <AxeSwitcher />
      {!isAdresse() && <Dcc />}
      <LinksZone className={'mt-4'} />
    </div>
  );
}
