import { WORLD_LAND_PATHS } from "./worldLandPaths";

const BRAND = {
  primary: "#CB2187",
  white: "#FFFFFF",
  teal: "#6ECAC4",
  gold: "#FAE398",
  pink: "#FBE3F1",
} as const;

const WONDERS = [
  { id: "chichen", x: 366, y: 168 },
  { id: "machu", x: 430, y: 248 },
  { id: "rio", x: 547, y: 268 },
  { id: "rome", x: 770, y: 118 },
  { id: "petra", x: 862, y: 145 },
  { id: "taj", x: 1032, y: 152 },
  { id: "wall", x: 1186, y: 120 },
] as const;

const ROUTE =
  "M366 168 C 400 220, 418 248, 430 248 C 490 270, 530 268, 547 268 C 640 190, 720 128, 770 118 C 820 138, 848 148, 862 145 C 940 158, 1000 156, 1032 152 C 1110 136, 1160 124, 1186 120";

const MERIDIANS = [120, 280, 440, 600, 760, 920, 1080, 1240, 1400];
const PARALLELS = [50, 120, 190, 260, 330];

function CompassRose({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity="0.9">
      <circle r="34" fill="none" stroke={BRAND.teal} strokeOpacity="0.35" strokeWidth="1" />
      <circle r="26" fill="none" stroke={BRAND.pink} strokeOpacity="0.4" strokeWidth="0.8" />
      <path d="M0 -24 L5 0 L0 24 L-5 0 Z" fill={BRAND.primary} />
      <path d="M-24 0 L0 -5 L24 0 L0 5 Z" fill={BRAND.gold} />
      <circle r="3.5" fill={BRAND.white} />
      <text
        y="-38"
        textAnchor="middle"
        fill={BRAND.white}
        fontSize="9"
        fontFamily="Montserrat, sans-serif"
        fontWeight="700"
        letterSpacing="1.4"
      >
        N
      </text>
    </g>
  );
}

function LandmarkSilhouettes() {
  return (
    <g fill={BRAND.gold} opacity="0.85">
      <g transform="translate(78 292)">
        <path d="M8 36 L28 4 L48 36 Z" />
        <rect x="20" y="28" width="16" height="8" fill={BRAND.white} />
      </g>
      <g transform="translate(1248 286)" fill={BRAND.white}>
        <path d="M8 40 V16 H48 V40" fill={BRAND.pink} />
        <path d="M8 16 Q28 -8 48 16" fill={BRAND.gold} />
        <circle cx="28" cy="2" r="2.4" fill={BRAND.white} />
        <rect x="22" y="28" width="12" height="12" fill={BRAND.primary} />
      </g>
    </g>
  );
}

export default function LandingHeroArt() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[#000000]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(110,202,196,0.2),transparent_56%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_80%,rgba(203,33,135,0.16),transparent_42%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_90%_20%,rgba(250,227,152,0.1),transparent_40%)]" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="40 10 1360 400"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <defs>
          <linearGradient id="lh-route" x1="366" y1="168" x2="1186" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor={BRAND.teal} />
            <stop offset="0.5" stopColor={BRAND.white} />
            <stop offset="1" stopColor={BRAND.primary} />
          </linearGradient>
        </defs>

        {MERIDIANS.map((x) => (
          <line key={`m-${x}`} x1={x} y1="20" x2={x} y2="390" stroke={BRAND.white} strokeOpacity="0.06" />
        ))}
        {PARALLELS.map((y) => (
          <line key={`p-${y}`} x1="60" y1={y} x2="1420" y2={y} stroke={BRAND.white} strokeOpacity="0.06" />
        ))}

        <g fill="rgba(255,255,255,0.5)" fillRule="evenodd" stroke="rgba(110,202,196,0.42)" strokeLinejoin="round" strokeWidth="0.85">
          {WORLD_LAND_PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        <path
          d={ROUTE}
          stroke="url(#lh-route)"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />

        {WONDERS.map((wonder) => (
          <g key={wonder.id} transform={`translate(${wonder.x} ${wonder.y})`}>
            <circle r="7" fill={BRAND.primary} fillOpacity="0.22" />
            <circle r="4.4" fill={BRAND.primary} />
            <circle r="1.8" fill={BRAND.white} />
          </g>
        ))}

        <g transform="translate(690 158) rotate(-18)">
          <path d="M-14 0 L12 -5 L18 0 L12 5 Z M-4 -8 L3 -1 L-4 8" fill={BRAND.white} />
        </g>

        <CompassRose x={168} y={318} />
        <LandmarkSilhouettes />
      </svg>
    </div>
  );
}
