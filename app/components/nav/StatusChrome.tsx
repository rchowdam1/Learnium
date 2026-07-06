"use client";

import React, { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import { Pill } from "@/app/components/ui/Pill";

interface StatusChromeProps {
  className?: string;
}

export function StatusChrome({ className = "" }: StatusChromeProps) {
  const [xp, setXp] = useState<number | null>(null);
  const [streak, setStreak] = useState<number | null>(null);
  const [dailyGoalTier, setDailyGoalTier] = useState<string | null>(null);
  const [quota, setQuota] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, subRes] = await Promise.all([
          fetch("/api/get-profile-data"),
          fetch("/api/get-subscription-status"),
        ]);

        if (profileRes.ok && subRes.ok) {
          const profileData = await profileRes.json();
          const subData = await subRes.json();

          if (profileData.success) {
            // Support optional chaining / fallbacks
            setXp(profileData.xp ?? null);
            setStreak(profileData.streak ?? null);
            setDailyGoalTier(profileData.daily_goal_tier ?? null);
          }

          // Fetch sets remaining from subscription status or profile fallback
          const setsRemaining = subData.setsRemaining ?? subData.requestsRemaining ?? profileData.requestsRemaining ?? null;
          setQuota(setsRemaining);
        }
      } catch (error) {
        console.error("Error fetching status chrome data:", error);
      }
    };

    fetchData();
  }, []);

  const xpDisplay = xp !== null ? `${xp} XP` : "0 XP";
  const streakDisplay = streak !== null ? `${streak} streak` : "— streak";
  const goalDisplay = dailyGoalTier ? `Goal: ${dailyGoalTier}` : "Goal: —";
  const quotaDisplay = quota !== null ? `Sets: ${quota} left` : "Sets: —";

  // ARIA Labels
  const xpAria = xp !== null ? `${xp} Experience Points` : "0 Experience Points";
  const streakAria = streak !== null ? `${streak} day streak` : "No active streak";
  const goalAria = dailyGoalTier ? `Daily goal tier: ${dailyGoalTier}` : "Daily goal not set";
  const quotaAria = quota !== null ? `${quota} sets remaining` : "No quota remaining";

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/* XP Pill */}
      <Pill
        variant="xp"
        aria-label={xpAria}
        title={xpAria}
      >
        {xpDisplay}
      </Pill>

      {/* Streak Flame */}
      <div
        className="flex items-center gap-1 text-streak font-semibold text-sm select-none"
        aria-label={streakAria}
        title={streakAria}
      >
        <Flame className="h-4.5 w-4.5 text-streak" aria-hidden="true" />
        <span>{streakDisplay}</span>
      </div>

      {/* Daily Goal Progress */}
      <span
        className="bg-accent-progress text-white px-2.5 py-0.5 text-xs rounded-full font-semibold select-none"
        aria-label={goalAria}
        title={goalAria}
      >
        {goalDisplay}
      </span>

      {/* Quota Remaining */}
      <span
        className="text-sm text-muted font-medium text-numeral select-none"
        aria-label={quotaAria}
        title={quotaAria}
      >
        {quotaDisplay}
      </span>
    </div>
  );
}
