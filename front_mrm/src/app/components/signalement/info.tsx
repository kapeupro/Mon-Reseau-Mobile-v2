import React, { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import { MoonLoader } from 'react-spinners';
import { twMerge } from 'tailwind-merge';

import BreadcrumbsComponent from '@/app/components/breadcrumbs';
import TitlePage from '@/app/components/titlePage';

import {
  useSignalementSubPagesStore,
  useSignalementStore,
} from '@/store/signalement';
import { usePageStore } from '@/store/store';
import {
  formatThousandSeparator,
  getDefaultColorOperator,
} from '@/utils/utils';

import Home from '@/assets/icons/home.svg';
import LeftArrow from '@/assets/icons/leftArrow.svg';
import Badge from '../badge';
import { getStatSignalement } from '@/service/territory';
import { isMobile } from '@/service/window';
import { useTerritoryStore } from '@/store/filter';

export default function InfoSignalement() {
  const { setSubPage } = useSignalementSubPagesStore();
  const { idHexa } = useSignalementStore();
  const translationsSignalement = useTranslations('signalement');
  const [bLoading, setBLoading] = useState(false);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      const { territory } = useTerritoryStore.getState();

      setBLoading(true);
      try {
        const resp = await getStatSignalement({
          type: 'detail',
          id: idHexa,
          entite: territory.dept,
        });
        setData(resp);
      } catch (error) {
        console.error("Une erreur s'est produite : ", error);
      }
      setBLoading(false);
    };

    fetchData();
  }, [idHexa]);

  if (bLoading || !idHexa) {
    return <Loading bLoading={bLoading} />;
  }

  const { data: aData } = data;

  return (
    <div>
      <Breadcrumbs />
      <div className='flex flex-row items-center gap-2 my-6'>
        <LeftArrow className='cursor-pointer' onClick={() => setSubPage('')} />
        <TitlePage
          text={translationsSignalement('infoPageBack')}
          underline={false}
          className='text-xl'
        />
      </div>
      <Resume total={getTotalSignalement(aData)} />
      <Statistic aData={aData} />
    </div>
  );
}

function Breadcrumbs() {
  const translationsSignalement = useTranslations('signalement');
  const { setSubPage } = useSignalementSubPagesStore();
  const { setPage } = usePageStore();

  const activeHomePage = () => {
    setPage('home');
    setSubPage('');
  };

  const activeMainPage = () => {
    setSubPage('');
  };

  const aItems = [
    {
      iconHome: <Home />,
      onClick: activeHomePage,
    },
    {
      text: translationsSignalement('infoPageBreadCrumbsAlert'),
      onClick: activeMainPage,
    },
    {
      text: '',
    },
  ];

  return <BreadcrumbsComponent items={aItems} />;
}

function Resume({ total }: Readonly<{ total: number }>) {
  const translationsSignalement = useTranslations('signalement');
  return (
    <div className='text-color-primary border rounded-lg p-2 flex space-x-6'>
      <div className='font-bold bg-stone-20 rounded-lg p-2 w-28 flex items-center justify-center text-xl text-secondary-text'>
        {formatThousandSeparator(total)}
      </div>
      <div className='font-medium text-sm leading-4 flex items-center justify-center'>
        {translationsSignalement('infoPageResume')}
      </div>
    </div>
  );
}

interface StatisticProps {
  aData: any[];
}
function Statistic({ aData }: Readonly<StatisticProps>) {
  if (!(Array.isArray(aData) && aData.length)) {
    return null;
  }

  const aOperatorStatistics = aData.map((dt: any) => (
    <OperatorStatistic key={dt.name} data={dt} />
  ));

  return <>{aOperatorStatistics}</>;
}

interface OperatorStatisticProps {
  data: any;
}
function OperatorStatistic({
  data: { operator, months, name, number, total },
}: Readonly<OperatorStatisticProps>) {
  const translationsSignalement = useTranslations('signalement');
  const translationsMonths = useTranslations('months');
  const hasSignalement = Boolean(total);
  const operatorColor = getDefaultColorOperator(Number(operator));
  const color = operatorColor
    ? {
        color: operatorColor,
        isHexaDecimal: true,
      }
    : { color: 'primary', isHexaDecimal: false };
  const isAll = name === 'all';
  const style: any = isAll ? {} : { backgroundColor: operatorColor };
  const maxValue = Math.max(...number);

  return (
    <div className='border rounded-lg p-4 font-medium text-color-primary text-sm mt-4'>
      <div className='text-sm space-x-4 flex items-center'>
        <Badge
          text={isAll ? translationsSignalement('statistic-all') : name}
          color={color}
          classname='px-2 py-1 rounded-lg align-middle'
          textColor={isAll ? 'white' : 'black'}
        />
        <span className='text-color-primary'>
          {hasSignalement ? (
            <>{`${formatThousandSeparator(
              total
            )}  ${translationsSignalement('statistic-report')}`}</>
          ) : (
            <>{translationsSignalement('no-reports')}</>
          )}
        </span>
      </div>
      {hasSignalement && (
        <div className='flex space-x-4'>
          <div
            className='text-center rotate-180'
            style={{
              writingMode: 'vertical-lr',
            }}
          >
            {translationsSignalement('reports-per-month')}
          </div>
          <div className='flex w-full justify-between mt-4'>
            {months.map((month: any, index: number) => {
              const valuePerMonth = number[index];
              return (
                <div className='flex flex-col items-center' key={month}>
                  <span>{valuePerMonth}</span>
                  <div className='flex flex-col flex-nowrap justify-end bg-gray-100 rounded-3xl w-2 h-32 my-1'>
                    <div
                      className={`w-2 rounded-3xl ${isAll ? 'bg-primary' : ''}`}
                      style={{
                        ...style,
                        height: `${(valuePerMonth / maxValue) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span>{translationsMonths(month)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function toLowerCase(paramsval: any) {
  return String(paramsval).toLowerCase();
}

function Loading({ bLoading = false }: Readonly<{ bLoading: boolean }>) {
  const bMobile = isMobile();

  return (
    <div
      className={twMerge(
        'flex  items-center justify-center pb-10',
        !bMobile && 'h-[calc(100vh-365px)]'
      )}
    >
      <MoonLoader color='#232253' loading={bLoading} size={150} />
    </div>
  );
}

function getTotalSignalement(aData: any) {
  if (!(Array.isArray(aData) && aData.length)) {
    return 0;
  }

  for (const dt of aData) {
    if (dt.name === 'all') {
      return dt.total;
    }
  }

  return 0;
}
