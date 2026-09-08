"use client";
 
import Script from "next/script";
 
declare global {
  interface Window {
    __ami_widget_loaded__?: boolean;
  }
}
 
export default function AmiWidgetLoader() {
  // Prevent duplicate mounting across route navigation
  if (typeof window !== "undefined" && window.__ami_widget_loaded__) {
    return null;
  }
  return (
    <>
      <Script
        id="ami-widget-planmyluxe"
        src="https://clients.meetami.ai/planmyluxe/planmyluxe.js"
        data-ami-client="planmyluxe"
        strategy="lazyOnload"
      />
      <Script
        id="amsaw"
        src="https://sw.meetami.ai/loader.js?k=tAoQoJlLxUV1"
        strategy="lazyOnload"
      />
    </>
  );
}


