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
      className={`h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-[${width}px]`}
      style={{ width: `${width}px` }}
    >
      <div
        className={`bg-${color ?? "blue"}-600 h-2.5 rounded-full`}
        style={{ width: `${percentage}%`, backgroundColor: color ?? "#2563eb" }}
      ></div>
    </div>
  );
}
