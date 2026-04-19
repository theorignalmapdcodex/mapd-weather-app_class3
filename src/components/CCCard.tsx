"use client";
import { CSSProperties, ReactNode } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface CCCardProps {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
  noPad?: boolean;
  accent?: boolean;
}

export function CCCard({ children, style, onClick, noPad, accent }: CCCardProps) {
  const { theme, accent: ctxAccent } = useTheme();

  return (
    <div
      onClick={onClick}
      style={{
        background: accent ? ctxAccent : theme.card,
        borderRadius: 22,
        padding: noPad ? 0 : 16,
        boxSizing: 'border-box',
        border: accent ? 'none' : `1px solid ${theme.border}`,
        cursor: onClick ? 'pointer' : 'default',
        overflow: noPad ? 'hidden' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
