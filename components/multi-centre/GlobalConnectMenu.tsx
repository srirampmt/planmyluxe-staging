"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import McMobileConnectMenu from "@/components/multi-centre/McMobileConnectMenu";

const HOTELS_SLUG_ROUTE = /^\/hotels\/[^/]+\/?$/;
const MULTI_CENTRE_SLUG_ROUTE = /^\/multi-centre\/[^/]+\/?$/;
const HOTELS_SLUG_CAPTURE = /^\/hotels\/([^/]+)\/?$/;
const MULTI_CENTRE_SLUG_CAPTURE = /^\/multi-centre\/([^/]+)\/?$/;

export default function GlobalConnectMenu() {
  const pathname = usePathname();
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobileViewport(media.matches);

    onChange();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  const isMobileExcludedRoute =
    HOTELS_SLUG_ROUTE.test(pathname) || MULTI_CENTRE_SLUG_ROUTE.test(pathname);
  const routeSlug =
    pathname.match(HOTELS_SLUG_CAPTURE)?.[1] ??
    pathname.match(MULTI_CENTRE_SLUG_CAPTURE)?.[1] ??
    undefined;

  const shouldHideGlobalMenu = isMobileExcludedRoute && isMobileViewport;

  if (shouldHideGlobalMenu) {
    return null;
  }

  return (
    <div>
      <McMobileConnectMenu anchor="right" globalMode slug={routeSlug} />
    </div>
  );
}
