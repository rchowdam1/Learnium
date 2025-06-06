export default function Progress({
  width,
  percentage,
}: {
  width: number;
  percentage: number;
}) {
  return (
    <div
      className={`h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-[${width}px]`}
    >
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}
