// "use client";

// import Link from "next/link";

// interface HolidayType {
//   label: string;
//   title: string;
//   image: string;
//   slug: string;
// }

// const holidayTypes: HolidayType[] = [
//   {
//     label: "LUXURY",
//     title: "ALL INCLUSIVE",
//     image: "/assets/images/holiday-type-1.png",
//     slug: "all-inclusive"
//   },
//   {
//     label: "LUXURY",
//     title: "ALL INCLUSIVE",
//     image: "/assets/images/holiday-type-2.png",
//     slug: "all-inclusive"
//   },
//   {
//     label: "LUXURY",
//     title: "ALL INCLUSIVE",
//     image: "/assets/images/holiday-type-3.png",
//     slug: "all-inclusive"
//   },
//   {
//     label: "LUXURY",
//     title: "ALL INCLUSIVE",
//     image: "/assets/images/holiday-type-4.png",
//     slug: "all-inclusive"
//   },
//   {
//     label: "LUXURY",
//     title: "ALL INCLUSIVE",
//     image: "/assets/images/holiday-type-5.png",
//     slug: "all-inclusive"
//   },
//   {
//     label: "LUXURY",
//     title: "ALL INCLUSIVE",
//     image: "/assets/images/holiday-type-6.png",
//     slug: "all-inclusive"
//   }
// ];

// export default function HolidayTypes() {
//   return (
//     <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-white font-['Montserrat']">
//       <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-12 md:py-16 lg:py-20">
//         <div className="w-full max-w-[1280px] mx-auto">
//           {/* Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
//             {holidayTypes.map((holiday, index) => (
//               <Link 
//                 key={index} 
//                 href={`/holidays/${holiday.slug}`}
//                 className="group block"
//               >
//                 <div className="relative overflow-hidden rounded-[16px] aspect-[4/3]">
//                   {/* Image */}
//                   <img
//                     src={holiday.image}
//                     alt={holiday.title}
//                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//                   />
                  
//                   {/* Gradient Overlay */}
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  
//                   {/* Text Content */}
//                   <div className="absolute bottom-0 left-0 right-0 p-6">
//                     <p className="text-white text-[11px] md:text-[12px] font-semibold tracking-wider mb-1 uppercase">
//                       {holiday.label}
//                     </p>
//                     <h3 className="text-[#C8105B] text-[16px] md:text-[22px] lg:text-[22px] font-bold uppercase">
//                       {holiday.title}
//                     </h3>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }