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

export default function CalendarPage() {
  const { theme, accent } = useTheme();
  const { unit } = useTemperature();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);

    // Load weather for home city
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
  const year = mounted ? currentDate.getFullYear() : new Date().getFullYear();

  const monthName = mounted
    ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Map forecast to calendar days
  const forecastMap: Record<number, DailyForecast> = {};
  if (weather?.forecast) {
    weather.forecast.forEach(f => {
      const d = new Date(f.date + 'T12:00');
      if (d.getMonth() === month && d.getFullYear() === year) {
        forecastMap[d.getDate()] = f;
      }
    });
  }

  const pageStyle = {
    background: theme.bg, minHeight: '100dvh',
    padding: '56px 16px 120px', color: theme.ink, fontFamily: BODY,
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

      {/* Title */}
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
        {/* Day headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          fontFamily: MONO, fontSize: 9, color: theme.mute,
          textAlign: 'center', marginBottom: 4, letterSpacing: 0.5,
        }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} style={{ padding: 4 }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const f = forecastMap[d];
            const isToday = d === today;
            return (
              <div key={i} style={{
                aspectRatio: '1',
                padding: 4,
                borderRadius: 8,
                background: isToday ? theme.ink : f ? theme.cardAlt : 'transparent',
                color: isToday ? theme.bg : theme.ink,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, fontFamily: MONO }}>{d}</div>
                {f ? (
                  <WeatherIcon
                    code={f.condition.code}
                    size={12}
                    color={isToday ? theme.bg : theme.ink}
                    accent={accent}
                  />
                ) : (
                  <div style={{ height: 12 }} />
                )}
                {f && (
                  <div style={{ fontFamily: MONO, fontSize: 8, color: isToday ? theme.bg : theme.mute, fontWeight: 600 }}>
                    {disp(f.maxTemp, unit)}°
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CCCard>

      {/* Upcoming forecast list */}
      {weather && (
        <CCCard noPad>
          <div style={{ padding: '12px 16px', fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', borderBottom: `1px solid ${theme.border}` }}>
            Upcoming
          </div>
          {weather.forecast.map((f, i) => {
            const date = new Date(f.date + 'T12:00');
            const label = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px',
                borderTop: i > 0 ? `1px solid ${theme.border}` : 'none',
              }}>
                <div style={{ width: 72, fontFamily: MONO, fontSize: 10, color: theme.mute, fontWeight: 700, letterSpacing: 0.3 }}>
                  {label.toUpperCase()}
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

      {/* Current time display */}
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
