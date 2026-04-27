"use client";

import { useEffect, useMemo, useState } from "react";

// ─────────────────────────────────────────────────────────────
// Sky gradients — ported directly from Claude Design
// ─────────────────────────────────────────────────────────────
const SKY_DAY: Record<string, string> = {
  sunny:  'linear-gradient(180deg, #FFB36B 0%, #FFD9A8 45%, #F5E8C9 100%)',
  cloudy: 'linear-gradient(180deg, #B6BDC8 0%, #D7DCE3 50%, #E8E4D6 100%)',
  rain:   'linear-gradient(180deg, #6E7782 0%, #9098A3 60%, #B5B4A6 100%)',
  storm:  'linear-gradient(180deg, #2E3239 0%, #4A4F58 60%, #6B6055 100%)',
  snow:   'linear-gradient(180deg, #B8C7D6 0%, #D9E1E8 50%, #EFEBE0 100%)',
};
const SKY_NIGHT: Record<string, string> = {
  sunny:  'linear-gradient(180deg, #0B1E3F 0%, #1F3358 50%, #3A2E55 100%)',
  cloudy: 'linear-gradient(180deg, #161B2E 0%, #2A3145 60%, #44425E 100%)',
  rain:   'linear-gradient(180deg, #0E1420 0%, #1B2233 60%, #2E3145 100%)',
  storm:  'linear-gradient(180deg, #07090F 0%, #14182A 60%, #1E2238 100%)',
  snow:   'linear-gradient(180deg, #1A2440 0%, #34405E 50%, #5C6478 100%)',
};

