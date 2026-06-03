import React from 'react';

import AntennesFullPage from '@/app/components/antenne/index';

import Support from '@/app/components/pages/subPages/antennes/support';

import { useAntenneSubPagesStore } from '@/store/antenne';

import Site from './subPages/antennes/site';

export default function Antennes() {
  const { subPage } = useAntenneSubPagesStore();

  return (
    <div className='pt-12 px-5'>
      {subPage === '' && <AntennesFullPage />}
      {subPage === 'support_info' && <Support />}
      {subPage === 'support_site' && <Site />}
    </div>
  );
}
