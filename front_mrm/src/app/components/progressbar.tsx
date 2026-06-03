import React from 'react';
import { twMerge } from 'tailwind-merge';

import Icon from '@/app/components/iconcmp';
import IconProgress from '@/assets/icons/bgpb.svg';
import { isMobile, getWidthWindow } from '../../service/window';

interface ProgressbarProps {
  className?: string;
  title?: string;
  subtitle?: string;
  color?: any;
  activeicon?: any;
  width?: number;
  iswithicon?: boolean;
  iswithtotal?: boolean;
  ispercent?: boolean;
  values?: any;
  dataTestName?: string;
  valuesLabel?: string[];
  dataTestCouverture?: string;
}

const getTotalMin = (values: any, sizeMin: number) => {
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i] < sizeMin) {
      sum += values[i];
    }
  }
  return sum;
};

const getTotal = (values: any) => {
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
  }
  return sum;
};

const formatValue = (x: number) => {
  var value = x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
  return value.replace(',', '\u00A0');
};

const getDefaultWidth = (IsMobile: boolean, widthMobile: number) => {
  if (IsMobile) {
    return widthMobile;
  } else {
    return 435;
  }
};

const getWidthProgressbarTw = (
  width: number,
  iswithtotal: boolean,
  IsMobile: boolean,
  widthMobile: number
) => {
  const widthLabelTotalPx = 64;
  const widthTotalPx =
    width > getDefaultWidth(IsMobile, widthMobile)
      ? getDefaultWidth(IsMobile, widthMobile)
      : width;
  const widthMediumPx = widthTotalPx - widthLabelTotalPx;
  const widthMediumTW = ' w-[' + widthMediumPx + 'px]';
  const widthTotalTW = ' w-[' + widthTotalPx + 'px]';
  if (iswithtotal) {
    return widthMediumTW;
  } else {
    return widthTotalTW;
  }
};

const getWidthProgressbarPx = (
  width: number,
  iswithtotal: boolean,
  IsMobile: boolean,
  widthMobile: number
) => {
  const widthLabelTotalPx = 64;
  const widthTotalPx =
    width > getDefaultWidth(IsMobile, widthMobile)
      ? getDefaultWidth(IsMobile, widthMobile)
      : width;
  const widthMediumPx = widthTotalPx - widthLabelTotalPx;
  if (iswithtotal) {
    return widthMediumPx;
  } else {
    return widthTotalPx;
  }
};

const buildValuesLabel = (
  values: any,
  color: any,
  ispercent: boolean,
  dataTestName: string,
  valuesLabel: string[]
) => {
  if (getTotal(values) === 0) {
    return '';
  }

  var rows = [];
  for (let i = 0; i < values.length; i++) {
    var key = i + '-pblb-';
    var strValues = formatValue(values[i]);
    if (ispercent) {
      strValues += '%';
    }

    var styleNameSquare = {
      backgroundColor: color[i],
      paddingTop: 3,
    };

    var styleNameLabel = {
      padding: '0 7px 0 4px',
    };

    let dataTest = '';
    if (valuesLabel.length > 0 && dataTestName !== '') {
      dataTest = dataTestName + valuesLabel[i];
    }

    var strPipe = i !== values.length - 1 ? '\u00A0|' : '';
    var divElt = (
      <div key={key} className='flex items-center'>
        <div className='rounded-sm w-1.5 h-1.5' style={styleNameSquare}></div>
        <label style={styleNameLabel} data-test={dataTest}>
          {strValues}
          {strPipe}
        </label>
      </div>
    );
    rows.push(divElt);
  }
  return rows;
};

const getWidthByValue = (
  val: number,
  ispercent: boolean,
  width: number,
  iswithtotal: boolean,
  listValues: any,
  IsMobile: boolean,
  widthMobile: number
) => {
  if (ispercent) {
    var prctWidthVal = Math.round(
      (val * getWidthProgressbarPx(width, iswithtotal, IsMobile, widthMobile)) /
        100
    );
    return prctWidthVal;
  } else {
    var total = getTotal(listValues);
    var widthVal = Math.round(
      (val * getWidthProgressbarPx(width, iswithtotal, IsMobile, widthMobile)) /
        total
    );
    return isNaN(widthVal) ? 0 : widthVal;
  }
};

const adjustSize = (
  numberPart: number,
  val: any,
  width: number,
  iswithtotal: boolean,
  sizeMin: number,
  IsMobile: boolean,
  widthMobile: number
) => {
  var totalDispo =
    getWidthProgressbarPx(width, iswithtotal, IsMobile, widthMobile) -
    sizeMin * numberPart;

  var aListAdjusted = [];
  for (var i = 0; i < val.length; i++) {
    if (val[i] < sizeMin) {
      aListAdjusted.push(sizeMin);
    } else {
      var rapport = val[i] / totalDispo;
      var sizeAdjusted = Math.round(
        val[i] - rapport * (sizeMin * numberPart - getTotalMin(val, sizeMin))
      );
      aListAdjusted.push(sizeAdjusted);
    }
  }
  return aListAdjusted;
};

const getWidthsData = (
  val: any,
  width: number,
  iswithtotal: boolean,
  sizeMin: number,
  ispercent: boolean,
  isMobileParams: boolean,
  widthMobileParams: number
) => {
  let aList = [];
  let countMin = 0;
  let widthDiv = 0;
  const total = getTotal(val);
  for (let i = 0; i < val.length; i++) {
    if (val[i] === 0 && total > 0) {
      widthDiv = 0;
      aList.push(widthDiv);
    } else {
      widthDiv = getWidthByValue(
        val[i],
        ispercent,
        width,
        iswithtotal,
        val,
        isMobileParams,
        widthMobileParams
      );
      aList.push(widthDiv);
      if (widthDiv < sizeMin) {
        countMin++;
      }
    }
  }

  if (countMin > 0) {
    aList = adjustSize(
      countMin,
      aList,
      width,
      iswithtotal,
      sizeMin,
      isMobileParams,
      widthMobileParams
    );
  }
  return aList;
};

