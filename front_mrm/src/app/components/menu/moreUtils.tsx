import React from 'react';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Title from '@/app/components/title';
import { twMerge } from 'tailwind-merge';
import MoreInfo from '../moreInfo';
import Info from '../info';
import { useToolsStore } from '@/store/tools';
import { isMobile } from '@/service/window';

export default function MoreUtils() {
  const { setSubPageTools } = useToolsStore();
  const router = useRouter();
  const bMobile = isMobile();
  const translationHome = useTranslations('home');

  return (
    <div className='bg-white px-5 pt-5'>
      <Title
        className={twMerge('text-color-primary text-xl mb-2')}
        text={"Plus d'outils"}
        underline={false}
      />
      <Info
        className='rounded-2xl w-full mt-3 text-color-primary'
        title={translationHome('moreToolsInternetConnectionTitle')}
        IsIconLink={true}
        iconLinkClassName='text-bg-secondary-text'
        titleClassName='text-base'
        link={process.env.NEXT_PUBLIC_LINK_MY_INTERNET_CONNECTION}
      >
        <span className='text-sm leading-5 text-bg-secondary-text'>
          {translationHome('moreToolsInternetConnectionDesc')}
        </span>
      </Info>
      <Info
        className='rounded-2xl w-full mt-3 text-color-primary'
        title={translationHome('moreToolsAlertTitle')}
        iconLinkClassName='text-bg-secondary-text'
        titleClassName='text-base'
        IsIconLink={true}
        action={() => {
          setSubPageTools({
            isActive: true,
            show: true,
            subPageTools: 'tools_alert',
          });

          if (bMobile) {
            router.back();
          }
        }}
      >
        <span className='text-sm leading-5 text-bg-secondary-text'>
          {translationHome('moreToolsAlertDesc')}
        </span>
      </Info>
      <Info
        className='rounded-2xl w-full mt-3 text-color-primary'
        title={translationHome('moreToolsAboutArcepTitle')}
        iconLinkClassName='text-bg-secondary-text'
        titleClassName='text-base'
        IsIconLink={true}
        link={process.env.NEXT_PUBLIC_LINK_ABOUT}
      >
        <span className='text-sm leading-5 text-bg-secondary-text'>
          {translationHome('moreToolsAboutArcepDesc')}
        </span>
      </Info>
    </div>
  );
}
