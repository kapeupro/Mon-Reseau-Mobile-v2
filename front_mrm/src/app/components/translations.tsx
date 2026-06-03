import { NextIntlClientProvider } from 'next-intl';

import { useLanguageStore } from '@/store/translation';
import enTranslations from '@/translations/en.json';
import frTranslations from '@/translations/fr.json';

interface TranslationProviderProps {
  children: React.ReactNode;
}

const oMessages: any = {
  fr: frTranslations,
  en: enTranslations,
};

export default function TranslationProvider({
  children,
}: TranslationProviderProps) {
  const { language } = useLanguageStore();

  const messages = oMessages[language];

  return (
    <NextIntlClientProvider locale={language} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
