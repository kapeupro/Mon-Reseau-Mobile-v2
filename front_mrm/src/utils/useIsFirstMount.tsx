import { useRef, useEffect } from 'react';

export const useIsFirstMount = () => {
  const isFirstMountRef = useRef(true);
  useEffect(() => {
    isFirstMountRef.current = false;
  }, []);
  return isFirstMountRef.current;
};
