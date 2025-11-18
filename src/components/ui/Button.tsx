"use client";

import Link from "next/link";
import React from "react"; // NEW: Import React for ReactNode type
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Button Component
 *
 * A reusable button with two variants:
 * - default: Black background with white text in light mode, white background with black text in dark mode
 * - ghost: Text only with hover underline
 *
 * Can be used as a button or a link (if href is provided)
 * MODIFIED: Added support for icons to make buttons more engaging
 * MODIFIED: Using inline styles to force dark/light mode colors
 */

interface ButtonProps {
  variant?: "default" | "ghost";
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  icon?: React.ReactNode; // NEW: Optional icon to display before button text
  iconPosition?: "left" | "right"; // NEW: Position of icon (default: left)
}

export function Button({
  variant = "default",
  href,
  children,
  className = "",
  icon, // NEW: Icon prop
  iconPosition = "left", // NEW: Icon position prop
  ...props
}: ButtonProps) {
  const { theme } = useTheme();

  // Base styles that apply to all buttons
  const baseStyles =
    "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl";

  // HARDCODED: Inline styles to force colors based on theme
  const getInlineStyles = (): React.CSSProperties => {
    if (variant === "default") {
      if (theme === "dark") {
        return {
          backgroundColor: "#ffffff",
          color: "#000000",
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: "#d1d5db",
        };
      } else {
        return {
          backgroundColor: "#000000",
          color: "#ffffff",
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: "#1f2937",
        };
      }
    }
    return {};
  };

  // Combine all styles
  const combinedStyles = `${baseStyles} ${className}`;

  // NEW: Render button content with optional icon
  const buttonContent = (
    <>
      {icon && iconPosition === "left" && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === "right" && <span className="flex-shrink-0">{icon}</span>}
    </>
  );

  // If href is provided, render as a Link
  if (href) {
    return (
      <Link href={href} className={combinedStyles} style={getInlineStyles()}>
        {buttonContent}
      </Link>
    );
  }

  // Otherwise, render as a button
  return (
    <button className={combinedStyles} style={getInlineStyles()} {...props}>
      {buttonContent}
    </button>
  );
}