import * as React from "react";

/**
 * Card Design Tokens & States Mapping:
 * - Background: bg-surface-raised (var(--surface-raised))
 * - Border: border (var(--border))
 * - Radius: rounded-xl (12px)
 * - Padding: p-6 (default)
 * - Shadow: none (flat surface + hairline border only per DESIGN.md set-card visual base)
 */

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`bg-surface-raised border border-border rounded-xl p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
