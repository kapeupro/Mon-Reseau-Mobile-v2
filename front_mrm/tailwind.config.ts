import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: ['grid-cols-4', 'grid-cols-6', 'grid-cols-5'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-text': 'var(--color-primary-text)',
        secondary: 'var(--color-secondary)',
        'secondary-text': 'var(--color-secondary-text)',
        info: 'var(--color-info)',
        'violet-10': 'var(--violet-10)',
        'violet-20': 'var(--violet-20)',
        'grey-20': 'var(--grey-20)',
        'stone-10': 'var(--stone-10)',
        'stone-20': 'var(--stone-20)', // bg-secondary
        'stone-30': 'var(--stone-30)',
        'primary-500': 'var(--primary-500)',
        'greenTheme-500': 'var(--greenTheme-500)',
        'greenTheme-100': 'var(--greenTheme-100)',
        'violetTheme-500': 'var(--violetTheme-500)',
        'violetTheme-100': 'var(--violetTheme-100)',
        'primary-200': 'var(--primary-200)',
        'purple-20': 'var(--purple-20)',
        bleu02: 'var(--bleu-02)',
        'bg-primary': 'var(--color-bg-primary)',
        'bg-primary-text': 'var(--color-bg-primary-text)',
        'bg-secondary-text': 'var(--color-bg-secondary-text)',
        'border-primary': 'var(--color-border-primary)',
        'color-primary': 'var(--color-text-primary)',
        'color-secondary': 'var(--color-text-secondary)',
        'color-tertiary': 'var(--color-text-tertiary)',
        'color-quaternary': 'var(--color-text-quaternary)',
        'btn-bg-primary': 'var(--color-btn-bg-primary)',
        'btn-bg-primary-text': 'var(--color-btn-primary-text)',
      },
      fontFamily: {
        title: ['var(--font-ibmPlexSans)'],
        paragraphe: ['var(--font-openSans)'],
      },
      fontSize: {
        ss: ['9px', '14px'],
        sl: ['11px', '16px'],
      },
      boxShadow: {
        custom: '0px 2px 6px 0px #23225324', // Modifiez ces valeurs selon vos besoins
        panel:
          '0 1px 2px rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)',
        'button-panel':
          '0px 1px 2px rgba(60, 64, 67, 0), 2px 2px 2px rgba(60, 64, 67, 0.12), 2px -2px 2px rgba(60, 64, 67, 0.12)',
        'panel-mobile':
          'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px',
        'bottom-left': '2px 2px 4px rgba(0, 0, 0, 0.1)',
        'scroll-left':
          '0 0px 15px 5px rgba(0,0,0,.1), 0 5px 5px -4px rgba(0,0,0,.5)',
        'scroll-right':
          '0 3px 15px 5px rgba(0,0,0,0.1), 0 -5px 5px -4px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'home-couverture-theorique': "url('/assets/couverture-theorique.png')",
        'home-qualite-reseau': "url('/assets/qos.webp')",
        'home-antenne': "url('/assets/antennes.webp')",
        'home-zac': "url('/assets/zac.webp')",
        'home-signalement': "url('/assets/signalement.webp')",
        'basemap-classique': "url('/assets/images/basemap_classique.png')",
        'basemap-satellite': "url('/assets/images/basemap_satellite.png')",
        'basemap-clair': "url('/assets/images/basemap_clair.png')",
        'basemap-sombre': "url('/assets/images/basemap_sombre.png')",
        'gradient-transparent':
          'linear-gradient(180deg, hsla(0, 0%, 100%, 0) 0, hsla(0, 0%, 100%, 0) 60%, hsla(0, 0%, 100%, .75) 80%, #fff)',
      },
      spacing: {
        '1/3.5': '25.8%',
        '120': '30rem',
      },
      maxWidth: {
        '10': '2.5rem',
      },
      gridTemplateRows: {
        '0fr': '0fr',
        '1fr': '1fr',
      },
    },
  },
  plugins: [],
};
export default config;
