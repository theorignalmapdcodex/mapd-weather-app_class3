"use client";

import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useTemperature } from "@/contexts/TemperatureContext";
import { useWeather } from "@/contexts/WeatherContext";
import { Brand } from "@/components/Brand";

const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", monospace';
const BODY = 'var(--font-space-grotesk), "Space Grotesk", system-ui';

export function CCHeader() {
  const { theme, toggleTheme, themeKey, accent } = useTheme();
  const { unit, toggleUnit } = useTemperature();
  const { locationMismatch, acceptMismatch, dismissMismatch } = useWeather();

  return (
    <>
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: theme.bg,
        marginLeft: -16, marginRight: -16,
        paddingLeft: 16, paddingRight: 16,
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        paddingBottom: 16,
      }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        {/* Clickable logo → home */}
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <Brand size={14} />
        </Link>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* F° / C° pill */}
          <div style={{
            display: 'inline-flex', background: theme.chip, borderRadius: 999,
            padding: 2, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1,
          }}>
            {(['F', 'C'] as const).map(u => (
              <button
                key={u}
                type="button"
                onClick={() => { if (unit !== u) toggleUnit(); }}
                style={{
                  padding: '4px 10px', borderRadius: 999, cursor: 'pointer',
                  background: unit === u ? theme.chipText : 'transparent',
                  color: unit === u ? theme.chip : theme.chipText,
                  border: 'none', fontFamily: MONO, fontSize: 11, fontWeight: 700,
                  transition: 'all 0.15s',
                }}
              >{u}°</button>
            ))}
          </div>

          {/* Dark / light toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              width: 36, height: 36, borderRadius: 999, background: theme.chip,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Toggle theme"
          >
            {themeKey === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4" fill={theme.chipText} />
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  stroke={theme.chipText} strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={theme.chipText} />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Location mismatch banner */}
      {locationMismatch && (
        <div style={{
          background: `${accent}18`, border: `1.5px solid ${accent}40`,
          borderRadius: 14, padding: '12px 14px', marginTop: 8,
          display: 'flex', gap: 10, alignItems: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
            <path d="M10 2a6 6 0 0 0-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 0 0-6-6Z"
              fill="none" stroke={accent} strokeWidth="1.8" />
            <circle cx="10" cy="8" r="2" fill={accent} />
          </svg>
          <div style={{ flex: 1, fontFamily: BODY, fontSize: 13, color: theme.ink }}>
            <b>You seem to be in {locationMismatch.city}.</b>{' '}
            <span style={{ color: theme.mute }}>Switch?</span>
          </div>
          <button type="button" onClick={acceptMismatch} style={{
            padding: '4px 12px', borderRadius: 999, background: accent,
            color: theme.bg, border: 'none', cursor: 'pointer',
            fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
          }}>Yes</button>
          <button type="button" onClick={dismissMismatch} style={{
            padding: '4px 10px', borderRadius: 999, background: 'transparent',
            color: theme.mute, border: `1px solid ${theme.border}`,
            cursor: 'pointer', fontFamily: MONO, fontSize: 10,
          }}>No</button>
        </div>
      )}
      </div>
    </>
  );
}
