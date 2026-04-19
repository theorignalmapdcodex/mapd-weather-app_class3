"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useTemperature } from "@/contexts/TemperatureContext";
import { getWeatherByCoordinates } from "@/lib/getWeather";
import { geocodeCity } from "@/lib/geocode";
import { WeatherData } from "@/types/weather";
import { weatherCodeToCondition, CONDITION_LABELS } from "@/lib/copy";
import { Brand } from "@/components/Brand";
import { WeatherIcon } from "@/components/WeatherIcon";
import { CCCard } from "@/components/CCCard";
import { MegaTemp } from "@/components/MegaTemp";
import Link from "next/link";

const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", monospace';
const DISPLAY = 'var(--font-syne), "Syne", system-ui';
const BODY = 'var(--font-space-grotesk), "Space Grotesk", system-ui';

function toC(f: number) { return Math.round((f - 32) * 5 / 9); }
function disp(f: number, unit: string) { return unit === 'C' ? toC(f) : f; }

export default function WeatherDetailPage() {
  const { location } = useParams<{ location: string }>();
  const { theme, accent } = useTheme();
  const { unit, toggleUnit } = useTemperature();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNight, setIsNight] = useState(false);

  const cityName = decodeURIComponent(location ?? '').replace(/-/g, ' ');

  useEffect(() => {
    const h = new Date().getHours();
    setIsNight(h < 6 || h >= 20);
    if (!cityName) return;
    geocodeCity(cityName).then(geo => {
      if (!geo) { setLoading(false); return; }
      return getWeatherByCoordinates(geo.name, geo.latitude, geo.longitude);
    }).then(data => {
      if (data) setWeather(data);
      setLoading(false);
    });
  }, [cityName]);

  const pageStyle = {
    background: theme.bg, minHeight: '100dvh',
    padding: '0 16px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)', color: theme.ink, fontFamily: BODY,
  };

  // ─── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ ...pageStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Brand size={14} />
        <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginTop: 32 }}>
          Loading {cityName}…
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 99, border: `3px solid ${theme.border}`, borderTopColor: accent, animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!weather) {
    return (
      <div style={{ ...pageStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Brand size={14} />
        <div style={{ fontFamily: DISPLAY, fontSize: 32, fontWeight: 800, marginTop: 32 }}>City not found.</div>
        <Link href="/" style={{ color: accent, fontFamily: MONO, fontSize: 12 }}>← Back home</Link>
      </div>
    );
  }

  const condition = weatherCodeToCondition(weather.current.condition.code);
  const conditionLabel = CONDITION_LABELS[condition];

  // Find hourly window
  const getHourlySlice = (count: number) => {
    if (!weather.hourly?.length) return [];
    try {
      const localStr = new Date().toLocaleString('en-CA', {
        timeZone: weather.timezone, hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit'
      });
      const currentHour = localStr.replace(', ', 'T').slice(0, 13);
      let idx = weather.hourly.findIndex(h => h.time.slice(0, 13) === currentHour);
      if (idx < 0) idx = 0;
      return weather.hourly.slice(idx, idx + count);
    } catch { return weather.hourly.slice(0, count); }
  };

  const hourly = getHourlySlice(24);
  const maxT = hourly.length ? Math.max(...hourly.map(h => h.temperature)) : 80;
  const minT = hourly.length ? Math.min(...hourly.map(h => h.temperature)) : 50;
  const rngT = maxT - minT || 1;

  const formatHourLabel = (time: string, index: number) => {
    if (index === 0) return 'NOW';
    try {
      const d = new Date(time + ':00');
      return d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }).replace(' ', '');
    } catch { return time.slice(11, 16); }
  };

  const formatTime = (iso?: string) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); }
    catch { return '—'; }
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Brand size={14} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', background: theme.chip, borderRadius: 999, padding: 2, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
            {(['F', 'C'] as const).map(u => (
              <div key={u} onClick={() => { if ((unit === 'F') !== (u === 'F')) toggleUnit(); }} style={{
                padding: '4px 10px', borderRadius: 999, cursor: 'pointer',
                background: unit === u ? theme.chipText : 'transparent',
                color: unit === u ? theme.chip : theme.chipText,
                transition: 'all 0.15s',
              }}>{u}°</div>
            ))}
          </div>
          <Link href="/" style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 0.5, textDecoration: 'none', padding: '6px 10px', borderRadius: 99, border: `1px solid ${theme.border}` }}>
            ← HOME
          </Link>
        </div>
      </div>

      {/* Sub-label + title */}
      <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase' }}>
        Detailed forecast
      </div>
      <div style={{ fontFamily: DISPLAY, fontSize: 'clamp(36px, 10vw, 52px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1, marginTop: 6, marginBottom: 4 }}>
        {weather.city}.
      </div>
      <div style={{ color: theme.mute, fontSize: 13, marginBottom: 24 }}>
        {weather.latitude.toFixed(2)}°N, {Math.abs(weather.longitude).toFixed(2)}°W
        {weather.sunrise && ` · Sunrise ${formatTime(weather.sunrise)}`}
      </div>

      {/* Current big card */}
      <CCCard style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'nowrap', minWidth: 0 }}>
          <MegaTemp value={disp(weather.current.temperature, unit)} unit={unit} />
          <div style={{ marginTop: 8, flexShrink: 0 }}>
            <WeatherIcon type={condition} night={isNight} size={56} color={theme.ink} accent={accent} />
          </div>
        </div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 22, letterSpacing: -0.5, marginTop: 8, marginBottom: 4 }}>{conditionLabel}.</div>
        <div style={{ display: 'flex', gap: 16, fontFamily: MONO, fontSize: 12, flexWrap: 'wrap' }}>
          <span><span style={{ color: theme.mute }}>FEELS </span><b>{disp(weather.current.feelsLike, unit)}°</b></span>
          <span><span style={{ color: theme.mute }}>WIND </span><b>{weather.current.windSpeed}mph</b></span>
          <span><span style={{ color: theme.mute }}>HUMIDITY </span><b>{weather.current.humidity}%</b></span>
        </div>
      </CCCard>

      {/* 48-hour chart + list */}
      {hourly.length > 0 && (
        <CCCard style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
            48-hour forecast
          </div>
          {/* SVG chart */}
          <div style={{ marginBottom: 12 }}>
            <svg width="100%" height="90" viewBox="0 0 340 90" preserveAspectRatio="none" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="hGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={accent} stopOpacity="0" />
                </linearGradient>
              </defs>
              {(() => {
                const slice = hourly.slice(0, 12);
                const pts = slice.map((h, i) => {
                  const x = (i / (slice.length - 1)) * 340;
                  const y = 75 - ((h.temperature - minT) / rngT) * 60;
                  return [x, y];
                });
                const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
                return (
                  <g>
                    <path d={`${path} L340,90 L0,90 Z`} fill="url(#hGrad)" />
                    <path d={path} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {pts.map(([x, y], i) => (
                      <circle key={i} cx={x} cy={y} r="3" fill={theme.bg} stroke={accent} strokeWidth="2" />
                    ))}
                  </g>
                );
              })()}
            </svg>
          </div>
          {/* Scrollable hourly list */}
          <div className="scroll-x" style={{ display: 'flex', gap: 0 }}>
            {hourly.slice(0, 12).map((h, i) => (
              <div key={i} style={{
                minWidth: 56, textAlign: 'center', padding: '8px 4px',
                borderLeft: i > 0 ? `1px solid ${theme.border}` : 'none',
                flexShrink: 0,
              }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, marginBottom: 6 }}>{formatHourLabel(h.time, i)}</div>
                <WeatherIcon code={h.weatherCode} size={20} color={theme.ink} accent={accent} night={isNight && i < 4} />
                <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, marginTop: 6 }}>{disp(h.temperature, unit)}°</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: h.precipProbability > 30 ? accent : theme.muter, fontWeight: 600, marginTop: 2 }}>
                  {h.precipProbability}%
                </div>
              </div>
            ))}
          </div>
        </CCCard>
      )}

      {/* 7-day */}
      <CCCard noPad style={{ marginBottom: 12 }}>
        <div style={{ padding: '14px 16px', fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', borderBottom: `1px solid ${theme.border}` }}>
          7-day outlook
        </div>
        {(() => {
          const hiAll = weather.forecast.map(d => d.maxTemp);
          const loAll = weather.forecast.map(d => d.minTemp);
          const mxH = Math.max(...hiAll);
          const mnL = Math.min(...loAll);
          const rng = mxH - mnL || 1;
          return weather.forecast.map((day, i) => {
            const label = i === 0 ? 'Today' : new Date(day.date + 'T12:00').toLocaleDateString('en-US', { weekday: 'short' });
            const hiPct = ((day.maxTemp - mnL) / rng) * 100;
            const loPct = ((day.minTemp - mnL) / rng) * 100;
            return (
              <div key={i} style={{ padding: '16px', borderTop: i > 0 ? `1px solid ${theme.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 44, fontWeight: 700, fontSize: 14, fontFamily: BODY }}>{label}</div>
                  <WeatherIcon code={day.condition.code} size={24} color={theme.ink} accent={accent} />
                  <div style={{ fontFamily: MONO, fontSize: 10, color: day.precipProbability > 30 ? accent : theme.muter, fontWeight: 700, width: 28 }}>
                    {day.precipProbability}%
                  </div>
                  <div style={{ flex: 1 }} />
                  <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: theme.mute, width: 36, textAlign: 'right' }}>
                    {disp(day.minTemp, unit)}°
                  </div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 800, width: 36, textAlign: 'right' }}>
                    {disp(day.maxTemp, unit)}°
                  </div>
                </div>
                <div style={{ height: 5, background: theme.border, borderRadius: 99, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: `${loPct}%`, right: `${100 - hiPct}%`, top: 0, bottom: 0, background: accent, borderRadius: 99 }} />
                </div>
              </div>
            );
          });
        })()}
      </CCCard>
    </div>
  );
}
