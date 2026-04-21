"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTemperature } from "@/contexts/TemperatureContext";
import { Brand } from "@/components/Brand";
import { CCCard } from "@/components/CCCard";
import { WeatherIcon } from "@/components/WeatherIcon";
import { getWeatherByCoordinates } from "@/lib/getWeather";
import { geocodeCity } from "@/lib/geocode";
import { WeatherData, DailyForecast } from "@/types/weather";

const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", monospace';
const DISPLAY = 'var(--font-syne), "Syne", system-ui';
const BODY = 'var(--font-space-grotesk), "Space Grotesk", system-ui';

function toC(f: number) { return Math.round((f - 32) * 5 / 9); }
function disp(f: number, unit: string) { return unit === 'C' ? toC(f) : f; }

// ── Holiday helpers ───────────────────────────────────────
function getNthWeekday(year: number, month: number, weekday: number, n: number): number {
  let count = 0;
  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, month, d);
    if (date.getMonth() !== month) break;
    if (date.getDay() === weekday) { count++; if (count === n) return d; }
  }
  return 1;
}

function getLastWeekday(year: number, month: number, weekday: number): number {
  const last = new Date(year, month + 1, 0).getDate();
  for (let d = last; d >= 1; d--) {
    if (new Date(year, month, d).getDay() === weekday) return d;
  }
  return 1;
}

