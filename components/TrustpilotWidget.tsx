"use client";

import { useEffect } from "react";
import Script from "next/script";

type TrustpilotApi = {
  loadFromElement: (element: Element, forceReload?: boolean) => void;
};

export default function TrustpilotWidget({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  useEffect(() => {
    const trustpilot = (window as Window & { Trustpilot?: TrustpilotApi })
      .Trustpilot;
    const widgetElement = document.getElementsByClassName("trustpilot-widget")[0];

    if (trustpilot && widgetElement instanceof Element) {
      trustpilot.loadFromElement(widgetElement, true);
    }
  }, []);

  return (
    <div className={embedded ? "w-full" : "flex items-center justify-center border-t border-[#EDD5E4] py-2.5 transition-opacity hover:opacity-80"}>
      <Script
        src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
        strategy="lazyOnload"
      />

      <div
        className="trustpilot-widget"
        data-locale="en-US"
        data-template-id="53aa8807dec7e10d38f59f32"
        data-businessunit-id="5b7f1be007c35b000152f3d6"
        data-style-height={embedded ? "90px" : "150px"}
        data-style-width="100%"
        data-token="65e43be7-c410-4acb-9912-b226c1623af8"
      >
        <a
          href="https://www.trustpilot.com/review/planmytour.co.uk"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* Trustpilot */}
        </a>
      </div>
    </div>
  );
}