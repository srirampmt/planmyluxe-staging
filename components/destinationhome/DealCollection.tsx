// "use client";

// import * as React from "react";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";
// import { CircleChevronRight } from "lucide-react";

// // Filter Tab
// const FilterTab = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
//   <button
//     onClick={onClick}
//     className={`shrink-0 px-[14px] py-[10px] text-[10px] md:text-[12px] border leading-[140%] tracking-[0px] rounded-[25px] transition ${
//       active
//         ? "bg-[#FBE3F1] text-[#595858] border-[#9F9F9F]"
//         : "text-[#7c7c7c] border-[#d0d0d0] hover:bg-[#FFF0F9] hover:text-[#CB2187] hover:border-[#CB2187]"
//     }`}
//   >
//     {label}
//   </button>
// );

// // Main Component
// export default function DealCollections({title}: {title?: string}) {
//   const [activeFilter, setActiveFilter] = React.useState("Top Trending");

//   const filterTabs = [
//     "Top Trending",
//     "Last-Minute",
//     "Xmas Markets",
//     "Xmas & New Year",
//     "Spring Sale",
//     "Summer 26 Sale",
//   ];

//    const deals = [
//     {
//       id: 1,
//       image:
//         "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
//       badge: "Top Deal of the Day",
//       location: "CYPRUS",
//       title: "King Evelthon Resort & Spa Hotel",
//       extras: "Lorem ipsum dolor sit amet consectetur. Ut at cursus vitae aliquam urna non etiam purus...",
//       price: "£1,999",
//     },
//     {
//       id: 1,
//       image:
//         "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
//       badge: "Top Deal of the Day",
//       location: "CYPRUS",
//       title: "King Evelthon Resort & Spa Hotel",
//       extras: "Lorem ipsum dolor sit amet consectetur. Ut at cursus vitae aliquam urna non etiam purus...",
//       price: "£1,999",
//     },
//     {
//       id: 1,
//       image:
//         "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
//       badge: "Top Deal of the Day",
//       location: "CYPRUS",
//       title: "King Evelthon Resort & Spa Hotel",
//       extras: "Lorem ipsum dolor sit amet consectetur. Ut at cursus vitae aliquam urna non etiam purus...",
//       price: "£1,999",
//     },
//     {
//       id: 1,
//       image:
//         "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
//       badge: "Top Deal of the Day",
//       location: "CYPRUS",
//       title: "King Evelthon Resort & Spa Hotel",
//       extras: "Lorem ipsum dolor sit amet consectetur. Ut at cursus vitae aliquam urna non etiam purus...",
//       price: "£1,999",
//     },
//     // Repeat remaining deals…
//   ];

//   return (
//     <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] bg-[#FFF7FC] font-['Montserrat']" >
//       <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-[20px] md:py-[50px] lg:py-[50px]">
//         <div className="w-full max-w-[1280px] mx-auto">
//           {/* Header */}
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-3 md:mb-5">
//             <h2 className="text-[24px] md:text-[48px] font-semibold text-[#4c4c4c] leading-[30px] md:leading-[60px] tracking-[-0.005em] max-w-[626px]">
//               {title}
//             </h2>

//             <a
//               href="#"
//               className="text-gray-500 text-xs underline hover:text-[#CB2187] self-start md:self-end mt-2 md:mt-0"
//             >
//               view all PlanMyLuxe exclusives
//             </a>
//           </div>

//           {/* Filter Tabs */}
//           <div className="flex overflow-x-auto scrollbar-hide gap-3 mb-5">
//             {filterTabs.map((tab) => (
//               <FilterTab
//                 key={tab}
//                 label={tab}
//                 active={activeFilter === tab}
//                 onClick={() => setActiveFilter(tab)}
//               />
//             ))}
//           </div>

