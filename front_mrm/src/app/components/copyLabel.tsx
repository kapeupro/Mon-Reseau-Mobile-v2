import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import CopyIcon from '@/assets/icons/copyIcon.svg';
import CheckIcon from '@/assets/icons/checkIcon.svg';

interface CopyLabelProps {
  text: string;
  toolTipMsg?: string;
  className?: any;
  dataTest?: string;
}

export default function CopyLabel({
  text,
  toolTipMsg = 'Texte copié',
  className,
  dataTest = '',
}: CopyLabelProps) {
  const [isTextCopied, setIsTextCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const onCopy = async () => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;

      textarea.style.position = 'absolute';
      textarea.style.left = '-99999999px';

      document.body.prepend(textarea);

      textarea.select();

      try {
        document.execCommand('copy');
        setIsTextCopied(true);

        setTimeout(() => {
          setIsTextCopied(false);
        }, 1500);
      } catch (err) {
        console.error('Unable to copy text using execCommand:', err);
      } finally {
        textarea.remove();
      }
    } catch (error) {
      console.error('Error copying text to clipboard:', error);
    }
  };

  return (
    <div className={twMerge('flex flex-row gap-2 relative', className)}>
      <span
        className='text-xs text-color-primary font-bold'
        data-test={dataTest}
      >
        {text}
      </span>
      <div className='relative'>
        <CopyIcon
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onCopy}
        />
        {isHovered && !isTextCopied && (
          <div className='absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white text-xs py-3 px-4 rounded-lg shadow-custom whitespace-nowrap'>
            <div className='w-3.5 h-3.5 bg-white absolute top-8 left-1/2 transform rounded-br-md -translate-x-1/2 rotate-45 shadow-bottom-left'></div>
            Copier
          </div>
        )}
        {isTextCopied && (
          <div className='absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white text-xs py-3 px-4 rounded-lg shadow-custom whitespace-nowrap'>
            <div className='w-3.5 h-3.5 bg-white absolute top-8 left-1/2 transform rounded-br-md -translate-x-1/2 rotate-45 shadow-bottom-left'></div>
            <div className='flex flex-row gap-2'>
              {toolTipMsg}
              <CheckIcon className='h-4' />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
