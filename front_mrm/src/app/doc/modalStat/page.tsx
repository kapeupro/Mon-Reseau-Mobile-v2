'use client';
import React, { useState } from 'react';
import Link from 'next/link';

import ModalStatComponent from '@/app/components/modalStat';
import Icon from '@/app/components/iconcmp';

import ArrowBack from '@/assets/icons/arrow_back.svg';

export default function ModalStat() {
  const [showModal, setShowModal] = useState(false);

  const onShowModal = () => {
    setShowModal(!showModal);
  };

  return (
    <div className='space-y-2 space-x-2'>
      <Link href='/doc'>
        <Icon icon={<ArrowBack />} />
      </Link>
      <button
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded  transition duration-300 ease-in-out'
        onClick={onShowModal}
      >
        Show modal
      </button>
      {/* <ModalStatComponent
                region="Seine Maritime"
                show={showModal}
                type="modal"
                onClose={() => setShowModal(false)}
            /> */}
      {/* <ModalStatComponent region="Seine Maritime" type="normal" /> */}
    </div>
  );
}
