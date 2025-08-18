"use client";

import { createClient } from "@supabase/supabase-js";

import AuthNav from "../components/nav/AuthNav";
import SubscriptionCards from "../components/cards/SubscriptionCards";
import { Undo2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import { useState, useEffect } from "react";

// Subscription Page to display when the user is logged in
export default function SubscriptionsPage() {
  const [userEmail, setUserEmail] = useState<string>();
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch("/api/get-subscription-status");

        if (!response.ok) {
          toast.error("Could not fetch subscription status");
        } else {
          const data = await response.json();
          setUserEmail(data.email);
          setIsSubscribed(data.isSubscribed);
        }
      } catch (error) {
        toast.error("An error occurred while fetching subscription status");
      }
    };

    fetchSubscriptionStatus();
  }, []);

  return (
    <div className="min-h-screen relative bg-gray-50">
      <AuthNav />

      {/*Back Home Page*/}
      <Link href="/profile">
        <div className="sm:pt-20 lg:pt-0 lg:absolute lg:top-26 lg:left-10 flex justify-center gap-2 items-center rounded-2xl px-2 py-1 hover:bg-gray-200 transition-colors duration-350 cursor-pointer">
          <Undo2 />
          <span>Return to profile</span>
        </div>
      </Link>

      <div className="flex flex-col justify-center items-center pt-25">
        <h1 className="text-5xl font-bold">Choose A Plan</h1>
        <span className="text-2xl text-gray-500 mt-5">
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
