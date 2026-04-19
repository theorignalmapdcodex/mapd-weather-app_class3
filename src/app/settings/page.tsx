"use client";

import { useTheme, ACCENTS, ThemeKey, AccentKey } from "@/contexts/ThemeContext";
import { CCHeader } from "@/components/CCHeader";
import { CCCard } from "@/components/CCCard";

const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", monospace';
const DISPLAY = 'var(--font-syne), "Syne", system-ui';
const BODY = 'var(--font-space-grotesk), "Space Grotesk", system-ui';

const ACCENT_LABELS: Record<AccentKey, string> = {
  orange: 'Orange',
  coral: 'Coral',
  lime: 'Lime',
  violet: 'Violet',
  sky: 'Sky',
};

export default function SettingsPage() {
  const { theme, accent, themeKey, setThemeKey, accentKey, setAccentKey } = useTheme();

  const pageStyle = {
    background: theme.bg, minHeight: '100dvh',
    padding: '56px 16px 120px', color: theme.ink, fontFamily: BODY,
  };

  return (
    <div style={pageStyle}>
      <CCHeader />

      <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
        Customize
      </div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(36px, 10vw, 52px)', letterSpacing: -2, lineHeight: 0.92, marginBottom: 28 }}>
        Make it<br />yours.
      </div>

      {/* Theme picker */}
      <CCCard style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>Theme</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {([
            ['cream', 'Cream', '#EEE7DB', '#1A1A1A'],
            ['dark',  'Dark',  '#141414', '#F3EEE3'],
            ['pastel','Pastel','#E8E4F3', '#231C3D'],
          ] as [ThemeKey, string, string, string][]).map(([k, label, bg, ink]) => (
            <button
              key={k}
              type="button"
              onClick={() => setThemeKey(k)}
              style={{
                background: bg, borderRadius: 16, padding: '16px 12px 12px',
                cursor: 'pointer', aspectRatio: '1',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start',
                border: themeKey === k ? `2.5px solid ${accent}` : `1.5px solid rgba(0,0,0,0.1)`,
                transition: 'border 0.15s',
              }}
            >
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 13, color: ink }}>
                {label}
              </div>
            </button>
          ))}
        </div>
      </CCCard>

      {/* Accent picker */}
      <CCCard style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>Accent color</div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          {(Object.entries(ACCENTS) as [AccentKey, string][]).map(([k, c]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                aria-label={`Set accent to ${ACCENT_LABELS[k]}`}
                onClick={() => setAccentKey(k)}
                style={{
                  width: 44, height: 44, borderRadius: 99, background: c, cursor: 'pointer',
                  border: accentKey === k ? `3px solid ${theme.ink}` : '3px solid transparent',
                  outline: accentKey === k ? `2px solid ${c}` : 'none',
                  outlineOffset: 3, transition: 'all 0.15s',
                }}
              />
              <div style={{ fontFamily: MONO, fontSize: 9, color: theme.mute, letterSpacing: 0.3, textTransform: 'uppercase' }}>
                {ACCENT_LABELS[k]}
              </div>
            </div>
          ))}
        </div>
      </CCCard>

      {/* Home city */}
      <CCCard style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>Home city</div>
        <div style={{ fontSize: 15, color: theme.ink, marginBottom: 14, fontFamily: BODY, fontWeight: 600 }}>
          {typeof window !== 'undefined' && localStorage.getItem('homeLocation')
            ? localStorage.getItem('homeLocation')
            : 'Not set'}
        </div>
        <button
          type="button"
          onClick={() => { localStorage.removeItem('homeLocation'); window.location.href = '/'; }}
          style={{
            display: 'inline-block', padding: '8px 18px', borderRadius: 999,
            background: theme.chip, color: theme.chipText,
            fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
            cursor: 'pointer', border: 'none', textTransform: 'uppercase',
          }}
        >
          Change city →
        </button>
      </CCCard>

      {/* About */}
      <CCCard>
        <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>About</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 18, marginBottom: 4 }}>CityCast</div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, marginBottom: 12 }}>Weather, but not boring.</div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: theme.muter }}>Built by @theoriginalmapd</div>
      </CCCard>
    </div>
  );
}
