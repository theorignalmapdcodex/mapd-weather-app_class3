"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useTemperature } from "@/contexts/TemperatureContext";
import { useWeather } from "@/contexts/WeatherContext";
import { weatherCodeToCondition, getCopy, CONDITION_LABELS } from "@/lib/copy";
import { CCHeader } from "@/components/CCHeader";
import { MegaTemp } from "@/components/MegaTemp";
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
      // Try geolocation
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
    padding: '56px 16px 120px', color: theme.ink, fontFamily: BODY,
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
              <div style={{ fontSize: 14, color: theme.mute, textAlign: 'center', maxWidth: 280, margin: '0 auto 28px', lineHeight: 1.45 }}>
                Tell us where you are. We&apos;ll give you the forecast for right here, right now.
              </div>
              <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
        <div style={{ width: 40, height: 40, borderRadius: 99, border: `3px solid ${theme.border}`, borderTopColor: accent, animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
  const conditionLabel = CONDITION_LABELS[condition];
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

  return (
    <div style={pageStyle}>
      <CCHeader />

      {/* Location + time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: theme.mute }}>
        <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
          <path d="M10 2a6 6 0 0 0-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 0 0-6-6Z" fill="none" stroke={accent} strokeWidth="1.8" />
          <circle cx="10" cy="8" r="2" fill={accent} />
        </svg>
        <span style={{ color: theme.ink, fontWeight: 700 }}>{weather.city}</span>
        <span>· {localTime}</span>
      </div>
      <div style={{ color: theme.mute, fontSize: 13, marginBottom: 20, fontFamily: BODY }}>
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        {' · '}{nowLabel}
      </div>

      {/* MegaTemp + icon */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
        <MegaTemp value={displayTemp(weather.current.temperature, unit)} unit={unit} />
        <div style={{ marginTop: 12, flexShrink: 0 }}>
          <WeatherIcon type={condition} night={isNight} size={64} color={theme.ink} accent={accent} />
        </div>
      </div>

      {/* Condition + copy */}
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 28, letterSpacing: -0.5, marginBottom: 6 }}>
        {conditionLabel}.
      </div>
      <div style={{ color: theme.mute, fontSize: 15, lineHeight: 1.4, marginBottom: 16, maxWidth: 300 }}>
        {copy}
      </div>

      {/* H / L / Feels + updated */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, fontFamily: MONO, fontSize: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div><span style={{ color: theme.mute }}>H </span><b>{displayTemp(weather.forecast[0]?.maxTemp ?? weather.current.temperature, unit)}°</b></div>
        <div><span style={{ color: theme.mute }}>L </span><b>{displayTemp(weather.forecast[0]?.minTemp ?? weather.current.temperature, unit)}°</b></div>
        <div><span style={{ color: theme.mute }}>FEELS </span><b>{displayTemp(weather.current.feelsLike, unit)}°</b></div>
        <div style={{ marginLeft: 'auto', color: accent, fontWeight: 700, fontSize: 10, letterSpacing: 0.5 }}>LIVE</div>
      </div>

      {/* Globe card */}
      <CCCard noPad style={{ marginBottom: 12, position: 'relative' }}>
        <div style={{ padding: '14px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase' }}>Your position</div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.ink, letterSpacing: 1 }}>
            {weather.latitude.toFixed(2)}°{weather.latitude >= 0 ? 'N' : 'S'}, {Math.abs(weather.longitude).toFixed(2)}°{weather.longitude >= 0 ? 'E' : 'W'}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 32px' }}>
          <DottedGlobe size={200} color={theme.ink} accent={accent} pinLat={pinLat} pinLon={pinLon} />
        </div>
        <div style={{ position: 'absolute', left: 16, bottom: 12, fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 0.5 }}>
          SUNRISE {formatTime(weather.sunrise)}
        </div>
        <div style={{ position: 'absolute', right: 16, bottom: 12, fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 0.5 }}>
          SUNSET {formatTime(weather.sunset)}
        </div>
      </CCCard>

      {/* 12-hour strip → links to /hourly */}
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

      {/* 7-day teaser → links to /7-day */}
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

      {/* Widgets row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <CCCard>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Moon</div>
          <div style={{ position: 'relative', width: 44, height: 44, marginBottom: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 99, background: theme.ink }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: `${100 - illum * 0.6}%`, maxWidth: 44, height: 44, borderRadius: '50%', background: theme.card }} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, fontFamily: BODY }}>{phaseName}</div>
          <div style={{ fontSize: 11, color: theme.mute, marginTop: 2, fontFamily: MONO }}>{illum}% lit</div>
        </CCCard>
        <CCCard>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Humidity</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 42, fontWeight: 800, lineHeight: 1 }}>{weather.current.humidity}</div>
          <div style={{ fontSize: 13, marginTop: 4, fontFamily: BODY }}>%</div>
          <div style={{ fontSize: 11, color: theme.mute, marginTop: 4, fontFamily: MONO }}>
            {weather.current.humidity < 40 ? 'Dry' : weather.current.humidity < 70 ? 'Comfortable' : 'Humid'}
          </div>
        </CCCard>
      </div>

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
