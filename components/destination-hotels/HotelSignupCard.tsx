"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";

const NewsletterModal = dynamic(() => import("@/components/NewsletterModal"), {
  ssr: false,
});

const SIGNUP_IMAGE =
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=700&q=80";

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

      <section className="overflow-hidden rounded-[8px] bg-[#111111] text-white shadow-sm">
        <div className="relative h-[170px]">
          <Image
            src={SIGNUP_IMAGE}
            alt=""
            fill
            sizes="300px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/30 to-transparent" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-pml-primary">
            <Mail className="h-3 w-3" aria-hidden="true" />
            Members only
          </span>
        </div>
        <div className="relative -mt-6 p-5 pt-0">
          <h2 className="text-[19px] font-semibold leading-tight">
            Get {destinationName} hotel offers
          </h2>
          <p className="mt-2 text-[12px] leading-5 text-white/75">
            Sign up for exclusive weekly offers, insider savings and handpicked
            luxury hotel deals.
          </p>
          <button
            type="button"
            onClick={openSignup}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-[8px] bg-pml-primary px-3 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#a81970] focus:outline-none focus:ring-2 focus:ring-white"
          >
            Sign up &amp; save
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </section>
    </>
  );
}
