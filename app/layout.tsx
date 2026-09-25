import "./globals.css";
import Script from "next/script";
import { Inter } from "next/font/google";
import { MainNav } from "@/components/layout/main-nav";
import { Montserrat } from 'next/font/google'
import Footer from "@/components/layout/Footer";
import ThirdPartyScripts from "@/components/ThirdPartyScripts";
import TawkToProvider from "@/components/TawkToProvider";
import UtmPhoneServer from "@/components/utm/UtmPhoneServer";
import PromoModal from "@/components/add-popup/pop-up";
import GlobalConnectMenu from "@/components/multi-centre/GlobalConnectMenu";
import { RouteWhatsAppProvider } from "@/components/multi-centre/RouteWhatsAppContext";
import AmiWidgetLoader from "@/components/AmiWidgetLoader";
import ConsentModeDefault from "@/components/ConsentModeDefault";
import ConsentModeBridge from "@/components/ConsentModeBridge";

const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300','400','500','600','700'],
  variable: '--font-montserrat',   // 👈 important
  display: 'swap',          // ← add this
  adjustFontFallback: true,
})

export const metadata = {
  title: {
    default: "PlanMyLuxe",
    template: "%s",
  },
  metadataBase: new URL('https://planmyluxe.co.uk'),
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" suppressHydrationWarning className={montserrat.variable}>
      <head>
        <link rel="alternate" hrefLang="en-GB" href="https://planmyluxe.co.uk" />
      </head>
      <body className={`${montserrat.className} bg-white `}>
        <ConsentModeDefault />
        <ConsentModeBridge />
        <UtmPhoneServer>
          <RouteWhatsAppProvider>
            <MainNav />
            <div className="pt-[var(--main-nav-height)]">
              {children}
              <Footer />
            </div>
            {/* <GlobalConnectMenu /> */}
            {/* <div className="block">
              <AmiWidgetLoader />
            </div> */}
          </RouteWhatsAppProvider>
        </UtmPhoneServer>
        <PromoModal />
        {/* <TawkToProvider /> */}
        {/* <ThirdPartyScripts /> */}
        {/* <Script
          strategy="afterInteractive"
          data-website-id="0e597fc2-ba0d-4a6e-b6a1-a3167934426a"
          data-domain="planmyluxe.co.uk"
          src="https://pmt-monitoring-analytics-ivory.vercel.app/analytics.js"
        /> */}
        {/* <script id="cookieyes" type="text/javascript" src="https://cdn-cookieyes.com/client_data/e75692a20ed359ff7a6eccfe387ce163/script.js"></script> */}
      </body>
    </html>
  );
}