function getHolidays(year: number): Record<string, string> {
  const h: Record<string, string> = {};
  const key = (m: number, d: number) => `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  // Fixed dates
  h[key(0, 1)]  = "New Year's Day";
  h[key(1, 14)] = "Valentine's Day";
  h[key(2, 17)] = "St. Patrick's Day";
  h[key(6, 4)]  = "Independence Day 🇺🇸";
  h[key(9, 31)] = "Halloween 🎃";
  h[key(10, 11)] = "Veterans Day";
  h[key(11, 24)] = "Christmas Eve";
  h[key(11, 25)] = "Christmas Day 🎄";
  h[key(11, 31)] = "New Year's Eve";

  // Computed
  h[key(0, getNthWeekday(year, 0, 1, 3))]  = "MLK Day";
  h[key(1, getNthWeekday(year, 1, 1, 3))]  = "Presidents' Day";
  h[key(4, getLastWeekday(year, 4, 1))]    = "Memorial Day";
  h[key(8, getNthWeekday(year, 8, 1, 1))]  = "Labor Day 🛠";
  h[key(9, getNthWeekday(year, 9, 1, 2))]  = "Columbus Day";
  h[key(10, getNthWeekday(year, 10, 4, 4))] = "Thanksgiving 🦃";

  // Easter (Anonymous Gregorian algorithm)
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d2 = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h2 = (19 * a + b - d2 - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h2 - k) % 7;
  const m2 = Math.floor((a + 11 * h2 + 22 * l) / 451);
  const eMonth = Math.floor((h2 + l - 7 * m2 + 114) / 31) - 1;
  const eDay = ((h2 + l - 7 * m2 + 114) % 31) + 1;
  h[key(eMonth, eDay)] = "Easter 🐣";

  return h;
}

export default function CalendarPage() {
  const { theme, accent } = useTheme();
  const { unit } = useTemperature();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    const saved = localStorage.getItem("homeLocation");
    if (saved) {
      geocodeCity(saved).then(geo => {
        if (!geo) return;
        return getWeatherByCoordinates(geo.name, geo.latitude, geo.longitude);
      }).then(data => { if (data) setWeather(data); });
    }
    return () => clearInterval(timer);
  }, []);

  const today = mounted ? currentDate.getDate() : null;
  const month = mounted ? currentDate.getMonth() : new Date().getMonth();
  const year  = mounted ? currentDate.getFullYear() : new Date().getFullYear();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const forecastMap: Record<number, DailyForecast> = {};
  if (weather?.forecast) {
    weather.forecast.forEach(f => {
      const d = new Date(f.date + 'T12:00');
      if (d.getMonth() === month && d.getFullYear() === year) forecastMap[d.getDate()] = f;
    });
  }

  const holidays = mounted ? getHolidays(year) : {};
  const holidayKey = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const pageStyle = {
    background: theme.bg, minHeight: '100dvh',
    padding: '0 16px',
    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
    color: theme.ink, fontFamily: BODY,
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Brand size={14} />
        {weather && (
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 0.5 }}>
            {weather.city}
          </div>
        )}
      </div>

      <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase' }}>
        {mounted ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
      </div>
      <div style={{ fontFamily: DISPLAY, fontSize: 'clamp(36px, 10vw, 52px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1, marginTop: 6, marginBottom: 4 }}>
        Month view.
      </div>
      <div style={{ fontSize: 13, color: theme.mute, marginBottom: 24, fontFamily: BODY }}>
        Every day, forecasted. {weather ? `Showing ${weather.city}.` : 'Set your home city to see forecasts.'}
      </div>

      {/* Calendar grid */}
      <CCCard style={{ marginBottom: 12, padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', fontFamily: MONO, fontSize: 9, color: theme.mute, textAlign: 'center', marginBottom: 4, letterSpacing: 0.5 }}>
          {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} style={{ padding: 4 }}>{d}</div>)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const f = forecastMap[d];
            const isToday = d === today;
            const holiday = holidays[holidayKey(d)];
            return (
              <div key={i} style={{
                aspectRatio: '1', padding: 3, borderRadius: 8,
                background: isToday ? accent : holiday ? `${accent}18` : f ? theme.cardAlt : 'transparent',
                color: isToday ? '#FFFFFF' : theme.ink,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                border: isToday ? `2px solid ${accent}` : holiday ? `1px solid ${accent}40` : 'none',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, fontFamily: MONO, lineHeight: 1, color: isToday ? '#FFFFFF' : holiday ? accent : theme.ink }}>
                  {d}
                </div>
                {f ? (
                  <WeatherIcon code={f.condition.code} size={10} color={isToday ? '#FFFFFF' : theme.ink} accent={isToday ? '#FFFFFF' : accent} />
                ) : (
                  <div style={{ height: 10 }} />
                )}
                {f && (
                  <div style={{ fontFamily: MONO, fontSize: 7, color: isToday ? 'rgba(255,255,255,0.85)' : theme.mute, fontWeight: 600, lineHeight: 1 }}>
                    {disp(f.maxTemp, unit)}°
                  </div>
                )}
                {/* Holiday dot */}
                {holiday && !isToday && (
                  <div style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 3, height: 3, borderRadius: '50%', background: accent }} />
                )}
              </div>
            );
          })}
        </div>
      </CCCard>

      {/* Holiday legend for this month */}
      {mounted && Object.entries(holidays)
        .filter(([k]) => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
        .sort(([a], [b]) => a.localeCompare(b))
        .length > 0 && (
        <CCCard style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>Holidays this month</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(holidays)
              .filter(([k]) => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, name]) => {
                const day = parseInt(k.slice(-2));
                return (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${accent}18`, border: `1px solid ${accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: accent }}>{day}</span>
                    </div>
                    <span style={{ fontFamily: BODY, fontSize: 13, color: theme.ink }}>{name}</span>
                  </div>
                );
              })}
          </div>
        </CCCard>
      )}

      {/* Upcoming forecast list */}
      {weather && (
        <CCCard noPad>
          <div style={{ padding: '12px 16px', fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', borderBottom: `1px solid ${theme.border}` }}>
            Upcoming
          </div>
          {weather.forecast.map((f, i) => {
            const date = new Date(f.date + 'T12:00');
            const label = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const hKey = f.date;
            const hName = holidays[hKey];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderTop: i > 0 ? `1px solid ${theme.border}` : 'none' }}>
                <div style={{ width: 72, fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: 0.3 }}>
                  <div style={{ color: i === 0 ? accent : theme.mute }}>{label.toUpperCase()}</div>
                  {hName && <div style={{ color: accent, fontSize: 8, marginTop: 2, letterSpacing: 0 }}>{hName}</div>}
                </div>
                <WeatherIcon code={f.condition.code} size={22} color={theme.ink} accent={accent} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, fontFamily: BODY }}>{f.condition.description}</div>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: f.precipProbability > 30 ? accent : theme.mute, marginTop: 2 }}>
                    {f.precipProbability}% rain
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, fontFamily: DISPLAY, fontWeight: 700 }}>
                  <span style={{ color: theme.mute, fontSize: 15 }}>{disp(f.minTemp, unit)}°</span>
                  <span style={{ fontSize: 17, fontWeight: 800 }}>{disp(f.maxTemp, unit)}°</span>
                </div>
              </div>
            );
          })}
        </CCCard>
      )}

      {mounted && (
        <div style={{ textAlign: 'center', marginTop: 24, fontFamily: MONO, fontSize: 11, color: theme.muter, letterSpacing: 1 }}>
          {currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          {' · '}
          {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
        </div>
      )}
    </div>
  );
}
