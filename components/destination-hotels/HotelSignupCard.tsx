"use client";

import dynamic from "next/dynamic";
import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";

const NewsletterModal = dynamic(() => import("@/components/NewsletterModal"), {
  ssr: false,
});

export default function HotelSignupCard({
  destinationName,
}: {
  destinationName: string;
}) {
  const [open, setOpen] = useState(false);
  const [shouldRenderModal, setShouldRenderModal] = useState(false);

  const openSignup = () => {
    setShouldRenderModal(true);
    setOpen(true);
  };

  return (
    <>
      {shouldRenderModal ? (
        <NewsletterModal open={open} onClose={() => setOpen(false)} />
      ) : null}

      <section className="rounded-[8px] bg-[#111111] p-5 text-white shadow-sm">
        <Mail className="h-6 w-6 text-[#e8b5d3]" aria-hidden="true" />
        <h2 className="mt-3 text-[18px] font-semibold">
          Get {destinationName} hotel offers
        </h2>
        <p className="mt-2 text-[12px] leading-5 text-white/75">
          Sign up for exclusive weekly offers, insider savings and handpicked
          luxury hotel deals.
        </p>
        <button
          type="button"
          onClick={openSignup}
          className="mt-4 inline-flex items-center gap-1.5 rounded-[8px] bg-white px-3 py-2 text-[12px] font-semibold text-[#111111] transition-colors hover:bg-[#FBE8F4] hover:text-pml-primary focus:outline-none focus:ring-2 focus:ring-white"
        >
          Sign up &amp; save
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </section>
    </>
  );
}
