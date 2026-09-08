// "use client";

// import React, { useCallback, useEffect, useMemo, useState } from "react";

// type AirportOption = { id: string; label: string };

// type Props = {
//   availableAirports: AirportOption[];
//   selectedAirport: string;
//   onAirportChange: (airportId: string) => void;
//   boardBasis: string;
//   duration: string;
//   priceData: Record<string, Record<number, number>>;
//   initialDepartureDate: string;
//   onDateSelect: (dateIso: string) => void;
// };

// const monthNames = [
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
// ];

// const formatPrice = (price: number) => {
//   const rounded = Math.round(price);
//   return `£${rounded}`;
// };

// const getDaysInMonth = (year: number, month: number) => {
//   return new Date(year, month + 1, 0).getDate();
// };

// const getStartDay = (year: number, month: number) => {
//   return new Date(year, month, 1).getDay();
// };

// export default function HolidayCalendarMc({
//   availableAirports,
//   selectedAirport,
//   onAirportChange,
//   boardBasis,
//   duration,
//   priceData,
//   initialDepartureDate,
//   onDateSelect,
// }: Props) {
//   const [currentYear, setCurrentYear] = useState<number>(
//     Number(initialDepartureDate.split("-")[0])
//   );
//   const [currentMonth, setCurrentMonth] = useState<number>(
//     Number(initialDepartureDate.split("-")[1]) - 1
//   );

//   useEffect(() => {
//     const [y, m] = initialDepartureDate.split("-");
//     const newYear = parseInt(y, 10);
//     const newMonth = parseInt(m, 10) - 1;
//     if (Number.isFinite(newYear) && Number.isFinite(newMonth)) {
//       setCurrentYear(newYear);
//       setCurrentMonth(newMonth);
//     }
//   }, [initialDepartureDate]);

//   const monthKey = useMemo(() => {
//     const mm = String(currentMonth + 1).padStart(2, "0");
//     return `${currentYear}${mm}`;
//   }, [currentYear, currentMonth]);

//   const days = useMemo(() => {
//     const daysInMonth = getDaysInMonth(currentYear, currentMonth);
//     const startDay = getStartDay(currentYear, currentMonth);
//     const arr: Array<{ day: number; iso: string; price: number | null }> = [];

//     for (let i = 0; i < startDay; i++) {
//       arr.push({ day: 0, iso: "", price: null });
//     }

//     for (let d = 1; d <= daysInMonth; d++) {
//       const dd = String(d).padStart(2, "0");
//       const mm = String(currentMonth + 1).padStart(2, "0");
//       const iso = `${currentYear}-${mm}-${dd}`;
//       const price = priceData[monthKey]?.[d] ?? null;
//       arr.push({ day: d, iso, price });
//     }

//     return arr;
//   }, [currentYear, currentMonth, monthKey, priceData]);

//   const handleMonthChange = useCallback(
//     (direction: "prev" | "next") => {
//       if (direction === "prev") {
//         if (currentMonth === 0) {
//           setCurrentMonth(11);
//           setCurrentYear((y) => y - 1);
//         } else {
//           setCurrentMonth((m) => m - 1);
//         }
//       } else {
//         if (currentMonth === 11) {
//           setCurrentMonth(0);
//           setCurrentYear((y) => y + 1);
//         } else {
//           setCurrentMonth((m) => m + 1);
//         }
//       }
//     },
//     [currentMonth]
//   );

//   const handleMonthYearSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
//     const [yearStr, monthStr] = e.target.value.split("-");
//     const newYear = parseInt(yearStr, 10);
//     const newMonth = parseInt(monthStr, 10);
//     if (!Number.isFinite(newYear) || !Number.isFinite(newMonth)) return;
//     setCurrentYear(newYear);
//     setCurrentMonth(newMonth);
//   }, []);

//   const monthOptions = useMemo(() => {
//     const opts: Array<{ value: string; label: string }> = [];
//     for (let i = -1; i <= 10; i++) {
//       const base = new Date(currentYear, currentMonth + i, 1);
//       const y = base.getFullYear();
//       const m = base.getMonth();
//       opts.push({
//         value: `${y}-${m}`,
//         label: `${monthNames[m]} ${y}`,
//       });
//     }
//     return opts;
//   }, [currentYear, currentMonth]);

