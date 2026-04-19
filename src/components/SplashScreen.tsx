"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", monospace';
const DISPLAY = 'var(--font-syne), "Syne", system-ui';

interface Props { onDone: () => void; }

export function SplashScreen({ onDone }: Props) {
  const { theme, accent } = useTheme();
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 1600);
    const t2 = setTimeout(() => onDone(), 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: theme.bg, color: theme.ink,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 0,
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.5s ease-in-out',
      pointerEvents: fading ? 'none' : 'auto',
    }}>
      {/* Logo mark */}
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ marginBottom: 16 }}>
        <circle cx="26" cy="26" r="26" fill={theme.ink} />
        <circle cx="32" cy="20" r="8" fill={accent} />
        <path d="M10 30h32a8 8 0 0 0 0-16 7 7 0 0 0-.8.08A11 11 0 0 0 10 22a8 8 0 0 0 0 8Z"
          fill={theme.bg} />
      </svg>

      {/* Wordmark */}
      <div style={{
        fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, letterSpacing: -1.5,
        color: theme.ink, marginBottom: 8,
      }}>CITYCAST</div>

      {/* Tagline */}
      <div style={{
        fontFamily: MONO, fontSize: 11, color: theme.mute,
        letterSpacing: 2, textTransform: 'uppercase', marginBottom: 40,
      }}>
        Weather, but not boring.
      </div>

      {/* Spinner */}
      <div style={{
        width: 28, height: 28, borderRadius: 99,
        border: `2.5px solid ${theme.border}`,
        borderTopColor: accent,
        animation: 'cc-spin 0.75s linear infinite',
      }} />
      <style>{`@keyframes cc-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
