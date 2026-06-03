import React from 'react';
import { twMerge } from 'tailwind-merge';

import IconX from '@/assets/icons/iconX.svg';
import IconCheck from '@/assets/icons/iconCheck.svg';
import IconMarker from '@/assets/icons/marker.svg';

interface SymboleProps {
  iconCheck?: boolean;
  selected?: boolean;
  className?: string;
}

export default function Symbole({ iconCheck = true, className }: SymboleProps) {
  return (
    <>
      {iconCheck ? (
        <div
          className={twMerge(
            'flex items-center justify-center bg-secondary text-color-primary rounded-full h-5 w-5',
            className
          )}
        >
          <IconCheck></IconCheck>
        </div>
      ) : (
        <IconX
          className={twMerge('flex items-center justify-center ', className)}
        ></IconX>
      )}
      {/* <div className="relative w-5 h-5">
                <IconMarker className="text-black"></IconMarker>
                <IconCheck
                    className={
                        "text-white absolute top-0.5 right-1.5 mx-auto w-3 h-3"
                    }
                ></IconCheck>
            </div> */}
    </>
  );
}
