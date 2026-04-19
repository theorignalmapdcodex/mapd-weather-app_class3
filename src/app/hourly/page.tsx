"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useTemperature } from "@/contexts/TemperatureContext";
import { useWeather } from "@/contexts/WeatherContext";
import { weatherCodeToCondition, CONDITION_LABELS } from "@/lib/copy";
import { CCHeader } from "@/components/CCHeader";
import { WeatherIcon } from "@/components/WeatherIcon";
import Link from "next/link";
import { HourlyForecast } from "@/types/weather";

const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", monospace';
const DISPLAY = 'var(--font-syne), "Syne", system-ui';
const BODY = 'var(--font-space-grotesk), "Space Grotesk", system-ui';

function toC(f: number) { return Math.round((f - 32) * 5 / 9); }
function displayTemp(f: number, unit: string) { return unit === 'C' ? toC(f) : f; }

function TempChart({ data, accent, bgCard, ink }: {
  data: HourlyForecast[]; accent: string; bgCard: string; ink: string;
}) {
  if (data.length < 2) return null;
  const W = 320, H = 100, PAD_X = 16, PAD_Y = 14;
  const temps = data.map(d => d.temperature);
  const minT = Math.min(...temps) - 3;
  const maxT = Math.max(...temps) + 3;
  const rng = maxT - minT || 1;
  const toX = (i: number) => PAD_X + (i / (data.length - 1)) * (W - PAD_X * 2);
  const toY = (t: number) => PAD_Y + (1 - (t - minT) / rng) * (H - PAD_Y * 2);
  const pts = data.map((d, i) => [toX(i), toY(d.temperature)] as [number, number]);

  let linePath = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const cx = (pts[i - 1][0] + pts[i][0]) / 2;
    linePath += ` C ${cx} ${pts[i - 1][1]} ${cx} ${pts[i][1]} ${pts[i][0]} ${pts[i][1]}`;
  }
  const areaPath = linePath + ` L ${pts[pts.length - 1][0]} ${H} L ${pts[0][0]} ${H} Z`;

  const showEvery = Math.ceil(data.length / 6);
  const labelIndices = data.map((_, i) => i).filter(i => i % showEvery === 0 || i === data.length - 1);

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      <svg viewBox={`0 0 ${W} ${H + 20}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#cg)" />
        <path d={linePath} fill="none" stroke={accent} strokeWidth="2" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={3} fill={bgCard} stroke={accent} strokeWidth="1.8" />
        ))}
        {labelIndices.map(i => (
          <text key={i} x={pts[i][0]} y={H + 14} textAnchor="middle"
            style={{ fontFamily: MONO, fontSize: 9, fill: ink, opacity: 0.5 }}>
            {i === 0 ? 'NOW' : (() => {
              try { return new Date(data[i].time + ':00').toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }).replace(' ', ''); }
              catch { return data[i].time.slice(11, 16); }
            })()}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function HourlyPage() {
  const { theme, accent, personality } = useTheme();
  const { unit } = useTemperature();
  const { weather, loading } = useWeather();

  const pageStyle = {
    background: theme.bg, minHeight: '100dvh',
    padding: '56px 16px 120px', color: theme.ink, fontFamily: BODY,
  };

  if (loading) return (
    <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CCHeader />
      <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase' }}>Loading…</div>
    </div>
  );

  if (!weather) return (
    <div style={pageStyle}>
      <CCHeader />
      <div style={{ paddingTop: 40, textAlign: 'center' }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 800, marginBottom: 12 }}>No city set.</div>
        <Link href="/" style={{ color: accent, fontFamily: MONO, fontSize: 13 }}>← Go to Now tab</Link>
      </div>
    </div>
  );

  const now = new Date();
  const isNight = now.getHours() < 6 || now.getHours() >= 20;

  const getHourlyFrom = () => {
    if (!weather.hourly?.length) return [];
    try {
      const localStr = now.toLocaleString('en-CA', {
        timeZone: weather.timezone, hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit',
      });
      const currentHour = localStr.replace(', ', 'T').slice(0, 13);
      let idx = weather.hourly.findIndex(h => h.time.slice(0, 13) === currentHour);
      if (idx < 0) idx = 0;
      return weather.hourly.slice(idx, idx + 24);
    } catch { return weather.hourly.slice(0, 24); }
  };

  const hourly = getHourlyFrom();

  // Smart copy based on precipitation in next 12h
  const next12 = hourly.slice(0, 12);
  const rainHours = next12.filter(h => h.precipProbability > 40);
  const peakRainHour = rainHours.sort((a, b) => b.precipProbability - a.precipProbability)[0];

  const smartCopy = (() => {
    if (personality === 'data') {
      return `${rainHours.length} of the next 12 hours have >40% rain chance.`;
    }
    if (rainHours.length === 0) {
      return personality === 'warm'
        ? 'Looking clear all day — enjoy every bit of it.'
        : 'No rain in sight. Have a beautiful one.';
    }
    if (peakRainHour) {
      const hourLabel = (() => {
        try { return new Date(peakRainHour.time + ':00').toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }); }
        catch { return 'later'; }
      })();
      return personality === 'warm'
        ? `Rain peaks around ${hourLabel}. Stay dry and take care.`
        : `Rain rolls in around ${hourLabel}. Plan accordingly.`;
    }
    return 'Some rain expected. Check the chart.';
  })();

  const formatHourLabel = (time: string, index: number) => {
    if (index === 0) return 'NOW';
    try { return new Date(time + ':00').toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }).replace(' ', ''); }
    catch { return time.slice(11, 16); }
  };

  return (
    <div style={pageStyle}>
      <CCHeader />

      {/* Page label */}
      <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
        48-Hour Forecast
      </div>

      {/* Big headline */}
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(38px, 12vw, 56px)', letterSpacing: -2, lineHeight: 0.92, marginBottom: 14 }}>
        Hour by<br />hour.
      </div>
      <div style={{ color: theme.mute, fontSize: 15, lineHeight: 1.45, marginBottom: 24, maxWidth: 320 }}>
        {smartCopy}
      </div>

      {/* Temperature chart card */}
      <div style={{ background: theme.card, borderRadius: 22, padding: '18px 16px 10px', marginBottom: 20, border: `1px solid ${theme.border}` }}>
        <TempChart data={hourly.slice(0, 12)} accent={accent} bgCard={theme.card} ink={theme.ink} />
      </div>

      {/* Hourly list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {hourly.map((h, i) => {
          const cond = weatherCodeToCondition(h.weatherCode);
          const condLabel = CONDITION_LABELS[cond];
          const isHighPrecip = h.precipProbability > 40;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', borderRadius: 16,
              background: i === 0 ? theme.cardAlt : 'transparent',
              border: i === 0 ? `1px solid ${theme.border}` : 'none',
            }}>
              <div style={{ width: 42, fontFamily: MONO, fontSize: 11, fontWeight: 700, color: i === 0 ? accent : theme.mute, flexShrink: 0 }}>
                {formatHourLabel(h.time, i)}
              </div>
              <WeatherIcon code={h.weatherCode} size={24} color={theme.ink} accent={accent} night={isNight && i < 6} />
              <div style={{ flex: 1, fontFamily: BODY, fontSize: 14, color: theme.ink }}>{condLabel}</div>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: isHighPrecip ? accent : theme.muter, width: 32, textAlign: 'right' }}>
                {h.precipProbability}%
              </div>
              <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 800, width: 38, textAlign: 'right' }}>
                {displayTemp(h.temperature, unit)}°
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