//           {/* 💥 SHADCN CAROUSEL REPLACING EMBLA MANUAL SETUP */}
//           <Carousel opts={{ align: "start" }} className="w-full">
//             <CarouselContent>
//               {deals.map((deal, idx) => (
//                 <CarouselItem key={idx} className="basis-auto">
//                   <div className="flex-[0_0_auto] w-[270px] sm:w-[300px] md:w-[360px] h-[436px] font-['Montserrat']">
//                     <div className="bg-white rounded-[8px] overflow-hidden flex flex-col h-full border border-[#e0e0e0] group">
//                       {/* Image Container */}
//                       <div className="relative w-full overflow-hidden bg-[#f5f5f5] h-[225px]">
//                         <img
//                           src={deal.image}
//                           alt={deal.title}
//                           className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105 group-hover:scale-105 will-change-transform"
//                         />

//                         {/* Location Badge */}
//                         <span className="absolute top-0 left-0 bg-white text-[#CB2187] pr-[32px] pl-[12px] pt-[4px] pb-[4px] text-[11px] md:text-[13px] font-semibold uppercase max-w-[70%] leading-[18px] tracking-[0.015em] rounded-br-[167px] pointer-events-none">
//                           {deal.badge}
//                         </span>

//                         {/* Exclusive Tag SVG */}
//                         <div className="absolute top-0 right-[-25px] pointer-events-none">
//                           <svg
//                             width="130"
//                             height="65"
//                             viewBox="0 0 80 69"
//                             fill="none"
//                             xmlns="http://www.w3.org/2000/svg"
//                             className="w-[130px] h-[65px] block"
//                           >
//                             <path
//                               fillRule="evenodd"
//                               clipRule="evenodd"
//                               d="M16.8722 63.9669C17.5165 65.1509 18.7662 65.9042 20.3473 66.0602C21.9273 66.2189 23.7093 65.7673 25.3016 64.8058L61.2205 43.117C63.1829 41.9321 69.8008 19.4952 69.8008 19.4952C70.4033 17.0859 69.2851 15.0456 66.9975 14.3874C62.5227 13.0993 53.3232 10.4545 49.3631 9.31609C47.5922 8.80638 45.3773 9.20502 43.425 10.3839L7.49406 32.08C5.90176 33.0415 4.63124 34.4331 3.96274 35.9495C3.29142 37.4655 3.27691 38.9822 3.92122 40.1663L16.8722 63.9669Z"
//                               fill="#3BAB39"
//                             />
//                             <path
//                               d="M19.7024 39.8132L23.7228 37.3733L24.304 38.3311L20.2836 40.771L19.7024 39.8132ZM22.3077 43.8551L21.194 44.531L16.4629 36.7352L21.9645 33.3964L22.5525 34.3653L18.1646 37.0282L22.3077 43.8551ZM27.7065 40.5787L22.9753 32.7829L26.0157 30.9378C26.6988 30.5233 27.3469 30.2772 27.9602 30.1996C28.5734 30.1221 29.1339 30.2086 29.6416 30.4593C30.1493 30.7099 30.5743 31.1174 30.9168 31.6816C31.2592 32.2459 31.4244 32.8111 31.4124 33.3771C31.3958 33.9357 31.2116 34.4691 30.8597 34.9773C30.5078 35.4855 29.9903 35.9469 29.3072 36.3614L26.8794 37.8348L27.0696 37.0184L28.8201 39.9028L27.7065 40.5787ZM32.9185 37.4156L29.2194 35.7899L30.4111 35.0667L34.1324 36.6789L32.9185 37.4156ZM27.1372 37.1298L26.3049 36.8882L28.6993 35.4351C29.4121 35.0025 29.858 34.5236 30.037 33.9984C30.219 33.4613 30.141 32.9143 29.8031 32.3575C29.4652 31.8007 29.0182 31.4827 28.4622 31.4036C27.9137 31.3199 27.2831 31.4944 26.5703 31.927L24.1759 33.3801L24.3391 32.5191L27.1372 37.1298ZM33.5647 30.9585L37.5739 28.5254L38.1484 29.472L34.1392 31.9051L33.5647 30.9585ZM35.7669 34.3612L40.3107 31.6037L40.8987 32.5726L35.2412 36.006L30.5101 28.2102L36.0117 24.8714L36.5997 25.8403L32.2118 28.5033L35.7669 34.3612ZM40.4686 26.7686L44.4779 24.3355L45.0524 25.2821L41.0431 27.7152L40.4686 26.7686ZM42.6708 30.1713L47.2147 27.4138L47.8027 28.3827L42.1452 31.8161L37.4141 24.0203L42.9157 20.6815L43.5037 21.6504L39.1158 24.3134L42.6708 30.1713ZM30.0352 50.9604C29.56 51.2488 29.0736 51.4383 28.576 51.529C28.0807 51.6102 27.5981 51.5983 27.1281 51.4934C26.6604 51.379 26.2263 51.1792 25.8256 50.8941C25.425 50.6089 25.0841 50.2347 24.803 49.7714C24.5218 49.3081 24.3472 48.833 24.2792 48.346C24.2112 47.859 24.2392 47.3828 24.3632 46.9175C24.4835 46.4462 24.6958 46.0126 25.0001 45.6166C25.3066 45.2112 25.6975 44.8642 26.1727 44.5759C26.6538 44.2839 27.1468 44.0985 27.6516 44.0197C28.1587 43.9313 28.6522 43.961 29.132 44.1087L28.8935 45.0215C28.5045 44.9162 28.1255 44.8943 27.7564 44.9557C27.3837 45.0112 27.0281 45.1417 26.6895 45.3472C26.3391 45.5598 26.0485 45.8175 25.8176 46.1201C25.5928 46.4191 25.4353 46.7423 25.3453 47.0895C25.2553 47.4367 25.2381 47.7966 25.2936 48.1693C25.3514 48.5324 25.4849 48.8862 25.6939 49.2307C25.903 49.5752 26.157 49.8599 26.4561 50.0848C26.7574 50.3002 27.0829 50.4481 27.4324 50.5285C27.7819 50.609 28.1412 50.6185 28.5103 50.557C28.8853 50.492 29.2481 50.3531 29.5985 50.1405C29.9371 49.935 30.2188 49.6827 30.4437 49.3837C30.665 49.0788 30.8169 48.7265 30.8995 48.3269L31.8192 48.5367C31.7288 49.0305 31.5291 49.4849 31.2202 49.8999C30.9172 50.3113 30.5222 50.6648 30.0352 50.9604ZM33.0715 49.0202L30.2058 44.2982L31.0255 43.8007L31.8041 45.0837L31.5293 44.8116C31.4617 44.4056 31.5301 44.0228 31.7344 43.6631C31.9387 43.3034 32.2666 42.9866 32.718 42.7126L33.2208 43.5412C33.1816 43.5569 33.1442 43.5756 33.1085 43.5972C33.0788 43.6152 33.0491 43.6332 33.0194 43.6513C32.5621 43.9288 32.2827 44.2853 32.1812 44.7208C32.0797 45.1562 32.1858 45.6323 32.4994 46.149L33.9268 48.5011L33.0715 49.0202ZM38.2996 45.9205C37.8957 46.1657 37.4942 46.3077 37.0953 46.3466C36.7022 46.382 36.3277 46.3005 35.9716 46.1021C35.6178 45.8941 35.3004 45.5585 35.0192 45.0952L33.3701 42.3779L34.2254 41.8588L35.815 44.4782C36.0962 44.9415 36.417 45.2222 36.7773 45.3205C37.1436 45.4152 37.5287 45.34 37.9326 45.0948C38.2296 44.9146 38.4519 44.6984 38.5996 44.4462C38.7436 44.1881 38.8048 43.9072 38.783 43.6035C38.7576 43.2938 38.644 42.9727 38.4421 42.64L36.9606 40.1988L37.8159 39.6798L40.6816 44.4018L39.8708 44.8938L39.0976 43.6198L39.4367 43.8772C39.4734 44.2857 39.3895 44.6699 39.1852 45.0295C38.9809 45.3892 38.6857 45.6862 38.2996 45.9205ZM41.8644 43.684L38.9987 38.962L39.854 38.4429L42.7197 43.1649L41.8644 43.684ZM38.8748 37.7937C38.7085 37.8946 38.5365 37.9258 38.3588 37.8874C38.187 37.8454 38.0542 37.7472 37.9605 37.5927C37.8632 37.4324 37.8355 37.2663 37.8775 37.0945C37.9255 36.9191 38.0327 36.7809 38.199 36.68C38.3653 36.579 38.5343 36.5496 38.7061 36.5916C38.8803 36.6241 39.0142 36.7176 39.1079 36.872C39.2052 37.0324 39.2347 37.2014 39.1963 37.3792C39.1542 37.551 39.0471 37.6891 38.8748 37.7937ZM45.294 41.6758C44.902 41.9137 44.4953 42.0873 44.0741 42.1967C43.6587 42.3024 43.3033 42.3394 43.0076 42.3075L42.953 41.4141C43.2379 41.4282 43.5576 41.3926 43.9123 41.3074C44.267 41.2222 44.5987 41.0859 44.9076 40.8984C45.3055 40.6569 45.5564 40.4275 45.6601 40.2101C45.7698 39.9891 45.7634 39.7776 45.6409 39.5757C45.5507 39.4272 45.427 39.3438 45.2696 39.3255C45.1122 39.3072 44.9318 39.3314 44.7284 39.398C44.5309 39.4609 44.3163 39.5424 44.0844 39.6425C43.849 39.7366 43.6099 39.8248 43.3672 39.9071C43.121 39.9834 42.8817 40.0311 42.6495 40.0501C42.4136 40.0632 42.1935 40.022 41.9893 39.9265C41.7815 39.8251 41.5946 39.6378 41.4288 39.3646C41.2558 39.0795 41.1846 38.7813 41.2152 38.4702C41.2458 38.159 41.3724 37.8587 41.5949 37.5692C41.8198 37.2702 42.1342 36.9981 42.5381 36.753C42.8469 36.5656 43.1822 36.4149 43.5439 36.3011C43.9079 36.1777 44.2323 36.1231 44.5171 36.1371L44.5628 37.0359C44.2625 37.0231 43.9802 37.0603 43.7162 37.1474C43.4521 37.2346 43.2042 37.3484 42.9726 37.489C42.5984 37.7161 42.357 37.9479 42.2486 38.1843C42.1366 38.4149 42.1382 38.6252 42.2536 38.8153C42.3509 38.9756 42.4801 39.0679 42.641 39.0921C42.8044 39.1068 42.9866 39.0856 43.1877 39.0286C43.3947 38.968 43.6159 38.8906 43.8514 38.7965C44.0832 38.6964 44.3223 38.6082 44.5686 38.5319C44.8112 38.4496 45.0457 38.4008 45.272 38.3854C45.5043 38.3663 45.7225 38.4045 45.9268 38.5C46.137 38.5919 46.3231 38.7715 46.4854 39.0388C46.6584 39.3239 46.7248 39.6208 46.6847 39.9297C46.6445 40.2385 46.509 40.5442 46.2782 40.8468C46.0438 41.1435 45.7157 41.4198 45.294 41.6758ZM50.0603 38.7831C49.5555 39.0895 49.0469 39.2559 48.5347 39.2824C48.0284 39.3052 47.5584 39.2003 47.1247 38.9678C46.6969 38.7316 46.3406 38.3789 46.0558 37.9097C45.7711 37.4404 45.6197 36.9634 45.6018 36.4785C45.5898 35.99 45.7007 35.5367 45.9345 35.1185C46.1707 34.6907 46.5145 34.3398 46.9659 34.0659C47.4232 33.7883 47.8884 33.6442 48.3614 33.6334C48.8344 33.6227 49.2806 33.742 49.7001 33.9913C50.122 34.2311 50.4807 34.5945 50.7763 35.0815C50.7979 35.1172 50.8202 35.1605 50.8431 35.2117C50.8719 35.2592 50.896 35.3055 50.9152 35.3507L46.8971 37.7893L46.524 37.1745L50.0967 35.0063L49.879 35.431C49.7011 35.1245 49.4747 34.8921 49.1999 34.7338C48.925 34.5755 48.6321 34.5013 48.3211 34.5112C48.0125 34.5116 47.7068 34.6037 47.4038 34.7875C47.1069 34.9678 46.884 35.1965 46.7353 35.4737C46.5829 35.7449 46.5153 36.042 46.5324 36.3648C46.5459 36.6817 46.6464 36.9946 46.8339 37.3034L46.9204 37.446C47.1114 37.7608 47.3539 37.9996 47.6479 38.1626C47.9441 38.316 48.2644 38.3817 48.6087 38.3597C48.9529 38.3377 49.2943 38.224 49.6329 38.0185C49.912 37.8491 50.1356 37.6484 50.3037 37.4164C50.4776 37.1808 50.5931 36.9157 50.65 36.6211L51.4574 36.8869C51.395 37.2661 51.243 37.6184 51.0016 37.9437C50.7661 38.2654 50.4524 38.5452 50.0603 38.7831Z"
//                               fill="white"
//                             />
//                             <circle
//                               cx="61.7279"
//                               cy="20.0457"
//                               r="3.90817"
//                               transform="rotate(-30 61.7279 20.0457)"
//                               fill="white"
//                             />
//                           </svg>
//                         </div>
//                       </div>

