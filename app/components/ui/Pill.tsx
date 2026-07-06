import * as React from "react";

/**
 * Pill Design Tokens & States Mapping:
 * - Common: rounded-full
 * - Variants:
 *   - xp: bg-accent (var(--accent)), text-on-accent (var(--on-accent)), text-numeral typography (Space Grotesk, Bold, Tabular/Lining numbers)
 *   - category: bg-surface (var(--surface)), text-muted (var(--text-muted)), border border-border (var(--border))
 *   - level: bg-surface-raised (var(--surface-raised)), text-primary (var(--text-primary)), border border-border (var(--border))
 */

export type PillVariant = "xp" | "category" | "level";

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: PillVariant;
}

export function Pill({ variant = "category", className = "", children, ...props }: PillProps) {
  const variantClass = {
    xp: "bg-accent text-on-accent text-numeral px-3 py-0.5 text-sm",
    category: "bg-surface text-muted border border-border px-3 py-0.5 text-xs text-label",
    level: "bg-surface-raised text-primary border border-border px-3 py-0.5 text-sm text-numeral",
  }[variant];

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full select-none ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
