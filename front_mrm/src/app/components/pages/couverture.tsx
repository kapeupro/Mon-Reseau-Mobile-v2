import React, { useCallback, useEffect, useRef, useState } from 'react';

import TitlePage from '@/app/components/titlePage';
import Help from '@/app/components/help';
import Info from '@/app/components/info';
import Icon from '@/app/components/iconcmp';
import BreadcrumbsComponent from '@/app/components/breadcrumbs';
import ModalBubbleText from '@/app/components/modalBubbleText';
import { useTranslations } from 'next-intl';

import ButtonServicesCouverture from '../couverture/buttonServices';
import Operators from '@/app/components/couverture/operators';
import Technologies from '@/app/components/couverture/technologies';
import ModalStat from '@/app/components/couverture/modalStat';
import ArrowButton from '@/app/components/couverture/arrowButton';
import DataLinks from '@/app/components/couverture/dataLinks';
import Action from '@/app/components/couverture/action';
import Superposer from '@/app/components/couverture/superposer';

import BreadcrumbsPage from '@/app/components/pages/BreadcrumbsPage';

import { useServiceStore } from '@/store/store';

import IconArrowDown from '@/assets/icons/caret_down.svg';
import IconCouvertureHelp from '@/assets/icons/Icon_couverture_help.svg';
import MoreInfo from '../moreInfo';

export default function Couverture() {
  const [show, setShow] = useState(false);
  const { service } = useServiceStore();
  const translations = useTranslations('whatIsThis.couverture');
  const couvertureTranslation = useTranslations('couverture');

  const toggleHiddenComponant = () => {
    setShow(!show);
  };

  const toggleShowComponant = useCallback(() => {
    setShow(true);
  }, []);

  const firstMount = useRef(true);

  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }
    toggleShowComponant();
  }, [service, toggleShowComponant]);

  const infoCouverture = couvertureTranslation('info');
  const moreInfoCouverture = couvertureTranslation('moreInfo');

  return (
    <div className='pt-12 px-5'>
      <div className=''>
        <div className='flex flex-col gap-5'>
          <BreadcrumbsPage />
          <TitlePage text={couvertureTranslation('title')} className='mb-4' />
        </div>
        <ModalBubbleText
          title={translations('title')}
          description={translations('description')}
          image={<IconCouvertureHelp className='h-60 w-60' />}
          className='mb-0'
        >
          <Help />
        </ModalBubbleText>
      </div>
      <div className='mb-5 w-full'>
        <Operators>
          <Superposer />
        </Operators>
        {/* <div className="flex items-center justify-center">
                    <Info className="text-color-primary py-1 rounded-2xl">
                        Superposer (fonction expert)
                    </Info>
                </div> */}
        {Boolean(infoCouverture.trim()) &&
          infoCouverture !== 'couverture.info' && (
            <Info className='rounded-2xl w-full mt-4 mb-2'>
              <div className='flex flex-col gap-1.5'>
                <span className='text-xs leading-4'>{infoCouverture}</span>
                {Boolean(moreInfoCouverture.trim()) &&
                  moreInfoCouverture !== 'couverture.moreInfo' && (
                    <MoreInfo>
                      <span className='text-xs leading-4'>
                        {moreInfoCouverture}
                      </span>
                    </MoreInfo>
                  )}
              </div>
            </Info>
          )}
        <div className='flex flex-col pt-4 shadow-custom pb-3 rounded-xl mt-3 pl-3'>
          <ButtonServicesCouverture>
            <IconArrowDown
              onClick={toggleHiddenComponant}
              className={
                'transition-all ' + (show ? 'pt-2' : 'transform rotate-90 pl-2')
              }
            />
          </ButtonServicesCouverture>
          <div
            className={
              'transition-grid-template-rows grid ' +
              (show ? 'grid-rows-1fr' : 'grid-rows-0fr')
            }
          >
            <div className='flex items-center justify-center overflow-hidden'>
              <Technologies />
            </div>
          </div>
        </div>
      </div>
      <div className='gap-10'>
        <ModalStat />
        <ArrowButton />
        <div className='flex items-center justify-center mt-7'></div>
        <DataLinks />
        <Action />
      </div>
    </div>
  );
}
