import React, { useState } from 'react';

import ImgPwa from '@/assets/pwa.svg';
import IconRight from '@/assets/icons/iconRight.svg';
import { useTranslations } from 'next-intl';
import { usePwaStore } from '@/store/pwa';
import IosPwaPopup from '../iosPWAPopup';

export default function DownloadPwa() {
  const { deferredPrompt } = usePwaStore();
  const translation = useTranslations('home');
  const [showIosPopup, setShowIosPopup] = useState(false);

  const handlerPWA = async () => {
    if (!isIos() && deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } else if (isIos() && !isInStandaloneMode()) {
      setShowIosPopup(true);
    }
  };
  return (
    <>
      <button
        className='bg-white flex px-6 pt-6 space-x-2 justify-center items-center'
        onClick={() => handlerPWA()}
      >
        <ImgPwa />
        <span className='cursor-pointer text-xs font-semibold tracking-[0.24px]'>
          {translation('addHomeScreen')}
        </span>
        <IconRight className='cursor-pointer' />
      </button>
      <IosPwaPopup open={showIosPopup} onClose={() => setShowIosPopup(false)} />
    </>
  );
}

function isIos() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

const isInStandaloneMode = () =>
  'standalone' in window.navigator && window.navigator.standalone;
