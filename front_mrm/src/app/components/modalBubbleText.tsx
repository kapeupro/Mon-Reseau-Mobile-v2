import React, { useEffect, useState } from 'react';
import { isMobile } from '@/service/window';
import { twMerge } from 'tailwind-merge';
import IconX from '@/assets/icons/x-lg.svg';
import IconDefault from '@/assets/icons/arcep.png';
import Icon from './iconcmp';

interface ModalProps {
  title?: string;
  description?: string;
  onClose?: () => void;
  children?: React.ReactNode;
  image?: React.ReactNode;
  className?: string;
}

export default function ModalBubbleText(props: ModalProps) {
  const {
    children,
    title = '',
    description = '',
    image = <Icon icon={IconDefault} width={250} />,
    className = '',
  } = props;
  const IsMobile = isMobile();
  const [isModalOpen, setModalOpen] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  const descriptionLines = description.split('\n');

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    setTimeout(() => {
      setAnimationClass(isModalOpen ? 'translate-y-0' : 'translate-y-full');
    }, 30);
  }, [isModalOpen]);

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      if (isModalOpen) {
        event.stopPropagation();
      }
    };

    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  return (
    <div className={twMerge('mb-8', className)}>
      <div onClick={toggleModal}>{children}</div>
      {isModalOpen && (
        <>
          {animationClass && (
            <div
              className={`fixed overflow-hidden duration-500 top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 ${animationClass}`}
              onClick={closeModal}
            >
              <div
                className={`fixed -bottom-4 left-0 right-0  bg-white rounded-2xl  h-[85%]  pt-5 pb-4 ${
                  !IsMobile ? 'w-120' : ''
                } z-40  `}
              >
                <div className='bg-primary pt-1.5 w-1/3 m-auto rounded-lg'></div>
                <IconX
                  onClick={closeModal}
                  className='absolute top-7 right-4 w-7'
                ></IconX>
                <div className='flex pt-8 justify-center items-center '>
                  {image}
                </div>
                <div className='m-auto rounded-lg p-8 h-full'>
                  <h2 className='font-bold text-color-primary text-lg mb-4'>
                    {title}
                  </h2>
                  <div className='overflow-y-auto h-[calc(100vh-524px)] '>
                    {descriptionLines.map((line, index) => (
                      <p
                        className='font-medium text-sm pb-3 leading-snug'
                        key={index}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div
            onClick={closeModal}
            className={` top-0 left-0 right-0 bottom-0 h-full w-full bg-black fixed opacity-50 z-[10]`}
          ></div>
        </>
      )}
    </div>
  );
}
