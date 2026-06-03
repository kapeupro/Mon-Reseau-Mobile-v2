'use client';
import React from 'react';
import Link from 'next/link';

import Icon from '@/app/components/iconcmp';
import BreadcrumbsComponent from '@/app/components/breadcrumbs';

import ArrowBack from '@/assets/icons/arrow_back.svg';
import Home from '@/assets/icons/home.svg';

export default function Help() {
  const breadcrumbItems = [
    { iconHome: <Home />, onClick: () => alert('Home clicked') },
    { text: 'Breadcrumb 1', href: '#' },
    { text: 'Breadcrumb 2', href: '#' },
    { text: 'Breadcrumb 3', href: '#' },
    { text: 'Breadcrumb 4', href: '#' },
    { text: 'Breadcrumb 5', href: '#' },
    { text: 'Breadcrumb 6', href: '#' },
  ];

  return (
    <div className='space-y-2 space-x-2'>
      <Link href='/doc'>
        <Icon icon={<ArrowBack />} />
      </Link>
      <BreadcrumbsComponent items={breadcrumbItems} />
    </div>
  );
}