//                       {/* Content */}
//                       <div className="pt-[6px] pr-[8px] pb-[14px] pl-[8px] flex-grow flex flex-col justify-start items-start text-left bg-white">
//                         <div className="text-[14px] font-semibold text-[#4c4c4c] leading-[1.4] p-[4px]">
//                           {deal.location}
//                         </div>

//                         <div className="flex items-center justify-start p-[4px]">
//                           <span className="text-pml-primary text-[14px]">
//                             {Array.from({ length: 5 }).map((_, i) => (
//                               <svg
//                                 key={i}
//                                 width="14"
//                                 height="14"
//                                 viewBox="0 0 14 14"
//                                 fill="none"
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 className="inline-block mr-[1px]"
//                               >
//                                 <path
//                                   d="M14.0001 5.4091L8.91313 5.07466L6.99734 0.261719L5.08156 5.07466L0.0001297 5.4091L3.89754 8.7184L2.61862 13.7384L6.99734 10.9707L11.3761 13.7384L10.0972 8.7184L14.0001 5.4091Z"
//                                   fill="#CB2187"
//                                 />
//                               </svg>
//                             ))}
//                           </span>
//                         </div>

//                         <h5 className="text-[14px] md:text-[16px] font-semibold text-pml-primary flex items-center justify-start leading-[24px] mb-[10px] p-[4px]">
//                           {deal.title}
//                         </h5>

//                         <div className="bg-[#EDEDED] border border-[#DFDEDE] px-[6px] md:px-[12px] py-[6px] rounded-[8px] text-[12px] text-[#4c4c4c] font-medium mb-[9px] flex items-center justify-center leading-[18px] tracking-[0.02em] w-full text-center">
//                           {deal.extras}
//                         </div>

//                         <a
//                           href="#"
//                           className="text-[#4c4c4c] border-none rounded-md text-[12px] md:text-[14px] font-normal text-right cursor-pointer transition-all duration-300 ease-in-out no-underline block w-full mx-auto pt-[5px] hover:text-[#a01a6e] leading-[22px] tracking-[0.01em] font-regular"
//                         >
//                           7 nights from
//                           <span className="text-base font-bold text-[#CB2187] px-[4px]">
//                             {deal.price}
//                           </span>
//                           per person
//                           <CircleChevronRight className="inline ml-1 text-pml-primary" size={20}/>
//                         </a>
//                       </div>
//                     </div>
//                   </div>
//                 </CarouselItem>
//               ))}
//             </CarouselContent>
//           </Carousel>
//         </div>
//       </div>
//     </section>
//   );
// }


