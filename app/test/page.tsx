"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Star, MapPin, Share2, Check, Info, Phone, MessageSquare, 
  Calendar as CalendarIcon, ChevronDown, ChevronUp, ChevronRight, ChevronLeft,
  Flame, Shield, ArrowRight, Plane,
  Sparkles, Bot, X, Send, User, Loader2, Home
} from 'lucide-react';

interface SeasonInfo {
  dates: string;
  price: number;
  selected: boolean;
}

interface SeasonalPricing {
  low: SeasonInfo;
  mid: SeasonInfo;
  high: SeasonInfo;
}

interface SimilarHotel {
  name: string;
  location: string;
  rating: number;
  price: number;
  image: string;
}

interface HotelData {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  offerHeader: string | null;
  images: string[];
  hasWhatsIncluded: boolean;
  whatsIncludedList?: string[];
  hasEnhanceTrip: boolean;
  sidebarWidgetType: string;
  seasonalPricing?: SeasonalPricing;
  hasFaq: boolean;
  hasSimilarHotels: boolean;
  similarHotels?: SimilarHotel[];
}

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const mockDataScenarios: Record<string, HotelData> = {
  amcRoyal: {
    id: 'amc-royal',
    name: 'AMC Royal Hotel & SPA',
    location: 'HURGHADA - EGYPT',
    rating: 5,
    price: 1099,
    offerHeader: null,
    images: ['Hotel Exterior', 'Waterpark', 'Banana Boat', 'Lobby Lounge'],
    hasWhatsIncluded: false,
    hasEnhanceTrip: false,
    sidebarWidgetType: 'seasonal',
    seasonalPricing: {
      low: { dates: '1st Nov 2026 - 31st Mar 2027', price: 1099, selected: true },
      mid: { dates: '1st Sep 2026 - 31st Nov 2026', price: 1289, selected: false },
      high: { dates: '28th June 2026 - 31st Aug 2026', price: 1379, selected: false }
    },
    hasFaq: true,
    hasSimilarHotels: false
  },
  mogador: {
    id: 'grand-mogador',
    name: 'Grand Mogador Menara',
    location: 'MARRAKECH - MOROCCO',
    rating: 5,
    price: 219,
    offerHeader: 'Modern city luxury with spacious pools and a prime Marrakech location',
    images: ['Hotel Exterior', 'Lounge Area', 'Swimming Pool', 'Luxury Suite'],
    hasWhatsIncluded: true,
    whatsIncludedList: [
      'Return Flights from the UK',
      'All known current airport and security charges',
      'One piece of hand baggage per person',
      'Our members benefit from extra airport channel security'
    ],
    hasEnhanceTrip: true,
    sidebarWidgetType: 'calendar',
    hasFaq: false,
    hasSimilarHotels: true,
    similarHotels: [
      { name: 'Titanic Palace', location: 'HURGHADA - EGYPT', rating: 5, price: 634, image: 'Resort View' },
      { name: 'City Hotel Dubrovnik', location: 'CROATIA - DUBROVNIK', rating: 4, price: 455, image: 'Cityscape' },
      { name: 'Iris Hotel Eden', location: 'CZECH REPUBLIC - PRAGUE', rating: 4, price: 134, image: 'River View' },
      { name: 'Marrakech Ryads', location: 'MARRAKECH - MOROCCO', rating: 5, price: 289, image: 'Courtyard' }
    ]
  },
  alua: {
    id: 'alua-village',
    name: 'Alua Village Fuerteventura',
    location: 'Canary Islands - Fuerteventura',
    rating: 4,
    price: 660,
    offerHeader: null,
    images: ['Hotel Exterior', 'Pool Area', 'Balcony View', 'Dining Hall'],
    hasWhatsIncluded: false,
    hasEnhanceTrip: false,
    sidebarWidgetType: 'calendar',
    hasFaq: false,
    hasSimilarHotels: true,
    similarHotels: [
      { name: 'Hotel Ereza Mar', location: 'FUERTEVENTURA - SPAIN', rating: 4, price: 558, image: 'Sea View' },
      { name: 'R2 Pajara Beach Hotel', location: 'FUERTEVENTURA - SPAIN', rating: 4, price: 569, image: 'Poolside' },
      { name: 'Arena Castillo', location: 'FUERTEVENTURA - SPAIN', rating: 3, price: 504, image: 'Resort' },
      { name: 'Alua Village', location: 'Canary Islands', rating: 4, price: 660, image: 'Exterior' }
    ]
  }
};

