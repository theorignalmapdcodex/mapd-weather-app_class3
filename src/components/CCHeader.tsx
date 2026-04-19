"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useTemperature } from "@/contexts/TemperatureContext";
import { Brand } from "@/components/Brand";

const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", monospace';

export function CCHeader() {
  const { theme, toggleTheme, themeKey } = useTheme();
  const { unit, toggleUnit } = useTemperature();

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24,
    }}>
      <Brand size={14} />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* F° / C° pill */}
        <div style={{
          display: 'inline-flex', background: theme.chip, borderRadius: 999,
          padding: 2, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1,
        }}>
          {(['F', 'C'] as const).map(u => (
            <button
              key={u}
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
  );
}
