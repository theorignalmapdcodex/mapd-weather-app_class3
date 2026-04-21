"use client";

import { useState, useEffect } from "react";
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

function IGIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="6" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="12" r="4.5" stroke={color} strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1" fill={color} />
    </svg>
  );
}

export default function SettingsPage() {
  const { theme, accent, themeKey, setThemeKey, accentKey, setAccentKey, customAccentHex, setCustomAccent } = useTheme();
  const [homeCity, setHomeCity] = useState<string | null>(null);

  useEffect(() => {
    setHomeCity(localStorage.getItem('homeLocation'));
  }, []);

  const handleCustomColor = (hex: string) => {
    setCustomAccent(hex);
  };

  const handleTutorial = () => {
    window.dispatchEvent(new CustomEvent('cc-show-tutorial'));
  };

  const isCustom = !!customAccentHex;

  const pageStyle = {
    background: theme.bg, minHeight: '100dvh',
    padding: '0 16px',
    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
    color: theme.ink, fontFamily: BODY,
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
                  border: (!isCustom && accentKey === k) ? `3px solid ${theme.ink}` : '3px solid transparent',
                  outline: (!isCustom && accentKey === k) ? `2px solid ${c}` : 'none',
                  outlineOffset: 3, transition: 'all 0.15s',
                }}
              />
              <div style={{ fontFamily: MONO, fontSize: 9, color: theme.mute, letterSpacing: 0.3, textTransform: 'uppercase' }}>
                {ACCENT_LABELS[k]}
              </div>
            </div>
          ))}

          {/* Custom color picker */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <label
              aria-label="Set custom accent color"
              style={{
                width: 44, height: 44, borderRadius: 99, cursor: 'pointer',
                background: customAccentHex ?? `conic-gradient(#FF6B1A, #F25D5D, #B8D94B, #7B5CE6, #3BA0E5, #FF6B1A)`,
                border: isCustom ? `3px solid ${theme.ink}` : '3px solid transparent',
                outline: isCustom ? `2px solid ${customAccentHex ?? accent}` : 'none',
                outlineOffset: 3, transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxSizing: 'border-box',
              }}
            >
              {!customAccentHex && (
                <span style={{ fontSize: 18, lineHeight: 1, userSelect: 'none', pointerEvents: 'none', color: theme.ink }}>+</span>
              )}
              <input
                type="color"
                title="Custom accent color"
                value={customAccentHex ?? '#FF6B1A'}
                onChange={e => handleCustomColor(e.target.value)}
                style={{ position: 'absolute', opacity: 0, width: 1, height: 1, pointerEvents: 'none' }}
              />
            </label>
            <div style={{ fontFamily: MONO, fontSize: 9, color: isCustom ? accent : theme.mute, letterSpacing: 0.3, textTransform: 'uppercase' }}>
              {isCustom ? 'Custom' : 'Pick'}
            </div>
          </div>
        </div>

        {isCustom && (
          <button
            type="button"
            onClick={() => setCustomAccent(null)}
            style={{
              marginTop: 14, background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: MONO, fontSize: 10, color: theme.mute,
              letterSpacing: 0.5, textTransform: 'uppercase', padding: 0,
            }}
          >
            ✕ Remove custom color
          </button>
        )}
      </CCCard>

      {/* Home city */}
      <CCCard style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>Home city</div>
        <div style={{ fontSize: 15, color: theme.ink, marginBottom: 14, fontFamily: BODY, fontWeight: 600 }}>
          {homeCity ?? 'Not set'}
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

      {/* Tutorial */}
      <CCCard style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>Tutorial</div>
        <div style={{ fontFamily: BODY, fontSize: 14, color: theme.mute, marginBottom: 14, lineHeight: 1.5 }}>
          New to CityCast? Walk through the 5-step intro to get the most out of the app.
        </div>
        <button
          type="button"
          onClick={handleTutorial}
          style={{
            display: 'inline-block', padding: '8px 18px', borderRadius: 999,
            background: accent, color: '#FFFFFF',
            fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
            cursor: 'pointer', border: 'none', textTransform: 'uppercase',
          }}
        >
          View tutorial →
        </button>
      </CCCard>

      {/* About */}
      <CCCard>
        <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>About</div>

        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 24, marginBottom: 2, color: theme.ink }}>CityCast</div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, marginBottom: 16, letterSpacing: 0.3 }}>
          Weather, but not boring.
        </div>

        <div style={{ fontFamily: MONO, fontSize: 11, color: theme.muter, marginBottom: 20, letterSpacing: 0.3 }}>
          from MAPD Concepts
        </div>

        <div style={{ height: 1, background: theme.border, marginBottom: 16 }} />

        <a
          href="https://www.instagram.com/theoriginalmapd"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            textDecoration: 'none',
            padding: '10px 16px', borderRadius: 12,
            background: theme.cardAlt, border: `1px solid ${theme.border}`,
          }}
        >
          <IGIcon size={18} color={accent} />
          <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: theme.ink, letterSpacing: 0.3 }}>
            @theoriginalmapd
          </span>
        </a>
      </CCCard>
    </div>
  );
}
