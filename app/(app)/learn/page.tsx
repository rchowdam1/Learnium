"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Play, GraduationCap } from "lucide-react";

import { Card } from "@/app/components/ui/Card";
import { Pill } from "@/app/components/ui/Pill";
import { Button } from "@/app/components/ui/Button";
import { ProgressBar } from "@/app/components/ui/ProgressBar";
import CreateSetController from "@/app/components/controllers/CreateSetController";
import CreateSetModal from "@/app/components/modals/CreateSetModal";

interface LearningSet {
  id: number;
  title: string;
  description: string;
  category: string;
  numLessons: number;
  completedLessons: number;
  completed: boolean;
  date: string;
}

export default function LearnPage() {
  const router = useRouter();
  const [sets, setSets] = useState<LearningSet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  const fetchSets = async () => {
    try {
      const response = await fetch("/api/get-sets");
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setSets(data.data);
        }
      } else {
        toast.error("Could not fetch sets");
      }
    } catch {
      toast.error("Could not fetch sets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSets();
  }, []);

  const handleCreateSet = (
    title: string,
    description: string,
    category: string,
    numLessons?: number,
    setId?: number
  ) => {
    toast.success("Set created successfully!");
    if (setId) {
      router.push(`/sets/${setId}`);
    } else {
      fetchSets();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-16 animate-pulse">
        <div className="mx-auto max-w-[72rem] px-4 pt-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="h-11 bg-muted rounded-xl w-36" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-surface-raised border border-border rounded-xl p-6"
                />
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-16">
        <div className="mx-auto max-w-[72rem] px-4 pt-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-heading text-3xl font-extrabold text-primary tracking-tight">
              Learn Hub
            </h1>
          </div>

          {/* Empty state container */}
          <div className="flex flex-col items-center justify-center text-center space-y-6 py-12 max-w-md mx-auto">
            <div className="relative">
              <div className="absolute inset-0 scale-125 bg-accent/25 rounded-full blur-2xl animate-pulse" />
              <GraduationCap className="h-16 w-16 text-accent relative z-10" />
            </div>

            <div className="space-y-4 w-full">
              <h2 className="text-display text-2xl font-extrabold text-primary tracking-tight">
                Start Your Learning Journey
              </h2>
              <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-6 text-left shadow-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-8 -mt-8" />
                <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-2 select-none">
                  Nova
                </span>
                <p className="text-body text-base italic text-primary leading-relaxed">
                  &ldquo;Looks like you haven&apos;t started any learning sets yet. What do you actually want to learn? Give me a topic, and we will build your first custom course!&rdquo;
                </p>
              </div>
            </div>

            <div className="w-full pt-4">
              <Button
                variant="primary"
                onClick={() => setCreateModalOpen(true)}
                className="w-full min-h-11 flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create Your First Set</span>
              </Button>
            </div>
          </div>

          {/* Learning Paths Section (Epic 7 Placeholder) */}
          <div className="mt-12 border-t border-border pt-12 opacity-50 cursor-not-allowed select-none">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-heading text-xl font-bold text-primary">Learning Paths</h2>
                <p className="text-body text-sm text-muted">
                  Structured step-by-step journeys to master entire domains.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted border border-border">
                Coming Soon
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="flex flex-col justify-between">
                <div>
                  <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
                <div className="mt-6 h-10 bg-muted rounded-xl w-full" />
              </Card>
              <Card className="flex flex-col justify-between">
                <div>
                  <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                  <div className="h-6 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
                <div className="mt-6 h-10 bg-muted rounded-xl w-full" />
              </Card>
            </div>
          </div>

          {/* Modal */}
          <CreateSetModal
            open={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onCreateSet={handleCreateSet}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="mx-auto max-w-[72rem] px-4 pt-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-heading text-3xl font-extrabold text-primary tracking-tight">
            Learn Hub
          </h1>
          <CreateSetController onCreateSet={handleCreateSet} />
        </div>

        {/* Sets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map((set) => {
            const percentage = set.numLessons ? (set.completedLessons / set.numLessons) * 100 : 0;
            return (
              <Card key={set.id} className="flex flex-col justify-between min-h-[240px]">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-heading text-lg font-bold text-primary line-clamp-1">
                      {set.title}
                    </h3>
                    <Pill variant="category" className="shrink-0">
                      {set.category}
                    </Pill>
                  </div>
                  <p className="text-body text-sm text-muted mt-2 line-clamp-2">
                    {set.description}
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  {/* Progress Indicator */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-muted">
                      <span>Progress</span>
                      <span>
                        {set.completedLessons}/{set.numLessons || 0} lessons
                      </span>
                    </div>
                    <ProgressBar value={percentage} showLabel={false} />
                  </div>

                  {/* Start/Continue Button */}
                  <Button
                    variant="primary"
                    href={`/sets/${set.id}`}
                    className="w-full min-h-11 flex items-center justify-center gap-2"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>
                      {set.completedLessons === 0 ? "Start Set" : "Continue Set"}
                    </span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Learning Paths Section (Epic 7 Placeholder) */}
        <div className="mt-12 border-t border-border pt-12 opacity-50 cursor-not-allowed select-none">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-heading text-xl font-bold text-primary">Learning Paths</h2>
              <p className="text-body text-sm text-muted">
                Structured step-by-step journeys to master entire domains.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted border border-border">
                Coming Soon
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="flex flex-col justify-between">
              <div>
                <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </div>
              <div className="mt-6 h-10 bg-muted rounded-xl w-full" />
            </Card>
            <Card className="flex flex-col justify-between">
              <div>
                <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                <div className="h-6 bg-muted rounded w-1/2 mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
              <div className="mt-6 h-10 bg-muted rounded-xl w-full" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
