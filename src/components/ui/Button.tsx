import Link from "next/link";
import React from "react"; // NEW: Import React for ReactNode type

/**
 * Button Component
 *
 * A reusable button with two variants:
 * - default: Blue background with white text
 * - ghost: Text only with hover underline
 *
 * Can be used as a button or a link (if href is provided)
 * MODIFIED: Added support for icons to make buttons more engaging
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
  // Base styles that apply to all buttons
  const baseStyles =
    "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"; // MODIFIED: Added gap-2 for icon spacing

  // Variant-specific styles - MODIFIED: Updated for minimalistic theme
  const variantStyles = {
    default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    ghost:
      "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
  };

  // Combine all styles
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${className}`;

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
      <Link href={href} className={combinedStyles}>
        {buttonContent}
      </Link>
    );
  }

  // Otherwise, render as a button
  return (
    <button className={combinedStyles} {...props}>
      {buttonContent}
    </button>
  );
}