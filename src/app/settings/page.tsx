"use client";

import { useTheme, THEMES, ACCENTS, ThemeKey, AccentKey, Personality } from "@/contexts/ThemeContext";
import { useTemperature } from "@/contexts/TemperatureContext";
import { Brand } from "@/components/Brand";
import { CCCard } from "@/components/CCCard";

const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", monospace';
const DISPLAY = 'var(--font-syne), "Syne", system-ui';
const BODY = 'var(--font-space-grotesk), "Space Grotesk", system-ui';

export default function SettingsPage() {
  const { theme, accent, themeKey, setThemeKey, accentKey, setAccentKey, personality, setPersonality } = useTheme();
  const { unit, toggleUnit } = useTemperature();

  const pageStyle = {
    background: theme.bg, minHeight: '100dvh',
    padding: '56px 16px 120px', color: theme.ink, fontFamily: BODY,
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
      <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase' }}>Customize</div>
      <div style={{ fontFamily: DISPLAY, fontSize: 'clamp(36px, 10vw, 52px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1, marginTop: 6, marginBottom: 24 }}>
        Make it yours.
      </div>

      {/* Theme picker */}
      <CCCard style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Theme</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {([
            ['cream', 'Cream', '#EEE7DB'],
            ['dark', 'Dark', '#141414'],
            ['pastel', 'Pastel', '#E8E4F3'],
          ] as [ThemeKey, string, string][]).map(([k, label, bg]) => (
            <div
              key={k}
              onClick={() => setThemeKey(k)}
              style={{
                background: bg, borderRadius: 14, padding: 12, cursor: 'pointer',
                aspectRatio: '1', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                border: themeKey === k ? `2px solid ${accent}` : `1px solid rgba(0,0,0,0.1)`,
                transition: 'border 0.15s',
              }}
            >
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 13, color: k === 'dark' ? '#F3EEE3' : '#1A1A1A' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </CCCard>

      {/* Accent picker */}
      <CCCard style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Accent color</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {(Object.entries(ACCENTS) as [AccentKey, string][]).map(([k, c]) => (
            <div
              key={k}
              onClick={() => setAccentKey(k)}
              style={{
                width: 40, height: 40, borderRadius: 99, background: c, cursor: 'pointer',
                border: accentKey === k ? `3px solid ${theme.ink}` : '3px solid transparent',
                outline: accentKey === k ? `2px solid ${c}` : 'none',
                outlineOffset: 2,
                transition: 'all 0.15s',
              }}
            />
          ))}
        </div>
      </CCCard>

      {/* Personality */}
      <CCCard style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Copy personality</div>
        {([
          ['witty', 'Deadpan', 'Dry one-liners.'],
          ['warm', 'Warm', 'Encouraging and soft.'],
          ['data', 'Data-first', 'Just the numbers.'],
        ] as [Personality, string, string][]).map(([k, label, desc], i) => (
          <div
            key={k}
            onClick={() => setPersonality(k)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 0', cursor: 'pointer',
              borderTop: i > 0 ? `1px solid ${theme.border}` : 'none',
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: 99, flexShrink: 0,
              border: `2px solid ${personality === k ? accent : theme.muter}`,
              background: personality === k ? accent : 'transparent',
              transition: 'all 0.15s',
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, fontFamily: BODY }}>{label}</div>
              <div style={{ fontSize: 11, color: theme.mute, fontFamily: MONO }}>{desc}</div>
            </div>
          </div>
        ))}
      </CCCard>

      {/* Reset home city */}
      <CCCard>
        <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Home city</div>
        <div style={{ fontSize: 14, color: theme.ink, marginBottom: 14, fontFamily: BODY }}>
          {typeof window !== 'undefined' && localStorage.getItem('homeLocation')
            ? `Currently: ${localStorage.getItem('homeLocation')}`
            : 'No home city set.'}
        </div>
        <div
          onClick={() => {
            localStorage.removeItem('homeLocation');
            window.location.href = '/';
          }}
          style={{
            display: 'inline-block', padding: '8px 18px', borderRadius: 999,
            background: theme.chip, color: theme.chipText,
            fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
            cursor: 'pointer', textTransform: 'uppercase',
          }}
        >
          Change city →
        </div>
      </CCCard>

      <div style={{ textAlign: 'center', marginTop: 32, fontFamily: MONO, fontSize: 10, color: theme.muter, letterSpacing: 0.5 }}>
        Made with love by @theoriginalmapd
      </div>
    </div>
  );
}
