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
  const [level, setLevel] = useState<number | null>(null);
  const [dailyGoalTier, setDailyGoalTier] = useState<string | null>(null);
  const [dailyGoalXp, setDailyGoalXp] = useState<number | null>(null);
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
            setLevel(profileData.level ?? null);
            setDailyGoalTier(profileData.daily_goal_tier ?? null);
            setDailyGoalXp(profileData.daily_goal_xp ?? profileData.today_xp ?? null);
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
  const streakDisplay = streak !== null ? `${streak}` : "—";
  const levelDisplay = level !== null ? `L${level}` : "L—";
  const goalTarget = dailyGoalTier === "Serious" ? 50 : dailyGoalTier === "Regular" ? 20 : dailyGoalTier === "Casual" ? 10 : null;
  const goalCurrent = dailyGoalXp ?? 0;
  const goalDisplay = goalTarget ? `Goal ${goalCurrent}/${goalTarget}` : "Goal —";
  const quotaDisplay = quota !== null ? `${quota} sets` : "— sets";

  // ARIA Labels
  const xpAria = xp !== null ? `${xp} Experience Points` : "0 Experience Points";
  const streakAria = streak !== null ? `${streak} day streak` : "No active streak";
  const levelAria = level !== null ? `Level ${level}` : "Level not available";
  const goalAria = goalTarget
    ? `Daily goal progress: ${goalCurrent} of ${goalTarget} Experience Points for ${dailyGoalTier}`
    : "Daily goal not set";
  const quotaAria = quota !== null ? `${quota} sets remaining` : "Set quota unavailable";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* XP Pill */}
      <Pill
        variant="xp"
        aria-label={xpAria}
        title={xpAria}
      >
        <span className="whitespace-nowrap">{xpDisplay}</span>
      </Pill>

      <Pill variant="level" aria-label={levelAria} title={levelAria}>
        {levelDisplay}
      </Pill>

      {/* Streak Flame */}
      <div
        className="flex min-h-9 items-center gap-1 rounded-full border border-border bg-surface px-2.5 text-sm select-none"
        aria-label={streakAria}
        title={streakAria}
      >
        <Flame className="h-4.5 w-4.5 text-streak" aria-hidden="true" />
        <span className="text-numeral font-bold text-primary">{streakDisplay}</span>
      </div>

      {/* Daily Goal Progress */}
      <span
        className="hidden min-h-9 items-center rounded-full border border-border bg-surface px-2.5 text-xs font-semibold text-primary select-none xl:inline-flex"
        aria-label={goalAria}
        title={goalAria}
      >
        {goalDisplay}
      </span>

      {/* Quota Remaining */}
      <span
        className="hidden whitespace-nowrap text-sm text-muted font-medium text-numeral select-none 2xl:inline"
        aria-label={quotaAria}
        title={quotaAria}
      >
        {quotaDisplay}
      </span>
    </div>
  );
}
