"use client";

import { CSSProperties } from "react";

// ── Palette ──────────────────────────────────────────────
const SKIN   = '#D4A882';
const SKIN_S = '#C08860';   // shadow skin
const TEAL   = '#58BFC8';
const TEAL_D = '#3A9BA4';
const BEANIE = '#F2F0EC';
const BEANIE_S = '#D8D4CE';
const PANTS  = '#2A3550';
const PANTS_D = '#1C2438';
const SHOES  = '#1A1A28';

// ── Helpers ───────────────────────────────────────────────
function Raindrop({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <line
      x1={x} y1={y} x2={x - 5} y2={y + 16}
      stroke="rgba(180,215,240,0.65)" strokeWidth="1.8" strokeLinecap="round"
      style={{
        animation: `cc-rain-fall 0.9s linear ${delay}s infinite`,
        transformBox: 'fill-box' as CSSProperties['transformBox'],
        transformOrigin: 'top center',
      }}
    />
  );
}

function Snowflake({ x, y, r, delay }: { x: number; y: number; r: number; delay: number }) {
  return (
    <circle
      cx={x} cy={y} r={r}
      fill="rgba(255,255,255,0.85)"
      style={{
        animation: `cc-snow-fall ${1.4 + delay * 0.3}s ease-in-out ${delay}s infinite`,
        transformBox: 'fill-box' as CSSProperties['transformBox'],
        transformOrigin: 'center center',
      }}
    />
  );
}

interface SceneCardProps {
  isNight: boolean;
  condition: string;
  hour?: number;
}

