import React from 'react';

import { useTranslations } from 'next-intl';

import DropDownBlock from '@/app/components/dropDownBlock';

import FullNetLevelSquare from '@/assets/icons/fullNetLevelSquare.svg';
import MiddleNetLevelSquare from '@/assets/icons/middleNetLevelSquare.svg';
import MinNetLevelSquare from '@/assets/icons/minNetLevelSquare.svg';
import NoneNetLevelSquare from '@/assets/icons/noneNetLevelSquare.svg';

import FullNetLevelTriangleForLegend from '@/assets/icons/fullNetLevelTriangleForLegend.svg';
import MiddleNetLevelTriangleForLegend from '@/assets/icons/middleNetLevelTriangleForLegend.svg';
import MinNetLevelTriangleForLegend from '@/assets/icons/minNetLevelTriangleForLegend.svg';
import NoneNetLevelTriangleForLegend from '@/assets/icons/noneNetLevelTriangleForLegend.svg';

import { useOperatorsStore } from '@/store/operators';

interface NetworkLevelLegendProps {
  type?: 'rectangle' | 'triangle';
}

export default function NetworkLevelLegend({
  type = 'rectangle',
}: NetworkLevelLegendProps) {
  const couvertureTranslation = useTranslations('couverture');
  const { date } = useOperatorsStore();
  const date_couverture = date.find(
    (date: any) => date.page === 'couverture-theorique'
  );

  const classNameContentDescriptionLegende =
    'text-xs font-medium text-gray-500';
  const classNameContentTitleLegende = 'text-xs font-bold text-black';
  return (
    <>
      {type === 'rectangle' ? (
        <div className='flex flex-col gap-1 font-[600] text-info'>
          <div className='flex flex-row items-center gap-2'>
            <FullNetLevelSquare />
            <span className='text-sl '>
              {'> 90% de Très Bonne Couverture (TBC)'}
            </span>
          </div>
          <div className='flex flex-row items-center gap-2'>
            <MiddleNetLevelSquare />
            <span className='text-sl'> {'Entre 50% et 90% de TBC'}</span>
          </div>
          <div className='flex flex-row items-center gap-2'>
            <MinNetLevelSquare />
            <span className='text-sl'> {'Entre 0% et 50% de TBC'}</span>
          </div>
          <div className='flex flex-row items-center gap-2'>
            <NoneNetLevelSquare />
            <span className='text-sl'> {'0% de TBC'}</span>
          </div>
        </div>
      ) : (
        <DropDownBlock
          header={
            <div className='flex flex-col gap-2  font-[600] text-info'>
              <div className='flex flex-row gap-4'>
                <div className='flex flex-row items-center gap-2'>
                  <FullNetLevelTriangleForLegend />
                  <span className='text-sl'> {'Très bonne couverture'}</span>
                </div>
                <div className='flex flex-row items-center gap-2'>
                  <MiddleNetLevelTriangleForLegend />
                  <span className='text-sl'> {'Bonne couverture'}</span>
                </div>
              </div>
              <div className='flex flex-row gap-4'>
                <div className='flex flex-row items-center gap-2'>
                  <MinNetLevelTriangleForLegend />
                  <span className='text-sl'> {'Couverture limitée'}</span>
                </div>
                <div className='flex flex-row items-center gap-2'>
                  <NoneNetLevelTriangleForLegend />
                  <span className='text-sl'> {'Zone non couverte'}</span>
                </div>
              </div>
            </div>
          }
        >
          <hr className=' mt-3' />
          <div className='flex flex-col pt-2 gap-4 text-gray-500'>
            <div className='flex flex-col'>
              <p className={classNameContentTitleLegende}>
                {couvertureTranslation('veryGoodCoverage')}
                <span className={classNameContentDescriptionLegende}>
                  {' '}
                  {couvertureTranslation('veryGoodCoverageDescription')}
                </span>
              </p>
            </div>
            <div className='flex flex-col'>
              <p className={classNameContentTitleLegende}>
                {couvertureTranslation('goodCoverage')}
                <span className={classNameContentDescriptionLegende}>
                  {' '}
                  {couvertureTranslation('goodCoverageDescription')}
                </span>
              </p>
            </div>
            <div className='flex flex-col'>
              <p className={classNameContentTitleLegende}>
                {couvertureTranslation('limitedCoverage')}
                <span className={classNameContentDescriptionLegende}>
                  {' '}
                  {couvertureTranslation('limitedCoverageDescription')}
                </span>
              </p>
            </div>
          </div>
        </DropDownBlock>
      )}
      <span className='text-sl  font-[600] text-info'>
        {' '}
        {'Données Arcep du '}
        {date_couverture.date_build_start}
      </span>
    </>
  );
}
