"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", monospace';
const DISPLAY = 'var(--font-syne), "Syne", system-ui';
const BODY = 'var(--font-space-grotesk), "Space Grotesk", system-ui';

interface Step {
  num: number;
  tag: string;
  title: string;
  body: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  {
    num: 1,
    tag: 'Welcome',
    title: 'Meet CityCast.',
    body: "Your weather companion that makes planning feel good. Live forecasts, smart tasks, and multiple cities — all in one beautiful app.",
    icon: (
      <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" width={80} height={60}>
        <circle cx={56} cy={18} r={16} fill="currentColor" opacity={0.18} />
        <circle cx={56} cy={18} r={10} fill="currentColor" opacity={0.35} />
        <ellipse cx={30} cy={38} rx={22} ry={14} fill="currentColor" opacity={0.22} />
        <ellipse cx={44} cy={34} rx={16} ry={11} fill="currentColor" opacity={0.18} />
      </svg>
    ),
  },
  {
    num: 2,
    tag: 'Home',
    title: 'Live forecast.',
    body: "See your city's weather come alive with animated sky scenes. Current conditions, hourly breakdown, and key metrics — all at a glance.",
    icon: (
      <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" width={80} height={60}>
        <rect x={8} y={10} width={64} height={44} rx={10} fill="currentColor" opacity={0.12} />
        <rect x={8} y={10} width={64} height={20} rx={10} fill="currentColor" opacity={0.2} />
        <circle cx={56} cy={22} r={8} fill="currentColor" opacity={0.5} />
        <rect x={16} y={38} width={20} height={3} rx={1.5} fill="currentColor" opacity={0.4} />
        <rect x={16} y={44} width={32} height={3} rx={1.5} fill="currentColor" opacity={0.25} />
      </svg>
    ),
  },
  {
    num: 3,
    tag: 'Plan',
    title: 'Tasks that know the weather.',
    body: "Add tasks with times and track your progress. CityCast keeps your to-do list in sync with what's happening outside.",
    icon: (
      <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" width={80} height={60}>
        <rect x={10} y={8} width={60} height={46} rx={10} fill="currentColor" opacity={0.12} />
        <rect x={20} y={20} width={24} height={3} rx={1.5} fill="currentColor" opacity={0.45} />
        <rect x={20} y={28} width={36} height={3} rx={1.5} fill="currentColor" opacity={0.3} />
        <rect x={20} y={36} width={18} height={3} rx={1.5} fill="currentColor" opacity={0.2} />
        <circle cx={14} cy={21.5} r={3} fill="currentColor" opacity={0.55} />
        <path d="M12.5 21.5 L14 23 L16 20" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: 4,
    tag: 'Places',
    title: 'Your cities.',
    body: "Save multiple cities and see their current weather side by side. Add your own photos or let CityCast find one automatically.",
    icon: (
      <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" width={80} height={60}>
        <rect x={6} y={12} width={30} height={38} rx={8} fill="currentColor" opacity={0.18} />
        <rect x={44} y={18} width={30} height={32} rx={8} fill="currentColor" opacity={0.12} />
        <circle cx={21} cy={26} r={6} fill="currentColor" opacity={0.4} />
        <circle cx={59} cy={30} r={5} fill="currentColor" opacity={0.3} />
        <rect x={12} y={36} width={18} height={2.5} rx={1.25} fill="currentColor" opacity={0.35} />
        <rect x={49} y={40} width={16} height={2.5} rx={1.25} fill="currentColor" opacity={0.25} />
      </svg>
    ),
  },
  {
    num: 5,
    tag: 'Settings',
    title: 'Make it yours.',
    body: "Switch themes, pick an accent color, or dial in your own. CityCast adapts to your style — cream, dark, or pastel.",
    icon: (
      <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" width={80} height={60}>
        <circle cx={40} cy={30} r={20} fill="currentColor" opacity={0.12} />
        <circle cx={40} cy={30} r={12} fill="currentColor" opacity={0.2} />
        <circle cx={40} cy={30} r={5} fill="currentColor" opacity={0.5} />
        <circle cx={20} cy={20} r={5} fill="currentColor" opacity={0.55} />
        <circle cx={60} cy={20} r={5} fill="currentColor" opacity={0.4} />
        <circle cx={20} cy={40} r={5} fill="currentColor" opacity={0.3} />
        <circle cx={60} cy={40} r={5} fill="currentColor" opacity={0.45} />
      </svg>
    ),
  },
];

interface TutorialOverlayProps {
  onDone: () => void;
}

export function TutorialOverlay({ onDone }: TutorialOverlayProps) {
  const { theme, accent } = useTheme();
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  const finish = () => {
    setExiting(true);
    setTimeout(() => {
      localStorage.setItem('cc-tutorial-v1', 'done');
      onDone();
    }, 280);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else finish();
  };

  const prev = () => { if (step > 0) setStep(s => s - 1); };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: theme.bg,
        display: 'flex', flexDirection: 'column',
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.28s ease',
        padding: '0 24px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 48px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 40px)',
      }}
    >
      {/* Skip */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
        <button
          type="button"
          onClick={finish}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: MONO, fontSize: 11, color: theme.mute,
            letterSpacing: 1, textTransform: 'uppercase', padding: '8px 0',
          }}
        >
          Skip →
        </button>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 48 }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              height: 3, flex: i === step ? 3 : 1, borderRadius: 99,
              background: i === step ? accent : theme.border,
              transition: 'flex 0.35s ease, background 0.2s',
            }}
          />
        ))}
      </div>

      {/* Icon */}
      <div style={{ color: accent, marginBottom: 32 }}>
        {current.icon}
      </div>

      {/* Tag */}
      <div style={{ fontFamily: MONO, fontSize: 10, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
        {String(current.num).padStart(2, '0')} — {current.tag}
      </div>

      {/* Title */}
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(36px, 10vw, 52px)', letterSpacing: -1.5, lineHeight: 1, marginBottom: 20, color: theme.ink }}>
        {current.title}
      </div>

      {/* Body */}
      <div style={{ fontFamily: BODY, fontSize: 16, color: theme.mute, lineHeight: 1.6, maxWidth: 340, flex: 1 }}>
        {current.body}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
        {step > 0 && (
          <button
            type="button"
            onClick={prev}
            style={{
              flex: 1, padding: '16px', borderRadius: 16,
              background: theme.cardAlt, border: `1.5px solid ${theme.border}`,
              fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
              color: theme.mute, cursor: 'pointer', textTransform: 'uppercase',
            }}
          >
            ← Back
          </button>
        )}
        <button
          type="button"
          onClick={next}
          style={{
            flex: 2, padding: '16px', borderRadius: 16,
            background: accent, border: 'none',
            fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
            color: '#FFFFFF', cursor: 'pointer', textTransform: 'uppercase',
          }}
        >
          {isLast ? "Let's go →" : 'Next →'}
        </button>
      </div>
    </div>
  );
}
