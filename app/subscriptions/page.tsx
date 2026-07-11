"use client";

import AuthNav from "../components/nav/AuthNav";
import SubscriptionCards from "../components/cards/SubscriptionCards";
import { Undo2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import { useState, useEffect } from "react";

// Subscription Page to display when the user is logged in
export default function SubscriptionsPage() {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch("/api/get-subscription-status");

        if (!response.ok) {
          toast.error("Could not fetch subscription status");
        } else {
          const data = await response.json();
          setIsSubscribed(data.isSubscribed);
        }
      } catch {
        toast.error("An error occurred while fetching subscription status");
      }
    };

    fetchSubscriptionStatus();
  }, []);

  return (
    <div className="min-h-screen relative bg-background">
      <AuthNav />

      {/*Back Home Page*/}
      <Link
        href="/profile"
        className="sm:pt-20 lg:pt-0 lg:absolute lg:top-26 lg:left-10 flex justify-center gap-2 items-center rounded-xl px-2 py-1 text-primary hover:bg-surface focus-ring transition-colors duration-350 cursor-pointer"
      >
        <Undo2 />
        <span>Return to profile</span>
      </Link>

      <div className="flex flex-col justify-center items-center pt-25">
        <h1 className="text-display text-primary">Choose A Plan</h1>
        <span className="text-body text-muted mt-5 text-2xl">
          Upgrade or downgrade your current plan at any time.
        </span>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mt-10">
          <SubscriptionCards free={true} isSubscribed={isSubscribed} />
          <SubscriptionCards free={false} isSubscribed={isSubscribed} />
        </div>
      </div>
    </div>
  );
}