export function SceneCard({ isNight, condition, hour }: SceneCardProps) {
  // Sky colours keyed by time + condition
  const isEvening = !isNight && (hour !== undefined ? hour >= 17 : false);
  const isMorning = !isNight && !isEvening && (hour !== undefined ? hour < 10 : false);

  const skyA =
    isNight                                        ? '#030A1C' :
    isEvening                                      ? '#C0582A' :
    isMorning                                      ? '#5AAAD4' :
    condition === 'rain' || condition === 'storm'  ? '#253646' :
    condition === 'snow'                           ? '#7A9AB2' :
    condition === 'cloudy'                         ? '#4A7090' :
                                                     '#3A8AC8';

  const skyB =
    isNight                                        ? '#08183A' :
    isEvening                                      ? '#E8903A' :
    isMorning                                      ? '#A8D8F0' :
    condition === 'rain' || condition === 'storm'  ? '#3E5464' :
    condition === 'snow'                           ? '#B8D4E8' :
    condition === 'cloudy'                         ? '#8AB8CC' :
                                                     '#82CCE8';

  const skyC =
    isNight                                        ? '#060E28' :
    isEvening                                      ? '#F0C068' :
    isMorning                                      ? '#D4EEF8' :
    condition === 'rain' || condition === 'storm'  ? '#506070' :
    condition === 'snow'                           ? '#D4E8F4' :
    condition === 'cloudy'                         ? '#B0D0DC' :
                                                     '#B8E4F4';

  // Terrain colours
  const hillA =
    isNight                                        ? '#05100C' :
    isEvening                                      ? '#1C3010' :
    condition === 'rain' || condition === 'storm'  ? '#1E2C1C' :
    condition === 'snow'                           ? '#A8C8D8' :
                                                     '#245C1A';

  const hillB =
    isNight                                        ? '#081814' :
    isEvening                                      ? '#243818' :
    condition === 'rain' || condition === 'storm'  ? '#283830' :
    condition === 'snow'                           ? '#C8DDE8' :
                                                     '#2E7020';

  const waterA =
    isNight ? '#060F28' :
    isEvening ? '#C0603A' :
    condition === 'rain' || condition === 'storm' ? '#283848' :
    condition === 'snow' ? '#90B8D0' :
    '#4890C4';

  const waterB =
    isNight ? '#0A183C' :
    isEvening ? '#D07840' :
    condition === 'rain' || condition === 'storm' ? '#303E50' :
    condition === 'snow' ? '#A8CCE0' :
    '#60A8DC';

  // Rain drops layout
  const RAIN_POS = [
    [32,20,0],[72,32,0.12],[118,12,0.3],[158,38,0.07],[202,18,0.45],
    [248,28,0.22],[290,10,0.58],[332,36,0.15],[372,14,0.67],[418,26,0.38],
    [50,60,0.8],[96,48,0.93],[142,72,0.55],[188,54,1.05],[234,64,0.72],
    [278,44,1.18],[316,68,0.85],[360,50,1.3],[400,76,0.62],[440,58,1.45],
  ];

  // Snow flakes layout
  const SNOW_POS = [
    [40,10,2.2,0],[95,22,1.8,0.3],[148,8,2.6,0.6],[196,30,1.4,0.9],
    [244,16,2.0,1.2],[292,26,1.6,1.5],[340,12,2.4,0.4],[388,28,1.8,0.7],
    [60,45,1.6,1.0],[112,35,2.2,1.3],[164,52,1.4,1.6],[212,42,2.0,0.2],
    [260,48,1.8,0.5],[308,38,2.4,0.8],[356,54,1.6,1.1],[404,44,2.0,1.4],
    [430,20,1.4,0.15],[460,40,2.0,0.85],
  ];

  return (
    <svg
      width="100%" height="100%"
      viewBox="0 0 480 220"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', inset: 0, display: 'block' }}
    >
      <defs>
        {/* Sky gradient */}
        <linearGradient id="sc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={skyA} />
          <stop offset="55%"  stopColor={skyB} />
          <stop offset="100%" stopColor={skyC} />
        </linearGradient>

        {/* Water shimmer gradient */}
        <linearGradient id="sc-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={waterA} />
          <stop offset="100%" stopColor={waterB} />
        </linearGradient>

        {/* Sun/moon outer glow */}
        <radialGradient id="sc-sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#FFFBE8" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFDF60" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sc-moon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#C8D8F0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#C8D8F0" stopOpacity="0" />
        </radialGradient>

        {/* Evening sun glow — warm */}
        <radialGradient id="sc-eve-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#FFCC60" stopOpacity="0.6" />
          <stop offset="60%"  stopColor="#FF9030" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FF6020" stopOpacity="0" />
        </radialGradient>

        {/* Haze filter for distant mountains */}
        <filter id="sc-haze" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>

        {/* Soft glow for moon */}
        <filter id="sc-moon-blur">
          <feGaussianBlur stdDeviation="4" />
        </filter>

        {/* Character clip: keeps walk-in from bleeding past left edge */}
        <clipPath id="sc-char-clip">
          <rect x="0" y="0" width="480" height="220" />
        </clipPath>
      </defs>

      {/* ── SKY ────────────────────────────────────────────── */}
      <rect width="480" height="220" fill="url(#sc-sky)" />

      {/* ── NIGHT: stars + moon ───────────────────────────── */}
      {isNight && (
        <>
          {/* Tiny dot stars */}
          {[
            [38,10,1.2,0.9],[72,8,0.9,0.75],[110,18,1.1,0.85],[148,6,0.8,0.7],
            [185,14,1.0,0.8],[220,9,0.9,0.9],[258,4,1.2,0.85],[292,16,0.8,0.7],
            [328,8,1.0,0.8],[362,12,1.1,0.9],[398,5,0.9,0.75],[430,18,1.0,0.85],
            [55,32,0.9,0.8],[92,26,1.2,0.9],[130,36,0.8,0.7],[168,28,1.0,0.85],
            [205,38,0.9,0.75],[242,24,1.1,0.9],[278,34,0.8,0.8],[314,28,1.2,0.85],
            [350,38,0.9,0.7],[386,22,1.0,0.9],[422,30,0.8,0.8],[458,14,1.1,0.75],
          ].map(([cx,cy,r,op], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="white" opacity={op} />
          ))}

          {/* 4-pointed sparkle stars */}
          {([
            [52,14,3.5,0.9],[160,7,3,0.85],[275,20,4,0.95],[410,10,3.5,0.9],[470,28,3,0.8],
          ] as [number,number,number,number][]).map(([cx,cy,s,op],i) => {
            const p = s * 0.22;
            return (
              <path key={i}
                d={`M${cx},${cy-s}L${cx+p},${cy-p}L${cx+s},${cy}L${cx+p},${cy+p}L${cx},${cy+s}L${cx-p},${cy+p}L${cx-s},${cy}L${cx-p},${cy-p}Z`}
                fill="white" opacity={op}
              />
            );
          })}

          {/* Moon glow halo */}
          <circle cx="390" cy="38" r="44" fill="url(#sc-moon-glow)" />
          {/* Moon body */}
          <circle cx="390" cy="38" r="26" fill="#E8E0D4" opacity="0.92" />
          {/* Crescent mask */}
          <circle cx="402" cy="30" r="23" fill={skyA} />
          {/* Subtle moon craters */}
          <circle cx="382" cy="42" r="3.5" fill="rgba(0,0,0,0.08)" />
          <circle cx="393" cy="34" r="2.5" fill="rgba(0,0,0,0.06)" />
        </>
      )}

      {/* ── EVENING SUN: large warm orb near horizon ──────── */}
      {isEvening && !isNight && (
        <>
          <circle cx="420" cy="118" r="80" fill="url(#sc-eve-glow)" />
          <circle cx="420" cy="118" r="52" fill="#FFA030" opacity="0.25" />
          <circle cx="420" cy="118" r="34" fill="#FFB840" opacity="0.5" />
          <circle cx="420" cy="118" r="22" fill="#FFC844" />
          {/* Horizon glow band */}
          <rect x="0" y="130" width="480" height="30"
            fill="url(#sc-eve-glow)" opacity="0.5" />
        </>
      )}

      {/* ── DAY SUN ────────────────────────────────────────── */}
      {!isNight && !isEvening && condition !== 'rain' && condition !== 'storm' && (
        <>
          {/* Outer halos */}
          <circle cx="400" cy="40" r="72" fill="url(#sc-sun-glow)"
            style={{ animation: 'cc-sun-glow 3s ease-in-out infinite' }} />
          <circle cx="400" cy="40" r="50" fill="#FFFBE8" opacity="0.12"
            style={{ animation: 'cc-sun-glow 3s ease-in-out 1s infinite' }} />
          {/* Sun disc */}
          <circle cx="400" cy="40" r="28" fill="#FFCA28" />
          <circle cx="400" cy="40" r="22" fill="#FFE060" />
          {/* 8 rays — soft blur for glow feel */}
          {[0,45,90,135,180,225,270,315].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line key={i}
                x1={400 + 32 * Math.cos(rad)} y1={40 + 32 * Math.sin(rad)}
                x2={400 + 50 * Math.cos(rad)} y2={40 + 50 * Math.sin(rad)}
                stroke="#FFD030" strokeWidth="4.5" strokeLinecap="round" opacity="0.7"
              />
            );
          })}
        </>
      )}

      {/* ── STORM LIGHTNING ────────────────────────────────── */}
      {condition === 'storm' && (
        <path
          d="M235 55 L221 82 L236 82 L215 115"
          stroke="#FFE840" strokeWidth="4" fill="none"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.95"
        />
      )}

      {/* ── CLOUDS ─────────────────────────────────────────── */}
      {(condition === 'rain' || condition === 'storm') && (
        <>
          <g style={{ animation: 'cc-cloud-drift 8s ease-in-out infinite' }}>
            <ellipse cx="60"  cy="42" rx="78" ry="32" fill="#304050" opacity="0.92" />
            <ellipse cx="200" cy="24" rx="108" ry="42" fill="#263444" />
          </g>
          <g style={{ animation: 'cc-cloud-drift 11s ease-in-out 2s infinite' }}>
            <ellipse cx="395" cy="38" rx="88" ry="30" fill="#304050" opacity="0.88" />
          </g>
        </>
      )}

      {condition === 'cloudy' && (
        <>
          <g style={{ animation: 'cc-cloud-drift 9s ease-in-out infinite' }}>
            <ellipse cx="100" cy="36" rx="90" ry="34" fill="rgba(255,255,255,0.6)" />
            <ellipse cx="72"  cy="46" rx="55" ry="24" fill="rgba(255,255,255,0.55)" />
          </g>
          <g style={{ animation: 'cc-cloud-drift 12s ease-in-out 3s infinite' }}>
            <ellipse cx="330" cy="28" rx="100" ry="36" fill="rgba(255,255,255,0.5)" />
            <ellipse cx="360" cy="38" rx="68"  ry="26" fill="rgba(255,255,255,0.45)" />
          </g>
        </>
      )}

      {condition === 'snow' && (
        <>
          <g style={{ animation: 'cc-cloud-drift 10s ease-in-out infinite' }}>
            <ellipse cx="90"  cy="40" rx="85" ry="33" fill="rgba(210,228,240,0.88)" />
          </g>
          <g style={{ animation: 'cc-cloud-drift 13s ease-in-out 4s infinite' }}>
            <ellipse cx="300" cy="26" rx="105" ry="38" fill="rgba(210,228,240,0.82)" />
          </g>
        </>
      )}

      {/* ── RAIN DROPS ─────────────────────────────────────── */}
      {(condition === 'rain' || condition === 'storm') &&
        RAIN_POS.map(([x, y, d], i) => (
          <Raindrop key={i} x={x} y={y} delay={d} />
        ))
      }

      {/* ── SNOWFLAKES ─────────────────────────────────────── */}
      {condition === 'snow' &&
        SNOW_POS.map(([x, y, r, d], i) => (
          <Snowflake key={i} x={x} y={y} r={r} delay={d} />
        ))
      }

      {/* ── DISTANT HAZY MOUNTAINS ─────────────────────────── */}
      <g filter="url(#sc-haze)">
        <path
          d="M0 108 Q40 82 90 92 Q140 100 180 86 Q220 72 265 84 Q310 96 360 78 Q405 62 450 76 Q465 80 480 74 L480 120 L0 120Z"
          fill={isNight ? '#0C1E18' : isEvening ? '#8A4020' : condition === 'snow' ? '#88A8C0' : '#4A8070'}
          opacity={isNight ? 0.9 : 0.65}
        />
        <path
          d="M0 118 Q50 96 110 106 Q170 116 230 98 Q285 82 340 96 Q390 108 440 90 L480 96 L480 130 L0 130Z"
          fill={isNight ? '#0A1C14' : isEvening ? '#7A3818' : condition === 'snow' ? '#9ABCCE' : '#5A9878'}
          opacity={isNight ? 0.85 : 0.7}
        />
      </g>

      {/* ── WATER / LAKE BAND ──────────────────────────────── */}
      <path
        d="M0 130 Q120 124 240 128 Q360 132 480 126 L480 150 Q360 154 240 150 Q120 146 0 152Z"
        fill="url(#sc-water)"
      />
      {/* Water shimmer highlights */}
      {!isNight && !condition.match(/rain|storm/) && (
        <>
          <line x1="60"  y1="138" x2="110" y2="138" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="180" y1="142" x2="240" y2="142" stroke="rgba(255,255,255,0.2)"  strokeWidth="1.2" strokeLinecap="round" />
          <line x1="310" y1="136" x2="370" y2="136" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {/* Night moon reflection */}
      {isNight && (
        <ellipse cx="390" cy="140" rx="12" ry="4" fill="rgba(220,215,200,0.2)" />
      )}

      {/* ── FOREGROUND HILLS ───────────────────────────────── */}
      <path
        d="M0 148 Q80 134 165 144 Q250 154 340 138 Q400 126 480 138 L480 220 L0 220Z"
        fill={hillA}
      />
      <path
        d="M0 158 Q70 150 150 157 Q250 166 340 152 Q410 142 480 155 L480 220 L0 220Z"
        fill={hillB}
      />

      {/* ── TREES (pine silhouettes) ────────────────────────── */}
      {/* Left cluster */}
      <path d="M44 149 L56 112 L68 149Z"  fill={isNight ? '#060E0A' : isEvening ? '#1A2C10' : '#1C5018'} />
      <path d="M60 149 L70 124 L80 149Z"  fill={isNight ? '#080F0C' : isEvening ? '#223414' : '#236020'} />
      {/* Right cluster */}
      <path d="M304 138 L316 100 L328 138Z" fill={isNight ? '#060E0A' : isEvening ? '#1A2C10' : '#1C5018'} />
      <path d="M322 142 L332 116 L342 142Z" fill={isNight ? '#080F0C' : isEvening ? '#223414' : '#236020'} />

      {/* ── BIRDS (day/clear) ──────────────────────────────── */}
      {!isNight && condition !== 'rain' && condition !== 'storm' && condition !== 'snow' && (
        <>
          <path d="M155 50 Q160 46 165 50" stroke={isEvening ? '#E08040' : 'rgba(30,20,10,0.7)'} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M172 44 Q177 40 182 44" stroke={isEvening ? '#E08040' : 'rgba(30,20,10,0.7)'} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M168 58 Q172 55 176 58" stroke={isEvening ? '#E08040' : 'rgba(30,20,10,0.65)'} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* ══════════════════════════════════════════════════════
          CHARACTER — walks in from right, then raises arm
          (group clipped so it can't bleed past left edge)
         ══════════════════════════════════════════════════════ */}
      <g clipPath="url(#sc-char-clip)">
        <g style={{
          animation: 'cc-walk-in 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
          transformBox: 'fill-box' as CSSProperties['transformBox'],
        }}>

          {/* ── Shoes ── */}
          <ellipse cx="345" cy="191" rx="11" ry="5" fill={SHOES} />
          <ellipse cx="367" cy="191" rx="11" ry="5" fill={SHOES} />

          {/* ── Trouser legs ── */}
          <rect x="338" y="174" width="12" height="18" rx="5.5" fill={PANTS} />
          <rect x="358" y="174" width="12" height="18" rx="5.5" fill={PANTS_D} />

          {/* ── Jacket body ── */}
          <path
            d="M332 156 Q328 163 328 174 L380 174 Q380 163 376 156 Q364 148 356 148 Q348 148 332 156Z"
            fill={TEAL}
          />
          {/* Jacket shadow/depth side */}
          <path
            d="M363 148 Q374 155 376 168 L370 174 Q368 163 362 156Z"
            fill={TEAL_D}
          />
          {/* Collar V */}
          <path d="M352 156 L356 166 L360 156" stroke="rgba(255,255,255,0.22)" strokeWidth="2" fill="none" />
          {/* Front zipper line */}
          <line x1="356" y1="160" x2="356" y2="174" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />

          {/* ── Neck ── */}
          <rect x="353" y="146" width="7" height="7" rx="3" fill={SKIN} />

          {/* ── Head ── */}
          <ellipse cx="356" cy="136" rx="15" ry="16" fill={SKIN} />
          {/* Ear */}
          <ellipse cx="341" cy="138" rx="3.5" ry="4.5" fill={SKIN_S} />
          <ellipse cx="371" cy="138" rx="3.5" ry="4.5" fill={SKIN_S} />

          {/* ── Beanie (white/cream) ── */}
          <path d="M341 134 Q340 118 347 112 Q351 107 356 107 Q361 107 365 112 Q372 118 371 134" fill={BEANIE} />
          {/* Beanie cuff / fold */}
          <rect x="341" y="130" width="30" height="7" rx="3.5" fill={BEANIE_S} />
          {/* Pom-pom */}
          <circle cx="356" cy="108" r="5" fill={BEANIE} />
          <circle cx="356" cy="108" r="3.5" fill={BEANIE_S} />

          {/* ── Eyes ── */}
          <ellipse cx="351" cy="135" rx="2.8" ry="3.2" fill="#1A0A00" />
          <ellipse cx="361" cy="135" rx="2.8" ry="3.2" fill="#1A0A00" />
          {/* Eye shine */}
          <ellipse cx="352" cy="134" rx="1.1" ry="1.3" fill="white" opacity="0.75" />
          <ellipse cx="362" cy="134" rx="1.1" ry="1.3" fill="white" opacity="0.75" />

          {/* ── Smile / expression ── */}
          {!isNight && condition !== 'rain' && condition !== 'storm' ? (
            <path d="M351 142 Q356 147 361 142" stroke="#1A0A00" strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M352 143 Q356 141 360 143" stroke="#1A0A00" strokeWidth="2" fill="none" strokeLinecap="round" />
          )}

          {/* ── Left arm — raised toward sky (animated after walk-in) ── */}
          <g style={{
            transformBox: 'fill-box' as CSSProperties['transformBox'],
            transformOrigin: '332px 158px',
            animation: 'cc-arm-raise 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 2.0s forwards',
          }}>
            <path d="M332 158 Q320 150 312 140" stroke={TEAL} strokeWidth="10" strokeLinecap="round" fill="none" />
            <ellipse cx="311" cy="139" rx="6.5" ry="7" fill={SKIN} />
          </g>

          {/* ── Right arm — relaxed / slightly swung ── */}
          <path d="M378 160 Q388 165 393 174" stroke={TEAL_D} strokeWidth="10" strokeLinecap="round" fill="none" />
          <ellipse cx="393" cy="175" rx="6.5" ry="7" fill={SKIN} />

        </g>
      </g>

      {/* ── RAIN umbrella overlay (person has umbrella in rain) ── */}
      {(condition === 'rain' || condition === 'storm') && (
        <g style={{
          animation: 'cc-walk-in 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
          transformBox: 'fill-box' as CSSProperties['transformBox'],
        }}>
          {/* Umbrella dome */}
          <path d="M330 155 Q337 137 356 135 Q375 137 382 155 Q370 152 356 151 Q342 152 330 155Z" fill="#FF6B1A" />
          {/* Rib lines */}
          <path d="M330 155 Q342 152 356 151" stroke="#CC5510" strokeWidth="1.2" fill="none" />
          <path d="M356 151 Q370 152 382 155" stroke="#CC5510" strokeWidth="1.2" fill="none" />
          <path d="M356 151 L356 148" stroke="#CC5510" strokeWidth="1.2" />
          {/* Handle */}
          <line x1="356" y1="151" x2="356" y2="168" stroke="#CC5510" strokeWidth="3" strokeLinecap="round" />
          <path d="M356 168 Q355 174 349 174" stroke="#CC5510" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      )}

    </svg>
  );
}
