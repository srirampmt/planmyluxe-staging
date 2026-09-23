"use client";

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.3337 4L6.00033 11.3333L2.66699 8" stroke="#4C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface GoodForItem {
  title: string;
  description: string;
}


type GoodForProps = {
  destinationName?: string;
  title_1?: string;
  title_2?: string;
  title_3?: string;
  title_4?: string;
  description_1?: string;
  description_2?: string;
  description_3?: string;
  description_4?: string;
};


export default function GoodFor({
  destinationName,
  title_1,
  title_2,
  title_3,
  title_4,
  description_1,
  description_2,
  description_3,
  description_4,
}: GoodForProps) {
  const goodForItems: GoodForItem[] = [
    { title: title_1 ?? '', description: description_1 ?? '' },
    { title: title_2 ?? '', description: description_2 ?? '' },
    { title: title_3 ?? '', description: description_3 ?? '' },
    { title: title_4 ?? '', description: description_4 ?? '' },
  ].filter((item) => item.title.trim() || item.description.trim());
  return (
    <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-[#F9FAFB] font-['Montserrat']">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-4 md:py-6">
        <div className="w-full max-w-[1280px] mx-auto bg-[#FBE3F1] rounded-[8px] p-5 sm:p-6 md:p-8 shadow-sm border border-[#f5d0e7]/50">
          {/* Title */}
          <h2 className="uppercase text-[#1a1a1a] text-[15px] sm:text-[16px] md:text-[18px] font-bold tracking-wider mb-4 md:mb-5 leading-tight">
            {destinationName ? `${destinationName} - Perfect for` : 'Perfect for'}
          </h2>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {goodForItems.map((item, index) => (
                <div key={index} className="flex h-full min-h-[88px] flex-col justify-center gap-1 rounded-[8px] bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                            <CheckIcon />
                        </div>
                        <h3 className="text-[15px] font-semibold leading-tight text-black">
                            {item.title}
                        </h3>
                    </div>
                    <p className="line-clamp-1 pl-6 text-[13px] leading-5 text-black/70">
                        {item.description}
                    </p>
                </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}