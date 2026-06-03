import React from 'react';

import { useTranslations } from 'next-intl';

import Action from './action';
import { useToolsStore } from '@/store/tools';
interface AlertProps {
  className?: any;
}

export default function Alert({ className = {} }: Readonly<AlertProps>) {
  const { setSubPageTools } = useToolsStore();

  const signalementTranslation = useTranslations('signalement');
  return (
    <Action
      title={signalementTranslation('reportTitle')}
      action={{
        text: signalementTranslation('title'),
        onClick: () => {
          setSubPageTools({
            isActive: true,
            show: true,
            subPageTools: 'tools_alert',
          });
        },
      }}
      className={className}
    >
      {signalementTranslation('reportDescription')}
    </Action>
  );
}
