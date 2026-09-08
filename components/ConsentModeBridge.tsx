"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function grantAllConsent() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer!.push(arguments); };
  window.gtag("consent", "update", {
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
    analytics_storage: "granted",
  });
}

export default function ConsentModeBridge() {
  useEffect(() => {
    // Fires on both "accept" and "reject" in the CookieYes banner — per the
    // confirmed decision, both branches grant all four signals.
    window.addEventListener("cookieyes_consent_update", grantAllConsent);
    return () => window.removeEventListener("cookieyes_consent_update", grantAllConsent);
  }, []);
  return null;
}
