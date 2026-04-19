"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export const THEMES = {
  cream: {
    bg: '#EEE7DB', bgAlt: '#E2D9C7', card: '#F5F0E6', cardAlt: '#FFFFFF',
    ink: '#1A1A1A', mute: 'rgba(26,26,26,0.55)', muter: 'rgba(26,26,26,0.25)',
    border: 'rgba(26,26,26,0.08)', chip: '#1A1A1A', chipText: '#EEE7DB',
  },
  dark: {
    bg: '#141414', bgAlt: '#1E1E1E', card: '#1E1E1E', cardAlt: '#2A2A2A',
    ink: '#F3EEE3', mute: 'rgba(243,238,227,0.6)', muter: 'rgba(243,238,227,0.25)',
    border: 'rgba(243,238,227,0.1)', chip: '#F3EEE3', chipText: '#141414',
  },
  pastel: {
    bg: '#E8E4F3', bgAlt: '#DDD8EB', card: '#F2EFFA', cardAlt: '#FFFFFF',
    ink: '#231C3D', mute: 'rgba(35,28,61,0.55)', muter: 'rgba(35,28,61,0.25)',
    border: 'rgba(35,28,61,0.08)', chip: '#231C3D', chipText: '#E8E4F3',
  },
} as const;

export const ACCENTS = {
  orange: '#FF6B1A',
  coral: '#F25D5D',
  lime: '#B8D94B',
  violet: '#7B5CE6',
  sky: '#3BA0E5',
} as const;

export type ThemeKey = keyof typeof THEMES;
export type AccentKey = keyof typeof ACCENTS;
export type Personality = 'witty' | 'warm' | 'data';
export type ThemeTokens = (typeof THEMES)[ThemeKey];

interface ThemeContextType {
  themeKey: ThemeKey;
  accentKey: AccentKey;
  personality: Personality;
  theme: ThemeTokens;
  accent: string;
  setThemeKey: (k: ThemeKey) => void;
  setAccentKey: (k: AccentKey) => void;
  setPersonality: (p: Personality) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_THEME: ThemeTokens = THEMES.cream;
const DEFAULT_ACCENT = ACCENTS.orange;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeKey, setThemeKeyState] = useState<ThemeKey>('cream');
  const [accentKey, setAccentKeyState] = useState<AccentKey>('orange');
  const [personality, setPersonalityState] = useState<Personality>('witty');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tk = localStorage.getItem('cc-theme') as ThemeKey | null;
    const ak = localStorage.getItem('cc-accent') as AccentKey | null;
    const pk = localStorage.getItem('cc-personality') as Personality | null;
    if (tk && THEMES[tk]) setThemeKeyState(tk);
    if (ak && ACCENTS[ak]) setAccentKeyState(ak);
    if (pk && ['witty', 'warm', 'data'].includes(pk)) setPersonalityState(pk);
  }, []);

  const setThemeKey = (k: ThemeKey) => {
    setThemeKeyState(k);
    if (mounted) localStorage.setItem('cc-theme', k);
  };

  const setAccentKey = (k: AccentKey) => {
    setAccentKeyState(k);
    if (mounted) localStorage.setItem('cc-accent', k);
  };

  const setPersonality = (p: Personality) => {
    setPersonalityState(p);
    if (mounted) localStorage.setItem('cc-personality', p);
  };

  const toggleTheme = () => setThemeKey(themeKey === 'dark' ? 'cream' : 'dark');

  return (
    <ThemeContext.Provider value={{
      themeKey, accentKey, personality,
      theme: THEMES[themeKey],
      accent: ACCENTS[accentKey],
      setThemeKey, setAccentKey, setPersonality,
      toggleTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    if (typeof window === 'undefined') {
      return {
        themeKey: 'cream' as ThemeKey, accentKey: 'orange' as AccentKey,
        personality: 'witty' as Personality,
        theme: DEFAULT_THEME, accent: DEFAULT_ACCENT,
        setThemeKey: () => {}, setAccentKey: () => {},
        setPersonality: () => {}, toggleTheme: () => {},
      };
    }
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
