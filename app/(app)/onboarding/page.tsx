"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, CheckCircle2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Pill } from "@/app/components/ui/Pill";

const PRESET_TOPICS = ["Science", "History", "Technology", "Business"];

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

export default function OnboardingPage() {
  const router = useRouter();
  const [profileLoading, setProfileLoading] = useState(true);
  const [step, setStep] = useState(1);
  
  // Form state
  const [topic, setTopic] = useState("");
  const [dailyGoalTier, setDailyGoalTier] = useState("");
  
  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved state from localStorage (AC 2 protection against refresh/network errors)
  useEffect(() => {
    const savedTopic = localStorage.getItem("onboarding_topic");
    const savedTier = localStorage.getItem("onboarding_daily_goal_tier");
    const savedStep = localStorage.getItem("onboarding_step");

    if (savedTopic) setTopic(savedTopic);
    if (savedTier) setDailyGoalTier(savedTier);
    if (savedStep) setStep(Number(savedStep));

    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch("/api/get-profile-data");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.daily_goal_tier) {
            // Already onboarded, skip to dashboard
            router.replace("/dashboard");
            return;
          }
        }
      } catch (err) {
        console.error("Failed to check onboarding profile data:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [router]);

  // Persist form state to localStorage
  const saveStateToLocalStorage = (newTopic: string, newTier: string, newStep: number) => {
    localStorage.setItem("onboarding_topic", newTopic);
    localStorage.setItem("onboarding_daily_goal_tier", newTier);
    localStorage.setItem("onboarding_step", String(newStep));
  };

  const handleTopicSelect = (selectedTopic: string) => {
    setTopic(selectedTopic);
    saveStateToLocalStorage(selectedTopic, dailyGoalTier, step);
  };

  const handleCustomTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTopic(value);
    saveStateToLocalStorage(value, dailyGoalTier, step);
  };

  const handleTierSelect = (selectedTier: string) => {
    setDailyGoalTier(selectedTier);
    saveStateToLocalStorage(topic, selectedTier, step);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!topic.trim()) {
        toast.error("Please enter or select a topic of interest.");
        return;
      }
      setStep(2);
      saveStateToLocalStorage(topic, dailyGoalTier, 2);
    }
  };

  const handlePrevStep = () => {
    if (step === 2) {
      setStep(1);
      saveStateToLocalStorage(topic, dailyGoalTier, 1);
    }
  };

  const handleSubmit = async () => {
    if (!dailyGoalTier) {
      toast.error("Please select a daily goal tier.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/save-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, daily_goal_tier: dailyGoalTier }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Clear local storage onboarding state
        localStorage.removeItem("onboarding_topic");
        localStorage.removeItem("onboarding_daily_goal_tier");
        localStorage.removeItem("onboarding_step");

        setStep(3); // Go to completion screen
      } else {
        toast.error(result.error || "Failed to save onboarding data. Please try again.");
      }
    } catch (err) {
      // Input is preserved since we use local component states and local storage. (AC 2)
      toast.error("Connection error. Please check your internet and try again.");
      console.error("Onboarding submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    // Navigate to dashboard
    router.replace("/dashboard");
  };

  if (profileLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <span className="text-body text-muted">Checking profile status...</span>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-start bg-background px-4 py-8 md:py-16">
      <div className="w-full max-w-[32rem] flex-col items-center justify-center space-y-8">
        
        {/* Step Indicator Header */}
        {step < 3 && (
          <div className="flex items-center justify-between px-2 select-none">
            <span className="text-label text-xs text-muted font-semibold uppercase tracking-wider">
              Step {step} of 2
            </span>
            <div className="flex gap-1.5">
              <div
                className={`h-1.5 w-10 rounded-full transition-colors duration-300 ${
                  step >= 1 ? "bg-brand" : "bg-border"
                }`}
              />
              <div
                className={`h-1.5 w-10 rounded-full transition-colors duration-300 ${
                  step >= 2 ? "bg-brand" : "bg-border"
                }`}
              />
            </div>
          </div>
        )}

        {/* Step 1: Topic Interest */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-display text-3xl font-bold text-primary tracking-tight">
                What sparks your curiosity?
              </h1>
              <p className="text-body text-base text-muted">
                Select a starter interest or enter your own custom topic. We&apos;ll use this to create your first learning path.
              </p>
            </div>

            {/* Preset chips */}
            <div className="space-y-2.5">
              <span className="text-label text-sm text-primary font-medium">Starter Interests</span>
              <div className="flex flex-wrap gap-2.5">
                {PRESET_TOPICS.map((t) => {
                  const isSelected = topic.toLowerCase() === t.toLowerCase();
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTopicSelect(t)}
                      className="focus-ring rounded-full cursor-pointer transition-transform duration-100 active:scale-95"
                      aria-pressed={isSelected}
                    >
                      <Pill
                        variant={isSelected ? "xp" : "category"}
                        className={`min-h-11 px-5 border ${
                          isSelected
                            ? "border-accent shadow-sm"
                            : "border-border hover:bg-surface hover:text-primary transition-colors duration-200"
                        }`}
                      >
                        {t}
                      </Pill>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-2">
              <Input
                label="Or type a custom topic"
                placeholder="E.g., Ancient Greek Philosophy, Astronomy..."
                value={topic}
                onChange={handleCustomTopicChange}
                maxLength={80}
                className="min-h-11"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4">
              <Button
                variant="primary"
                onClick={handleNextStep}
                disabled={!topic.trim()}
                className="w-full min-h-11"
              >
                <span>Continue</span>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Daily Goal Tier */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-display text-3xl font-bold text-primary tracking-tight">
                Choose your daily goal
              </h1>
              <p className="text-body text-base text-muted">
                How much time would you like to dedicate to learning each day?
              </p>
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
                    className={`focus-ring text-left w-full cursor-pointer rounded-xl p-6 border-2 transition-all duration-200 hover:bg-surface-raised hover:scale-[1.01] ${
                      isSelected
                        ? "border-brand bg-surface-raised shadow-md"
                        : "border-border bg-surface-raised"
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="space-y-1">
                        <span className="text-heading text-lg font-bold text-primary block">
                          {tier.title}
                        </span>
                        <span className="text-body text-sm text-muted block text-left">
                          {tier.description}
                        </span>
                      </div>
                      <Pill variant="xp" className="min-h-8 font-semibold">
                        {tier.xp}
                      </Pill>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 min-h-11"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Back</span>
              </Button>
              <Button
                variant="progress"
                onClick={handleSubmit}
                disabled={!dailyGoalTier || isSubmitting}
                className="w-full flex items-center justify-center gap-2 min-h-11 flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Setup</span>
                    <Sparkles className="h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Completion Step */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
            <div className="relative">
              <div className="absolute inset-0 scale-125 bg-accent/20 rounded-full blur-xl animate-pulse" />
              <CheckCircle2 className="h-20 w-20 text-accent relative z-10" />
            </div>

            <div className="space-y-3">
              <h1 className="text-display text-4xl font-extrabold text-primary tracking-tight">
                You&apos;re all set!
              </h1>
              <div className="max-w-[28rem] rounded-2xl border border-border bg-surface-raised p-6 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-8 -mt-8" />
                <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-2 select-none">
                  Nova
                </span>
                <p className="text-body text-base italic text-primary leading-relaxed">
                  &ldquo;Perfect. Your onboarding is complete and I&apos;ve personalized your dashboard. Let&apos;s make today a great day to learn!&rdquo;
                </p>
              </div>
            </div>

            <div className="w-full pt-4">
              <Button
                variant="progress"
                onClick={handleComplete}
                className="w-full min-h-11 flex items-center justify-center gap-2"
              >
                <span>Go to Dashboard</span>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
