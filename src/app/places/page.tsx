"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTemperature } from "@/contexts/TemperatureContext";
import { useWeather } from "@/contexts/WeatherContext";
import { weatherCodeToCondition, getConditionLabel } from "@/lib/copy";
import { CCHeader } from "@/components/CCHeader";
import { WeatherIcon } from "@/components/WeatherIcon";
import { geocodeCity } from "@/lib/geocode";
import { getWeatherByCoordinates } from "@/lib/getWeather";
import { WeatherData } from "@/types/weather";
import Link from "next/link";

const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", monospace';
const DISPLAY = 'var(--font-syne), "Syne", system-ui';
const BODY = 'var(--font-space-grotesk), "Space Grotesk", system-ui';

function toC(f: number) { return Math.round((f - 32) * 5 / 9); }
function displayTemp(f: number, unit: string) { return unit === 'C' ? toC(f) : f; }

interface SavedCity { name: string; }

const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg,#C87941 0%,#7B4A20 100%)',
  'linear-gradient(135deg,#1A3A5C 0%,#2E6B9E 100%)',
  'linear-gradient(135deg,#3D2B1F 0%,#8B5E3C 100%)',
  'linear-gradient(135deg,#1C3A2A 0%,#2E8B57 100%)',
  'linear-gradient(135deg,#4A1A2C 0%,#9B3060 100%)',
];

