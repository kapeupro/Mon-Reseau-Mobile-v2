import React from 'react';

import { isMobile } from '@/service/window';

import LegendComponent from '@/app/components/legend';

import { useTogglePanelStore } from '@/store/togglePanel';
import { useControleStore } from '@/store/map';

export default function Legend() {
  const { showPanel } = useTogglePanelStore();
  const { oMeasure, setControle } = useControleStore();

  const classNameMobile = 'absolute bottom-[62px] left-2.5';
  let classNameDesktope =
    ' absolute bottom-12 left-5 transition duration-300 ease-in-out';
  classNameDesktope += showPanel ? ' translate-x-120' : ' translate-x-0';

  const bMobile = isMobile();

  const className = isMobile() ? classNameMobile : classNameDesktope;
  return oMeasure?.activate && bMobile ? null : (
    <div className={className}>
      <LegendComponent />
    </div>
  );
}
