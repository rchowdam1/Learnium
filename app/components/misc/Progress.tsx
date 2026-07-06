export default function Progress({
  width,
  percentage,
  color,
}: {
  width: number;
  percentage: number;
  color?: string;
}) {
  return (
    <div
      className="h-2.5 rounded-full bg-accent-progress-track"
      style={{ width: `${width}px` }}
    >
      <div
        className={`h-2.5 rounded-full ${color ? "" : "bg-accent-progress"}`}
        style={{
          width: `${percentage}%`,
          ...(color ? { backgroundColor: color } : {}),
        }}
      />
    </div>
  );
}
