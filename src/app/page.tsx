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
import { SceneCard } from "@/components/SceneCard";

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

  // Recalculate isNight using the city's timezone once weather loads
  useEffect(() => {
    if (!weather?.timezone) return;
    try {
      const h = parseInt(
        new Date().toLocaleTimeString('en-US', {
          timeZone: weather.timezone, hour: '2-digit', hour12: false,
        }).slice(0, 2), 10
      );
      setIsNight(h < 6 || h >= 20);
      setNowLabel(
        h < 6  ? 'late night'     :
        h < 12 ? 'this morning'   :
        h < 17 ? 'this afternoon' :
        h < 20 ? 'this evening'   : 'tonight'
      );
    } catch { /* keep browser time */ }
  }, [weather?.timezone]);

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