const StarRating = ({ count }: { count: number }) => (
  <div className="flex gap-1 text-pink-500">
    {[...Array(count)].map((_, i) => (
      <Star key={i} size={16} fill="currentColor" className="drop-shadow-sm" />
    ))}
  </div>
);

const TrustPilotWidget = () => (
  <div className="border border-gray-200/80 rounded-2xl p-5 flex flex-col items-center justify-center bg-white shadow-sm mt-6 hover:shadow-md transition-shadow">
    <div className="flex gap-4 mb-4 items-center">
      <div className="flex items-center gap-1.5 font-bold text-gray-700 text-sm">
        <Shield size={18} className="text-blue-500" /> ATOL
      </div>
      <div className="h-5 w-px bg-gray-300"></div>
      <div className="font-bold text-gray-700 text-sm flex items-center gap-1.5">
        <span className="w-4 h-4 bg-black text-white rounded-full flex items-center justify-center text-[10px]">A</span> ABTA
      </div>
    </div>
    <div className="text-[11px] font-bold tracking-widest text-gray-400 mb-3 uppercase">Trusted & Protected</div>
    <div className="flex items-center gap-2 mb-2">
      <Star size={24} fill="#00b67a" color="#00b67a" />
      <span className="font-black text-2xl text-gray-900 tracking-tight">Trustpilot</span>
    </div>
    <div className="flex gap-1 mb-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-[#00b67a] p-1.5 rounded-sm">
          <Star size={14} fill="white" color="white" />
        </div>
      ))}
    </div>
    <div className="text-sm text-gray-600 mt-1">
      TrustScore <span className="font-bold text-gray-900">4.8</span> | <span className="underline font-medium hover:text-pink-600 cursor-pointer">7,844 reviews</span>
    </div>
  </div>
);

const Header = () => (
  <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
    <div className="bg-slate-50 py-1.5 px-4 text-xs font-medium text-slate-600 flex justify-between items-center max-w-7xl mx-auto hidden md:flex border-b border-gray-100">
      <div className="flex items-center gap-2"><Star size={12} fill="#00b67a" color="#00b67a"/> Rated Excellent on Trustpilot</div>
      <div className="flex items-center gap-5">
        <a href="#" className="hover:text-pink-600 transition-colors">Manage Booking</a>
        <a href="#" className="hover:text-pink-600 transition-colors">Help Centre</a>
      </div>
    </div>
    
    <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer group">
        <div className="bg-gradient-to-br from-pink-500 to-pink-700 text-white p-2.5 rounded-xl shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
          <Plane size={24} className="transform -rotate-45" />
        </div>
        <div>
          <div className="text-2xl font-black tracking-tighter text-slate-900 leading-none">PLAN<span className="text-pink-600 font-light">LUXE</span></div>
          <div className="text-[10px] tracking-widest text-slate-400 font-bold uppercase mt-0.5">Luxury For Less</div>
        </div>
      </div>
      
      <nav className="hidden lg:flex items-center gap-8 font-semibold text-sm text-slate-700">
        <a href="#" className="flex items-center gap-1 hover:text-pink-600 transition-colors py-2">Deals & Offers <ChevronDown size={14}/></a>
        <a href="#" className="flex items-center gap-1 hover:text-pink-600 transition-colors py-2">Holiday Styles <ChevronDown size={14}/></a>
        <a href="#" className="flex items-center gap-1 hover:text-pink-600 transition-colors py-2">Destinations <ChevronDown size={14}/></a>
        <a href="#" className="flex items-center gap-1 hover:text-pink-600 transition-colors py-2">Support <ChevronDown size={14}/></a>
      </nav>

      <div className="flex items-center gap-4">
        <button className="hidden md:flex items-center gap-2 bg-pink-50 text-pink-700 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-pink-100 transition-colors border border-pink-100 shadow-sm">
          <Phone size={16} /> 020 7183 2819
        </button>
        <button className="lg:hidden p-2 text-slate-600">
          <div className="w-6 h-0.5 bg-current mb-1.5 rounded"></div>
          <div className="w-6 h-0.5 bg-current mb-1.5 rounded"></div>
          <div className="w-6 h-0.5 bg-current rounded"></div>
        </button>
      </div>
    </div>
  </header>
);

const Breadcrumbs = ({ location, hotelName }: { location: string; hotelName: string }) => (
  <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium py-4">
    <a href="#" className="flex items-center gap-1 hover:text-pink-600 transition-colors">
      <Home size={14} /> Home
    </a>
    <ChevronRight size={14} className="text-slate-300" />
    <a href="#" className="hover:text-pink-600 transition-colors">Destinations</a>
    <ChevronRight size={14} className="text-slate-300" />
    <a href="#" className="hover:text-pink-600 transition-colors capitalize">{location.split(' - ')[0].toLowerCase()}</a>
    <ChevronRight size={14} className="text-slate-300" />
    <span className="text-slate-800 font-semibold">{hotelName}</span>
  </div>
);

