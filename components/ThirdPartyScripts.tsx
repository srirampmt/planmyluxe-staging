'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import GoogleTagManager from '@/components/GoogleTagManager';
import ResponseIQProvider from '@/components/ResponseIQProvider';

const HOTEL_PATH_PREFIX = '/hotels/';
const MULTI_CENTRE_PATH_PREFIX = '/multi-centre/';

export default function ThirdPartyScripts() {
  const pathname = usePathname();

  // Check if it's a deal page (hotel or multi-centre) that needs delayed GTM loading.
  const isDealPage = useMemo(() => {
    if (!pathname) return null;
    return (
      pathname === '/hotels' || 
      pathname.startsWith(HOTEL_PATH_PREFIX) ||
      pathname === '/multi-centre' ||
      pathname.startsWith(MULTI_CENTRE_PATH_PREFIX)
    );
  }, [pathname]);

  // Default to disabled until we know the route.
  // This prevents mounting scripts immediately on deal pages during the first render.
  const [gtmEnabled, setGtmEnabled] = useState(false);

  useEffect(() => {
    if (isDealPage === null) return;

    // Non-deal pages: enable GTM immediately.
    if (!isDealPage) {
      setGtmEnabled(true);
      return;
    }

    // Deal page (hotel or multi-centre): delay GTM so it does not block LCP/TBT.
    setGtmEnabled(false);

    let cancelled = false;
    const enable = () => {
      if (cancelled) return;
      setGtmEnabled(true);
    };

    // Use a fixed delay (no requestIdleCallback) so GTM definitely does not load
    // during the critical rendering window.
    const timeout = window.setTimeout(enable, 6000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [isDealPage]);

  return (
    <>
      {gtmEnabled ? <GoogleTagManager gtmId="GTM-NSW36DKM" /> : null}
      <ResponseIQProvider />
    </>
  );
}