// ─────────────────────────────────────────────────────────────
// Cloud SVG — from Claude Design
// ─────────────────────────────────────────────────────────────
function Cloud({ w = 100, dark = false, night = false }: { w?: number; dark?: boolean; night?: boolean }) {
  const fill = dark
    ? (night ? '#3A4055' : '#52596A')
    : (night ? '#5C6378' : '#F0EFEA');
  const stroke = dark
    ? (night ? '#4A5168' : '#6A7282')
    : (night ? '#6E748A' : '#D9D6CC');
  const h = w * 0.55;
  return (
    <svg width={w} height={h} viewBox="0 0 100 55">
      <path
        d="M22 38 a14 14 0 0 1 4-25 18 18 0 0 1 33 -3 14 14 0 0 1 18 28 Z"
        fill={fill} stroke={stroke} strokeWidth="1" strokeLinejoin="round"
        style={{ filter: dark ? 'none' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Character SVG — walking, condition-aware outfit
// ─────────────────────────────────────────────────────────────
function Character({ night, condition }: { night: boolean; condition: string }) {
  const wet = condition === 'rain' || condition === 'storm';
  const coat = condition === 'snow' ? '#7B5CE6'
             : wet                  ? '#E07B3D'
             : night                ? '#3B5BA8'
             :                        '#1A1A1A';
  const skin  = '#E8B98A';
  const hair  = '#2A1810';
  const pants = condition === 'snow' ? '#3A4055' : '#1A1A1A';

  return (
    <svg width="62" height="84" viewBox="0 0 62 84" style={{ overflow: 'visible' }}>
      {/* Umbrella */}
      {wet && (
        <g transform="translate(31, 12)" style={{
          transformOrigin: '0px 8px',
          animation: 'wx-umbrella-sway 2s ease-in-out infinite',
        }}>
          <path d="M-26 8 Q-26 -10 0 -10 Q26 -10 26 8 Z" fill="#1A1A1A" stroke="#000" strokeWidth="0.8"/>
          <path d="M-26 8 L0 -10 M-13 8 L0 -10 M0 8 L0 -10 M13 8 L0 -10 M26 8 L0 -10"
                stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" fill="none"/>
          <circle cx="0" cy="-10" r="1.5" fill="#1A1A1A"/>
          <line x1="0" y1="8" x2="0" y2="36" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round"/>
          <path d="M0 36 Q0 40 -3 40" stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </g>
      )}

      {/* Back leg */}
      <g transform="translate(28, 56)" style={{
        transformOrigin: '0px 0px',
        animation: 'wx-leg-back 0.8s ease-in-out infinite',
      }}>
        <rect x="-3" y="0" width="6" height="20" rx="2" fill={pants}/>
        <rect x="-4" y="18" width="8" height="4" rx="1" fill="#0A0A0A"/>
      </g>

      {/* Body / coat */}
      <path d="M22 36 Q19 30 22 26 L40 26 Q43 30 40 36 L42 56 Q42 60 38 60 L24 60 Q20 60 20 56 Z"
            fill={coat} stroke="#000" strokeWidth="0.5" strokeOpacity="0.3"/>

      {/* Front leg */}
      <g transform="translate(34, 56)" style={{
        transformOrigin: '0px 0px',
        animation: 'wx-leg-front 0.8s ease-in-out infinite',
      }}>
        <rect x="-3" y="0" width="6" height="20" rx="2" fill={pants}/>
        <rect x="-4" y="18" width="8" height="4" rx="1" fill="#0A0A0A"/>
      </g>

      {/* Arm holding umbrella / swinging */}
      {wet ? (
        <path d="M28 32 Q24 26 30 18 Q31 16 32 16" stroke={coat} strokeWidth="5" fill="none" strokeLinecap="round"/>
      ) : (
        <path d="M28 32 Q24 40 26 50" stroke={coat} strokeWidth="5" fill="none" strokeLinecap="round"/>
      )}
      <path d="M36 32 Q40 40 38 50" stroke={coat} strokeWidth="5" fill="none" strokeLinecap="round"/>

      {/* Head */}
      <circle cx="31" cy="22" r="7" fill={skin}/>
      {/* Hair */}
      <path d="M24 19 Q24 13 31 13 Q38 13 38 19 Q38 17 36 17 Q34 18 31 18 Q28 18 26 17 Q24 17 24 19 Z" fill={hair}/>

      {/* Snow beanie */}
      {condition === 'snow' && (
        <>
          <ellipse cx="31" cy="14" rx="9" ry="3" fill="#7B5CE6"/>
          <path d="M22 14 Q22 8 31 8 Q40 8 40 14 Z" fill="#7B5CE6"/>
          <circle cx="31" cy="6" r="2.5" fill="#fff"/>
        </>
      )}

      {/* Eyes */}
      <circle cx="29" cy="22" r="0.8" fill="#1A1A1A"/>
      <circle cx="33" cy="22" r="0.8" fill="#1A1A1A"/>

      {/* Sunglasses (sunny day) */}
      {!night && condition === 'sunny' && (
        <>
          <rect x="26" y="20.5" width="4" height="2.5" rx="1" fill="#1A1A1A"/>
          <rect x="32" y="20.5" width="4" height="2.5" rx="1" fill="#1A1A1A"/>
          <line x1="30" y1="21.5" x2="32" y2="21.5" stroke="#1A1A1A" strokeWidth="0.6"/>
          <path d="M29 25 Q31 27 33 25" stroke="#1A1A1A" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Scenery — hills + ground + puddles/snow
// ─────────────────────────────────────────────────────────────
function Scenery({ condition, night }: { condition: string; night: boolean }) {
  const wet   = condition === 'rain' || condition === 'storm';
  const snowy = condition === 'snow';

  const groundTop = night
    ? (snowy ? '#D9E1E8' : '#1F2638')
    : (snowy    ? '#FFFFFF'
      : condition === 'storm'  ? '#3D3528'
      : condition === 'rain'   ? '#5A5448'
      : condition === 'cloudy' ? '#8B8775'
      : '#C8B98A');

  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 90, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Far hills */}
      <svg width="100%" height="60" viewBox="0 0 400 60" preserveAspectRatio="none"
           style={{ position: 'absolute', bottom: 50, left: 0, right: 0, opacity: night ? 0.55 : 0.4 }}>
        <path d="M0 60 L0 40 Q40 22 90 32 T180 28 T280 36 T400 26 L400 60 Z"
              fill={night ? '#0E1525' : 'rgba(0,0,0,0.18)'}/>
      </svg>

      {/* Mid hill */}
      <svg width="100%" height="50" viewBox="0 0 400 50" preserveAspectRatio="none"
           style={{ position: 'absolute', bottom: 36, left: 0, right: 0, opacity: night ? 0.7 : 0.5 }}>
        <path d="M0 50 L0 32 Q60 14 130 22 T260 18 T400 28 L400 50 Z"
              fill={night ? '#171F33' : 'rgba(0,0,0,0.22)'}/>
      </svg>

      {/* Ground */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 46,
        background: `linear-gradient(180deg, ${groundTop} 0%, ${night ? '#0B0F1C' : 'rgba(0,0,0,0.15)'} 100%)`,
        boxShadow: `inset 0 1px 0 ${night ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.3)'}`,
      }}/>

      {/* Snow on ground */}
      {snowy && (
        <div style={{
          position: 'absolute', bottom: 28, left: 0, right: 0, height: 22,
          background: night
            ? 'linear-gradient(180deg, #E8EEF5 0%, #B5BFD0 100%)'
            : 'linear-gradient(180deg, #FFFFFF 0%, #DCE3EB 100%)',
          borderTop: `2px solid ${night ? '#F0F4F8' : '#FFFFFF'}`,
        }}/>
      )}

      {/* Puddle reflections */}
      {wet && [12, 38, 65, 82].map((x, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: 6 + (i % 2) * 4, left: `${x}%`,
          width: 28 + i * 4, height: 4,
          background: night ? 'rgba(180,200,230,0.3)' : 'rgba(255,255,255,0.4)',
          borderRadius: '50%', filter: 'blur(1px)',
          animation: `wx-puddle ${2 + i * 0.4}s ease-in-out infinite alternate`,
        }}/>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SceneCard — main component
// ─────────────────────────────────────────────────────────────
interface SceneCardProps {
  isNight: boolean;
  condition: string;
  hour?: number;
}

export function SceneCard({ isNight: night, condition }: SceneCardProps) {
  // Normalise condition key (fallback to 'sunny')
  const cond = (['sunny','cloudy','rain','storm','snow'].includes(condition) ? condition : 'sunny') as keyof typeof SKY_DAY;
  const sky = (night ? SKY_NIGHT : SKY_DAY)[cond] ?? SKY_DAY.sunny;

  // Random stars — generated client-side to avoid SSR hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const stars = useMemo(() => Array.from({ length: 38 }, (_, i) => ({
    x: (i * 137.508) % 100,          // deterministic-ish golden-angle spread
    y: (i * 97.3) % 55,
    s: 0.4 + (i % 5) * 0.28,
    d: (i * 0.37) % 3,
  })), []);

  const drops = useMemo(() => Array.from({ length: 26 }, (_, i) => ({
    x: (i * 151.3) % 100,
    d: (i * 0.23) % 1.2,
    dur: 0.6 + (i % 7) * 0.071,
    h: 18 + (i % 5) * 2,
  })), []);

  const flakes = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    x: (i * 143.7) % 100,
    d: (i * 0.41) % 4,
    dur: 4 + (i % 8) * 0.5,
    s: 2 + (i % 4) * 0.5,
  })), []);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: sky,
      overflow: 'hidden',
      borderRadius: 'inherit',
    }}>
      <style>{`
        @keyframes wx-sun-pulse  { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.05);opacity:0.92} }
        @keyframes wx-rays       { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes wx-moon-glow  { 0%,100%{filter:drop-shadow(0 0 8px rgba(255,255,255,0.45))} 50%{filter:drop-shadow(0 0 14px rgba(255,255,255,0.7))} }
        @keyframes wx-cloud-drift  { 0%{transform:translateX(-12px)} 50%{transform:translateX(12px)}  100%{transform:translateX(-12px)} }
        @keyframes wx-cloud-drift2 { 0%{transform:translateX(8px)}  50%{transform:translateX(-14px)} 100%{transform:translateX(8px)} }
        @keyframes wx-rain   { 0%{transform:translate3d(0,-20px,0);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translate3d(0,180px,0);opacity:0} }
        @keyframes wx-snow   { 0%{transform:translate3d(0,-20px,0) rotate(0deg);opacity:0} 15%{opacity:1} 85%{opacity:1} 100%{transform:translate3d(20px,200px,0) rotate(360deg);opacity:0} }
        @keyframes wx-twinkle{ 0%,100%{opacity:0.3} 50%{opacity:1} }
        @keyframes wx-flash  { 0%,88%,92%,100%{opacity:0} 89%,91%{opacity:1} }
        @keyframes wx-bolt   { 0%,87%,100%{opacity:0;transform:translateY(-8px) scaleY(0.9)} 89%,92%{opacity:1;transform:translateY(0) scaleY(1)} }
        @keyframes wx-puddle { from{opacity:0.3;transform:scaleX(0.8)} to{opacity:0.9;transform:scaleX(1.1)} }
        @keyframes wx-leg-front{ 0%,100%{transform:rotate(18deg)}  50%{transform:rotate(-22deg)} }
        @keyframes wx-leg-back { 0%,100%{transform:rotate(-18deg)} 50%{transform:rotate(20deg)}  }
        @keyframes wx-walk-in  { from{transform:translateX(160px)} to{transform:translateX(0)} }
        @keyframes wx-umbrella-sway { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
      `}</style>

      {/* Sky layer — all positioned absolutely */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>

        {/* Stars (night only) */}
        {night && mounted && stars.map((s, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
            width: s.s, height: s.s, borderRadius: '50%', background: '#fff',
            animation: `wx-twinkle ${1.6 + s.d}s ease-in-out infinite`,
            animationDelay: `${s.d}s`, opacity: 0.6,
          }}/>
        ))}

        {/* Sun */}
        {!night && (cond === 'sunny' || cond === 'cloudy' || cond === 'snow') && (
          <div style={{ position: 'absolute', top: 14, right: 22, width: 80, height: 80 }}>
            {cond === 'sunny' && (
              <div style={{ position: 'absolute', inset: -16, animation: 'wx-rays 22s linear infinite' }}>
                {[0,30,60,90,120,150].map(a => (
                  <div key={a} style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: 92, height: 2, marginTop: -1, marginLeft: -46,
                    background: 'linear-gradient(90deg, transparent, #FFE3A8 30%, #FFE3A8 70%, transparent)',
                    transform: `rotate(${a}deg)`, opacity: 0.55,
                  }}/>
                ))}
              </div>
            )}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: cond === 'sunny'
                ? 'radial-gradient(circle, #FFEFC2 0%, #FFC966 55%, #FF9B3D 100%)'
                : 'radial-gradient(circle, #FFE9B8 0%, #FFCB78 70%, #FF9B3D 100%)',
              boxShadow: cond === 'sunny'
                ? '0 0 60px rgba(255,180,80,0.5), 0 0 30px rgba(255,210,140,0.6)'
                : '0 0 30px rgba(255,200,120,0.35)',
              animation: 'wx-sun-pulse 5s ease-in-out infinite',
              opacity: cond === 'cloudy' ? 0.55 : 1,
            }}/>
          </div>
        )}

        {/* Moon */}
        {night && (cond === 'sunny' || cond === 'cloudy' || cond === 'snow') && (
          <div style={{ position: 'absolute', top: 18, right: 24, width: 70, height: 70, animation: 'wx-moon-glow 4s ease-in-out infinite' }}>
            <svg width="70" height="70" viewBox="0 0 70 70">
              <defs>
                <radialGradient id="sc-moonGrad" cx="0.4" cy="0.4">
                  <stop offset="0%"   stopColor="#FFFAEC"/>
                  <stop offset="60%"  stopColor="#F0E6CC"/>
                  <stop offset="100%" stopColor="#C9BC9E"/>
                </radialGradient>
              </defs>
              <circle cx="35" cy="35" r="26" fill="url(#sc-moonGrad)"/>
              <circle cx="42" cy="28" r="3"   fill="#C9BC9E" opacity="0.5"/>
              <circle cx="28" cy="38" r="2"   fill="#C9BC9E" opacity="0.4"/>
              <circle cx="40" cy="45" r="2.5" fill="#C9BC9E" opacity="0.4"/>
            </svg>
          </div>
        )}

        {/* Clouds */}
        {(cond === 'cloudy' || cond === 'rain' || cond === 'storm' || cond === 'snow') && (
          <>
            <div style={{ position: 'absolute', top: 26, right: 14, animation: 'wx-cloud-drift 9s ease-in-out infinite' }}>
              <Cloud w={130} dark={cond === 'storm' || cond === 'rain'} night={night}/>
            </div>
            <div style={{ position: 'absolute', top: 64, right: 90, animation: 'wx-cloud-drift2 11s ease-in-out infinite', opacity: 0.85 }}>
              <Cloud w={92} dark={cond === 'storm' || cond === 'rain'} night={night}/>
            </div>
            {(cond === 'cloudy' || cond === 'snow') && (
              <div style={{ position: 'absolute', top: 18, left: 30, animation: 'wx-cloud-drift 13s ease-in-out infinite', opacity: 0.7 }}>
                <Cloud w={70} dark={false} night={night}/>
              </div>
            )}
          </>
        )}

        {/* Rain */}
        {cond === 'rain' && mounted && drops.map((d, i) => (
          <div key={i} style={{
            position: 'absolute', top: 60, left: `${d.x}%`,
            width: 1.5, height: d.h,
            background: night ? 'rgba(180,200,230,0.7)' : 'rgba(70,90,120,0.55)',
            borderRadius: 1,
            animation: `wx-rain ${d.dur}s linear infinite`,
            animationDelay: `${d.d}s`,
          }}/>
        ))}

        {/* Storm — rain + lightning */}
        {cond === 'storm' && (
          <>
            {mounted && drops.map((d, i) => (
              <div key={i} style={{
                position: 'absolute', top: 70, left: `${d.x}%`,
                width: 1.5, height: d.h + 4,
                background: 'rgba(200,220,240,0.7)',
                animation: `wx-rain ${d.dur * 0.85}s linear infinite`,
                animationDelay: `${d.d}s`,
              }}/>
            ))}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 70% 30%, rgba(255,240,200,0.85), transparent 60%)',
              animation: 'wx-flash 5s linear infinite',
            }}/>
            <svg style={{
              position: 'absolute', top: 80, right: 60, width: 36, height: 70,
              animation: 'wx-bolt 5s linear infinite',
              filter: 'drop-shadow(0 0 8px rgba(255,235,180,0.9))',
            }} viewBox="0 0 36 70">
              <path d="M22 0 L8 38 L18 38 L12 70 L30 28 L20 28 Z" fill="#FFE7A0" stroke="#FFC859" strokeWidth="1"/>
            </svg>
          </>
        )}

        {/* Snow */}
        {cond === 'snow' && mounted && flakes.map((f, i) => (
          <div key={i} style={{
            position: 'absolute', top: 40, left: `${f.x}%`,
            width: f.s, height: f.s, borderRadius: '50%',
            background: '#fff', boxShadow: '0 0 4px rgba(255,255,255,0.8)',
            animation: `wx-snow ${f.dur}s linear infinite`,
            animationDelay: `${f.d}s`,
          }}/>
        ))}

        {/* Horizon glow */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          background: night
            ? 'linear-gradient(180deg, transparent, rgba(0,0,0,0.25))'
            : 'linear-gradient(180deg, transparent, rgba(255,200,140,0.18))',
          pointerEvents: 'none',
        }}/>

        {/* Scenery (hills + ground) */}
        <Scenery condition={cond} night={night}/>

        {/* Walking character — slides in from right */}
        <div style={{
          position: 'absolute', bottom: 38, right: 24,
          animation: 'wx-walk-in 1.8s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        }}>
          <Character night={night} condition={cond}/>
        </div>

      </div>
    </div>
  );
}
