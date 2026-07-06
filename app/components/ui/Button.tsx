"use client";

import * as React from "react";
import Link from "next/link";

/**
 * Button Design Tokens & States Mapping:
 * - Resting States:
 *   - primary: bg-cta (var(--cta-fill)), text-cta-text (var(--cta-text))
 *   - secondary: bg-transparent, border-border-interactive (var(--border-interactive)), text-primary (var(--text-primary))
 *   - tertiary: bg-transparent, text-muted (var(--text-muted))
 *   - progress: bg-accent (var(--accent)), text-on-accent (var(--on-accent))
 * - Hover States:
 *   - primary: bg-cta-hover (var(--cta-fill-hover))
 *   - secondary: bg-surface (var(--surface))
 *   - tertiary: bg-surface (var(--surface))
 *   - progress: bg-accent (stays reward-colored)
 * - Focus State (all):
 *   - focus-ring utility: outline-2 solid var(--info) with outline-offset-2
 * - Disabled States:
 *   - primary: bg-cta-disabled (var(--cta-disabled)), text-disabled (var(--text-disabled))
 *   - secondary: bg-transparent, border-border (var(--border)), text-disabled (var(--text-disabled))
 *   - tertiary: bg-transparent, text-disabled (var(--text-disabled))
 *   - progress: bg-cta-disabled (var(--cta-disabled)), text-disabled (var(--text-disabled))
 */

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "progress";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  href?: string;
  as?: "button" | "a";
}

export const Button = React.forwardRef<HTMLButtonElement & HTMLAnchorElement, ButtonProps>(
  ({ variant = "primary", className = "", disabled, href, as, children, ...props }, ref) => {
    const variantClass = {
      primary: "bg-cta text-cta-text hover:bg-cta-hover disabled:bg-cta-disabled disabled:text-disabled",
      secondary: "border border-border-interactive text-primary hover:bg-surface disabled:border-border disabled:text-disabled disabled:bg-transparent",
      tertiary: "text-muted hover:bg-surface disabled:text-disabled disabled:bg-transparent",
      progress: "bg-accent text-on-accent disabled:bg-cta-disabled disabled:text-disabled", // Reserved: Continue Lesson / Complete / Correct only
    }[variant];

    const baseClasses = `focus-ring text-label min-h-11 cursor-pointer rounded-xl px-6 py-2 transition-colors duration-150 inline-flex items-center justify-center gap-2 select-none disabled:cursor-not-allowed ${variantClass} ${className}`;

    // Render as a link if 'href' is provided or 'as' is 'a'
    if (href || as === "a") {
      const linkProps = props as unknown as React.ComponentPropsWithoutRef<typeof Link>;
      if (disabled) {
        return (
          <span
            className={`${baseClasses} pointer-events-none opacity-50`}
            aria-disabled="true"
            role="link"
            tabIndex={-1}
          >
            {children}
          </span>
        );
      }

      return (
        <Link
          {...linkProps}
          href={href || "#"}
          className={baseClasses}
          ref={ref as React.Ref<HTMLAnchorElement>}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        type={props.type || "button"}
        className={baseClasses}
        disabled={disabled}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
