"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useTemperature } from "@/contexts/TemperatureContext";
import { useWeather } from "@/contexts/WeatherContext";
import { weatherCodeToCondition, getCopy, getConditionLabel } from "@/lib/copy";
import { CCHeader } from "@/components/CCHeader";
import { WeatherIcon } from "@/components/WeatherIcon";
import { CCCard } from "@/components/CCCard";
import { DottedGlobe, latLonToPinCoords } from "@/components/DottedGlobe";

const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", monospace';
const DISPLAY = 'var(--font-syne), "Syne", system-ui';
const BODY = 'var(--font-space-grotesk), "Space Grotesk", system-ui';

function toC(f: number) { return Math.round((f - 32) * 5 / 9); }
function displayTemp(f: number, unit: string) { return unit === 'C' ? toC(f) : f; }

function getMoonPhase() {
  const now = new Date();
  const known = new Date('2024-01-11');
  const diff = (now.getTime() - known.getTime()) / (1000 * 60 * 60 * 24);
  const cycle = ((diff % 29.53) + 29.53) % 29.53;
  const illum = Math.round(50 - 50 * Math.cos((cycle / 29.53) * 2 * Math.PI));
  const phaseName =
    cycle < 3.7 ? 'New Moon' : cycle < 11.1 ? 'Waxing Crescent' :
    cycle < 14.8 ? 'First Quarter' : cycle < 18.5 ? 'Waxing Gibbous' :
    cycle < 22.1 ? 'Full Moon' : cycle < 25.8 ? 'Waning Gibbous' :
    cycle < 29.2 ? 'Waning Crescent' : 'New Moon';
  return { illum, phaseName };
}

function uvInfo(idx?: number) {
  if (idx === undefined) return { label: '—', color: '#888' };
  if (idx <= 2) return { label: 'Low', color: '#4CAF50' };
  if (idx <= 5) return { label: 'Moderate', color: '#FFB300' };
  if (idx <= 7) return { label: 'High', color: '#FF7043' };
  if (idx <= 10) return { label: 'Very High', color: '#E53935' };
  return { label: 'Extreme', color: '#9C27B0' };
}

