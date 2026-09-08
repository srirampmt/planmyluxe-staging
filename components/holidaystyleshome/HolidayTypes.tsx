"use client";
 
import Link from "next/link";
 
interface CMSHolidayType {
  id: number;
  name: string;
  slug: string;
  card_image: string;
  card_subtitle: string;
}
 
export default function HolidayTypes({
  title,
  holidays,
}: {
  title?: string;
  holidays?: CMSHolidayType[];
}) {
  if (!holidays || holidays.length === 0) return null;
 
  return (
    <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-white font-['Montserrat']">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-4 md:py-16 lg:py-20">
        <div className="w-full max-w-[1280px] mx-auto">
          {/* (OPTIONAL) Title — only if provided */}
          {title && (
            <h2 className="text-[#4c4c4c] text-[24px] md:text-[38px] font-semibold mb-6">
              {title}
            </h2>
          )}
 
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {holidays.map((holiday) => (
              <Link
                key={holiday.id}
                href={`/holiday-styles/${holiday.slug}`}
                className="group block"
              >
                <div className="space-y-2">
                  {/* Image */}
                  <div className="relative overflow-hidden rounded-[8px] w-full aspect-[405/340]">
                    <img
                      src={
                        holiday.card_image ||
                        "/assets/images/holiday-type-placeholder.png"
                      }
                      alt={holiday.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
 
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                  </div>
 
                  {/* Text */}
                  <div>
                    <p className="text-[#666666] text-[12px] md:text-[14px] font-normal leading-[22px] tracking-[0.01em] uppercase">
                      {holiday.card_subtitle || ""}
                    </p>
 
                    <h3 className="text-[#C8105B] text-[16px] md:text-[20px] lg:text-[20px] leading-[30px] font-semibold uppercase">
                      {holiday.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}