//@ts-nocheck
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // if (window._paq) {
    //     window._paq.push(["setCustomUrl", `?${searchParams.toString()}`])
    //     window._paq.push(["trackPageView"])
    // }
  }, [pathname, searchParams]);

  return null;
}
