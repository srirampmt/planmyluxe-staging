// interface TimelineProps {
//   dates: string[];
// }

// export default function HorizontalTimeline({ dates }: TimelineProps) {
//   return (
//     <div className="w-full overflow-x-auto scroll-smooth touch-pan-x">
//       <ol className="m-0 relative flex min-w-full w-max justify-center gap-12 whitespace-nowrap py-1 px-0">
//         {dates.map((date, index) => {
//           const showTimeAbove = index % 2 === 0;
//           const step = index + 1;
//           const isLast = index === dates.length - 1;
//           const circleRadiusPx = 14;
//           const connectorGapPx = 8;

//           return (
//             <li
//               key={index}
//               className="relative flex min-w-[100px] flex-none grid grid-rows-[36px_28px_36px] justify-items-center"
//             >
//               {/* Connector line to next step (between numbers) */}
//               {!isLast ? (
//                 <div
//                   aria-hidden="true"
//                   className="pointer-events-none absolute top-[50px] z-0 border-t-2 border-dashed border-[#595858] opacity-50"
//                   style={{
//                     left: `calc(50% + ${circleRadiusPx + connectorGapPx}px)`,
//                     width: `calc(100% + 3rem - ${2 * (circleRadiusPx + connectorGapPx)}px)`,
//                   }}
//                 />
//               ) : null}

//               {/* Above label */}
//               {showTimeAbove ? (
//                 <span className="row-start-1 row-end-2 flex h-9 items-center rounded text-xs font-bold text-heading text-[#595858]">
//                   {date}
//                 </span>
//               ) : (
//                 <div className="row-start-1 row-end-2 h-9" aria-hidden="true" />
//               )}

//               {/* Dot */}
//               <div className="row-start-2 row-end-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-pml-primary border border-pml-primary">
//                 <span className="text-xs font-semibold text-white">{step}</span>
//               </div>

//               {/* Below label */}
//               {!showTimeAbove ? (
//                 <span className="row-start-3 row-end-4 flex items-center rounded text-xs font-bold text-heading text-[#595858]">
//                   {date}
//                 </span>
//               ) : (
//                 <div className="row-start-3 row-end-4 h-9" aria-hidden="true" />
//               )}
//             </li>
//           );
//         })}
//       </ol>
//     </div>
//   );
// }
