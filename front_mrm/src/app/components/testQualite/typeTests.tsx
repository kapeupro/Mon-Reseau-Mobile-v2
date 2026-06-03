'use client';
import React from 'react';

import { twMerge } from 'tailwind-merge';

import Switcher from '@/app/components/switcher';
import Info from '@/app/components/info';
import MoreInfo from '@/app/components/moreInfo';

import { useTestStore } from '@/store/store';
import { useDataQosAvailableStore, useServiceQosStore } from '@/store/qos';
import { TESTS_INTERNET, TESTS_APPEL } from '@/app/constant/constant';

import { useTranslations } from 'next-intl';
import { useCrowdState } from '@/store/crowd';
import DOMPurify from 'dompurify';

function getTypeTestAvailable(crowdselect: any, dataAvailable: any) {
  if (!crowdselect) {
    return [];
  }

  return dataAvailable[crowdselect.id_crowd] ?? [];
}

export default function TypeTests() {
  const { testInternet, testAppel, toggleTestInternet, toggleTestAppel } =
    useTestStore();
  const { service } = useServiceQosStore();
  const { crowdselect } = useCrowdState();
  const { data: dataAvailable } = useDataQosAvailableStore();

  const typeTestAvailable = getTypeTestAvailable(crowdselect, dataAvailable);

  const translations = useTranslations('qos');
  const testTranslation = useTranslations('test');

  return (
    <div className='flex flex-col gap-4 w-full'>
      <div className='flex items-center justify-center gap-2'>
        {service === 'internet'
          ? TESTS_INTERNET.map((test) => {
              const enabled =
                typeTestAvailable.includes(test.name.toLowerCase()) ||
                typeTestAvailable === 'all';

              return (
                <React.Fragment key={test.name}>
                  <Switcher
                    type='radio'
                    classname={`max-w-none w-1/4 px-2 ${
                      enabled ? '' : 'opacity-30'
                    }`}
                    checked={enabled && testInternet.includes(test.name)}
                    onToggle={() => {
                      toggleTestInternet(test.name);
                    }}
                    disabled={!enabled}
                  >
                    <span
                      className={twMerge(
                        'text-xs font-medium text-center leading-3 h-6',
                        !enabled && 'text-gray-400'
                      )}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(testTranslation(test.text)),
                      }}
                    ></span>
                  </Switcher>
                </React.Fragment>
              );
            })
          : TESTS_APPEL.map((test) => {
              const enabled =
                typeTestAvailable.includes(test.name.toLowerCase()) ||
                typeTestAvailable === 'all';

              return (
                <React.Fragment key={test.name}>
                  <Switcher
                    type='radio'
                    classname={`max-w-none w-[80px] px-2 ${
                      enabled ? '' : 'opacity-30'
                    }`}
                    checked={enabled && testAppel.includes(test.name)}
                    onToggle={() => {
                      toggleTestAppel(test.name);
                    }}
                    disabled={!enabled}
                  >
                    <span
                      className={twMerge(
                        'text-xs font-medium text-center leading-3 h-6',
                        !enabled && 'text-gray-400'
                      )}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(testTranslation(test.text)),
                      }}
                    ></span>
                  </Switcher>
                </React.Fragment>
              );
            })}
      </div>
      <div className='flex items-center justify-center'>
        {service === 'internet'
          ? TESTS_INTERNET.map((test) => {
              return (
                <React.Fragment key={test.name}>
                  {testInternet === test.name && (
                    <Info className='rounded-2xl w-full'>
                      <div className='flex flex-col gap-1.5'>
                        <span className='text-xs leading-4'>
                          {testTranslation(test.description)}
                        </span>
                        {test.more && (
                          <MoreInfo>
                            <span className='text-xs leading-4'>
                              {testTranslation(test.more)}
                            </span>
                          </MoreInfo>
                        )}
                      </div>
                    </Info>
                  )}
                </React.Fragment>
              );
            })
          : TESTS_APPEL.map((test) => {
              return (
                <React.Fragment key={test.name}>
                  {testAppel === test.name && (
                    <Info className='rounded-2xl w-full'>
                      <div className='flex flex-col gap-1.5'>
                        <span className='text-xs leading-4'>
                          {translations(test.description)}
                        </span>
                        {test.more && (
                          <MoreInfo>
                            <span className='text-xs leading-4'>
                              {testTranslation(test.more)}
                            </span>
                          </MoreInfo>
                        )}
                      </div>
                    </Info>
                  )}
                </React.Fragment>
              );
            })}
      </div>
    </div>
  );
}
