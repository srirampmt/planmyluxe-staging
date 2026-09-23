import { WORLD_LAND_PATHS } from "./worldLandPaths";

const PINS = [
  { id: "nyc", x: 424, y: 117 },
  { id: "rio", x: 547, y: 316 },
  { id: "london", x: 720, y: 83 },
  { id: "capetown", x: 794, y: 351 },
  { id: "dubai", x: 941, y: 166 },
  { id: "bangkok", x: 1122, y: 201 },
  { id: "tokyo", x: 1279, y: 133 },
  { id: "sydney", x: 1325, y: 351 },
] as const;

const PLANE_PATH = "M424 117 C 560 30, 780 50, 941 166 C 1040 120, 1160 90, 1279 133";

export default function MultiCentreBannerArt() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 z-0 bg-[#080e1e]" />
      <div className="absolute z-0 -left-24 top-[-30%] h-[420px] w-[420px] rounded-full bg-[#CB2187]/16 blur-[90px] mc-glow" />
      <div className="absolute z-0 right-[-8%] bottom-[-40%] h-[380px] w-[380px] rounded-full bg-[#3b5ccc]/14 blur-[80px] mc-glow-alt" />

      <svg
        className="absolute inset-0 z-0 h-full w-full"
        viewBox="0 0 1440 420"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <defs>
          <linearGradient id="mc-land" x1="0" y1="0" x2="1440" y2="420" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f4f7ff" stopOpacity="0.38" />
            <stop offset="1" stopColor="#b8c6ff" stopOpacity="0.24" />
          </linearGradient>
          <linearGradient id="mc-route" x1="424" y1="117" x2="1279" y2="133" gradientUnits="userSpaceOnUse">
            <stop stopColor="#CB2187" stopOpacity="0.25" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="1" stopColor="#CB2187" stopOpacity="0.75" />
          </linearGradient>
        </defs>

        <g fill="url(#mc-land)" fillRule="evenodd" stroke="rgba(255,255,255,0.28)" strokeLinejoin="round" strokeWidth="0.8">
          {WORLD_LAND_PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        <path
          d="M424 117 C 520 40, 640 40, 720 83"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1.4"
          strokeLinecap="round"
          className="mc-dash-slow"
        />
        <path
          d="M547 316 C 640 280, 720 240, 794 351"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.2"
          strokeLinecap="round"
          className="mc-dash"
        />
        <path
          d={PLANE_PATH}
          stroke="url(#mc-route)"
          strokeWidth="2"
          strokeLinecap="round"
          className="mc-dash"
        />
        <path
          d="M941 166 C 1040 240, 1180 300, 1325 351"
          stroke="rgba(203,33,135,0.35)"
          strokeWidth="1.4"
          strokeDasharray="5 10"
        />

        {PINS.map((pin, i) => (
          <g key={pin.id} transform={`translate(${pin.x} ${pin.y})`}>
            <circle r="12" fill="#CB2187" className="mc-pin-ring" style={{ animationDelay: `${i * 0.35}s` }} />
            <circle r="5" fill="#CB2187" />
            <circle r="2" fill="white" />
          </g>
        ))}
      </svg>

      <svg
        className="absolute inset-0 z-20 h-full w-full"
        viewBox="0 0 1440 420"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <g transform="translate(673 65) rotate(5)">
          <image
            href="/images/mc-airliner.svg"
            x="-26.5"
            y="-25.2"
            width="52.9"
            height="50.4"
            preserveAspectRatio="none"
          />
        </g>
      </svg>

      <style>{`
        .mc-dash {
          stroke-dasharray: 10 14;
        }
        .mc-dash-slow {
          stroke-dasharray: 6 16;
        }
        .mc-pin-ring {
          transform-box: fill-box;
          transform-origin: center;
          opacity: 0.28;
          animation: mc-pulse 3.6s ease-out infinite;
        }
        .mc-glow {
          animation: mc-drift 12s ease-in-out infinite alternate;
        }
        .mc-glow-alt {
          animation: mc-drift 16s ease-in-out infinite alternate-reverse;
        }
        @keyframes mc-pulse {
          0% { transform: scale(0.7); opacity: 0.4; }
          70% { transform: scale(1.7); opacity: 0; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes mc-drift {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(24px, -16px, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .mc-pin-ring,
          .mc-glow,
          .mc-glow-alt {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
