"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", monospace';
const DISPLAY = 'var(--font-syne), "Syne", system-ui';

interface Props { onDone: () => void; }

export function SplashScreen({ onDone }: Props) {
  const { theme, accent } = useTheme();
  const [fading, setFading] = useState(false);
  const [showFetch, setShowFetch] = useState(false);

  useEffect(() => {
    // Show "Fetching your sky..." shortly after mount
    const t0 = setTimeout(() => setShowFetch(true), 400);
    const t1 = setTimeout(() => setFading(true), 1800);
    const t2 = setTimeout(() => onDone(), 2300);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: theme.bg, color: theme.ink,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.5s ease-in-out',
      pointerEvents: fading ? 'none' : 'auto',
    }}>
      {/* Logo mark — sun + cloud with breathing room */}
      <svg
        width="100" height="76"
        viewBox="0 0 100 76"
        fill="none"
        style={{ marginBottom: 18, overflow: 'visible' }}
      >
        {/* Sun — fully within bounds, top right */}
        <circle cx="72" cy="24" r="20" fill={accent} />
        {/* Cloud — anchored lower, overlapping sun */}
        <path
          d="M10 64h80a16 16 0 0 0 0-32 15 15 0 0 0-2 .18A22 22 0 0 0 10 46a16 16 0 0 0 0 18Z"
          fill={theme.ink}
        />
      </svg>

      {/* CITYCAST wordmark */}
      <div style={{
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: 'clamp(40px, 11vw, 56px)',
        letterSpacing: -2.5,
        color: theme.ink,
        marginBottom: 16,
        lineHeight: 1,
      }}>
        CITYCAST
      </div>

      {/* Fetching text — fades in after short delay */}
      <div style={{
        fontFamily: MONO,
        fontSize: 11,
        color: theme.mute,
        letterSpacing: 2,
        textTransform: 'uppercase',
        opacity: showFetch ? 1 : 0,
        transition: 'opacity 0.4s ease',
        marginBottom: 32,
      }}>
        Fetching your sky…
      </div>

      {/* Spinner */}
      <div style={{
        width: 24,
        height: 24,
        borderRadius: 99,
        border: `2.5px solid ${theme.border}`,
        borderTopColor: accent,
        animation: 'cc-spin 0.75s linear infinite',
        opacity: showFetch ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }} />
      <style>{`@keyframes cc-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
