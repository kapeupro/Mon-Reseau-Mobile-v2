'use client';
import React from 'react';
import Link from 'next/link';

import Title from '@/app/components/title';
import Icon from '@/app/components/iconcmp';
import DropDownBlockComponent from '@/app/components/dropDownBlock';

import ArrowBack from '@/assets/icons/arrow_back.svg';

export default function DropDownBlock() {
  return (
    <div className='space-y-2'>
      <Link href='/doc'>
        <Icon icon={<ArrowBack />} />
      </Link>
      <DropDownBlockComponent
        header={
          <Title
            text='Test du dropDownBlock'
            className='text-md text-black pb-4'
            underline={false}
          />
        }
        separator={true}
      >
        <span className='bg-gray-200 p-5'>
          Contenu du dropdown block <br /> <br />
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Illum
          doloremque repellendus ad, ipsum repudiandae aliquid nihil porro
          maxime, labore in doloribus ipsa ea. Cum incidunt pariatur repellat
          dicta provident perspiciatis.
        </span>
      </DropDownBlockComponent>
    </div>
  );
}
