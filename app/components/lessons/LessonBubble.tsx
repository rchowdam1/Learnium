export default function LessonBubble({
  number,
  active,
  complete,
  last,
  clickedLesson,
}: {
  number: number;
  active: boolean;
  complete: boolean;
  last: boolean; // last determines if there should be a vertical line extending from the bubble
  clickedLesson: () => void; // function to handle click events on the bubble
}) {
  return (
    <div
      className={`relative h-2 w-40 ${
        active ? "bg-blue-500" : complete ? "bg-green-500" : "bg-gray-200"
      } shadow-lg cursor-pointer transition-colors duration-300`}
      onClick={clickedLesson}
    >
      {/*Vertical Line*/}
      {!last && (
        <div
          className={`absolute w-2 h-19 ${
            complete ? "bg-green-500" : "bg-gray-200"
          } left-9 shadow-lg`}
        ></div>
      )}
      {/* Circle centered on the line */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 ${
          active ? "bg-blue-500" : complete ? "bg-green-500" : "bg-gray-200"
        } w-20 h-20 rounded-full flex items-center justify-center shadow-lg`}
      >
        <span
          className={`text-4xl font-bold ${
            active || complete ? "text-white" : "text-black"
          }`}
        >
          {number}
        </span>
      </div>
    </div>
  );
}
