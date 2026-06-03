'use client';
import React from 'react';
import TranslationProvider from '@/app/components/translations';

export default function DocLayout({ children }: { children: React.ReactNode }) {
  return (
    <TranslationProvider>
      <section className='mx-auto max-w-4xl mt-10'>{children}</section>
    </TranslationProvider>
  );
}
