import React from 'react';
import Image from 'next/image';
import RepubliqueFrancaise from '@/assets/icons/Rf.svg';
import Facebook from '@/assets/icons/facebook.svg';
import Linkedin from '@/assets/icons/linkedin.svg';
import Mastodon from '@/assets/icons/mastodon.svg';
import IconRight from '@/assets/icons/iconRight.svg';
import LogoFooter from '@/assets/logo_footer.png';

import Language from '@/app/components/language';
import { useTranslations } from 'next-intl';
import { twMerge } from 'tailwind-merge';

export default function Footer() {
  const translations = useTranslations('footer');
  return (
    <div className=' h-60 md:h-52 bg-primary mt-7  p-6 w-full  text-primary-text'>
      <div className='grid grid-cols-3 border-b-2 pb-4 border-opacity-50 border-[#D0D0E7] '>
        <RepubliqueFrancaise />
        <Image src={LogoFooter} alt={'logofooter'} className='h-11 w-32 ' />
      </div>
      <div className='flex mt-2 items-baseline'>
        <div className='grid grid-cols-3 grow'>
          <a
            href={`${process.env.NEXT_PUBLIC_LINK_FOOTER_FACEBOOK}`}
            target='_blank'
          >
            <Facebook></Facebook>
          </a>
          <a
            href={`${process.env.NEXT_PUBLIC_LINK_FOOTER_TWITTER}`}
            target='_blank'
          >
            <Mastodon></Mastodon>
          </a>
          <a
            href={`${process.env.NEXT_PUBLIC_LINK_FOOTER_LINKEDIN}`}
            target='_blank'
          >
            <Linkedin></Linkedin>
          </a>
        </div>
        <Language />
      </div>
      <div className='pt-4 flex justify-start'>
        <div>
          <a
            href={`${process.env.NEXT_PUBLIC_LINK_FOOTER_NOTICE}`}
            target='_blank'
            className='flex text-sm font-semibold underline underline-offset-1'
          >
            <span>{translations('opinion')}</span>
            <IconRight className='mt-0.5' />{' '}
          </a>
          <a
            href={`${process.env.NEXT_PUBLIC_LINK_FOOTER_LEGALE_NOTICE}`}
            target='_blank'
            className='flex text-sm  font-semibold underline underline-offset-1'
          >
            <span>{translations('termsOfUse')}</span>
            <IconRight className='mt-0.5' />{' '}
          </a>
        </div>
        <div>
          <a
            href={`${process.env.NEXT_PUBLIC_LINK_FOOTER_SITEMAP}`}
            target='_blank'
            className='flex text-sm  font-semibold underline underline-offset-1'
          >
            <span>{translations('siteMap')}</span>
            <IconRight className='mt-0.5' />{' '}
          </a>
          <a
            href={`${process.env.NEXT_PUBLIC_LINK_FOOTER_CONTACT}`}
            target='_blank'
            className='flex text-sm font-semibold underline underline-offset-1'
          >
            <span>{translations('contact')}</span>
            <IconRight className='mt-0.5' />{' '}
          </a>
        </div>
        {process.env['NEXT_PUBLIC_VERSION'] !== undefined &&
          process.env['NEXT_PUBLIC_VERSION'] !== '' && (
            <div className='flex text-xs text-white font-semibold mt-7 ml-auto'>
              Version {`${process.env.NEXT_PUBLIC_VERSION}`}
            </div>
          )}
      </div>
    </div>
  );
}
