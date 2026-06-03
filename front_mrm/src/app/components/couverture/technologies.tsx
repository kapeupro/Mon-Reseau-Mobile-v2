'use client';
import React, { useEffect } from 'react';
import DOMPurify from 'dompurify';

import Switcher from '@/app/components/switcher';

import { useServiceStore, useTechnologiesStore } from '@/store/store';
import {
  TECHNOLOGIES_INTERNET,
  TECHNOLOGIES_APPEL,
} from '@/app/constant/constant';

export default function Technologies() {
  const { technologies, toggleTechnology } = useTechnologiesStore();
  const { service } = useServiceStore();

  return (
    <div className='space-y-3'>
      {/* <h2 className="text-color-primary font-semibold text-sm">Technologie</h2> */}
      <div
        className='flex space-x-2 mt-4'
        data-test='coverage-technologie-buttons'
      >
        {service === 'internet'
          ? TECHNOLOGIES_INTERNET.map((technology) => {
              return (
                <React.Fragment key={technology.name}>
                  <Switcher
                    type='radio'
                    classname='max-w-none w-[63.6px] px-2'
                    checked={technologies.includes(technology.name)}
                    onToggle={() => {
                      toggleTechnology(technology.name);
                    }}
                  >
                    {/* <div className="w-5 h-5 border-4 rounded-full border-primary "></div> */}
                    <span
                      className='text-xs font-medium text-color-primary text-center leading-3 h-6'
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(technology.text ?? ''),
                      }}
                    ></span>
                  </Switcher>
                </React.Fragment>
              );
            })
          : TECHNOLOGIES_APPEL.map((technology) => {
              return (
                <React.Fragment key={technology.name}>
                  <Switcher
                    type='radio'
                    classname='max-w-none w-[63.6px] px-2'
                    checked={technologies.includes(technology.name)}
                    onToggle={() => {
                      toggleTechnology(technology.name);
                    }}
                  >
                    {/* <div className="w-5 h-5 border-4 rounded-full border-primary "></div> */}
                    <span
                      className='text-xs font-medium text-color-primary text-center leading-3 h-6'
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(technology.text ?? ''),
                      }}
                    ></span>
                  </Switcher>
                </React.Fragment>
              );
            })}
      </div>
    </div>
  );
}
