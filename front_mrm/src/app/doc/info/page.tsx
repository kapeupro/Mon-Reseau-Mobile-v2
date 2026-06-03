'use client';
import React from 'react';
import Link from 'next/link';

import InfoComponent from '@/app/components/info';
import Icon from '@/app/components/iconcmp';
import MoreInfo from '@/app/components/moreInfo';

import ArrowBack from '@/assets/icons/arrow_back.svg';
import Buildings from '@/assets/icons/buildings.png';

export default function Info() {
  return (
    <div className='space-y-2 space-x-2'>
      <Link href='/doc'>
        <Icon icon={<ArrowBack />} />
      </Link>
      <InfoComponent icon={Buildings} title='Vous-êtes en zone dense'>
        Le débit moyen constaté pour ce type de zone est de 38 Mbit/s
      </InfoComponent>
      <br />
      <InfoComponent icon={Buildings} title='Vous-êtes en zone dense' />
      <br />
      <InfoComponent icon={Buildings}>
        Le débit moyen constaté pour ce type de zone est de 38 Mbit/s
      </InfoComponent>
      <br />
      <InfoComponent title='Vous-êtes en zone dense' /> <br />
      <InfoComponent>
        Le débit moyen constaté pour ce type de zone est de 38 Mbit/s
      </InfoComponent>
      <InfoComponent>
        <div className='flex flex-col gap-1.5'>
          <span className='text-xs leading-4'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore
            deleniti animi laudantium quaerat nobis sed doloribus assumenda
            minus, sint perspiciatis, quae dolorum magnam eos deserunt tempora
            aperiam vitae perferendis suscipit!
          </span>
          <MoreInfo>
            <span className='text-xs leading-4'>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sapiente
              sit eum accusamus. Ad commodi saepe et quidem maxime officia!
              Nesciunt sit delectus eveniet quo laborum. Eos eveniet laborum
              porro reprehenderit. Lorem ipsum dolor sit amet, consectetur
              adipisicing elit. Sunt vero tempora unde sequi. Voluptate quasi
              architecto, iure qui commodi vel non similique? Ea quaerat rerum
              molestiae impedit provident. Tenetur, harum? Lorem ipsum dolor sit
              amet consectetur adipisicing elit. A accusamus tempora provident
              saepe facilis architecto quam nisi illum, fuga doloremque sit
              animi nesciunt quas mollitia. Laboriosam libero nemo delectus rem.
            </span>
          </MoreInfo>
        </div>
      </InfoComponent>
    </div>
  );
}
