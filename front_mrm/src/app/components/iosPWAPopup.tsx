import React from 'react';
import { useTranslations } from 'next-intl';

interface IosPwaPopupProps {
  open: boolean;
  onClose: () => void;
}

export default function IosPwaPopup({ open, onClose }: IosPwaPopupProps) {
  const translation = useTranslations('home');

  if (!open) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex justify-center items-center z-50'>
      <div className='bg-white mx-6 p-6 rounded-xl shadow-xl max-w-md'>
        <h2 className='text-lg font-semibold mb-4'>
          {translation('iosInstructionsTitle')}
        </h2>

        <p className='text-sm whitespace-pre-line text-gray-700 mb-6'>
          {translation('iosInstructions')}
        </p>

        <button
          onClick={onClose}
          className='w-full py-2 bg-black text-white rounded-lg font-semibold'
        >
          {translation('close')}
        </button>
      </div>
    </div>
  );
}
