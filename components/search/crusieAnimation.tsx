import { Cloud } from 'lucide-react';

export default function CruiseAnimation() {
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1200px] rounded-[48px] bg-[#F8F9FA] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.12)] overflow-hidden">
        <div className="px-6 py-5 md:px-10 md:py-6 flex flex-col md:flex-row items-center justify-between min-h-[100px] gap-6">
          {/* Animation Area */}
          <div className="relative flex-1 w-full h-20 bg-gradient-to-r from-sky-100 via-blue-50 to-sky-100 rounded-2xl overflow-hidden shadow-inner flex items-center border border-white/60">
            {/* Sun */}
            <div className="absolute top-2 right-12 w-6 h-6 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse" />

            {/* Clouds */}
            <div className="absolute top-2 left-[15%] text-white drop-shadow-md animate-cloud-slow opacity-90">
              <Cloud size={26} fill="currentColor" />
            </div>
            <div className="absolute top-1.5 left-[65%] text-white drop-shadow-sm animate-cloud-fast opacity-80">
              <Cloud size={16} fill="currentColor" />
            </div>

            {/* Birds */}
            <div className="absolute top-3 left-0 text-slate-400/60 animate-bird-1">
              <svg width="16" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s4-8 10 0c6-8 10 0 10 0" />
              </svg>
            </div>
            <div className="absolute top-5 left-0 text-slate-400/40 animate-bird-2">
              <svg width="12" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s4-8 10 0c6-8 10 0 10 0" />
              </svg>
            </div>

            {/* Ship + Banner */}
            <div className="absolute bottom-2 z-20 flex items-center w-max animate-sail-across">
              {/* Banner */}
              <div className="relative flex items-center animate-banner-wave mr-2 mb-1">
                <div className="bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-white/80 whitespace-nowrap">
                  <span className="bg-gradient-to-r from-[#d81b60] to-[#9d174d] bg-clip-text text-transparent font-bold text-[15px] tracking-wide">
                    Plan My Cruise
                  </span>
                </div>
                <svg className="absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-4" viewBox="0 0 24 16" fill="none">
                  <path d="M0,8 Q12,14 24,4" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
                </svg>
              </div>

              {/* Ship */}
              <div className="relative animate-ship-bob">
                {/* Smoke stacks */}
                <div className="absolute -top-2 flex flex-col items-center" style={{ left: '52px' }}>
                  <div className="w-1.5 h-1.5 bg-slate-300/80 rounded-full absolute animate-smoke-side-1" />
                  <div className="w-1.5 h-1.5 bg-slate-300/80 rounded-full absolute animate-smoke-side-2" style={{ animationDelay: '1s' }} />
                </div>
                <div className="absolute -top-2 flex flex-col items-center" style={{ left: '72px' }}>
                  <div className="w-1.5 h-1.5 bg-slate-300/80 rounded-full absolute animate-smoke-side-1" style={{ animationDelay: '0.5s' }} />
                  <div className="w-1.5 h-1.5 bg-slate-300/80 rounded-full absolute animate-smoke-side-2" style={{ animationDelay: '1.5s' }} />
                </div>

                <svg width="130" height="45" viewBox="0 0 130 45" xmlns="http://www.w3.org/2000/svg">
                  <path d="M -2 40 Q 8 40 12 38 L 2 38 Z" fill="#ffffff" opacity="0.6" />
                  <circle cx="38" cy="14" r="2.5" fill="#e2e8f0" />
                  <rect x="37" y="16" width="2" height="3" fill="#94a3b8" />
                  <circle cx="82" cy="16" r="2" fill="#cbd5e1" />
                  <rect x="81" y="17" width="2" height="2" fill="#94a3b8" />
                  <path d="M 48 6 L 56 6 L 58 19 L 46 19 Z" fill="#d81b60" />
                  <polygon points="48,6 56,6 56.5,9 47.5,9" fill="#0f172a" />
                  <path d="M 68 6 L 76 6 L 78 19 L 66 19 Z" fill="#d81b60" />
                  <polygon points="68,6 76,6 76.5,9 67.5,9" fill="#0f172a" />
                  <path d="M 32 19 L 92 19 C 96 19 98 23 100 25 L 28 25 Z" fill="#ffffff" />
                  <path d="M 22 25 L 102 25 C 108 25 110 29 112 33 L 14 33 Z" fill="#f8fafc" />
                  <path d="M 92 19 C 94 21 95 23 96 25 L 100 25 C 98 23 96 19 92 19 Z" fill="#38bdf8" opacity="0.5" />
                  <path d="M 102 25 C 104 27 106 29 108 33 L 112 33 C 109 29 106 25 102 25 Z" fill="#38bdf8" opacity="0.5" />
                  <line x1="36" y1="22" x2="86" y2="22" stroke="#94a3b8" strokeWidth="2" strokeDasharray="2 4" strokeLinecap="round" />
                  <line x1="26" y1="29" x2="98" y2="29" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="3 4" strokeLinecap="round" />
                  <rect x="40" y="27" width="7" height="3" rx="1.5" fill="#f97316" />
                  <rect x="52" y="27" width="7" height="3" rx="1.5" fill="#f97316" />
                  <rect x="64" y="27" width="7" height="3" rx="1.5" fill="#f97316" />
                  <rect x="76" y="27" width="7" height="3" rx="1.5" fill="#f97316" />
                  <path d="M 8 33 L 114 33 C 122 33 126 37 128 42 L 2 42 C 4 37 6 33 8 33 Z" fill="#0f172a" />
                  <path d="M 6 39 L 126 39" stroke="#38bdf8" strokeWidth="0.75" opacity="0.8" />
                  <path d="M 4 41 L 127 41" stroke="#d81b60" strokeWidth="0.5" opacity="0.6" />
                  <circle cx="20" cy="36" r="1.5" fill="#38bdf8" />
                  <circle cx="35" cy="36" r="1.5" fill="#38bdf8" />
                  <circle cx="50" cy="36" r="1.5" fill="#38bdf8" />
                  <circle cx="65" cy="36" r="1.5" fill="#38bdf8" />
                  <circle cx="80" cy="36" r="1.5" fill="#38bdf8" />
                  <circle cx="95" cy="36" r="1.5" fill="#38bdf8" />
                  <circle cx="110" cy="36" r="1.5" fill="#38bdf8" />
                </svg>
              </div>
            </div>

            {/* Waves */}
            <div className="absolute bottom-1 left-0 w-[200%] h-5 flex animate-wave-slow text-sky-400/40">
              <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.42,111.45,190.1,95.8,236.4,83.56,279.7,70.5,321.39,56.44Z" fill="currentColor" />
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-[200%] h-6 flex animate-wave text-blue-500/40">
              <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.42,111.45,190.1,95.8,236.4,83.56,279.7,70.5,321.39,56.44Z" fill="currentColor" />
              </svg>
            </div>
            <div className="absolute -bottom-1 left-0 w-[200%] h-6 flex animate-wave-fast text-sky-600/50">
              <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.42,111.45,190.1,95.8,236.4,83.56,279.7,70.5,321.39,56.44Z" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex w-full md:w-auto flex-shrink-0">
            <button className="w-full md:w-auto px-8 py-2.5 bg-[#d81b60] text-white text-sm font-medium rounded-full hover:bg-[#b0164e] transition-all hover:shadow-lg shadow-md whitespace-nowrap">
              Visit PlanMyCruise
            </button>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes sail-across {
          0% { transform: translateX(-160px); }
          100% { transform: translateX(110vw); }
        }
        @keyframes ship-bob {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(1deg); }
        }
        @keyframes banner-wave {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(2px) rotate(-1deg); }
        }
        @keyframes smoke-side-1 {
          0% { transform: translate(0,0) scale(0.5); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translate(-25px,-10px) scale(2); opacity: 0; }
        }
        @keyframes smoke-side-2 {
          0% { transform: translate(0,0) scale(0.5); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translate(-25px,-15px) scale(2.5); opacity: 0; }
        }
        @keyframes cloud-move {
          0% { transform: translateX(200%); }
          100% { transform: translateX(-300%); }
        }
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes bird-fly {
          0% { transform: translateX(100vw) translateY(0); }
          30% { transform: translateX(50vw) translateY(-5px); }
          100% { transform: translateX(-20vw) translateY(5px); }
        }

        .animate-bird-1 { animation: bird-fly 18s linear infinite; }
        .animate-bird-2 { animation: bird-fly 22s linear infinite 5s; }
        .animate-sail-across { animation: sail-across 14s linear infinite; }
        .animate-ship-bob { animation: ship-bob 4s ease-in-out infinite; }
        .animate-banner-wave { animation: banner-wave 3s ease-in-out infinite; }
        .animate-smoke-side-1 { animation: smoke-side-1 2s linear infinite; }
        .animate-smoke-side-2 { animation: smoke-side-2 2s linear infinite; }
        .animate-cloud-slow { animation: cloud-move 20s linear infinite; }
        .animate-cloud-fast { animation: cloud-move 12s linear infinite 5s; }
        .animate-wave { animation: wave 10s linear infinite; }
        .animate-wave-slow { animation: wave 15s linear infinite reverse; }
        .animate-wave-fast { animation: wave 7s linear infinite; }
      `}</style>
    </div>
  );
}