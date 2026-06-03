import { usePathname } from 'next/navigation';

export const useFormatPathname = () => {
  let pathname = usePathname();
  pathname = pathname.trim();
  return pathname !== '/' ? pathname.substring(1) : pathname;
};
