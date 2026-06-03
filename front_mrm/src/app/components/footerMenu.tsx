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

export default function FooterMenu() {
  const translations = useTranslations('footer');
  return (
    <div className='flex p-2 gap-10 bg-white w-full'>
      <a
        href={`${process.env.NEXT_PUBLIC_LINK_FOOTER_NOTICE}`}
        target='_blank'
        className='flex text-color-primary font-semibold mt-1.5 '
      >
        <span>{translations('opinion')}</span>
        {/* <IconRight className="mt-0.5" />{" "} */}
      </a>
      <Language classIcon='text-color-primary' classText='text-color-primary' />
    </div>
  );
}
