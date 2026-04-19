"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTemperature } from "@/contexts/TemperatureContext";
import { getWeatherData, getWeatherByCoordinates } from "@/lib/getWeather";
import { geocodeCity } from "@/lib/geocode";
import { WeatherData } from "@/types/weather";
import { weatherCodeToCondition } from "@/lib/copy";
import { Brand } from "@/components/Brand";
import { WeatherIcon } from "@/components/WeatherIcon";
import { CCCard } from "@/components/CCCard";
import { CITIES } from "@/data/cities";
import Link from "next/link";

const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", monospace';
const DISPLAY = 'var(--font-syne), "Syne", system-ui';
const BODY = 'var(--font-space-grotesk), "Space Grotesk", system-ui';

function toC(f: number) { return Math.round((f - 32) * 5 / 9); }
function disp(f: number, unit: string) { return unit === 'C' ? toC(f) : f; }

export default function AllCitiesPage() {
  const { theme, accent } = useTheme();
  const { unit, toggleUnit } = useTemperature();
  const [cities, setCities] = useState<Array<{ name: string; latitude: number; longitude: number; weather: WeatherData | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<WeatherData | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    loadCities();
  }, []);

  async function loadCities() {
    setLoading(true);
    const results = [];
    for (const city of CITIES) {
      const weather = await getWeatherData(city.name);
      results.push({ ...city, weather });
      await new Promise(r => setTimeout(r, 200));
    }
    setCities(results);
    setLoading(false);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim() || searching) return;
    setSearching(true);
    setSearchError("");
    setSearchResult(null);
    const geo = await geocodeCity(searchQuery.trim());
    if (!geo) { setSearchError("City not found. Try another name."); setSearching(false); return; }
    const weather = await getWeatherByCoordinates(geo.name, geo.latitude, geo.longitude);
    if (weather) { setSearchResult(weather); setSearchQuery(""); }
    else setSearchError("Could not load weather data.");
    setSearching(false);
  }

  const pageStyle = {
    background: theme.bg, minHeight: '100dvh',
    padding: '0 16px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)', color: theme.ink, fontFamily: BODY,
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Brand size={14} />
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
      </div>

      {/* Title */}
      <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase' }}>Saved places</div>
      <div style={{ fontFamily: DISPLAY, fontSize: 'clamp(36px, 10vw, 52px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1, marginTop: 6, marginBottom: 20 }}>
        Your cities.
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: theme.card, borderRadius: 999, padding: '10px 16px',
          border: `1px solid ${theme.border}`,
        }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke={theme.mute} strokeWidth="1.8" />
            <line x1="13.5" y1="13.5" x2="17" y2="17" stroke={theme.mute} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search a city…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: theme.ink, fontSize: 14, fontFamily: BODY }}
          />
          <button type="submit" style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: accent, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
          }}>
            {searching ? '…' : '+ ADD'}
          </button>
        </div>
        {searchError && <div style={{ color: accent, fontFamily: MONO, fontSize: 11, marginTop: 8, letterSpacing: 0.5 }}>{searchError}</div>}
      </form>

      {/* Search result */}
      {searchResult && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Search result</div>
          <CityCard weather={searchResult} unit={unit} theme={theme} accent={accent} />
        </div>
      )}

      {/* Cities list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48, gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 99, border: `3px solid ${theme.border}`, borderTopColor: accent, animation: 'spin 0.8s linear infinite' }} />
          <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase' }}>Loading cities…</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cities.filter(c => c.weather).map((c) => (
            <CityCard key={c.name} weather={c.weather!} unit={unit} theme={theme} accent={accent} />
          ))}
        </div>
      )}
    </div>
  );
}

function CityCard({ weather, unit, theme, accent }: {
  weather: WeatherData;
  unit: string;
  theme: ReturnType<typeof useTheme>['theme'];
  accent: string;
}) {
  const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", monospace';
  const DISPLAY = 'var(--font-syne), "Syne", system-ui';
  const BODY = 'var(--font-space-grotesk), "Space Grotesk", system-ui';

  const condition = weatherCodeToCondition(weather.current.condition.code);
  const localTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone: weather.timezone,
  });
  const toC = (f: number) => Math.round((f - 32) * 5 / 9);
  const disp = (f: number) => unit === 'C' ? toC(f) : f;

  return (
    <Link href={`/weather/${encodeURIComponent(weather.city.toLowerCase())}`} style={{ textDecoration: 'none' }}>
      <CCCard noPad style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          {/* Photo / stripe panel */}
          <div style={{
            width: 100, flexShrink: 0,
            background: `linear-gradient(135deg, ${accent}55 0%, ${theme.ink}cc 100%)`,
            display: 'flex', alignItems: 'flex-end', padding: 8, minHeight: 100,
          }}>
            <div style={{
              fontFamily: MONO, fontSize: 8, color: '#fff',
              letterSpacing: 0.5, textTransform: 'uppercase',
              background: 'rgba(0,0,0,0.3)', padding: '3px 6px', borderRadius: 4,
            }}>
              {weather.city.slice(0, 3).toUpperCase()}
            </div>
          </div>
          {/* Info */}
          <div style={{ flex: 1, minWidth: 0, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, lineHeight: 1, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: theme.ink }}>
                {weather.city}
              </div>
              <div style={{ fontSize: 11, color: theme.mute, fontFamily: MONO, letterSpacing: 0.5 }}>
                {localTime}
              </div>
              <div style={{ fontSize: 11, color: theme.mute, fontFamily: MONO, marginTop: 2 }}>
                H:{disp(weather.forecast[0]?.maxTemp ?? 0)}° L:{disp(weather.forecast[0]?.minTemp ?? 0)}°
              </div>
            </div>
            <WeatherIcon type={condition} size={28} color={theme.ink} accent={accent} />
            <div style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 800, color: theme.ink, flexShrink: 0 }}>
              {disp(weather.current.temperature)}°
            </div>
          </div>
        </div>
      </CCCard>
    </Link>
  );
}
