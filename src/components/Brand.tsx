"use client";
import { useTheme } from "@/contexts/ThemeContext";

interface BrandProps {
  size?: number;
  accent?: string;
}

export function Brand({ size = 14, accent }: BrandProps) {
  const { theme, accent: ctxAccent } = useTheme();
  const a = accent ?? ctxAccent;
  const s = size + 6;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      fontFamily: 'var(--font-syne), "Syne", system-ui',
      fontWeight: 700, fontSize: size, color: theme.ink, letterSpacing: -0.2,
    }}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="16" cy="8.5" r="3.8" fill={a} />
        <path
          d="M6 17h12a4 4 0 0 0 0-8 3.8 3.8 0 0 0-.7.07A6 6 0 0 0 6 11.5a4 4 0 0 0 0 5.5Z"
          fill={theme.ink} stroke={theme.ink} strokeWidth="1.2" strokeLinejoin="round"
        />
      </svg>
      <span>CITYCAST</span>
    </div>
  );
}
