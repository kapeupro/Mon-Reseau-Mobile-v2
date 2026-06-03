import './globals.css';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { IBM_Plex_Sans, Open_Sans } from 'next/font/google';
import { NavigationEvents } from './components/navigation-events';
import { useThemeStore } from '@/store/themes';

const ibmPlexSans = IBM_Plex_Sans({
  weight: '600',
  subsets: ['latin'],
  variable: '--font-ibmPlexSans',
  display: 'swap',
});

const openSans = Open_Sans({
  weight: '600',
  subsets: ['latin'],
  variable: '--font-openSans',
  display: 'swap',
});

export const metadata: Metadata = {
  applicationName: 'Mon App réseau mobile',
  title: 'Mon réseau mobile',
  description: 'Arcep - Mon réseau mobile',
  manifest: '/manifest.json',
  metadataBase: new URL('https://monreseaumobile.arcep.fr'),
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mon réseau mobile',
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Mon App réseau mobile',
    title: 'Mon réseau mobile',
    description: 'Arcep - Mon réseau mobile',
  },
  twitter: {
    card: 'summary',
    title: 'Mon réseau mobile',
    description: 'Arcep - Mon réseau mobile',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useThemeStore.getState();
  return (
    <html lang='fr' data-theme={theme}>
      <body className={`${ibmPlexSans.variable} ${openSans.variable}`}>
        {children}
        <Suspense fallback={null}>
          <NavigationEvents />
        </Suspense>
      </body>
    </html>
  );
}
