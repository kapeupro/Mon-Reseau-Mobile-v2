import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useHomeMenuStore } from '@/store/store';
import { useTranslations } from 'next-intl';
import ArrowButton from '@/app/components/arrowButton';
import Donnees from '@/app/components/home/donnees';
import LogoArcep from '@/assets/logoArcep.png';
import Rf from '@/assets/icons/rf_color.svg';
import LogoMRM from '@/assets/logoHdMRM.svg';
import TitlePage from '../titlePage';
import { useThemeStore } from '@/store/themes';
import { twMerge } from 'tailwind-merge';
import Icon from '../iconcmp';
import IconLink from '@/assets/icons/iconLink.svg';
import ThemesBurger from '../home/themesBurger';
import IconX from '@/assets/icons/CrossMenu.svg';
import MoreUtils from '../menu/moreUtils';
import News from '../menu/News';
import { isMobile } from '@/service/window';
import { useNewsStore } from '@/store/news';
import FooterMenu from '../footerMenu';
import DOMPurify from 'dompurify';

export default function HomeMenu() {
  const translations = useTranslations('home');
  const { aData } = useNewsStore();
  const { theme } = useThemeStore();
  const [accessibility, setAccessibility] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const IsMobile = isMobile();
  const { show: showHomeMenu, setShow: setShowHomeMenu } = useHomeMenuStore();

  useEffect(() => {
    if (!isVisible) {
      setIsVisible(true);
    }

    if (theme !== 'default' && !accessibility) {
      setAccessibility(true);
    }
  }, [accessibility, isVisible, theme]);

  const onClickBackButton = () => {
    setShowHomeMenu(false);
  };

  const classButtonBack = IsMobile
    ? 'absolute top-10 right-3 w-fit'
    : 'fixed top-16  w-fit left-[455px]' + (showHomeMenu ? '' : ' hidden');

  return (
    <div className='relative w-full'>
      <div className={twMerge('absolute z-50', classButtonBack)}>
        <IconX
          className={twMerge('cursor-pointer w-12 h-12')}
          onClick={onClickBackButton}
        ></IconX>
      </div>
      <div
        className={twMerge(
          'bg-secondary w-full pt-4 rounded-t-2xl xl:rounded-none',
          isVisible ? 'animation-slide-in-left' : 'hidden'
        )}
      >
        <TitlePage text='Accueil' className='mb-4 hidden' />
        <div className='ml-0  mx-auto pt-4 flex gap-10 xl:mx-4 border-b-[0.5px] border-b-[#67B4E2] pb-4'>
          <Rf className={'bg-secondary '} width='100' height='80' />
          <Image alt='LogoArcep' src={LogoArcep} className='w-auto h-14 ' />
        </div>
        <div className='flex relative gap-10 mt-9 mx-6 mb-32'>
          <div className=' row-span-2'>
            <LogoMRM width='125' height='125' className='mt-[-25px]' />
          </div>
          <div className=''>
            <div
              className='text-color-primary ml-4 mb-2 font-title font-semibold text-lg text-secondary-text'
              data-test='title-home'
            >
              {translations('title')}
            </div>
            <ArrowButton
              text={translations('about')}
              className='hover:bg-base-100 bg-primary text-white'
              onClick={() =>
                window.open(
                  `${process.env.NEXT_PUBLIC_LINK_HOME_OTHERS}`,
                  '_blank'
                )
              }
            />
          </div>
          <div className='p-2 absolute top-24'>
            <div
              className={'bg-white text-color-primary p-5 rounded-2xl shadow'}
            >
              <div className='font-semibold  text-justify mb-4'>
                <span className='text-sm text-red-500'>
                  {translations('news')} :
                </span>{' '}
                {aData[0] && (
                  <div className='relative'>
                    <div
                      className='text-sm leading-6 text-color-primary h-[120px] overflow-hidden text-clip'
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(aData[0].description ?? ''),
                      }}
                    />
                    <div className='absolute top-0 right-0 bottom-0 left-0 bg-gradient-transparent'></div>
                  </div>
                )}
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_LINK_EMAIL_INFO}`}
                className={twMerge(
                  'flex flex-row gap-4 cursor-pointer text-white bg-red-500 rounded-full py-1 px-5 w-fit'
                )}
                target='_blank'
              >
                <span className={twMerge('text-sm font-semibold')}>
                  {translations('receiveNews')}
                </span>
                <Icon icon={<IconLink />} />
              </a>
            </div>
          </div>
        </div>
        <div className='pt-36 bg-white '>
          <ThemesBurger />
        </div>

        <div className='flex flex-col bg-white w-full px-5'>
          <Donnees classTitle='hidden' />
        </div>
        <MoreUtils />
        <News />
        <FooterMenu />
      </div>
    </div>
  );
}
