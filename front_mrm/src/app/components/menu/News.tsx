import React, { useState, useRef, useEffect } from 'react';

import * as RssToJson from 'rss-to-json';
import MoonLoader from 'react-spinners/MoonLoader';
import { useTranslations } from 'next-intl';

import Title from '@/app/components/title';
import { twMerge } from 'tailwind-merge';
import Info from '../info';
import Icon from '@/app/components/iconcmp';
import IconCaretLeft from '@/assets/icons/caret_left.svg';
import { isMobile } from '@/service/window';
import { useNewsStore } from '@/store/news';
import DOMPurify from 'dompurify';

export default function News() {
  const { aData, setData } = useNewsStore();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const [bLoading, setLoading] = useState(false);
  const translationHome = useTranslations('home');
  const IsMobile = isMobile();

  const handleScroll = (direction: string) => {
    const container = containerRef.current;
    if (!container) return;

    const step = container.clientWidth;
    let newScrollPosition = scrollPosition;

    if (direction === 'left') {
      newScrollPosition = Math.max(scrollPosition - step, 0);
    } else if (direction === 'right') {
      newScrollPosition = Math.min(
        scrollPosition + step,
        container.scrollWidth - container.clientWidth
      );
    }

    container.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth',
    });
    setScrollPosition(newScrollPosition);
  };

  const showIconScrollRight = () => {
    const container = containerRef.current;
    if (!container) return false;

    if (
      scrollPosition === 0 &&
      container.clientWidth === container.scrollWidth &&
      aData.length >= 2
    ) {
      return true;
    }
    return scrollPosition + container.clientWidth < container.scrollWidth;
  };

  useEffect(() => {
    if (aData.length) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      let newsData: any = [];

      try {
        const resp = await RssToJson.Parse(process.env.NEXT_PUBLIC_NEWS_URL!);

        if (Array.isArray(resp.items)) {
          newsData = resp.items;
        } else {
          newsData = [];
        }
      } catch (error) {
        console.error(error);
      }

      setData(newsData);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className='bg-white px-5 pt-5 flex flex-col w-full'>
      <Title
        className={twMerge('text-color-primary text-xl')}
        text={translationHome('arcepNews')}
        underline={false}
      />
      <div
        className=' z-5 flex flex-nowrap justify-start items-center overflow-x-auto gap-3 max-w-full'
        ref={containerRef}
      >
        {bLoading ? (
          <div className='flex justify-center grow'>
            <MoonLoader color='#232253' loading={bLoading} size={50} />
          </div>
        ) : (
          <>
            {scrollPosition > 0 && !IsMobile && (
              <Icon
                icon={<IconCaretLeft />}
                width={20}
                shadow
                onClick={() => handleScroll('left')}
                className='bg-white absolute z-10 left-1  opacity-100 ml-2.5 shadow-scroll-left'
              />
            )}
            {aData.map((dt) => (
              <div
                onClick={() => window.open(dt.link, '_blank')}
                key={dt.id}
                className='cursor-pointer'
              >
                <Info
                  className='rounded-2xl my-4 text-color-primary  mx-0'
                  title={formatDate(dt.published)}
                  contentClassName='mx-0 ml-5'
                  iconLinkClassName='my-0 mx-4 items-start'
                  titleClassName={'text-red-500 text-base font-bold mb-2 mx-0'}
                  IsIconLink={false}
                  contenairClassName='w-80 h-28'
                  link={dt.link}
                >
                  <span
                    className='text-sm  text-bg-secondary-text'
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(dt.description ?? ''),
                    }}
                  />
                </Info>
              </div>
            ))}
            {showIconScrollRight() && !IsMobile && (
              <Icon
                icon={<IconCaretLeft />}
                width={20}
                shadow
                onClick={() => handleScroll('right')}
                className='bg-white transform rotate-180 absolute z-10 right-1 opacity-100 mr-2.5 shadow-scroll-right'
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function formatDate(timestamp: any) {
  const oDate = new Date(timestamp);
  if (isNaN(oDate.getTime())) {
    return '';
  }

  const aStrMonth = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ];

  return `${oDate.getDate()} ${
    aStrMonth[oDate.getMonth()]
  } ${oDate.getFullYear()}`;
}