const HotelBanner = ({ data, onOpenAI }: { data: HotelData; onOpenAI: (prompt: string) => void }) => (
  <div className="mb-10">
    <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-6">
      
      {/* Title & Info Block */}
      <div className="flex-1">
        {data.offerHeader && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-50 border border-pink-100 text-pink-700 rounded-lg text-xs font-bold mb-3 shadow-sm">
            <Sparkles size={14} className="text-pink-500" />
            {data.offerHeader}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
          <StarRating count={data.rating} />
          <div className="hidden sm:block w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
          <div className="flex items-center text-slate-600 text-sm font-semibold">
            <MapPin size={16} className="mr-1 text-slate-400" />
            <span className="uppercase tracking-wide">{data.location}</span>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl lg:text-[42px] font-black text-slate-900 mb-4 tracking-tight leading-tight">
          {data.name}
        </h1>
        
      </div>
      
      {/* Price & Action Block (Desktop primarily) */}
      <div className="hidden md:flex flex-col items-end gap-3 shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Prices from</div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-pink-600 leading-none">£{data.price}</span>
              <span className="text-sm font-semibold text-slate-500">/pp</span>
            </div>
          </div>
          <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3.5 rounded-xl font-bold text-base transition-all shadow-md shadow-pink-200/50 flex items-center justify-center gap-2 group whitespace-nowrap">
            Enquiry Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <button className="flex items-center justify-center p-2.5 text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm shrink-0">
          <Share2 size={16} />
        </button>
      </div>
    </div>

    {/* Production Image Grid */}
    <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 md:gap-3 h-[300px] sm:h-[400px] md:h-[480px] rounded-2xl overflow-hidden">
      <div className="md:col-span-2 row-span-2 bg-slate-200 relative group cursor-pointer">
        <div className="absolute inset-0 bg-slate-300 flex items-center justify-center text-3xl font-bold text-slate-400 opacity-50">{data.images[0]}</div>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
      </div>
      <div className="hidden md:block bg-slate-200 relative group cursor-pointer">
        <div className="absolute inset-0 bg-slate-300 flex items-center justify-center text-xl font-bold text-slate-400 opacity-50">{data.images[1]}</div>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
      </div>
      <div className="hidden md:block bg-slate-200 relative group cursor-pointer">
        <div className="absolute inset-0 bg-slate-300 flex items-center justify-center text-xl font-bold text-slate-400 opacity-50">{data.images[2]}</div>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
      </div>
      <div className="hidden md:block md:col-span-2 bg-slate-200 relative group cursor-pointer">
        <div className="absolute inset-0 bg-slate-300 flex items-center justify-center text-xl font-bold text-slate-400 opacity-50">{data.images[3]}</div>
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-white text-slate-900 px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg">
            <CalendarIcon size={16} /> View All Photos
          </span>
        </div>
      </div>
    </div>
  </div>
);

const WhatsIncluded = ({ list }: { list: string[] }) => (
  <div className="mb-10 bg-green-50 rounded-2xl p-6 md:p-8">
    <h3 className="text-lg font-bold text-slate-900 mt-0">
      What's Included:
    </h3>
    <ul className="flex flex-col gap-4 m-0 p-0 list-none">
      {list.map((item, i) => (
        <li key={i} className="flex items-center gap-3 text-slate-600 m-0 text-[15px]">
          <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center shrink-0">
            <Check size={12} strokeWidth={3} className="text-green-500" />
          </div>
          <span className="leading-snug">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const EnhanceTrip = () => (
  <div className="mb-12 rounded-3xl p-1 bg-gradient-to-br from-purple-200 via-pink-100 to-indigo-100 shadow-sm relative">
    <div className="bg-white/80 backdrop-blur-sm rounded-[22px] p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-1">
            <Sparkles className="text-purple-600" /> Enhance Your Trip
          </h3>
          <p className="text-slate-500 m-0 font-medium">Exclusive perks included when you book today.</p>
        </div>
        <div className="flex flex-col items-end">
           <div className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">Offer Ends In</div>
           <div className="flex gap-1.5 font-mono font-bold text-slate-800 text-lg">
             <div className="bg-white px-2.5 py-1.5 rounded-lg shadow-sm border border-slate-100">02<span className="text-[10px] text-slate-400 block font-sans font-normal leading-none mt-0.5">Days</span></div>:
             <div className="bg-white px-2.5 py-1.5 rounded-lg shadow-sm border border-slate-100">09<span className="text-[10px] text-slate-400 block font-sans font-normal leading-none mt-0.5">Hrs</span></div>:
             <div className="bg-white px-2.5 py-1.5 rounded-lg shadow-sm border border-slate-100">14<span className="text-[10px] text-slate-400 block font-sans font-normal leading-none mt-0.5">Mins</span></div>
           </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 flex gap-5 border border-slate-200 shadow-sm items-center hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group">
        <div className="w-24 h-24 bg-slate-100 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold text-slate-400 overflow-hidden">
          <img src="/api/placeholder/100/100" alt="Tour" className="w-full h-full object-cover mix-blend-multiply opacity-50" />
        </div>
        <div className="flex-1">
          <div className="inline-block bg-purple-100 text-purple-700 text-[10px] font-black px-2.5 py-1 rounded-md mb-2 uppercase tracking-widest">Included Free</div>
          <h4 className="font-bold text-slate-900 text-lg m-0 mb-1 group-hover:text-purple-700 transition-colors">VIP Marrakech City Tour</h4>
          <p className="text-sm text-slate-500 m-0 line-clamp-1">Explore the vibrant medina and historical sites with a private guide.</p>
        </div>
        <div className="text-right shrink-0 pr-2">
          <div className="text-xs text-slate-400 line-through mb-0.5 font-semibold">£45.00</div>
          <div className="font-black text-green-600 text-xl tracking-tight">FREE</div>
        </div>
      </div>
    </div>
  </div>
);

const ContactAndTrending = () => (
  <div className="my-12">
    {/* Contact Strip */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 lg:hidden">
      <button className="bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm"><Phone size={18}/> Call to Book</button>
      <button className="bg-pink-50 text-pink-700 border border-pink-100 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-pink-100"><MessageSquare size={18}/> Live Chat</button>
      <button className="bg-[#25D366] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm"><MessageSquare size={18}/> WhatsApp</button>
    </div>

    {/* Trending Banner */}
    <div className="bg-gradient-to-r from-pink-600 to-purple-700 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between text-white shadow-xl relative overflow-hidden">
      <div className="absolute -right-10 -top-10 opacity-10">
        <Flame size={250} />
      </div>
      <div className="relative z-10 flex items-center gap-6 mb-6 md:mb-0">
        <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
          <Flame size={32} className="text-yellow-300" />
        </div>
        <div>
          <h3 className="text-2xl md:text-3xl font-black mb-1 tracking-tight">TOP TRENDING DEALS</h3>
          <p className="text-pink-100 font-medium tracking-wide">DISCOVER EXCLUSIVE OFFERS TODAY</p>
        </div>
      </div>
      <button className="relative z-10 w-full md:w-auto bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-black px-8 py-3.5 rounded-xl transition-all shadow-lg hover:scale-105">
        Unlock Deals
      </button>
    </div>
  </div>
);

const StaticPricingCard = ({ seasonalPricing }: { seasonalPricing: SeasonalPricing }) => {
  const [isDatesExpanded, setIsDatesExpanded] = useState(true);
  const seasonEntries = Object.entries(seasonalPricing);

  return (
  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm sticky top-24">
    <div className="p-6 border-b border-slate-100">

      <h3 className="font-black text-slate-900 flex items-center gap-2 text-lg mb-5">
        <CalendarIcon size={20} className="text-pink-600" />
        Seasonal Pricing
      </h3>
      <div className="space-y-3">
        {seasonEntries.map(([season, info]) => (
          <div 
            key={season} 
            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
              info.selected 
                ? 'border-pink-600 bg-pink-50 shadow-sm' 
                : 'border-slate-100 hover:border-pink-300 hover:bg-slate-50'
            }`}
          >
            {info.selected && (
              <div className="absolute -top-3 right-4 bg-pink-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm">
                <Check size={10} strokeWidth={3} /> Selected
              </div>
            )}
            <div className="flex justify-between items-center mb-1">
              <div className="font-bold text-slate-900 capitalize text-sm">{season} Season</div>
              <div className="text-right">
                <span className="text-xs text-slate-500 mr-1 font-medium">from</span>
                <span className="font-black text-xl text-pink-600">£{info.price}</span>
                <span className="text-xs text-slate-500 font-medium">/pp</span>
              </div>
            </div>
            <div className="text-xs text-slate-500 font-medium">{info.dates}</div>
          </div>
        ))}
      </div>
      {/* Detailed Departure Dates */}
      <div className="mt-5 border border-slate-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setIsDatesExpanded((p) => !p)}
          className={`w-full px-4 py-3 flex items-center justify-between transition-colors hover:bg-pink-50 ${isDatesExpanded ? "border-b border-slate-100" : ""}`}
        >
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
            <CalendarIcon size={18} className="text-pink-600" />
            Detailed Departure Dates
          </h3>
          {isDatesExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </button>
        {isDatesExpanded && (
          <div className="px-4 divide-y divide-slate-100">
            {seasonEntries.map(([season, info]) => (
              <div key={season} className="flex items-start gap-4 py-3">
                <div className="flex items-baseline gap-1 shrink-0 w-[68px] rounded-[8px] bg-pink-50 px-2 py-1">
                  <span className="text-sm font-bold text-pink-600">£{info.price}</span>
                  <span className="text-[11px] text-slate-400 font-medium">pp</span>
                </div>
                <span className="text-xs text-slate-500">{info.dates}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    <div className="bg-slate-50 p-6 border-t border-slate-100">
      <div className="text-[11px] leading-tight text-slate-500 mb-5 bg-slate-100 p-3 rounded-lg flex gap-2 border border-slate-200">
         <Info size={16} className="shrink-0 text-slate-400" />
         Local tax not included. Accommodation tax approx $3 per person/night payable locally at the hotel.
      </div>
      <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md text-base">
        <Phone size={18} /> Call to Book This Price
      </button>
    </div>
  </div>
  );
};

const HolidayCalendarWidget = ({ basePrice }: { basePrice: number }) => (
  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm sticky top-24">
    <div className="p-6 border-b border-slate-100">
      <h3 className="font-black text-slate-900 mb-5 text-lg flex items-center gap-2">
        <CalendarIcon size={20} className="text-pink-600" /> Check Availability
      </h3>
      
      <div className="space-y-4 mb-6">
        <div>
           <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Departure Airport</label>
           <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-pink-500 outline-none appearance-none cursor-pointer">
             <option>Any London (LGW, LHR, STN)</option>
             <option>Manchester (MAN)</option>
             <option>Birmingham (BHX)</option>
           </select>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
             <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Duration</label>
             <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-pink-500 outline-none appearance-none cursor-pointer">
               <option>4 Nights</option>
               <option>7 Nights</option>
               <option>10 Nights</option>
             </select>
          </div>
          <div className="flex-1">
             <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Board</label>
             <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-pink-500 outline-none appearance-none cursor-pointer">
               <option>Room Only</option>
               <option>Bed & Breakfast</option>
               <option>All Inclusive</option>
             </select>
          </div>
        </div>
      </div>

      {/* Production-Style Calendar Grid */}
      <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-4 font-bold text-slate-800">
          <button className="p-1 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft size={20}/></button>
          November 2026
          <button className="p-1 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight size={20}/></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
          <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
           <div className="p-2"></div><div className="p-2"></div><div className="p-2"></div>
           {[...Array(27)].map((_, i) => {
             const price = basePrice + (i % 3 === 0 ? 30 : 0) + (i % 5 === 0 ? 100 : 0);
             const isSelected = i === 8;
             const isCheapest = price === basePrice;
             
             return (
               <div key={i} className={`p-1.5 rounded-lg cursor-pointer transition-all border ${
                 isSelected 
                  ? 'bg-pink-600 text-white font-bold border-pink-600 shadow-md transform scale-105' 
                  : isCheapest 
                    ? 'bg-green-50 text-green-700 font-bold border-green-100 hover:border-green-300' 
                    : 'hover:bg-slate-50 text-slate-700 border-transparent hover:border-slate-200'
               }`}>
                  <div className="leading-none mb-1">{i + 1}</div>
                  <div className={`text-[9px] font-semibold ${isSelected ? 'text-pink-200' : isCheapest ? 'text-green-600' : 'text-slate-400'}`}>£{price}</div>
               </div>
             );
           })}
        </div>
      </div>
    </div>
    <div className="bg-slate-50 p-6">
      <div className="flex justify-between items-end mb-5">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Includes Flights From</div>
          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-sm"><Plane size={14} className="text-pink-600"/> London Gatwick (LGW)</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400 line-through mb-0.5 font-semibold">Was £459</div>
          <div className="text-3xl font-black text-pink-600 tracking-tight">£{basePrice}</div>
        </div>
      </div>
      <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-pink-200/50 text-base">
        Continue to Book
      </button>
    </div>
  </div>
);

const MobileDealSheet = ({ data }: { data: HotelData }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe z-40 lg:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.08)] flex justify-between items-center animate-in slide-in-from-bottom-full">
    <div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Price from</div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-pink-600 leading-none">£{data.price}</span>
        <span className="text-xs font-semibold text-slate-500">/pp</span>
      </div>
    </div>
    <button className="bg-pink-600 text-white px-8 py-3 rounded-xl font-bold shadow-md">
      Check Dates
    </button>
  </div>
);


interface AIConciergeProps {
  data: HotelData;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialPrompt: string;
  setInitialPrompt: (prompt: string) => void;
}

const AIConcierge = ({ data, isOpen, setIsOpen, initialPrompt, setInitialPrompt }: AIConciergeProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSendMessage(initialPrompt);
      setInitialPrompt(''); 
    }
  }, [isOpen, initialPrompt]);

  const handleSendMessage = async (textToProcess = inputValue) => {
    if (!textToProcess.trim()) return;

    const newUserMessage: Message = { role: 'user', text: textToProcess };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const apiKey = ""; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const systemPrompt = `You are a highly knowledgeable, polite, and luxury-focused travel concierge for PlaneLuxe. 
      The user is viewing "${data.name}" in "${data.location}". 
      Keep responses concise (1-2 short paragraphs), enthusiastic, and helpful. Format with bullet points if listing things.`;

      const formattedHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      formattedHistory.push({ role: 'user', parts: [{ text: textToProcess }] });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: formattedHistory,
          systemInstruction: { parts: [{ text: systemPrompt }] },
        })
      });

      const result = await response.json();
      
      if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        setMessages(prev => [...prev, { role: 'bot', text: result.candidates[0].content.parts[0].text }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: "I'm having trouble connecting right now. Please try again." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "I apologize, but I encountered an error processing your request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 w-[calc(100vw-32px)] lg:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] flex flex-col h-[500px] max-h-[80vh] overflow-hidden">
      <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <div className="bg-pink-600 p-2 rounded-full shadow-lg shadow-pink-600/30">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">PlaneLuxe AI</h3>
            <p className="text-[10px] text-slate-400">Expert on {data.name}</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1.5 rounded-full transition-colors text-slate-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 text-sm mt-8">
            <Bot size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="px-4">Hello! I'm your AI concierge. Ask me anything about {data.name} or {data.location}.</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-pink-100' : 'bg-slate-200'}`}>
              {msg.role === 'user' ? <User size={14} className="text-pink-600"/> : <Bot size={14} className="text-slate-600"/>}
            </div>
            <div className={`p-3.5 rounded-2xl max-w-[80%] text-sm ${
              msg.role === 'user' 
                ? 'bg-pink-600 text-white rounded-tr-sm shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm whitespace-pre-wrap leading-relaxed'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 flex-row">
            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-200">
               <Bot size={14} className="text-slate-600"/>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-500 rounded-tl-sm shadow-sm flex items-center gap-2 text-sm">
              <Loader2 size={14} className="animate-spin text-pink-600" /> Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
          <input 
            type="text" 
            placeholder={`Ask about ${data.location.split(' - ')[0]}...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-pink-300 focus:ring-2 focus:ring-pink-100 rounded-full py-3 pl-5 pr-12 text-sm transition-all outline-none"
            disabled={isLoading}
          />
          <button 
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputValue.trim()}
            className="absolute right-1.5 p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentMode, setCurrentMode] = useState('amcRoyal');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [initialAIPrompt, setInitialAIPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('Hotel Details');
  
  const data = mockDataScenarios[currentMode];

  const handleOpenAI = (prompt: string) => {
    setInitialAIPrompt(prompt);
    setIsAIOpen(true);
  };

  const tabs = ['Hotel Details', 'Location', 'Facilities', 'Reviews', 'Fine Print', 'Why We Love It'];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-pink-100 selection:text-pink-900 pb-20 lg:pb-0">
      
      {/* Admin Simulator Header */}
      <div className="bg-slate-900 text-white p-2.5 flex flex-wrap justify-center gap-3 text-xs font-medium z-50 relative border-b border-slate-800">
        <div className="flex items-center gap-2 mr-2 text-slate-400 uppercase tracking-widest">
          <Shield size={14} /> Admin View:
        </div>
        <button onClick={() => setCurrentMode('amcRoyal')} className={`px-4 py-1.5 rounded-full transition-colors ${currentMode === 'amcRoyal' ? 'bg-pink-600' : 'bg-slate-800 hover:bg-slate-700'}`}>Route A (AMC)</button>
        <button onClick={() => setCurrentMode('mogador')} className={`px-4 py-1.5 rounded-full transition-colors ${currentMode === 'mogador' ? 'bg-pink-600' : 'bg-slate-800 hover:bg-slate-700'}`}>Route B (Mogador)</button>
        <button onClick={() => setCurrentMode('alua')} className={`px-4 py-1.5 rounded-full transition-colors ${currentMode === 'alua' ? 'bg-pink-600' : 'bg-slate-800 hover:bg-slate-700'}`}>Route C (Alua)</button>
      </div>

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        
        <Breadcrumbs location={data.location} hotelName={data.name} />
        
        <HotelBanner data={data} onOpenAI={handleOpenAI} />

        {}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative mt-10">
          
          {/* Main Left Column */}
          <div className="lg:col-span-8">
            
            {/* Scrollable Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-200 mb-10 sticky top-[72px] bg-white/95 backdrop-blur z-30 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {tabs.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-4 font-bold text-sm whitespace-nowrap border-b-2 transition-all ${activeTab === tab ? 'border-pink-600 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="prose prose-slate max-w-none">
              
              {data.hasWhatsIncluded && data.whatsIncludedList && <WhatsIncluded list={data.whatsIncludedList} />}
              {data.hasEnhanceTrip && <EnhanceTrip />}

              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-0 mb-6 tracking-tight">About The Hotel</h2>
              
              <h4 className="font-bold text-slate-900 mt-8 mb-3 text-lg">Overview</h4>
              <p className="text-slate-600 leading-relaxed mb-6 text-[15px]">
                {data.name} is a luxury resort offering an exclusive experience for guests who seek a blend of relaxation and adventure. Surrounded by beautiful scenery, it's the perfect destination for families, couples, and anyone wanting to unwind. The property boasts modern architecture blended seamlessly with local cultural touches.
              </p>

              <h4 className="font-bold text-slate-900 mt-8 mb-3 text-lg">Amenities, Sports & Entertainment</h4>
              <p className="text-slate-600 leading-relaxed mb-6 text-[15px]">
                The hotel features a variety of leisure facilities to keep you entertained throughout your stay. Take a dip in the beautiful outdoor pool or enjoy a game of tennis. Guests can also indulge in water sports, while those looking to relax can visit the on-site spa offering traditional and modern therapies.
              </p>

              <ContactAndTrending />

              {}
              {data.hasFaq && (
                <div className="mt-16 bg-slate-50 p-8 rounded-3xl border border-slate-100">
                  <h2 className="text-2xl font-black text-slate-900 mb-8">Frequently Asked Questions</h2>
                  <div className="space-y-3">
                    {['What are the check-in and check-out times?', 'Is there a dress code for the restaurants?', 'Are airport transfers included?'].map((q, i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-pink-300 cursor-pointer transition-colors flex justify-between items-center group shadow-sm">
                        <span className="font-semibold text-slate-700 group-hover:text-pink-600 transition-colors">{q}</span>
                        <ChevronDown size={20} className="text-slate-400 group-hover:text-pink-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.hasSimilarHotels && data.similarHotels && (
                <div className="mt-16 pt-10 border-t border-slate-200">
                  <div className="flex justify-between items-end mb-8">
                    <h2 className="text-2xl font-black text-slate-900">Similar Hotels You Might Like</h2>
                    <a href="#" className="text-sm font-bold text-pink-600 hover:underline hidden sm:block">View all recommendations</a>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {data.similarHotels.slice(0,2).map((hotel, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all group bg-white flex flex-col h-full cursor-pointer">
                        <div className="h-48 bg-slate-200 relative overflow-hidden">
                           <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-400 bg-slate-300 group-hover:scale-105 transition-transform duration-500">{hotel.image}</div>
                           <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg shadow-sm">
                             <StarRating count={hotel.rating} />
                           </div>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{hotel.location}</div>
                          <h4 className="font-bold text-slate-900 text-lg mb-4 leading-tight group-hover:text-pink-600 transition-colors">{hotel.name}</h4>
                          <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-end">
                            <div className="text-xs font-semibold text-slate-500 pb-1">7 nights from</div>
                            <div className="font-black text-pink-600 text-2xl leading-none">£{hotel.price}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {}
          <div className="lg:col-span-4 hidden lg:block">
             <div className="sticky top-28 space-y-6">
              
              {/* Desktop Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-slate-900 text-white py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1.5 hover:bg-slate-800 transition-colors text-[13px] shadow-sm">
                  <Phone size={18} className="text-pink-400"/> Call Us
                </button>
                <button className="bg-pink-50 border border-pink-100 text-pink-700 py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1.5 hover:bg-pink-100 transition-colors text-[13px]">
                  <MessageSquare size={18}/> Live Chat
                </button>
              </div>

              {/* Dynamic Pricing Widgets based on Admin Setting */}
              {data.sidebarWidgetType === 'seasonal' && data.seasonalPricing && (
                <StaticPricingCard seasonalPricing={data.seasonalPricing} />
              )}

              {data.sidebarWidgetType === 'calendar' && (
                <HolidayCalendarWidget basePrice={data.price} />
              )}

              <TrustPilotWidget />

             </div>
          </div>

        </div>
      </main>

      {}
      <div className="bg-slate-50 border-t border-slate-200 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-black text-slate-900 text-center mb-12 tracking-tight">Holidays you can trust.</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center">
             <div className="flex flex-col items-center group cursor-pointer">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-5 text-pink-600 group-hover:scale-110 transition-transform group-hover:shadow-md">
                 <ArrowRight size={28} className="transform rotate-90" />
               </div>
               <h4 className="font-bold text-slate-900 mb-2">Low deposits</h4>
               <p className="text-sm text-slate-500 leading-relaxed">Secure your holiday for as little as £29 per person</p>
             </div>
             <div className="flex flex-col items-center group cursor-pointer">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-5 text-pink-600 group-hover:scale-110 transition-transform group-hover:shadow-md">
                 <CalendarIcon size={28} />
               </div>
               <h4 className="font-bold text-slate-900 mb-2">Spread the cost</h4>
               <p className="text-sm text-slate-500 leading-relaxed">Flexible payment options available to suit you</p>
             </div>
             <div className="flex flex-col items-center group cursor-pointer">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-5 text-pink-600 group-hover:scale-110 transition-transform group-hover:shadow-md">
                 <Phone size={28} />
               </div>
               <h4 className="font-bold text-slate-900 mb-2">24/7 Support</h4>
               <p className="text-sm text-slate-500 leading-relaxed">Our dedicated team is always here to help you</p>
             </div>
             <div className="flex flex-col items-center group cursor-pointer">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-5 text-pink-600 group-hover:scale-110 transition-transform group-hover:shadow-md">
                 <Shield size={28} />
               </div>
               <h4 className="font-bold text-slate-900 mb-2">Fully bonded</h4>
               <p className="text-sm text-slate-500 leading-relaxed">Enjoy peace of mind with full ATOL protection</p>
             </div>
          </div>
        </div>
      </div>

      <footer className="bg-slate-900 text-slate-400 py-16 border-t-[6px] border-pink-600">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <div className="text-3xl font-black tracking-tighter text-white leading-none mb-4">PLAN<span className="text-pink-600 font-light">LUXE</span></div>
            <p className="text-sm leading-relaxed mb-6">PlanMyLuxe is a trading name of Plan My Tour Ltd. Luxury travel curated for the modern explorer.</p>
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Shield size={16} className="text-green-500"/> ATOL Protected
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-5 uppercase text-xs tracking-widest">Contact Us</h4>
            <div className="flex items-center gap-3 text-pink-400 font-black text-2xl mb-3">
              <Phone size={24}/> 020 7183 2819
            </div>
            <p className="text-sm hover:text-white cursor-pointer transition-colors inline-flex items-center gap-1"><MessageSquare size={14}/> Send an enquiry</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-5 uppercase text-xs tracking-widest">Help & Support</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li className="hover:text-pink-400 cursor-pointer transition-colors">Latest Travel Advice</li>
              <li className="hover:text-pink-400 cursor-pointer transition-colors">Contact Us</li>
              <li className="hover:text-pink-400 cursor-pointer transition-colors">FAQ</li>
            </ul>
          </div>
          <div>
             <h4 className="text-white font-bold mb-5 uppercase text-xs tracking-widest">Useful Links</h4>
             <ul className="space-y-3 text-sm font-medium">
              <li className="hover:text-pink-400 cursor-pointer transition-colors">About Us</li>
              <li className="hover:text-pink-400 cursor-pointer transition-colors">Why Choose Us</li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Floating AI & Mobile Deal Sheet triggers */}
      <MobileDealSheet data={data} />

      {!isAIOpen && (
        <button 
          onClick={() => setIsAIOpen(true)}
          className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-slate-800 hover:scale-105 transition-all z-50 group flex items-center gap-2 border border-slate-700"
        >
          <Sparkles size={20} className="text-pink-400 group-hover:animate-pulse" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-bold text-sm">
            Ask AI Concierge
          </span>
        </button>
      )}

      <AIConcierge 
        data={data} 
        isOpen={isAIOpen} 
        setIsOpen={setIsAIOpen} 
        initialPrompt={initialAIPrompt}
        setInitialPrompt={setInitialAIPrompt}
      />
    </div>
  );
}