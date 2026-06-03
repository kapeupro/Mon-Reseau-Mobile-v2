'use client';
import React from 'react';

export const UseViewPort = () => {
  const [width, setWidth] = React.useState<number>();

  React.useEffect(() => {
    const handleWindowResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleWindowResize);
    handleWindowResize();
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  // Return the width so we can use it in our components
  return { width };
};

export const isMobile = () => {
  const { width } = UseViewPort();
  const breakpoint = 1025;
  if (width && width > breakpoint) {
    return false;
  }
  return true;
};

export const getWidthWindow = () => {
  const { width } = UseViewPort();
  if (!width) {
    return 453;
  } else {
    return width;
  }
};

export const resetScroll = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
  const scrollableElement = document.querySelector('.overflow-scroll');
  if (scrollableElement) {
    scrollableElement.scrollTo(0, 0);
  }
};
