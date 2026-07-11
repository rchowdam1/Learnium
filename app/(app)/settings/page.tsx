"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  User,
  Target,
  Bell,
  Palette,
  Trophy,
  LogOut,
  ArrowLeft,
  Loader2,
  Sparkles,
  CreditCard,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { Pill } from "@/app/components/ui/Pill";

const TIER_DETAILS = [
  {
    id: "Casual",
    title: "Casual",
    xp: "10 XP",
    description: "Perfect for quick daily sessions.",
  },
  {
    id: "Regular",
    title: "Regular",
    xp: "20 XP",
    description: "Great for building a solid habit.",
  },
  {
    id: "Serious",
    title: "Serious",
    xp: "50 XP",
    description: "Accelerate your learning journey.",
  },
];

export default function SettingsPage() {
  const [profileLoading, setProfileLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Daily Goal state
  const [dailyGoalTier, setDailyGoalTier] = useState("");
  const [originalGoalTier, setOriginalGoalTier] = useState("");
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const response = await fetch("/api/get-profile-data");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setEmail(data.email || "");
            setCreatedAt(data.created_at || "");
            setIsSubscribed(!!data.isSubscribed);
            setDailyGoalTier(data.daily_goal_tier || "");
            setOriginalGoalTier(data.daily_goal_tier || "");
          } else {
            toast.error("Failed to load profile settings.");
          }
        } else {
          toast.error("Failed to fetch settings.");
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        toast.error("Connection error loading settings.");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchSettingsData();
  }, []);

  const handleTierSelect = (selectedTier: string) => {
    setDailyGoalTier(selectedTier);
  };

  const handleSaveGoal = async () => {
    if (!dailyGoalTier) {
      toast.error("Please select a daily goal tier.");
      return;
    }
    setIsSavingGoal(true);
    try {
      const response = await fetch("/api/save-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daily_goal_tier: dailyGoalTier }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setOriginalGoalTier(dailyGoalTier);
        toast.success("Daily goal updated successfully!");
      } else {
        toast.error(data.error || "Failed to update daily goal.");
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast.error("Failed to save settings due to a connection error.");
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const response = await fetch("/api/logout");
      if (response.ok) {
        window.location.href = "/login";
      } else {
        toast.error("Could not sign out");
        setIsSigningOut(false);
      }
    } catch (err) {
      console.error("Sign out error:", err);
      toast.error("Sign out failed.");
      setIsSigningOut(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (profileLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <span className="text-body text-muted font-medium">Checking profile details...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-primary py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[42rem] mx-auto space-y-8 pb-12">
        {/* Back Link & Page Title */}
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="focus-ring inline-flex items-center gap-2 text-muted hover:text-primary transition-colors duration-150 rounded-xl px-2 py-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-label text-sm font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-display-sm text-3xl font-bold tracking-tight">
              Settings
            </h1>
            <Pill variant={isSubscribed ? "xp" : "category"} className="font-semibold">
              {isSubscribed ? "PRO MEMBER" : "FREE TIER"}
            </Pill>
          </div>
        </div>

        {/* Section 1: Account Info */}
        <Card className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <User className="h-6 w-6 text-brand" />
            <div>
              <h2 className="text-heading text-lg font-bold">Account Settings</h2>
              <p className="text-caption text-muted">Manage your credentials and plan status</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Email Address"
              value={email}
              disabled
              readOnly
              className="bg-surface opacity-75 cursor-not-allowed select-all"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface/50">
              <div className="space-y-1">
                <span className="text-label text-sm font-medium block text-muted">
                  Membership & Date Joined
                </span>
                <span className="text-body text-sm font-semibold">
                  Member since {formatDate(createdAt)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" href="/subscriptions" className="min-h-11">
                  <CreditCard className="h-4 w-4" />
                  <span>Manage Plan</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="secondary"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="text-error border-error hover:bg-error/5 min-h-11"
            >
              {isSigningOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing out...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Section 2: Daily Goal Settings */}
        <Card className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Target className="h-6 w-6 text-brand" />
            <div>
              <h2 className="text-heading text-lg font-bold">Daily Goal</h2>
              <p className="text-caption text-muted">Adjust how much XP you want to target each day</p>
            </div>
          </div>

          {/* Tiers Grid */}
          <div className="grid grid-cols-1 gap-4">
            {TIER_DETAILS.map((tier) => {
              const isSelected = dailyGoalTier === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => handleTierSelect(tier.id)}
                  className={`focus-ring text-left w-full cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 hover:bg-surface-raised hover:scale-[1.01] flex items-center justify-between ${
                    isSelected
                      ? "border-brand bg-surface-raised shadow-sm"
                      : "border-border bg-surface-raised"
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="space-y-1">
                    <span className="text-heading text-base font-bold text-primary block">
                      {tier.title}
                    </span>
                    <span className="text-body text-xs text-muted block text-left">
                      {tier.description}
                    </span>
                  </div>
                  <Pill variant="xp" className="min-h-8 font-semibold">
                    {tier.xp}
                  </Pill>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              onClick={handleSaveGoal}
              disabled={isSavingGoal || dailyGoalTier === originalGoalTier}
              className="min-h-11"
            >
              {isSavingGoal ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Save Goal</span>
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Section 3: Preferences / Future Placeholders */}
        <Card className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <ShieldAlert className="h-6 w-6 text-brand" />
            <div>
              <h2 className="text-heading text-lg font-bold">Preferences</h2>
              <p className="text-caption text-muted">Customize notification and appearance options</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Reminder Toggle Placeholders */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface-raised opacity-50 cursor-not-allowed select-none">
              <div className="space-y-1">
                <span className="text-label text-sm font-bold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted" />
                  Daily Reminders
                </span>
                <span className="text-caption text-muted block">
                  Get email reminders to keep your streak active.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-not-allowed">
                  <input
                    type="checkbox"
                    disabled
                    className="sr-only peer cursor-not-allowed"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-border after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-raised after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand" />
                </label>
                <span className="text-xs font-semibold text-muted bg-surface border border-border px-2 py-0.5 rounded-full whitespace-nowrap">
                  Coming soon
                </span>
              </div>
            </div>

            {/* Theme Placeholders */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface-raised opacity-50 cursor-not-allowed select-none">
              <div className="space-y-1">
                <span className="text-label text-sm font-bold flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted" />
                  Interface Theme
                </span>
                <span className="text-caption text-muted block">
                  Switch between light, dark, or system matching theme.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  disabled
                  defaultValue="auto"
                  className="bg-surface border border-border-interactive rounded-xl px-3 py-1.5 text-xs font-medium text-muted cursor-not-allowed outline-none"
                >
                  <option value="auto">Auto (follows system)</option>
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>
            </div>

            {/* Leagues Opt-out Placeholders */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface-raised opacity-50 cursor-not-allowed select-none">
              <div className="space-y-1">
                <span className="text-label text-sm font-bold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted" />
                  League Participation
                </span>
                <span className="text-caption text-muted block">
                  Compete with other learners in weekly boards or turn them off.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-not-allowed">
                  <input
                    type="checkbox"
                    disabled
                    defaultChecked
                    className="sr-only peer cursor-not-allowed"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-border after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-raised after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand" />
                </label>
                <span className="text-xs font-semibold text-muted bg-surface border border-border px-2 py-0.5 rounded-full whitespace-nowrap">
                  Coming in a future update
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