function windDirLabel(deg?: number) {
  if (deg === undefined) return '—';
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function pollenLevel(val?: number): string {
  if (!val || val < 1) return 'None';
  if (val < 10) return 'Very Low';
  if (val < 30) return 'Low';
  if (val < 80) return 'Moderate';
  if (val < 150) return 'High';
  return 'Very High';
}

function pollenColor(val?: number, accent?: string): string {
  if (!val || val < 1) return '#888';
  if (val < 30) return '#4CAF50';
  if (val < 80) return '#FFB300';
  if (val < 150) return '#FF7043';
  return accent ?? '#E53935';
}

// Fixed star positions to avoid hydration mismatch
const STARS: [number, number, number, number][] = [
  [42,18,1.2,0.9],[88,12,0.9,0.8],[130,30,1.1,0.85],[168,8,0.8,0.95],
  [210,25,1.0,0.8],[255,16,1.3,0.9],[298,7,0.9,0.75],[345,20,1.1,0.85],
  [378,38,0.8,0.7],[60,44,1.0,0.9],[148,50,0.9,0.8],[228,38,1.2,0.9],
  [320,45,0.8,0.75],[44,60,0.9,0.85],[192,56,1.1,0.8],[268,51,0.8,0.7],
  [385,28,1.0,0.9],[16,68,0.8,0.75],[100,64,0.9,0.8],[285,61,1.1,0.85],
  [158,73,0.7,0.7],[332,70,0.9,0.8],[72,80,0.8,0.75],[408,58,1.0,0.9],
  [182,86,0.7,0.65],[352,83,0.8,0.7],[232,90,0.6,0.65],[112,88,0.7,0.7],
];

function SceneCard({ isNight, condition }: { isNight: boolean; condition: string }) {
  const skyNight   = ['#060D1F','#142750'];
  const skyClear   = ['#4A90D9','#FFDBA0'];
  const skyCloudy  = ['#7A8FA0','#C8D8E4'];
  const skyRain    = ['#3A4D5A','#617888'];
  const skySnow    = ['#8FA8BC','#DCE9F4'];

  const [top, bottom] =
    isNight ? skyNight :
    condition === 'rain' || condition === 'storm' ? skyRain :
    condition === 'snow' ? skySnow :
    condition === 'cloudy' ? skyCloudy :
    skyClear;

  const groundColor = isNight ? '#060D18' : condition === 'rain' ? '#293840' : '#2B5A18';
  const groundColor2 = isNight ? '#0A1428' : condition === 'rain' ? '#364E58' : '#3A7020';

  return (
    <svg width="100%" height="100%" viewBox="0 0 480 200" preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, display: 'block' }}>
        <defs>
          <linearGradient id="sc-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={top} />
            <stop offset="100%" stopColor={bottom} />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="480" height="200" fill="url(#sc-sky)" />

        {isNight ? (
          <>
            {/* Stars */}
            {STARS.map(([x, y, r, op], i) => (
              <circle key={i} cx={x} cy={y} r={r} fill="white" opacity={op} />
            ))}
            {/* Moon — crescent via two circles */}
            <circle cx="400" cy="36" r="24" fill="#E8DDD0" />
            <circle cx="410" cy="28" r="22" fill={top} />
            {/* Ground hills */}
            <path d="M0 155 Q60 138 130 148 Q200 158 270 142 Q340 128 410 140 Q445 146 480 138 L480 200 L0 200 Z" fill={groundColor} />
            <path d="M0 165 Q50 158 110 162 Q200 168 290 158 Q370 150 480 160 L480 200 L0 200 Z" fill={groundColor2} />
            {/* Trees */}
            <path d="M72 150 L80 122 L88 150 Z" fill={groundColor} />
            <path d="M84 150 L90 130 L96 150 Z" fill="#070F1E" />
            <path d="M330 138 L338 108 L346 138 Z" fill={groundColor} />
            {/* Person silhouette — looking up, tilted head */}
            <ellipse cx="240" cy="133" rx="7" ry="7.5" fill={groundColor} />
            <rect x="237" y="140" width="6" height="14" rx="3" fill={groundColor} />
            <line x1="237" y1="146" x2="228" y2="152" stroke={groundColor} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="243" y1="146" x2="250" y2="150" stroke={groundColor} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="238" y1="154" x2="234" y2="166" stroke={groundColor} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="243" y1="154" x2="247" y2="166" stroke={groundColor} strokeWidth="3.5" strokeLinecap="round" />
          </>
        ) : condition === 'rain' || condition === 'storm' ? (
          <>
            {/* Storm clouds */}
            <ellipse cx="90" cy="46" rx="68" ry="32" fill="#4A5E6A" opacity="0.9" />
            <ellipse cx="240" cy="30" rx="90" ry="38" fill="#3C505A" />
            <ellipse cx="390" cy="50" rx="72" ry="30" fill="#4A5E6A" opacity="0.8" />
            {/* Rain streaks */}
            {[52,72,92,132,152,195,225,268,308,345,372,412].map((x, i) => (
              <line key={i} x1={x} y1={70 + (i % 3) * 8} x2={x - 5} y2={90 + (i % 3) * 8}
                stroke="rgba(175,210,230,0.65)" strokeWidth="1.5" />
            ))}
            {/* Ground */}
            <path d="M0 158 Q120 148 240 155 Q360 162 480 150 L480 200 L0 200 Z" fill={groundColor} />
            <path d="M0 168 Q100 162 200 166 Q340 172 480 164 L480 200 L0 200 Z" fill={groundColor2} />
            {/* Person with umbrella */}
            <ellipse cx="240" cy="136" rx="7" ry="7" fill={groundColor} />
            <rect x="237" y="143" width="6" height="14" rx="3" fill={groundColor} />
            <line x1="237" y1="148" x2="228" y2="154" stroke={groundColor} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="243" y1="148" x2="250" y2="152" stroke={groundColor} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="238" y1="157" x2="234" y2="168" stroke={groundColor} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="243" y1="157" x2="247" y2="168" stroke={groundColor} strokeWidth="3.5" strokeLinecap="round" />
            {/* Umbrella */}
            <path d="M226 130 Q240 118 254 130 Q247 130 240 128 Q233 130 226 130 Z" fill="#FF7043" opacity="0.9" />
            <line x1="240" y1="130" x2="240" y2="142" stroke="#FF7043" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
          </>
        ) : (
          <>
            {/* Sun with soft glow */}
            <circle cx="380" cy="46" r="44" fill="#FFDD60" opacity="0.18" />
            <circle cx="380" cy="46" r="32" fill="#FFDD60" opacity="0.35" />
            <circle cx="380" cy="46" r="22" fill="#FFCA28" />
            {/* Clouds if partly cloudy */}
            {condition === 'cloudy' && (
              <>
                <ellipse cx="100" cy="58" rx="62" ry="24" fill="rgba(255,255,255,0.55)" />
                <ellipse cx="260" cy="40" rx="78" ry="28" fill="rgba(255,255,255,0.45)" />
              </>
            )}
            {/* Rolling hills */}
            <path d="M0 152 Q80 132 165 144 Q250 156 330 138 Q395 124 480 136 L480 200 L0 200 Z" fill={groundColor} />
            <path d="M0 162 Q70 155 145 160 Q240 167 320 155 Q400 145 480 158 L480 200 L0 200 Z" fill={groundColor2} />
            {/* Trees */}
            <path d="M68 150 L76 122 L84 150 Z" fill={groundColor} />
            <path d="M80 150 L86 132 L92 150 Z" fill="#245018" />
            <path d="M318 136 L327 107 L336 136 Z" fill={groundColor} />
            {/* Person */}
            <ellipse cx="240" cy="132" rx="7" ry="7.5" fill="#1A1A1A" />
            <rect x="237" y="139" width="6" height="14" rx="3" fill="#1A1A1A" />
            <line x1="237" y1="145" x2="228" y2="151" stroke="#1A1A1A" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="243" y1="145" x2="252" y2="151" stroke="#1A1A1A" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="238" y1="153" x2="234" y2="164" stroke="#1A1A1A" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="243" y1="153" x2="247" y2="164" stroke="#1A1A1A" strokeWidth="3.5" strokeLinecap="round" />
          </>
        )}
    </svg>
  );
}

