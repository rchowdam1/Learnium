import { Check, Settings } from "lucide-react";

export default function SubscriptionCards({
  free,
  isSubscribed,
}: {
  free: boolean;
  isSubscribed: boolean;
}) {
  // Free Plan Card
  const freeFeatures = [
    "1 set request per day",
    "Up to 3 sets at a time",
    "Quizzes after each lesson",
    "3-5 lessons per set",
  ];

  const paidFeatures = [
    "5 set requests per day",
    "Up to 10 sets at a time",
    "Active recall sessions for every lesson",
    "View completed set contents",
  ];
  return (
    <div className="flex flex-col justify-center gap-y-2 border border-gray-300 rounded-xl w-115 py-10 px-2 items-center bg-white transition-colors transition-transform duration-400 transform hover:scale-101 hover:border-2 hover:border-blue-400">
      <span className="text-3xl font-semibold">{free ? "Free" : "Pro"}</span>
      <span className="text-gray-600">
        {free ? "For Everyday Learning" : "For Next Level Learning"}
      </span>
      <span className="text-gray-600">
        <span className="text-4xl font-bold text-black">
          ${free ? "0" : "9.99"}
        </span>
        /month
      </span>
      {/*Plan Features*/}
      <div className="flex flex-col justify-center items-start gap-y-2 mt-5">
        {free
          ? freeFeatures.map((feature, index) => {
              return (
                <span key={index} className="flex gap-4 text-xl text-gray-600">
                  <Check className="w-9 h-9 text-green-400" />
                  {feature}
                </span>
              );
            })
          : paidFeatures.map((feature, index) => {
              return (
                <span key={index} className="flex gap-4 text-xl text-gray-600">
                  <Check className="w-9 h-9 text-green-400" />
                  {feature}
                </span>
              );
            })}
      </div>

      {/**Action button */}
      <button
        className={`px-2 w-75 py-2 font-medium transition-colors duration-200 rounded-lg ${
          free
            ? isSubscribed
              ? "bg-gray-200 hover:bg-gray-100 cursor-pointer"
              : "bg-gray-100 cursor-not-allowed"
            : isSubscribed
            ? "bg-blue-400 hover:bg-blue-300 cursor-not-allowed"
            : "bg-black hover:bg-gray-600 cursor-pointer"
        } ${free ? "text-gray-600" : "text-white"}`}
      >
        {free
          ? isSubscribed
            ? "Switch to Free"
            : "Active"
          : isSubscribed
          ? "Active"
          : "Subscribe"}
      </button>
    </div>
  );
}
