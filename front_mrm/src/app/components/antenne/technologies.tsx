import React from 'react';
import DOMPurify from 'dompurify';

import Switcher from '@/app/components/switcher';
import { TECHNOLOGIES } from '@/app/constant/antennes';
import { useTechnologiesStore } from '@/store/antenne';

export default function Technologies() {
  const { technologies, toggleTechnology } = useTechnologiesStore();
  return (
    <div
      className='flex items-center justify-center space-x-2 my-6'
      data-test='antennas-technology-buttons'
    >
      {TECHNOLOGIES.map((technology: any) => {
        console.log('technology', technology);
        return (
          <React.Fragment key={technology.name}>
            <Switcher
              type='switcher'
              classname='max-w-none w-[62px]'
              checked={technologies.includes(technology.name)}
              onToggle={() => toggleTechnology(technology.name)}
            >
              <span
                className='text-[10px] font-medium text-color-primary text-center h-7'
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(technology.text ?? ''),
                }}
              ></span>
            </Switcher>
          </React.Fragment>
        );
      })}
    </div>
  );
}