//   return (
//     <div id="holiday-calendar-mc" className="w-full max-w-[420px] rounded-[16px] border border-[#EDEDED] bg-white p-4">
//       <div className="mb-3">
//         <div className="text-[13px] text-[#595858]">Departing</div>
//         <select
//           aria-label="Select departure airport"
//           value={selectedAirport}
//           onChange={(e) => onAirportChange(e.target.value)}
//           className="mt-1 w-full rounded-[8px] border border-[#9F9F9F] bg-white p-2.5 text-[14px] text-[#595858]"
//         >
//           {availableAirports.map((a) => (
//             <option key={a.id} value={a.id}>
//               {a.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="mb-4 grid grid-cols-2 gap-3 text-[13px] text-[#595858]">
//         <div>
//           <div>Board basis</div>
//           <div className="mt-1 rounded-[8px] border border-[#EDEDED] bg-[#FAFAFA] p-2.5 text-[14px]">
//             {boardBasis}
//           </div>
//         </div>
//         <div>
//           <div>Duration</div>
//           <div className="mt-1 rounded-[8px] border border-[#EDEDED] bg-[#FAFAFA] p-2.5 text-[14px]">
//             {duration}
//           </div>
//         </div>
//       </div>

//       <div className="flex items-center justify-between mb-3">
//         <button
//           type="button"
//           onClick={() => handleMonthChange("prev")}
//           aria-label="Previous month"
//           className="text-[#595858] hover:bg-gray-100 rounded px-2 py-1"
//         >
//           ‹
//         </button>

//         <select
//           aria-label="Select month"
//           value={`${currentYear}-${currentMonth}`}
//           onChange={handleMonthYearSelect}
//           className="rounded-[8px] border border-[#9F9F9F] bg-white px-3 py-2 text-[14px] text-[#595858]"
//         >
//           {monthOptions.map((opt) => (
//             <option key={opt.value} value={opt.value}>
//               {opt.label}
//             </option>
//           ))}
//         </select>

//         <button
//           type="button"
//           onClick={() => handleMonthChange("next")}
//           aria-label="Next month"
//           className="text-[#595858] hover:bg-gray-100 rounded px-2 py-1"
//         >
//           ›
//         </button>
//       </div>

//       {/* Day headers */}
//       <div className="grid grid-cols-7 gap-1 mb-2 border-b border-[#EDEDED] pb-2">
//         {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
//           <div key={d} className="text-center text-[12px] font-semibold text-[#595858] font-montserrat">
//             {d}
//           </div>
//         ))}
//       </div>

//       {/* Calendar grid */}
//       <div className="grid grid-cols-7 gap-1">
//         {days.map((cell, idx) => {
//           if (cell.day === 0) {
//             return <div key={idx} className="h-[52px]" />;
//           }

//           const hasPrice = cell.price !== null;
//           const isSelected = cell.iso === initialDepartureDate;

//           return (
//             <button
//               key={cell.iso}
//               type="button"
//               onClick={() => onDateSelect(cell.iso)}
//               data-testid={`calendar-day-${cell.day}`}
//               className={`h-[52px] rounded-[8px] border text-center flex flex-col items-center justify-center transition-all duration-150 font-montserrat ${
//                 isSelected
//                   ? 'border-pml-primary bg-pml-primary/10 ring-1 ring-pml-primary'
//                   : hasPrice
//                     ? 'border-[#EDEDED] hover:border-pml-primary hover:bg-pml-primary/5'
//                     : 'border-[#F2F2F2] bg-[#FAFAFA]'
//               }`}
//             >
//               <div className={`text-[13px] font-semibold ${isSelected ? 'text-pml-primary' : 'text-[#595858]'}`}>
//                 {cell.day}
//               </div>
//               <div className={`text-[11px] font-medium ${isSelected ? 'text-pml-primary' : hasPrice ? 'text-[#595858]' : 'text-[#CFCFCF]'}`}>
//                 {hasPrice ? formatPrice(cell.price as number) : "-"}
//               </div>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }