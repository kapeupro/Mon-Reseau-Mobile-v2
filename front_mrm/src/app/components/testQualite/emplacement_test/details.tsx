import ProgressbarComponent from '@/app/components/progressbar';
import IconSuccess from '@/assets/icons/success.svg';
import IconPartialSuccess from '@/assets/icons/partialSuccess.svg';
import IconFail from '@/assets/icons/fail.svg';
import IconDown from '@/assets/icons/iconDown.svg';
import { twMerge } from 'tailwind-merge';
import { isMobile, getWidthWindow } from '@/service/window';
import { useTranslations } from 'next-intl';
import { useResumeQosStore } from '@/store/qos';

interface DetailProps {
  type?: string;
  values?: [];
}

export default function Detail({
  type = 'download',
  values = [],
}: DetailProps) {
  const { showLegendHelp, setShowLegendHelp } = useResumeQosStore();
  const translations = useTranslations('test');
  let legendElt = null;
  const colorSucces = '#1b155c';
  const colorPartial = '#CDCCFF';
  const colorEchec = '#e67fa3';
  let color = [colorSucces, colorPartial, colorEchec];
  let classLabelLegend = '';
  if (type === 'web' || type === 'voix') {
    legendElt = (
      <div className={twMerge('flex flex-row text-xs font-normal')}>
        <div className={twMerge('flex flex-row items-center gap-2 px-3')}>
          <IconSuccess></IconSuccess>
          <span>{translations('success')}</span>
        </div>
        <div className={twMerge('flex flex-row items-center gap-2 px-3')}>
          <IconPartialSuccess color='#CDCCFF'></IconPartialSuccess>
          <span>{translations('partialSuccess')}</span>
        </div>
        <div className={twMerge('flex flex-row items-center gap-2 px-3')}>
          <IconFail></IconFail>
          <span>{translations('fails')}</span>
        </div>
      </div>
    );
  }
  if (type === 'stream') {
    legendElt = (
      <div className={twMerge('flex flex-row text-xs font-normal')}>
        <div className={twMerge('flex flex-row items-center gap-2 px-3')}>
          <IconSuccess></IconSuccess>
          <span>{translations('perfectQuality')}</span>
        </div>
        <div className={twMerge('flex flex-row items-center gap-2 px-3')}>
          <IconPartialSuccess color='#CDCCFF'></IconPartialSuccess>
          <span>{translations('correctQuality')}</span>
        </div>
        <div className={twMerge('flex flex-row items-center gap-2 px-3')}>
          <IconFail></IconFail>
          <span>{translations('fails')}</span>
        </div>
      </div>
    );
  } else if (type === 'download') {
    color = ['#eebb45', '#7ccc98', '#41b6c4', '#225ea8'];
    if (isMobile()) {
      classLabelLegend = 'pt-3';
    }
    legendElt = (
      <div className='flex flex-col'>
        <div
          className='flex flex-row justify-between items-center cursor-pointer'
          onClick={() => setShowLegendHelp(!showLegendHelp)}
        >
          <div
            className={twMerge(
              'grid grid-cols-2 text-sl font-normal mt-2 w-full'
            )}
          >
            <div className={twMerge('flex flex-row items-center gap-2 px-0')}>
              <div
                className={twMerge('rounded-full w-2.5 h-2.5 bg-[#eebb45]')}
              ></div>
              <span>{translations('debit-inf-3')}</span>
            </div>
            <div className={twMerge('flex flex-row items-center gap-2 px-0')}>
              <div
                className={twMerge('rounded-full w-2.5 h-2.5 bg-[#7ccc98]')}
              ></div>
              <span className={classLabelLegend}>
                {translations('debit-in-3-8')}
              </span>
            </div>
            <div className={twMerge('flex flex-row items-center gap-2 px-0')}>
              <div
                className={twMerge('rounded-full w-2.5 h-2.5 bg-[#41b6c4]')}
              ></div>
              <span className={classLabelLegend}>
                {translations('debit-in-8-30')}
              </span>
            </div>
            <div className={twMerge('flex flex-row items-center gap-2 px-0')}>
              <div
                className={twMerge('rounded-full w-2.5 h-2.5 bg-[#225ea8]')}
              ></div>
              <span>{translations('debit-sup-30')}</span>
            </div>
          </div>
          <div className='pr-1'>
            <IconDown
              className={
                showLegendHelp
                  ? 'transform transition-transform duration-500 rotate-180'
                  : 'transform transition-transform duration-500'
              }
            />
          </div>
        </div>
        <div
          className={twMerge(
            'transition-grid-template-rows grid ',
            showLegendHelp ? 'grid-rows-1fr' : 'grid-rows-0fr'
          )}
        >
          <div className='overflow-hidden'>
            <p className='text-xs font-bold text-black mt-1'>
              {`${translations('resume-legend-help-title')} : `}
              <span className='text-xs font-medium text-gray-500'>
                {translations('resume-legend-help-description')}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  } else if (type === 'upload' || type === 'sms') {
    color = [colorSucces, colorEchec];
    legendElt = (
      <div className={twMerge('flex flex-row text-xs font-normal')}>
        <div className={twMerge('flex flex-row items-center gap-2 px-3')}>
          <IconSuccess></IconSuccess>
          <span>{translations('success')}</span>
        </div>
        <div className={twMerge('flex flex-row items-center gap-2 px-3')}>
          <IconFail></IconFail>
          <span>{translations('fails')}</span>
        </div>
      </div>
    );
  }
  return (
    <div>
      <ProgressbarComponent
        color={color}
        values={values}
        ispercent={false}
        iswithicon={false}
        width={414}
      ></ProgressbarComponent>
      {legendElt}
    </div>
  );
}
