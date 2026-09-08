 
export default function Trendingbanner({
  card_image,
  add_title,
  add_subtitle,
  add_link,
}: {
  card_image?: string;
  add_title?: string;
  add_subtitle?: string;
  add_link?: string;
}) {
  return (
    <div className="max-w-7xl mx-auto px-[16px] sm:px-[16px] md:px-[16px] lg:px-0 py-0 md:py-10 mb-0 font-['Montserrat']">
      <div className="rounded-[8px] overflow-hidden relative h-[180px] md:h-[160px] lg:h-[160px]">
        {/* Desktop only: Show image and button for >=1000px */}
        <div className="hidden min-[1000px]:flex w-full h-full items-center justify-between absolute inset-0 z-10">
          <img
            src={card_image ?? ""}
            alt="Top 20 banner"
            className="w-full h-full object-cover"
          />
          <a href={add_link} className="absolute right-8 bottom-8 bg-white text-pml-primary px-4 py-2 rounded-[8px] text-[14px] font-medium hover:bg-[#f3f3f3] w-auto text-center border-[2px] border-transparent hover:border-pml-primary" >
            DOWNLOAD OUR DEALS!
          </a>
        </div>
        {/* Show mobile div when screen < 1000px, hide otherwise */}
        <div className="block max-[600px]:hidden w-full h-full bg-pml-primary rounded-[8px] border-4 border-white min-[1000px]:hidden p-4 flex flex-row items-center justify-start  gap-4">
          <div className="bg-white w-[130px] h-[130px] flex items-center justify-center rounded-[8px] border-4 border-white p-2">
            <svg
              width="88"
              height="88"
              viewBox="0 0 35 35"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-1"
            >
              <path
                d="M17.6 32.2C17.6 32.2 2 22.2 2 12.1C2 5.1 10 2 15.2 6C17.6 7.9 17.6 13.1 17.6 13.1C17.6 13.1 17.6 7.9 20 6C25.2 2 33.2 5.1 33.2 12.1C33.2 22.2 17.6 32.2 17.6 32.2Z"
                fill="url(#pinkHeartGradient)"
              />
              <defs>
                <linearGradient
                  id="pinkHeartGradient"
                  x1="17.6"
                  y1="2"
                  x2="17.6"
                  y2="32.2"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FFB6E6" />
                  <stop offset="1" stopColor="#D62E91" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="bg-[#D62E91] border-4 border-white w-full h-[130px] flex flex-col items-center justify-center">
            <div className="text-white text-center font-[Montserrat] font-semibold text-[15px] leading-[19px] mx-auto">
              THE BIG PINK
              <br />
              PAYDAY SALE
            </div>
          </div>
          <a href={add_link} className="mt-0 md:mt-4 bg-white text-pml-primary px-2 md:px-4 py-2 rounded-[8px] text-[11px] sm:text-sm font-medium hover:bg-[#f3f3f3] w-full sm:w-auto text-center border-[2px] border-transparent hover:border-pml-primary sm:mt-0 sm:ml-auto sm:self-end">
            DOWNLOAD&nbsp;OUR&nbsp;DEALS!
          </a>
        </div>

        <div className="absolute block min-[600px]:hidden inset-0 flex flex-col justify-center items-center gap-3 px-6 md:px-12 sm:flex-row sm:justify-between sm:items-end sm:gap-5 sm:pb-6 md:pb-10 bg-pml-primary">
          <div className="flex flex-row items-center gap-5">
            {/* Mobile-only Pink Payday Card, minimal and compact */}
            <div className=" bg-[#D62E91] border-[6px] border-white rounded-lg w-[180px] h-[110px] flex flex-col items-center justify-center mx-auto p-0">
              <img src="/assets/images/image.png" alt="Pink Payday Sale" className="w-[33px] h-[33px]" />
              <div className="text-white text-center font-[Montserrat] font-semibold text-[15px] leading-[19px]">
                THE BIG PINK
                <br />
                PAYDAY SALE
              </div>
            </div>

            <div className="flex flex-col justify-center items-start">
              <div className="text-white text-[12px] md:text-[14px] font-medium tracking-widest">
                {add_subtitle || ""}
              </div>
              <div className="text-white text-lg md:text-2xl font-bold mt-1">
                {add_title || ""}
              </div>
            </div>
          </div>
          <a href={add_link} className="mt-0 md:mt-4 bg-white text-pml-primary px-2 md:px-4 py-2 rounded-[8px] text-[14px] font-medium hover:bg-[#f3f3f3] w-full sm:w-auto text-center border-[2px] border-transparent hover:border-pml-primary sm:mt-0 sm:ml-auto sm:self-end" >
            DOWNLOAD OUR DEALS!
          </a>
        </div>
      </div>
    </div>
  );
}

