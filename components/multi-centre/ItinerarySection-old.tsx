// type ItineraryItem = {
//   day: number;
//   title: string;
//   transport: "flight" | "train";
//   subtitle: string;
//   description: string;
//   image: string;
//   hotel: string;
//   rating: number;
//   board: string;
//   duration: string;
//   extras: string;
// };

// function FlightIcon({ className }: { className?: string }) {
//   return (
//     <svg
//       className={className}
//       width="20"
//       height="20"
//       viewBox="0 0 24 24"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//       aria-hidden="true"
//     >
//       <path
//         d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5L21 16Z"
//         fill="#4C4C4C"
//       />
//     </svg>
//   );
// }

// function TrainIcon({ className }: { className?: string }) {
//   return (
//     <svg
//       className={className}
//       width="20"
//       height="20"
//       viewBox="0 0 24 24"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//       aria-hidden="true"
//     >
//       <path
//         d="M12 2c-4.5 0-8 1-8 5v10c0 2.21 1.79 4 4 4l-2 2v1h2l3-3h2l3 3h2v-1l-2-2c2.21 0 4-1.79 4-4V7c0-4-3.5-5-8-5Zm6 15c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-4h12v4Zm0-6H6V7c0-1.94 2.24-3 6-3s6 1.06 6 3v4ZM8.5 17a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
//         fill="#4C4C4C"
//       />
//     </svg>
//   );
// }

// function StarIcon({ className }: { className?: string }) {
//   return (
//     <svg
//       className={className}
//       width="16"
//       height="15"
//       viewBox="0 0 16 15"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//       aria-hidden="true"
//     >
//       <path
//         d="M8 0.75l2.06 4.17 4.6.67-3.33 3.24.79 4.58L8 11.18 3.88 13.4l.79-4.58L1.34 5.59l4.6-.67L8 .75Z"
//         fill="#CB2187"
//       />
//     </svg>
//   );
// }

// export default function ItinerarySection({
//   itinerary,
// }: {
//   itinerary: ItineraryItem[];
// }) {
//   return (
//     <div className="flex w-full max-w-[872px] flex-col items-start gap-[24px] font-montserrat">
//       <div
//         id="mc-itinerary"
//         className="scroll-mt-[calc(var(--main-nav-height,0px)+64px)]"
//       />
//       <div className="flex h-[29px] w-full items-center justify-start gap-[10px]">
//         <div className="h-[29px] w-[197px] text-[24px] font-semibold leading-[29px] text-[#4C4C4C]">
//           Itinerary Details
//         </div>
//       </div>

//       <div className="flex w-full flex-col items-start">
//         {itinerary.map((item, idx) => (
//           <div key={item.day} className="flex w-full flex-col items-start">
//             <div className="flex h-[68px] w-full items-center gap-[10px] py-[10px]">
//               <div className="flex h-[48px] w-[48px] flex-col items-center justify-center gap-[10px] rounded-[24px] bg-[#CB2187] px-[18px] py-[12px]">
//                 <span className="font-sans text-[24px] font-bold leading-[24px] text-white">
//                   {item.day}
//                 </span>
//               </div>
//               <div className="text-[24px] font-bold leading-[140%] text-[#4C4C4C]">
//                 {item.title}
//               </div>
//             </div>

//             <div
//               className={
//                 "flex w-full items-stretch " +
//                 (idx === itinerary.length - 1 ? "pb-0" : "pb-[24px]")
//               }
//             >
//               <div className="box-border relative flex w-[25px] shrink-0 flex-col items-start gap-[10px] self-stretch p-[10px] after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-[repeating-linear-gradient(to_bottom,#CFCBCB_0_6px,transparent_4px_12px)] after:bg-[length:1px_12px] after:bg-repeat-y" />

//               <div className="flex w-full flex-col items-start gap-[9px] px-[32px]">
//                 <div className="flex w-full flex-col gap-[16px] md:flex-row md:items-start">
//                   <div className="flex w-full flex-col items-start gap-[12px] md:w-[533px]">
//                     <div className="flex h-[22px] items-end gap-[6px]">
//                       {item.transport === "flight" ? <FlightIcon /> : <TrainIcon />}
//                       <div className="text-[16px] font-semibold leading-[140%] text-[#4C4C4C]">
//                         {item.subtitle}
//                       </div>
//                     </div>

//                     <div className="text-[16px] font-normal leading-[150%] text-[#4C4C4C]">
//                       {item.description}
//                     </div>
//                   </div>

//                   <div className="h-[210px] w-[234px] shrink-0 overflow-hidden rounded-[4px]">
//                     <img
//                       src={item.image}
//                       alt={item.title}
//                       className="h-full w-full object-cover"
//                     />
//                   </div>
//                 </div>

//                 <div className="flex w-full flex-col items-start gap-[8px] md:w-[522px]">
//                   <div className="flex w-full flex-wrap items-center gap-[32px]">
//                     <div className="flex h-[22px] items-center gap-[12px]">
//                       <span className="text-[16px] font-normal leading-[140%] text-[#4C4C4C]">
//                         Your Hotel:
//                       </span>
//                       <span className="text-[16px] font-semibold leading-[140%] text-[#4C4C4C] underline">
//                         {item.hotel}
//                       </span>
//                     </div>

//                     <div className="flex h-[20px] items-center gap-[15px]">
//                       <span className="text-[16px] font-normal leading-[20px] text-[#4C4C4C]">
//                         Hotel Rating:
//                       </span>
//                       <div className="flex h-[15px] items-center gap-[2px]">
//                         {Array.from({ length: item.rating }).map((_, starIdx) => (
//                           <StarIcon key={starIdx} />
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex w-full flex-wrap items-center gap-[41px]">
//                     <div className="flex h-[22px] items-center gap-[12px]">
//                       <span className="text-[16px] font-normal leading-[20px] text-[#4C4C4C]">
//                         Board Basis:
//                       </span>
//                       <span className="text-[16px] font-semibold leading-[140%] text-[#4C4C4C]">
//                         {item.board}
//                       </span>
//                     </div>

//                     <div className="flex h-[22px] items-center gap-[15px]">
//                       <span className="text-[16px] font-normal leading-[20px] text-[#4C4C4C]">
//                         Duration:
//                       </span>
//                       <span className="text-[16px] font-semibold leading-[140%] text-[#4C4C4C]">
//                         {item.duration}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="flex w-full flex-wrap items-center gap-[12px]">
//                     <span className="text-[16px] font-normal leading-[20px] text-[#4C4C4C]">
//                       Added Extras:
//                     </span>
//                     <span className="text-[16px] font-semibold leading-[140%] text-[#4C4C4C]">
//                       {item.extras}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export type { ItineraryItem };
