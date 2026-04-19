"use client";
import { useTheme } from "@/contexts/ThemeContext";

interface MegaTempProps {
  value: number;
  unit: string;
}

export function MegaTemp({ value, unit }: MegaTempProps) {
  const { theme } = useTheme();

  return (
    <div style={{
      fontFamily: 'var(--font-syne), "Syne", system-ui',
      fontWeight: 800,
      fontSize: 'clamp(90px, 28vw, 140px)',
      lineHeight: 0.82,
      color: theme.ink,
      letterSpacing: '-0.05em',
      display: 'flex',
      alignItems: 'flex-start',
      minWidth: 0,
    }}>
      <span>{value}</span>
      <span style={{ fontSize: 'clamp(34px, 10vw, 50px)', marginTop: 8, marginLeft: 2, letterSpacing: -1 }}>
        °{unit}
      </span>
    </div>
  );
}
