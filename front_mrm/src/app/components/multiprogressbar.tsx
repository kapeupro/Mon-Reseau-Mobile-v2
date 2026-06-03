import React from 'react';
import ProgressBar from '@/app/components/progressbar';

interface MultiProgressbarProps {
  title?: any;
  subtitle?: any;
  color?: any;
  width?: number;
  iswithicon?: boolean;
  iswithtotal?: boolean;
  ispercent?: boolean;
  values?: any;
}

export default function MultiProgressbar({
  title = '',
  subtitle = '',
  color = [],
  width = 320,
  iswithicon = true,
  iswithtotal = false,
  ispercent = true,
  values = [],
}: MultiProgressbarProps) {
  const getMaxValues = (valuesGlobal?: any) => {
    var aValueTotal = [];
    for (let i = 0; i < valuesGlobal.length; i++) {
      aValueTotal.push(getTotal(valuesGlobal[i]));
    }
    aValueTotal.sort(function (a, b) {
      return a - b;
    });
    return aValueTotal[aValueTotal.length - 1];
  };

  const getTotal = (valuesData: any) => {
    let sum = 0;
    for (let i = 0; i < valuesData.length; i++) {
      sum += valuesData[i];
    }
    return sum;
  };

  const getWidthProgressBar = (
    totalvalue: number,
    maxvalues: number,
    widthmax: number
  ) => {
    const widthEltProgressBarCalc = Math.round(
      (totalvalue * widthmax) / maxvalues
    );
    return widthEltProgressBarCalc;
  };

  const maxvaluescalc = getMaxValues(values);

  const rows = [];
  for (let i = 0; i < values.length; i++) {
    var strTitle = title[i];
    var strSubtitle = subtitle[i];
    var key = i + 'multi';
    var widthEltProgressBar = getWidthProgressBar(
      getTotal(values[i]),
      maxvaluescalc,
      width
    );
    const eltProgerssBar = (
      <ProgressBar
        className='mt-0.5'
        key={key}
        title={strTitle}
        subtitle={strSubtitle}
        color={color[i]}
        width={widthEltProgressBar}
        iswithicon={iswithicon}
        iswithtotal={iswithtotal}
        ispercent={ispercent}
        values={values[i]}
      />
    );

    rows.push(eltProgerssBar);
  }
  return <div>{rows}</div>;
}
