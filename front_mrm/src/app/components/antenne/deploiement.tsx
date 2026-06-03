import React from 'react';

import Select, { components } from 'react-select';

import Title from '@/app/components/title';
import ModalBubbleText from '@/app/components/modalBubbleText';
import Help from '@/app/components/help';
import { useDispositifStore } from '@/store/antenne';
import { LIST_DEPLOIEMENT } from '@/app/constant/antennes';
import { useTranslations } from 'next-intl';
import IconZonesHelp from '@/assets/icons/icon_zone_help.svg';
import Icon from '../iconcmp';

const IndicatorSeparator = (props: any) => {
  return null;
};

const SingleValue = (props: any) => {
  const { data } = props;
  const antenneTranslations = useTranslations('antenne');
  return (
    <components.SingleValue {...props}>
      <span className='text-color-primary text-[13px] font-semibold'>
        {antenneTranslations(data.label)}
      </span>
    </components.SingleValue>
  );
};

const styles = {
  control: (provided: any) => ({
    ...provided,
    minHeight: '50px',
    height: '50px',
    borderRadius: '8px',
    borderColor: '#D0D0E7',
  }),
};

export default function Deploiement() {
  const { dispositif, setDispositif } = useDispositifStore();
  const translationsZone = useTranslations('whatIsThis.zone');
  const zoneTranslation = useTranslations('zone');
  const antenneTranslations = useTranslations('antenne');

  const optionLabels = LIST_DEPLOIEMENT.map((option: any) => ({
    ...option,
    label: antenneTranslations(option.label),
  }));

  return (
    <>
      <Title
        text={antenneTranslations('planOfDeployment')}
        underline={false}
        className='text-base mb-2'
      />
      <ModalBubbleText
        title={translationsZone('title')}
        image={<IconZonesHelp className='h-60 w-60' />}
        description={translationsZone('description')}
      >
        <Help text={zoneTranslation('title')} />
      </ModalBubbleText>
      <div className='mb-6' data-test='antennas-program-filter'>
        <Select
          components={{
            IndicatorSeparator,
            SingleValue,
          }}
          options={optionLabels}
          value={LIST_DEPLOIEMENT.filter((dt) => dt.value === dispositif)}
          onChange={(dt) => setDispositif(dt!.value)}
          isClearable={false}
          isSearchable={false}
          isMulti={false}
          styles={styles}
        />
      </div>
    </>
  );
}