const POPULAR_CITIES = [
  'New York','London','Tokyo','Paris','Dubai','Lagos','Sydney','Toronto',
  'Accra','Berlin','Singapore','São Paulo','Mumbai','Amsterdam','Nairobi',
  'Mexico City','Seoul','Cairo','Johannesburg','Bangkok','Stockholm','Rome',
];

export default function NowPage() {
  const { theme, accent, personality } = useTheme();
  const { unit } = useTemperature();
  const { weather, loading, loadCity } = useWeather();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [cityInput, setCityInput] = useState("");
  const [detectedCity, setDetectedCity] = useState("");
  const [searching, setSearching] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [nowLabel, setNowLabel] = useState("right now");

  useEffect(() => {
    const h = new Date().getHours();
    setIsNight(h < 6 || h >= 20);
    setNowLabel(h < 6 ? 'late night' : h < 12 ? 'this morning' : h < 17 ? 'this afternoon' : h < 20 ? 'this evening' : 'tonight');
    const saved = localStorage.getItem("homeLocation");
    if (!saved) {
      setShowOnboarding(true);
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async pos => {
          try {
            const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
            const d = await r.json();
            const city = d.address?.city || d.address?.town || d.address?.village || d.address?.county;
            if (city) setDetectedCity(city);
          } catch { /* ignore */ }
        }, () => { /* ignore */ }, { timeout: 5000 });
      }
    }
  }, []);

  async function handleUseDetected() {
    setShowOnboarding(false);
    await loadCity(detectedCity);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!cityInput.trim() || searching) return;
    setSearching(true);
    setShowOnboarding(false);
    await loadCity(cityInput.trim());
    setCityInput("");
    setSearching(false);
  }

  async function handlePopularCity(city: string) {
    setShowOnboarding(false);
    setSearching(true);
    await loadCity(city);
    setSearching(false);
  }

  const formatTime = (iso?: string) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); }
    catch { return '—'; }
  };

  const getHourlySlice = () => {
    if (!weather?.hourly?.length) return [];
    const tz = weather.timezone;
    try {
      const localStr = new Date().toLocaleString('en-CA', {
        timeZone: tz, hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit',
      });
      const currentHour = localStr.replace(', ', 'T').slice(0, 13);
      let idx = weather.hourly.findIndex(h => h.time.slice(0, 13) === currentHour);
      if (idx < 0) idx = 0;
      return weather.hourly.slice(idx, idx + 6);
    } catch { return weather.hourly.slice(0, 6); }
  };

  const formatHourLabel = (time: string, index: number) => {
    if (index === 0) return 'NOW';
    try {
      const d = new Date(time + ':00');
      return d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }).replace(' ', '');
    } catch { return time.slice(11, 16); }
  };

  const pageStyle = {
    background: theme.bg, minHeight: '100dvh',
    padding: '0 16px',
    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
    color: theme.ink, fontFamily: BODY,
  };

  // ─── Onboarding ─────────────────────────────────────────────
  if (showOnboarding) {
    return (
      <div style={{ ...pageStyle, display: 'flex', flexDirection: 'column' }}>
        <CCHeader />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <DottedGlobe size={220} color={theme.ink} accent={accent} pinLat={0.7} pinLon={0.3} />
          </div>

          {detectedCity ? (
            <>
              <div style={{ fontFamily: MONO, fontSize: 11, color: accent, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700, textAlign: 'center' }}>
                ◉ Detected
              </div>
              <div style={{ fontFamily: DISPLAY, fontSize: 'clamp(52px, 18vw, 80px)', fontWeight: 800, letterSpacing: -3, lineHeight: 0.9, textAlign: 'center', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {detectedCity}
              </div>
              <div style={{ fontSize: 14, color: theme.mute, textAlign: 'center', maxWidth: 280, margin: '0 auto 28px', lineHeight: 1.45 }}>
                That&apos;s where you are. We&apos;ll give you the forecast for right here, right now.
              </div>
              <button onClick={handleUseDetected} style={{
                padding: 16, borderRadius: 999, background: theme.ink, color: theme.bg,
                textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 16,
                cursor: 'pointer', border: 'none', width: '100%', marginBottom: 14,
              }}>
                Use my location →
              </button>
              <div style={{ textAlign: 'center', fontSize: 14, color: theme.mute, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
                onClick={() => setDetectedCity("")}>
                Pick a different city
              </div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: MONO, fontSize: 11, color: accent, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700, textAlign: 'center' }}>
                ◉ Where are you?
              </div>
              <div style={{ fontFamily: DISPLAY, fontSize: 'clamp(44px, 14vw, 64px)', fontWeight: 800, letterSpacing: -2, lineHeight: 0.9, textAlign: 'center', marginBottom: 14 }}>
                Your city.
              </div>
              <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <input
                  value={cityInput}
                  onChange={e => setCityInput(e.target.value)}
                  placeholder="e.g. Durham, Tokyo, Lagos…"
                  autoFocus
                  style={{
                    padding: '14px 18px', borderRadius: 999, border: `1px solid ${theme.border}`,
                    background: theme.card, color: theme.ink, fontSize: 16,
                    fontFamily: BODY, outline: 'none', width: '100%', boxSizing: 'border-box',
                  }}
                />
                <button type="submit" style={{
                  padding: 16, borderRadius: 999, background: theme.ink, color: theme.bg,
                  textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 16,
                  cursor: 'pointer', border: 'none', width: '100%',
                }}>
                  {searching ? 'Finding…' : 'Use this location →'}
                </button>
              </form>

              {/* Popular cities */}
              <div style={{ fontFamily: MONO, fontSize: 9, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, textAlign: 'center' }}>
                Or pick a city
              </div>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
              }}>
                {POPULAR_CITIES.map(city => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handlePopularCity(city)}
                    style={{
                      padding: '6px 14px', borderRadius: 999,
                      background: theme.chip, color: theme.chipText,
                      border: `1px solid ${theme.border}`,
                      fontFamily: MONO, fontSize: 10, fontWeight: 700,
                      cursor: 'pointer', letterSpacing: 0.3,
                      transition: 'background 0.15s',
                    }}
                  >{city}</button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── Loading ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ ...pageStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <CCHeader />
        <div style={{ marginTop: 40, fontFamily: MONO, fontSize: 11, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase' }}>
          Fetching your sky…
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 99, border: `3px solid ${theme.border}`, borderTopColor: accent, animation: 'cc-spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!weather) {
    return (
      <div style={pageStyle}>
        <CCHeader />
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 32, fontWeight: 800, marginBottom: 12 }}>No weather yet.</div>
          <div style={{ color: theme.mute, marginBottom: 24 }}>Search for a city to get started.</div>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <input value={cityInput} onChange={e => setCityInput(e.target.value)} placeholder="City name…"
              style={{ flex: 1, padding: '12px 16px', borderRadius: 999, border: `1px solid ${theme.border}`, background: theme.card, color: theme.ink, fontSize: 15, fontFamily: BODY, outline: 'none' }} />
            <button type="submit" style={{ padding: '12px 20px', borderRadius: 999, background: theme.ink, color: theme.bg, border: 'none', cursor: 'pointer', fontFamily: MONO, fontWeight: 700 }}>→</button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Home screen ─────────────────────────────────────────────
  const condition = weatherCodeToCondition(weather.current.condition.code);
  const conditionLabel = getConditionLabel(condition, isNight);
  const copy = getCopy(personality, condition, isNight);
  const { illum, phaseName } = getMoonPhase();
  const hourlySlice = getHourlySlice();
  const { pinLat, pinLon } = latLonToPinCoords(weather.latitude, weather.longitude);

  const localTime = (() => {
    try {
      return new Date().toLocaleTimeString('en-US', {
        timeZone: weather.timezone, hour: 'numeric', minute: '2-digit', hour12: true,
      });
    } catch { return ''; }
  })();

  const uv = uvInfo(weather.current.uvIndex);
  const month = new Date().getMonth(); // 0-11
  const isSpring = month >= 2 && month <= 5;

  // Hero overlay colours — white text on dark skies, dark text on light skies
  const heroOnDark = isNight || condition === 'rain' || condition === 'storm';
  const heroInk    = heroOnDark ? '#FFFFFF' : '#1A1A1A';
  const heroMute   = heroOnDark ? 'rgba(255,255,255,0.72)' : 'rgba(26,26,26,0.6)';
  const heroAcc    = heroOnDark ? 'rgba(255,255,255,0.9)' : accent;

  return (
    <div style={pageStyle}>
      <CCHeader />

      {/* ── Hero: scene animation + all weather info overlaid ── */}
      <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', marginBottom: 16, height: 'clamp(275px, 74vw, 340px)' }}>

        {/* Background scene */}
        <SceneCard isNight={isNight} condition={condition} />

        {/* Gradient for text legibility */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 42%, rgba(0,0,0,0.48) 100%)' }} />

        {/* Overlay content */}
        <div style={{ position: 'absolute', inset: 0, padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>

          {/* Top: city + date */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: heroMute }}>
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a6 6 0 0 0-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 0 0-6-6Z" fill="none" stroke={heroAcc} strokeWidth="1.8" />
                <circle cx="10" cy="8" r="2" fill={heroAcc} />
              </svg>
              <span style={{ color: heroInk, fontWeight: 700 }}>{weather.city}</span>
              <span>· {localTime}</span>
            </div>
            <div style={{ color: heroMute, fontSize: 12, marginTop: 3, fontFamily: BODY }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {nowLabel}
            </div>
          </div>

          {/* Bottom: temp + icon + label + copy + H/L/Feels */}
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(68px, 21vw, 104px)', lineHeight: 0.85, letterSpacing: '-0.05em', color: heroInk }}>
                {displayTemp(weather.current.temperature, unit)}<span style={{ fontSize: 'clamp(26px, 7.5vw, 36px)', marginLeft: 2, letterSpacing: -1 }}>°{unit}</span>
              </div>
              <WeatherIcon type={condition} night={isNight} size={52} color={heroInk} accent={heroOnDark ? 'rgba(255,255,255,0.9)' : accent} />
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, letterSpacing: -0.5, color: heroInk, marginBottom: 3 }}>
              {conditionLabel}.
            </div>
            <div style={{ color: heroMute, fontSize: 13, lineHeight: 1.35, marginBottom: 10, maxWidth: 280 }}>
              {copy}
            </div>
            <div style={{ display: 'flex', gap: 12, fontFamily: MONO, fontSize: 11, color: heroInk, flexWrap: 'wrap', alignItems: 'center' }}>
              <div><span style={{ color: heroMute }}>H </span><b>{displayTemp(weather.forecast[0]?.maxTemp ?? weather.current.temperature, unit)}°</b></div>
              <div><span style={{ color: heroMute }}>L </span><b>{displayTemp(weather.forecast[0]?.minTemp ?? weather.current.temperature, unit)}°</b></div>
              <div><span style={{ color: heroMute }}>FEELS </span><b>{displayTemp(weather.current.feelsLike, unit)}°</b></div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF3B30', animation: 'cc-pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
                <span style={{ color: '#FF3B30', fontWeight: 700, fontSize: 9, letterSpacing: 0.5, fontFamily: MONO }}>LIVE</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 12-hour strip */}
      {hourlySlice.length > 0 && (
        <Link href="/hourly" style={{ textDecoration: 'none' }}>
          <CCCard style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase' }}>
              <span>Next 12 hours</span>
              <span style={{ color: accent }}>See all →</span>
            </div>
            <div style={{ display: 'flex', gap: 0 }}>
              {hourlySlice.map((h, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute }}>{formatHourLabel(h.time, i)}</div>
                  <WeatherIcon code={h.weatherCode} size={22} color={theme.ink} accent={accent} night={isNight && i < 3} />
                  <div style={{ fontSize: 15, fontWeight: 700, fontFamily: DISPLAY }}>{displayTemp(h.temperature, unit)}°</div>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: h.precipProbability > 30 ? accent : theme.muter, fontWeight: 600 }}>
                    {h.precipProbability}%
                  </div>
                </div>
              ))}
            </div>
          </CCCard>
        </Link>
      )}

      {/* 7-day teaser */}
      <Link href="/7-day" style={{ textDecoration: 'none' }}>
        <CCCard noPad style={{ marginBottom: 12 }}>
          <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', borderBottom: `1px solid ${theme.border}` }}>
            <span>7-day forecast</span>
            <span style={{ color: accent }}>Full view →</span>
          </div>
          {weather.forecast.slice(0, 4).map((day, i) => {
            const label = i === 0 ? 'Today' : new Date(day.date + 'T12:00').toLocaleDateString('en-US', { weekday: 'short' });
            return (
              <div key={i} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, borderTop: i > 0 ? `1px solid ${theme.border}` : 'none' }}>
                <div style={{ width: 40, fontWeight: 700, fontSize: 14, fontFamily: BODY }}>{label}</div>
                <WeatherIcon code={day.condition.code} size={20} color={theme.ink} accent={accent} />
                <div style={{ fontFamily: MONO, fontSize: 10, color: day.precipProbability > 30 ? accent : theme.muter, fontWeight: 700, width: 28 }}>{day.precipProbability}%</div>
                <div style={{ flex: 1 }} />
                <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: theme.mute }}>{displayTemp(day.minTemp, unit)}°</div>
                <div style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 800, marginLeft: 6 }}>{displayTemp(day.maxTemp, unit)}°</div>
              </div>
            );
          })}
        </CCCard>
      </Link>

      {/* ── Metrics grid ─────────────────────────────────── */}

      {/* Pollen — show during spring or if values are non-zero */}
      {weather.pollen && (isSpring || (weather.pollen.tree ?? 0) + (weather.pollen.grass ?? 0) + (weather.pollen.weed ?? 0) > 0) && (
        <CCCard style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>Pollen</div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[
              { label: 'Tree', val: weather.pollen.tree },
              { label: 'Grass', val: weather.pollen.grass },
              { label: 'Ragweed', val: weather.pollen.weed },
            ].map(({ label, val }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                {/* Leaf icon */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 4 }}>
                  <path d="M12 22C12 22 3 14 3 8a9 9 0 0 1 18 0c0 6-9 14-9 14Z"
                    fill={pollenColor(val, accent)} opacity="0.85" />
                  <line x1="12" y1="22" x2="12" y2="10" stroke={pollenColor(val, accent)} strokeWidth="1.4" opacity="0.6" />
                </svg>
                <div style={{ fontFamily: MONO, fontSize: 9, color: theme.mute, marginBottom: 3 }}>{label}</div>
                <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 13, color: pollenColor(val, accent) }}>
                  {pollenLevel(val)}
                </div>
              </div>
            ))}
          </div>
        </CCCard>
      )}

      {/* 2-col metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>

        {/* UV Index */}
        <CCCard>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>UV Index</div>
          <div style={{ fontFamily: BODY, fontSize: 11, color: theme.mute, marginBottom: 6 }}>{uv.label} right now</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 38, fontWeight: 800, lineHeight: 1, color: uv.color }}>
            {weather.current.uvIndex ?? '—'}
          </div>
          {/* Gauge bar */}
          <div style={{ marginTop: 10, height: 5, borderRadius: 99, background: `linear-gradient(90deg, #4CAF50, #FFB300, #FF7043, #E53935, #9C27B0)`, position: 'relative' }}>
            <div style={{
              position: 'absolute', top: -3, width: 11, height: 11, borderRadius: 99,
              background: uv.color, border: `2px solid ${theme.bg}`,
              left: `${Math.min(((weather.current.uvIndex ?? 0) / 12) * 100, 95)}%`,
              transform: 'translateX(-50%)',
            }} />
          </div>
        </CCCard>

        {/* Wind */}
        <CCCard>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Wind</div>
          <div style={{ fontFamily: BODY, fontSize: 11, color: theme.mute, marginBottom: 4 }}>
            {weather.current.windSpeed <= 5 ? "It's calm" :
             weather.current.windSpeed <= 15 ? 'Light breeze' :
             weather.current.windSpeed <= 25 ? 'Moderate wind' : 'Strong wind'}
          </div>
          {/* Compass */}
          <div style={{ position: 'relative', width: 56, height: 56, margin: '4px 0' }}>
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="26" stroke={theme.border} strokeWidth="1.5" fill="none" />
              {['N','E','S','W'].map((d, i) => (
                <text key={d} x={28 + [0,20,0,-20][i]} y={28 + [-20,5,24,5][i]}
                  textAnchor="middle" fill={theme.mute} fontSize="8" fontFamily="monospace">{d}</text>
              ))}
              {/* Needle */}
              <line
                x1="28" y1="28"
                x2={28 + 16 * Math.sin(((weather.current.windDirection ?? 0) * Math.PI) / 180)}
                y2={28 - 16 * Math.cos(((weather.current.windDirection ?? 0) * Math.PI) / 180)}
                stroke={accent} strokeWidth="2.5" strokeLinecap="round"
              />
              <circle cx="28" cy="28" r="3" fill={accent} />
            </svg>
          </div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 18, lineHeight: 1 }}>
            {weather.current.windSpeed} <span style={{ fontSize: 11, fontFamily: MONO, color: theme.mute }}>{unit === 'C' ? 'km/h' : 'mph'}</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, marginTop: 2 }}>
            from {windDirLabel(weather.current.windDirection)}
          </div>
        </CCCard>

        {/* Humidity */}
        <CCCard>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Humidity</div>
          <div style={{ fontFamily: BODY, fontSize: 11, color: theme.mute, marginBottom: 6 }}>
            {weather.current.humidity < 40 ? 'The air is dry' : weather.current.humidity < 60 ? 'Similar to yesterday' : weather.current.humidity < 80 ? 'Fairly humid' : 'Very humid'}
          </div>
          <div style={{ fontFamily: DISPLAY, fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{weather.current.humidity}</div>
          <div style={{ fontSize: 13, marginTop: 2, fontFamily: MONO, color: theme.mute }}>%</div>
          {/* Bar */}
          <div style={{ marginTop: 8, height: 5, borderRadius: 99, background: theme.border, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${weather.current.humidity}%`, background: accent, borderRadius: 99, transition: 'width 0.5s' }} />
          </div>
        </CCCard>

        {/* Dew Point */}
        <CCCard>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Dew Point</div>
          <div style={{ fontFamily: BODY, fontSize: 11, color: theme.mute, marginBottom: 10 }}>
            {(weather.current.dewPoint ?? 0) < 32 ? 'The air is very dry' :
             (weather.current.dewPoint ?? 0) < 50 ? 'Pleasant conditions' :
             (weather.current.dewPoint ?? 0) < 60 ? 'Getting muggy' : 'Very muggy'}
          </div>
          <div style={{ fontFamily: DISPLAY, fontSize: 38, fontWeight: 800, lineHeight: 1 }}>
            {weather.current.dewPoint !== undefined ? displayTemp(weather.current.dewPoint, unit) : '—'}
          </div>
          <div style={{ fontSize: 13, marginTop: 2, fontFamily: MONO, color: theme.mute }}>°{unit}</div>
        </CCCard>

        {/* Pressure */}
        <CCCard>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Pressure</div>
          <div style={{ fontFamily: BODY, fontSize: 11, color: theme.mute, marginBottom: 10 }}>
            {(weather.current.pressure ?? 1013) > 1020 ? 'Currently rising' :
             (weather.current.pressure ?? 1013) > 1010 ? 'Holding steady' : 'Currently falling'}
          </div>
          <div style={{ fontFamily: DISPLAY, fontSize: 32, fontWeight: 800, lineHeight: 1 }}>
            {weather.current.pressure ?? '—'}
          </div>
          <div style={{ fontSize: 11, marginTop: 2, fontFamily: MONO, color: theme.mute }}>hPa</div>
        </CCCard>

        {/* Visibility */}
        <CCCard>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Visibility</div>
          <div style={{ fontFamily: BODY, fontSize: 11, color: theme.mute, marginBottom: 10 }}>
            {(weather.current.visibility ?? 0) >= 10000 ? 'Unlimited visibility' :
             (weather.current.visibility ?? 0) >= 5000 ? 'Good visibility' :
             (weather.current.visibility ?? 0) >= 2000 ? 'Moderate visibility' : 'Poor visibility'}
          </div>
          <div style={{ fontFamily: DISPLAY, fontSize: 32, fontWeight: 800, lineHeight: 1 }}>
            {weather.current.visibility !== undefined
              ? unit === 'C'
                ? (weather.current.visibility / 1000).toFixed(1)
                : (weather.current.visibility / 1609).toFixed(1)
              : '—'}
          </div>
          <div style={{ fontSize: 11, marginTop: 2, fontFamily: MONO, color: theme.mute }}>
            {unit === 'C' ? 'km' : 'mi'}
          </div>
        </CCCard>
      </div>

      {/* Moon + Globe row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <CCCard>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Moon</div>
          <div style={{ position: 'relative', width: 44, height: 44, marginBottom: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 99, background: theme.ink }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: `${100 - illum * 0.6}%`, maxWidth: 44, height: 44, borderRadius: '50%', background: theme.card }} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, fontFamily: BODY }}>{phaseName}</div>
          <div style={{ fontSize: 11, color: theme.mute, marginTop: 2, fontFamily: MONO }}>{illum}% lit</div>
        </CCCard>
        <CCCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Sunrise / Sunset</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: theme.ink, textAlign: 'center', lineHeight: 1.8 }}>
            <div>↑ {formatTime(weather.sunrise)}</div>
            <div>↓ {formatTime(weather.sunset)}</div>
          </div>
        </CCCard>
      </div>

      {/* Globe */}
      <CCCard noPad style={{ marginBottom: 12, position: 'relative' }}>
        <div style={{ padding: '14px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase' }}>Your position</div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.ink, letterSpacing: 1 }}>
            {weather.latitude.toFixed(2)}°{weather.latitude >= 0 ? 'N' : 'S'}, {Math.abs(weather.longitude).toFixed(2)}°{weather.longitude >= 0 ? 'E' : 'W'}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 16px' }}>
          <DottedGlobe size={200} color={theme.ink} accent={accent} pinLat={pinLat} pinLon={pinLon} />
        </div>
      </CCCard>

      {/* Plan teaser */}
      <Link href="/plan" style={{ textDecoration: 'none' }}>
        <CCCard style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Today&apos;s Plan</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18 }}>Plan your day. →</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 999, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <line x1="4" y1="7" x2="20" y2="7" stroke={theme.bg} strokeWidth="2" strokeLinecap="round" />
                <line x1="4" y1="12" x2="20" y2="12" stroke={theme.bg} strokeWidth="2" strokeLinecap="round" />
                <line x1="4" y1="17" x2="14" y2="17" stroke={theme.bg} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </CCCard>
      </Link>

      <div style={{ textAlign: 'center', fontFamily: MONO, fontSize: 10, color: theme.muter, letterSpacing: 0.5, marginTop: 12 }}>
        Made with love · @theoriginalmapd
      </div>
    </div>
  );
}
