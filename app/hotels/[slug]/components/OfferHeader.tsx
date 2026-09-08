import React from "react";
import { StarRating, LocationPinIcon } from "./icons";
import { MapPin } from "lucide-react";

interface OfferHeaderProps {
  location?: string;
  hotelName?: string;
  rating?: number;
  description?: string;
  offerMode?: boolean;
}

export default function OfferHeader({
  location,
  hotelName,
  rating,
  description,
  offerMode,
}: OfferHeaderProps) {
  if (!location && !hotelName && typeof rating !== "number" && !description) return null;

  return (
    <div className="w-full max-w-[840px] font-['Montserrat'] text-[#595858] my-4 md:my-4">
      {offerMode ? (
        <>
          {(typeof rating === "number" || !!location) && (
            <div className="mb-1 flex flex-wrap items-center gap-[6px]">
              {typeof rating === "number" && <StarRating rating={rating} />}
              {!!location && (
                <div className="flex items-center gap-[6px] text-[13px] font-semibold uppercase leading-[24px] text-[#595858] md:text-[14px] md:leading-[28px]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#595858]">
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {location}
                </div>
              )}
            </div>
          )}

          {!!hotelName && (
            <h1 className="text-pml-primary mb-[2px] text-[24px] font-extrabold leading-[30px] tracking-tight text-[#242F40] md:text-[30px] md:leading-[38px]">
              {hotelName}
            </h1>
          )}
        </>
      ) : (
        // <h2 className="mb-[2px] text-[22px] font-semibold leading-[30px] md:text-[24px] md:leading-[36px] text-[#CB2187]">
        //   Best Endorsement by Guests
        // </h2>
        null
      )}

      {/* {!!description && (
        <p className="mt-1 text-[14px] font-medium leading-[22px] text-[#595858] md:text-[16px] md:leading-[24px]">
          {description}
        </p>
      )} */}
    </div>
  );
}
