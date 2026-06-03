import React from 'react';

import { useTranslations } from 'next-intl';
import { twMerge } from 'tailwind-merge';

import { useBasemapStore } from '@/store/superposition';

const credit_elements: any = {
  classique: [
    {
      label: 'credit_etalab.label',
      url: 'credit_etalab.url',
    },
    {
      label: 'credit_openmaptiles.label',
      url: 'credit_openmaptiles.url',
    },
    {
      label: 'credit_openstreetmap.label',
      url: 'credit_openstreetmap.url',
    },
  ],
  satellite: [
    {
      label: 'credit_ign.label',
      url: 'credit_ign.url',
    },
  ],
  clair: [
    {
      label: 'credit_etalab.label',
      url: 'credit_etalab.url',
    },
    {
      label: 'credit_openmaptiles.label',
      url: 'credit_openmaptiles.url',
    },
    {
      label: 'credit_openstreetmap.label',
      url: 'credit_openstreetmap.url',
    },
  ],
  sombre: [
    {
      label: 'credit_etalab.label',
      url: 'credit_etalab.url',
    },
    {
      label: 'credit_openmaptiles.label',
      url: 'credit_openmaptiles.url',
    },
    {
      label: 'credit_openstreetmap.label',
      url: 'credit_openstreetmap.url',
    },
  ],
};

export default function Credits({
  className = {
    main: '',
    text: '',
  },
}: Readonly<{
  className?: {
    main?: string;
    text?: string;
  };
}>) {
  const { oBasemap } = useBasemapStore();

  const translations = useTranslations('credits');

  const map_type = oBasemap.name;

  let texts_classname = 'flex justify-center text-center ';
  texts_classname += className.text;

  return (
    <div
      className={twMerge(
        'flex flex-col gap-2 font-semibold text-gray-500 items-center pb-3',
        className.main
      )}
    >
      {credit_elements[map_type].map((element: any, index: number) => (
        <a
          className={texts_classname}
          href={translations(element.url)}
          key={index}
          target='_blank'
          rel='noopener noreferrer'
        >
          {translations(element.label)} {new Date().getFullYear()}
        </a>
      ))}
    </div>
  );
}
