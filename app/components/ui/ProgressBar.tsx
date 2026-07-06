import * as React from "react";

/**
 * ProgressBar Design Tokens Mapping:
 * - Track: bg-accent-progress-track (var(--accent-progress-track))
 * - Fill: bg-accent-progress (var(--accent-progress)) (muted lime always-on progress)
 * - Radius: rounded-full (9999px)
 * - Percent Label (Optional): text-numeral (Space Grotesk, Bold, Tabular/Lining numbers)
 */

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // Percentage value from 0 to 100
  showLabel?: boolean;
}

export function ProgressBar({ value, showLabel = false, className = "", ...props }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full flex items-center gap-3 ${className}`} {...props}>
      <div className="relative w-full h-3 bg-accent-progress-track rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-progress rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span className="text-numeral text-sm text-primary min-w-[2.5rem] text-right">
          {clampedValue}%
        </span>
      )}
    </div>
  );
}