export default function PlacesPage() {
  const { theme, accent } = useTheme();
  const { unit } = useTemperature();
  const { weather: homeWeather, loadCity } = useWeather();
  const [cities, setCities] = useState<SavedCity[]>([]);
  const [cityWeathers, setCityWeathers] = useState<Record<string, WeatherData | null>>({});
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [cityAutoPhotos, setCityAutoPhotos] = useState<Record<string, string>>({});

  const fetchUnsplashPhoto = async (cityName: string): Promise<string | null> => {
    const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
    if (!key) {
      console.warn('[CityCast] NEXT_PUBLIC_UNSPLASH_ACCESS_KEY not set — restart dev server after adding .env.local');
      return null;
    }
    try {
      const r = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(cityName + ' city')}&orientation=landscape&client_id=${key}`
      );
      if (!r.ok) {
        console.warn(`[CityCast] Unsplash fetch failed for "${cityName}": ${r.status}`);
        return null;
      }
      const d = await r.json();
      const url = d.urls?.regular ?? d.urls?.small ?? null;
      if (url) {
        setCityAutoPhotos(prev => {
          const next = { ...prev, [cityName]: url };
          try { localStorage.setItem('cc-unsplash-photos', JSON.stringify(next)); } catch { /* quota */ }
          return next;
        });
      }
      return url;
    } catch (err) {
      console.warn(`[CityCast] Unsplash error for "${cityName}":`, err);
      return null;
    }
  };

  useEffect(() => {
    const savedAuto = localStorage.getItem('cc-unsplash-photos');
    if (savedAuto) { try { setCityAutoPhotos(JSON.parse(savedAuto)); } catch { /* ignore */ } }

    const saved = localStorage.getItem('cc-saved-cities');
    const initial: SavedCity[] = saved ? JSON.parse(saved) : [];
    if (homeWeather && !initial.find(c => c.name.toLowerCase() === homeWeather.city.toLowerCase())) {
      initial.unshift({ name: homeWeather.city });
    }
    setCities(initial);
    initial.forEach(c => fetchCityWeather(c.name));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeWeather?.city]);

  // Fetch Unsplash photos for any city missing one in state
  useEffect(() => {
    cities.forEach(c => {
      if (!cityAutoPhotos[c.name]) {
        fetchUnsplashPhoto(c.name);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities]);

  const fetchCityWeather = async (name: string) => {
    setCityWeathers(prev => {
      if (prev[name] !== undefined) return prev;
      return { ...prev, [name]: null };
    });
    const geo = await geocodeCity(name);
    if (!geo) return;
    const data = await getWeatherByCoordinates(geo.name, geo.latitude, geo.longitude);
    setCityWeathers(prev => ({ ...prev, [name]: data ?? null }));
  };

  const saveList = (list: SavedCity[]) => {
    setCities(list);
    localStorage.setItem('cc-saved-cities', JSON.stringify(list));
  };

  const addCity = async () => {
    if (!search.trim() || adding) return;
    setAdding(true);
    const geo = await geocodeCity(search.trim());
    if (geo && !cities.find(c => c.name.toLowerCase() === geo.name.toLowerCase())) {
      const newList = [...cities, { name: geo.name }];
      saveList(newList);
      fetchCityWeather(geo.name);
      if (!cityAutoPhotos[geo.name]) fetchUnsplashPhoto(geo.name);
    }
    setSearch('');
    setAdding(false);
  };

  const removeCity = (name: string) => saveList(cities.filter(c => c.name !== name));

  const setAsHome = (name: string) => {
    loadCity(name);
    // Move to front
    const updated = [{ name }, ...cities.filter(c => c.name !== name)];
    saveList(updated);
  };

  const isHomeCity = (name: string) =>
    homeWeather?.city.toLowerCase() === name.toLowerCase();

  const pageStyle = {
    background: theme.bg, minHeight: '100dvh',
    padding: '0 16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)', color: theme.ink, fontFamily: BODY,
  };

  return (
    <div style={pageStyle}>
      <CCHeader />

      <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
        Saved Places
      </div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(38px, 12vw, 56px)', letterSpacing: -2, lineHeight: 0.92, marginBottom: 24 }}>
        Your cities.
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          background: theme.card, borderRadius: 999,
          padding: '0 16px', border: `1px solid ${theme.border}`, gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke={theme.mute} strokeWidth="1.8" />
            <path d="M13 13l4 4" stroke={theme.mute} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addCity(); }}
            placeholder="Search a city…"
            style={{
              flex: 1, padding: '12px 0', background: 'transparent',
              border: 'none', color: theme.ink, fontSize: 15,
              fontFamily: BODY, outline: 'none',
            }}
          />
        </div>
        <button type="button" onClick={addCity} style={{
          width: 44, height: 44, borderRadius: 999, background: accent,
          border: 'none', cursor: 'pointer', color: theme.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontFamily: DISPLAY, fontWeight: 700, flexShrink: 0,
        }}>
          {adding ? '…' : '+'}
        </button>
      </div>

      {/* City cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {cities.map((city, i) => {
          const w = cityWeathers[city.name];
          const isHome = isHomeCity(city.name);
          const photo = cityAutoPhotos[city.name] ?? null;
          const grad = FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length];
          const condition = w ? weatherCodeToCondition(w.current.condition.code) : 'sunny';

          const localTime = w ? (() => {
            try {
              return new Date().toLocaleTimeString('en-US', {
                timeZone: w.timezone, hour: 'numeric', minute: '2-digit', hour12: true,
              });
            } catch { return ''; }
          })() : '';

          return (
            <div key={city.name} style={{
              display: 'flex', background: theme.card, borderRadius: 20,
              overflow: 'hidden',
              border: isHome ? `1.5px solid ${accent}50` : `1px solid ${theme.border}`,
            }}>
              {/* Photo panel */}
              <div style={{
                width: 90, flexShrink: 0, position: 'relative',
                backgroundImage: photo ? `url(${photo})` : grad,
                backgroundSize: 'cover', backgroundPosition: 'center',
                minHeight: 110,
              }}>
                {/* Overlay gradient for readability */}
                {photo && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5) 100%)',
                  }} />
                )}

                {isHome && (
                  <div style={{
                    position: 'absolute', top: 8, left: 8, zIndex: 2,
                    background: accent, borderRadius: 99, padding: '2px 7px',
                    fontFamily: MONO, fontSize: 7, fontWeight: 700,
                    color: theme.bg, letterSpacing: 0.5, textTransform: 'uppercase',
                  }}>HOME</div>
                )}

              </div>

              {/* City info */}
              <div style={{ flex: 1, padding: '14px 14px 14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(13px, 3.8vw, 16px)',
                      letterSpacing: -0.5, lineHeight: 1.1,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {city.name}
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, marginTop: 3 }}>
                      {localTime || '—'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                    {w ? (
                      <>
                        <WeatherIcon type={condition} size={22} color={theme.ink} accent={accent} />
                        <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800 }}>
                          {displayTemp(w.current.temperature, unit)}°
                        </div>
                      </>
                    ) : (
                      <div style={{ fontFamily: MONO, fontSize: 10, color: theme.muter }}>…</div>
                    )}
                  </div>
                </div>

                {w && (
                  <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, marginBottom: 10 }}>
                    {getConditionLabel(condition, false)}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {!isHome && (
                    <button type="button" onClick={() => setAsHome(city.name)} style={{
                      fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                      color: accent, background: `${accent}15`,
                      borderRadius: 99, padding: '4px 10px',
                      border: `1px solid ${accent}30`, cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}>Set home</button>
                  )}
                  <Link href={`/weather/${encodeURIComponent(city.name.toLowerCase())}`} style={{
                    fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                    color: theme.mute, background: theme.bgAlt,
                    borderRadius: 99, padding: '4px 10px',
                    border: `1px solid ${theme.border}`, cursor: 'pointer',
                    textTransform: 'uppercase', textDecoration: 'none',
                    display: 'inline-block',
                  }}>Details</Link>
                  {!isHome && (
                    <button type="button" onClick={() => removeCity(city.name)} style={{
                      fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                      color: theme.muter, background: 'transparent',
                      borderRadius: 99, padding: '4px 10px',
                      border: `1px solid ${theme.border}`, cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}>Remove</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty prompt */}
        {cities.length === 0 && (
          <div style={{
            border: `1.5px dashed ${theme.border}`, borderRadius: 20,
            padding: '32px 16px', textAlign: 'center', color: theme.muter,
            fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase',
          }}>
            Search above to add your first city
          </div>
        )}
      </div>

      {/* Settings link */}
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Link href="/settings" style={{
          fontFamily: MONO, fontSize: 11, color: theme.mute,
          letterSpacing: 1, textTransform: 'uppercase', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke={theme.mute} strokeWidth="1.8" />
            <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
              stroke={theme.mute} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Customize theme & settings
        </Link>
      </div>
    </div>
  );
}
