"use client";
import { ReactNode } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface ChipProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  small?: boolean;
}

export function Chip({ children, active, onClick, small }: ChipProps) {
  const { theme } = useTheme();

  return (
    <div
      onClick={onClick}
      style={{
        padding: small ? '4px 10px' : '6px 12px',
        borderRadius: 999,
        background: active ? theme.chip : 'transparent',
        color: active ? theme.chipText : theme.ink,
        border: active ? 'none' : `1px solid ${theme.border}`,
        fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", monospace',
        fontSize: small ? 10 : 11,
        fontWeight: 600,
        letterSpacing: 0.5,
        textTransform: 'uppercase' as const,
        cursor: onClick ? 'pointer' : 'default',
        WebkitUserSelect: 'none',
        userSelect: 'none' as const,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap' as const,
      }}
    >
      {children}
    </div>
  );
}
