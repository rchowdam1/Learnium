"use client";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/app/components/ui/Button";

export default function SubscriptionCards({
  free,
  isSubscribed,
}: {
  free: boolean;
  isSubscribed: boolean;
}) {
  const router = useRouter();

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

  const isDisabled = (free && !isSubscribed) || (!free && isSubscribed);
  const buttonLabel = free
    ? isSubscribed
      ? "Switch to Free"
      : "Active"
    : isSubscribed
      ? "Active"
      : "Subscribe";

  return (
    <div className="flex flex-col justify-center gap-y-2 border border-border rounded-xl w-115 py-10 px-2 items-center bg-surface-raised">
      <span className="text-heading text-3xl text-primary">
        {free ? "Free" : "Pro"}
      </span>
      <span className="text-body text-muted">
        {free ? "For Everyday Learning" : "For Next Level Learning"}
      </span>
      <span className="text-body text-muted">
        <span className="text-numeral text-4xl text-primary">
          ${free ? "0" : "9.99"}
        </span>
        /month
      </span>
      {/*Plan Features*/}
      <div className="flex flex-col justify-center items-start gap-y-2 mt-5">
        {free
          ? freeFeatures.map((feature, index) => {
              return (
                <span
                  key={index}
                  className="flex gap-4 text-xl text-body text-muted"
                >
                  <Check className="w-9 h-9 text-accent-progress" />
                  {feature}
                </span>
              );
            })
          : paidFeatures.map((feature, index) => {
              return (
                <span
                  key={index}
                  className="flex gap-4 text-xl text-body text-muted"
                >
                  <Check className="w-9 h-9 text-accent-progress" />
                  {feature}
                </span>
              );
            })}
      </div>

      {/**Action button */}
      <Button
        variant={free && isSubscribed ? "secondary" : "primary"}
        disabled={isDisabled}
        className="w-75 mt-2"
        onClick={async () => {
          if ((free && !isSubscribed) || (!free && isSubscribed)) {
            return;
          }

          if (free && isSubscribed) {
            // click to go to customer portal
            const res = await fetch("/api/customer-portal", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({}),
            });

            if (!res.ok) {
              console.log("Error creating customer portal session");
              return;
            }

            const data = await res.json();
            if (data.url) {
              router.push(data.url);
              return;
            } else {
              toast.error(data.error);
              return;
            }
          }

          const res = await fetch("/api/checkout", {
            // click to go to checkout
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              isSubscribed,
            }),
          });

          if (!res.ok) {
            console.log("Error creating checkout session");
            return;
          }

          const data = await res.json();
          router.push(data.url);
        }}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
