import Script from "next/script";

export default function ConsentModeDefault() {
  return (
    <Script id="consent-mode-default" strategy="beforeInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){ dataLayer.push(arguments); }
        // Per explicit product decision: all signals default to granted regardless
        // of visitor choice (see ConsentModeBridge.tsx for the same decision on update).
        gtag('consent', 'default', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
          analytics_storage: 'granted'
        });
      `}
    </Script>
  );
}
