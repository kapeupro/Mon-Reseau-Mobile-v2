import React from 'react';

import { useTranslations } from 'next-intl';
import Select, { components } from 'react-select';

import IconRight from '@/assets/icons/iconRight.svg';

import Icon from '@/app/components/iconcmp';
import { LIST_LANGUAGE } from '@/app/constant/constant';
import { useLanguageStore } from '@/store/translation';
import { twMerge } from 'tailwind-merge';

const Option = ({ innerProps, label, data }: any) => {
  return (
    <div {...innerProps}>
      <div className='flex bg-stone-20 pl-3 cursor-pointer'>
        <Icon icon={data.icon} className='mr-4' />
        {label}
      </div>
    </div>
  );
};

const DropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <Icon icon={<IconRight className='text-primary-text' />} />
    </components.DropdownIndicator>
  );
};

const SingleValue = (props: any) => {
  const { data } = props;
  return (
    <components.SingleValue {...props} className='flex cursor-pointer'>
      <Icon icon={data.icon} className={twMerge('mr-4')} />
      <span className={twMerge('text-primary-text', data.classText)}>
        {data.label}
      </span>
    </components.SingleValue>
  );
};

const IndicatorSeparator = (props: any) => {
  return null;
};

const Menu = (props: any) => {
  return (
    <React.Fragment>
      <components.Menu {...props}>
        <div className='bg-stone-20 text-bg-secondary-text'>
          {props.children}
        </div>
      </components.Menu>
    </React.Fragment>
  );
};

const styles = {
  control: (provided: any) => ({
    ...provided,
    border: 'none',
    boxShadow: 'none',
    backgroundColor: 'transparent',
    minHeight: '30px',
    height: '30px',
    width: '160px',
  }),
};

interface LanguageProps {
  classIcon?: string;
  classText?: string;
}

export default function Language({
  classIcon = '',
  classText = '',
}: LanguageProps) {
  const { language, setLanguage } = useLanguageStore();
  const translations = useTranslations('footer.language');
  const options = LIST_LANGUAGE.map((dt) => ({
    ...dt,
    label: translations(dt.value),
    classIcon: classIcon,
    classText: classText,
  }));

  return (
    <>
      <Select
        options={options}
        components={{
          Option,
          DropdownIndicator,
          SingleValue,
          IndicatorSeparator,
          Menu,
        }}
        value={options.filter((dt) => dt.value === language)}
        onChange={(dt) => setLanguage(dt!.value)}
        isClearable={false}
        isSearchable={false}
        styles={styles}
        isMulti={false}
      />
    </>
  );
}
