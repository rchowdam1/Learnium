export default function Progress({
  width,
  percentage,
  color,
  ariaLabel = "Progress",
}: {
  width: number;
  percentage: number;
  color?: string;
  ariaLabel?: string;
}) {
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div
      className="h-2.5 rounded-full bg-accent-progress-track"
      style={{ width: `${width}px`, maxWidth: "100%" }}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(normalizedPercentage)}
    >
      <div
        className={`h-2.5 rounded-full ${color ? "" : "bg-accent-progress"}`}
        style={{
          width: `${normalizedPercentage}%`,
          ...(color ? { backgroundColor: color } : {}),
        }}
      />
    </div>
  );
}