export default function Progressbar({
  className = 'leading-4',
  title = '',
  subtitle = '',
  color = [],
  width = 435,
  iswithicon = true,
  iswithtotal = false,
  ispercent = true,
  activeicon = <IconProgress />,
  values = [],
  dataTestName = '',
  valuesLabel = [],
  dataTestCouverture = '',
}: ProgressbarProps) {
  const IsMobile = isMobile();
  const marginScreen = 40;

  const widthWin = typeof window != 'undefined' ? window.innerWidth : 370;
  const widthMobile = widthWin - marginScreen;
  if (IsMobile) {
    width = widthMobile;
  }
  const widthTotalPx =
    width > getDefaultWidth(IsMobile, widthMobile)
      ? getDefaultWidth(IsMobile, widthMobile)
      : width;
  const widthLabelTotalPx = 64;
  const widthMinLabel = 205;
  const sizeMin = 0;
  const widthDefaultLabel = widthTotalPx - widthLabelTotalPx;
  const widthLabelValue =
    widthDefaultLabel < widthMinLabel ? widthMinLabel : widthDefaultLabel;

  const widthTotalTW = ' w-[' + widthTotalPx + 'px]';

  const strClassNameTotal = widthTotalTW + ' h-7 mt-1 flex';
  const strClassNameContentProgress = widthTotalTW + ' flex ';

  const classSubtitleLabel =
    subtitle === ''
      ? 'hidden'
      : 'text-ss font-semibold not-italic text-right tracking-widest text-gray-400';
  const strClassNameProgress = twMerge(
    getWidthProgressbarTw(width, iswithtotal, IsMobile, widthMobile) +
      ' h-7 flex'
  );
  const strClassNameProgressMask = twMerge(' flex h-7');

  const strStyleNameProgressMask = {
    width: getWidthProgressbarPx(width, iswithtotal, IsMobile, widthMobile) - 1,
    clipPath: 'inset(0% 0% 0% 0% round 18px)',
  };

  const strClassNameProgressParentRelative = twMerge(
    getWidthProgressbarTw(width, iswithtotal, IsMobile, widthMobile)
  );
  const strClassNameLabel = twMerge(
    getWidthProgressbarTw(width, iswithtotal, IsMobile, widthMobile) +
      ' flex mt-1.5 text-sl font-semibold not-italic text-right text-color-primary-500 py-0.5 font-semibold font-sans text-xs text-[#514F96]'
  );
  const strClassNameLabelTotal = iswithtotal
    ? twMerge('font-medium ml-2  text-sm mt-1.5')
    : 'hidden';

  const buildDivBackground = (listvalues: any, isMobileParams: boolean) => {
    const rows = [];
    let widthDiv = 0;

    var aListWidth = getWidthsData(
      listvalues,
      width,
      iswithtotal,
      sizeMin,
      ispercent,
      isMobileParams,
      widthMobile
    );
    var total = getTotal(listvalues);

    if (total === 0) {
      const styleNoData = {
        backgroundColor: 'rgb(232 232 232)',
        width: getWidthProgressbarPx(width, iswithtotal, IsMobile, widthMobile),
      };
      const str100Class = twMerge(strClassNameContentProgress + ' rounded-sm ');

      return <div className={str100Class} style={styleNoData}></div>;
    }

    var startDivCounter = 0;
    var bIconeToAdd = true;
    for (var i = 0; i < listvalues.length; i++) {
      if (listvalues[i] === 0 && total > 0) {
        continue;
      }

      widthDiv = aListWidth[i];
      var key = i + '-pb-' + color;

      startDivCounter++;

      var classNameDiv = twMerge(' h-7 float-left text-white ');

      var styleNameDiv = {
        backgroundColor: color[i],
        width: widthDiv,
      };

      let divElt = (
        <div key={key} className={classNameDiv} style={styleNameDiv}></div>
      );

      if (bIconeToAdd && iswithicon) {
        bIconeToAdd = false;
        divElt = (
          <div
            key={key}
            className={classNameDiv + ' relative'}
            style={styleNameDiv}
          >
            <Icon
              className='ml-2 mt-0.5 absolute'
              icon={activeicon}
              width={24}
              height={26}
            />
          </div>
        );
      }

      rows.push(divElt);
    }
    return <div className={strClassNameContentProgress}>{rows}</div>;
  };

  return (
    <div className={className}>
      <label className='text-xs font-medium not-italic'>{title}</label>
      <br />
      <label className={classSubtitleLabel}>{subtitle}</label>
      <div className={strClassNameTotal}>
        <div className={strClassNameProgressParentRelative}>
          <div
            className={strClassNameProgressMask}
            style={strStyleNameProgressMask}
          >
            <div className={strClassNameProgress}>
              {buildDivBackground(values, IsMobile)}
            </div>
          </div>
        </div>
        <label className={strClassNameLabelTotal}>
          {formatValue(getTotal(values))}
        </label>
      </div>
      <div
        className={strClassNameLabel}
        style={{
          width: iswithtotal ? widthLabelValue : widthTotalPx,
        }}
        data-test={dataTestCouverture}
      >
        <div className='w-full flex'></div>
        {buildValuesLabel(values, color, ispercent, dataTestName, valuesLabel)}
      </div>
    </div>
  );
}
