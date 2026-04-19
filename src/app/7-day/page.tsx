"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useTemperature } from "@/contexts/TemperatureContext";
import { useWeather } from "@/contexts/WeatherContext";
import { weatherCodeToCondition } from "@/lib/copy";
import { CCHeader } from "@/components/CCHeader";
import { WeatherIcon } from "@/components/WeatherIcon";
import Link from "next/link";

const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", monospace';
const DISPLAY = 'var(--font-syne), "Syne", system-ui';
const BODY = 'var(--font-space-grotesk), "Space Grotesk", system-ui';

function toC(f: number) { return Math.round((f - 32) * 5 / 9); }
function displayTemp(f: number, unit: string) { return unit === 'C' ? toC(f) : f; }

export default function SevenDayPage() {
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

  const hiAll = weather.forecast.map(d => d.maxTemp);
  const loAll = weather.forecast.map(d => d.minTemp);
  const maxHi = Math.max(...hiAll);
  const minLo = Math.min(...loAll);
  const rng = maxHi - minLo || 1;

  // Smart copy
  const rainyDays = weather.forecast.filter(d => d.precipProbability > 40);
  const bestDay = weather.forecast.slice(1).reduce((a, b) => a.precipProbability < b.precipProbability ? a : b);
  const bestDayLabel = new Date(bestDay.date + 'T12:00').toLocaleDateString('en-US', { weekday: 'long' });

  const smartCopy = (() => {
    const cond = weatherCodeToCondition(weather.forecast[0].condition.code);
    if (personality === 'data') return `${rainyDays.length} rainy days this week. Best day: ${bestDayLabel}.`;
    if (rainyDays.length === 0) {
      return personality === 'warm'
        ? 'Clear skies all week — what a gift. Enjoy every day.'
        : 'Solid week ahead. No excuses.';
    }
    if (cond === 'sunny' || cond === 'cloudy') {
      return personality === 'warm'
        ? `${bestDayLabel} looks beautiful. Make the most of it.`
        : `Weekend's looking clean. ${rainyDays.length > 2 ? 'Mid-week, not so much.' : 'Mostly good week.'}`;
    }
    return personality === 'warm'
      ? 'A mixed week ahead. Take the good days as they come.'
      : `${rainyDays.length} rough days this week. Plan around them.`;
  })();

  return (
    <div style={pageStyle}>
      <CCHeader />

      {/* Page label */}
      <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
        7-Day Outlook
      </div>

      {/* Big headline */}
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(38px, 12vw, 56px)', letterSpacing: -2, lineHeight: 0.92, marginBottom: 14 }}>
        The week<br />ahead.
      </div>
      <div style={{ color: theme.mute, fontSize: 15, lineHeight: 1.45, marginBottom: 28, maxWidth: 320 }}>
        {smartCopy}
      </div>

      {/* 7-day rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {weather.forecast.map((day, i) => {
          const label = i === 0 ? 'Today' : new Date(day.date + 'T12:00').toLocaleDateString('en-US', { weekday: 'short' });
          const hiPct = ((day.maxTemp - minLo) / rng) * 100;
          const loPct = ((day.minTemp - minLo) / rng) * 100;
          const isToday = i === 0;
          const isRainy = day.precipProbability > 40;

          return (
            <div key={i} style={{
              padding: '18px 16px',
              background: isToday ? theme.cardAlt : theme.card,
              borderRadius: 18,
              border: isToday ? `1.5px solid ${accent}20` : `1px solid ${theme.border}`,
            }}>
              {/* Top row: day + icon + precip + temps */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 44, fontWeight: isToday ? 800 : 600, fontSize: isToday ? 16 : 14, fontFamily: BODY, color: isToday ? theme.ink : theme.mute }}>
                  {label}
                </div>
                <WeatherIcon code={day.condition.code} size={24} color={theme.ink} accent={accent} />
                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: isRainy ? accent : theme.muter, width: 30 }}>
                  {day.precipProbability}%
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: theme.mute, width: 36, textAlign: 'right' }}>
                  {displayTemp(day.minTemp, unit)}°
                </div>
                <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, width: 40, textAlign: 'right' }}>
                  {displayTemp(day.maxTemp, unit)}°
                </div>
              </div>
              {/* Range bar */}
              <div style={{ height: 4, background: theme.border, borderRadius: 99, position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: `${loPct}%`, right: `${100 - hiPct}%`,
                  top: 0, bottom: 0, background: accent, borderRadius: 99,
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
