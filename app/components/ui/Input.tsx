"use client";

import * as React from "react";

/**
 * Input Design Tokens & States Mapping:
 * - Resting State: bg-surface-raised (var(--surface-raised)), border-border-interactive (var(--border-interactive) - 3:1 contrast boundary)
 * - Focus State: border-brand (var(--brand)) + focus-ring (2px var(--info) ring with offset)
 * - Error State: border-error (var(--error)), text-error (var(--error)) + visual cue (⚠️ icon/text)
 * - Label: above the input field, text-label typography (Space Grotesk, Medium)
 * - Radius: rounded-xl (12px)
 * - Baseline Style: px-3 py-3 text-body text-primary placeholder:text-muted
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    // Generate a unique ID if none is provided
    const internalId = React.useId();
    const inputId = id || internalId;
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-label text-sm text-primary select-none font-medium"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`
            w-full rounded-xl border px-3 py-3 text-body text-primary bg-surface-raised placeholder:text-muted
            focus-ring outline-none transition-colors duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error
              ? "border-error focus:border-error"
              : "border-border-interactive focus:border-brand"
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <span
            id={errorId}
            className="text-error text-xs font-medium flex items-center gap-1 select-none"
          >
            <span aria-hidden="true">⚠️</span>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
