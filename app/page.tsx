import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Sparkles, Trophy, Flame, Repeat } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-primary flex flex-col selection:bg-selection selection:text-primary">
      {/* Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-xl focus:bg-surface-raised focus:px-4 focus:py-2 focus:text-primary focus:border focus:border-border focus:shadow-sm focus-ring"
      >
        Skip to content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-[72rem] items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand">
              <span className="text-label text-cta-text font-bold">L</span>
            </div>
            <span className="text-heading text-xl text-primary font-bold">Learnium</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="#features" className="focus-ring text-label text-sm text-muted hover:text-primary transition-colors duration-150">
              Features
            </Link>
            <Link href="#how-it-works" className="focus-ring text-label text-sm text-muted hover:text-primary transition-colors duration-150">
              How It Works
            </Link>
            <Button variant="secondary" href="/login">
              Sign In
            </Button>
            <Button variant="primary" href="/signup">
              Get Started Free
            </Button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-grow focus:outline-none" tabIndex={-1}>
        {/* Hero Section */}
        <section className="border-b border-border bg-background">
          <div className="mx-auto max-w-[72rem] px-6 py-24 sm:py-32">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-display text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-tight text-primary">
                Master Any Topic with AI-Generated Courses and Gamified Progress
              </h1>
              <p className="text-body mx-auto mt-8 max-w-2xl text-lg sm:text-xl text-muted">
                Describe whatever you want to learn, and Nova will build a custom, structured curriculum of bite-sized lessons. Earn XP, maintain your streak, and unlock real progress in just 5 minutes a day.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button variant="primary" href="/signup" className="w-full sm:w-auto px-8 py-3 text-lg">
                  Start Learning Free
                </Button>
                <Button variant="secondary" href="/login" className="w-full sm:w-auto px-8 py-3 text-lg">
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Value Section (Stats) */}
        <section className="border-b border-border bg-surface py-16">
          <div className="mx-auto max-w-[72rem] px-6">
            <div className="text-center">
              <p className="text-label text-sm uppercase tracking-wider text-muted mb-12">
                Why Microlearning Works
              </p>
              <div className="grid gap-8 md:grid-cols-3">
                <Card className="flex flex-col items-center justify-center text-center">
                  <div className="text-numeral text-heading mb-3 text-4xl text-primary font-bold">~50%</div>
                  <h3 className="text-heading text-lg text-primary mb-2">Better Retention</h3>
                  <p className="text-body text-sm text-muted">
                    Short, focused lessons improve information retention and reduce cognitive fatigue.
                  </p>
                </Card>
                <Card className="flex flex-col items-center justify-center text-center">
                  <div className="text-numeral text-heading mb-3 text-4xl text-primary font-bold">5 Min</div>
                  <h3 className="text-heading text-lg text-primary mb-2">Fits Your Schedule</h3>
                  <p className="text-body text-sm text-muted">
                    Learn during commutes, coffee breaks, or whenever you have a few spare minutes.
                  </p>
                </Card>
                <Card className="flex flex-col items-center justify-center text-center">
                  <div className="text-numeral text-heading mb-3 text-4xl text-primary font-bold">3x</div>
                  <h3 className="text-heading text-lg text-primary mb-2">Faster Progress</h3>
                  <p className="text-body text-sm text-muted">
                    Highly focused learning paths help you achieve your goals 3x faster than traditional setups.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-b border-border bg-background py-24">
          <div className="mx-auto max-w-[72rem] px-6">
            <div className="mb-16 text-center max-w-2xl mx-auto">
              <h2 className="text-heading text-primary mb-4 text-3xl sm:text-4xl">
                Features Designed for Real Progress
              </h2>
              <p className="text-body text-lg text-muted">
                Learnium pairs adaptive AI curriculum design with proven science-based habit mechanics.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="flex flex-col h-full">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-surface">
                  <Sparkles className="h-6 w-6 text-brand" />
                </div>
                <h3 className="text-heading text-lg text-primary mb-3 font-semibold">AI-Generated Courses</h3>
                <p className="text-body text-sm text-muted">
                  Type any topic you want to master. Nova instantly builds a structured, step-by-step roadmap of bite-sized lessons tailored to your goals.
                </p>
              </Card>

              <Card className="flex flex-col h-full">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-surface">
                  <Trophy className="h-6 w-6 text-brand" />
                </div>
                <h3 className="text-heading text-lg text-primary mb-3 font-semibold">Gamified Progression</h3>
                <p className="text-body text-sm text-muted">
                  Stay motivated with level milestones, leagues, and XP rewards. Experience game-like momentum inside a premium, clutter-free workspace.
                </p>
              </Card>

              <Card className="flex flex-col h-full">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-surface">
                  <Flame className="h-6 w-6 text-streak" />
                </div>
                <h3 className="text-heading text-lg text-primary mb-3 font-semibold">Friendly Streaks</h3>
                <p className="text-body text-sm text-muted">
                  Build a daily learning habit. We celebrate your consistency and offer friendly encouragement when life gets busy—never guilt or shame.
                </p>
              </Card>

              <Card className="flex flex-col h-full">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-surface">
                  <Repeat className="h-6 w-6 text-brand" />
                </div>
                <h3 className="text-heading text-lg text-primary mb-3 font-semibold">Spaced Repetition</h3>
                <p className="text-body text-sm text-muted">
                  Stop forgetting what you learn. Scientifically scheduled review sessions reactivate your memory pathways to lock in knowledge for the long run.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="border-b border-border bg-surface py-24">
          <div className="mx-auto max-w-[72rem] px-6">
            <div className="mb-16 text-center max-w-2xl mx-auto">
              <h2 className="text-heading text-primary mb-4 text-3xl sm:text-4xl">
                How It Works
              </h2>
              <p className="text-body text-lg text-muted">
                Three simple steps to start your custom learning journey.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-xl bg-surface overflow-hidden">
                  <Image
                    src="/icons/step1.png"
                    alt="Illustration showing picking a topic"
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
                <h3 className="text-heading text-lg text-primary mb-3">1. Pick a Topic</h3>
                <p className="text-body text-sm text-muted">
                  Enter any subject—from &ldquo;Basics of Guitar&rdquo; to &ldquo;Intro to Machine Learning.&rdquo; Nova instantly maps the core concepts.
                </p>
              </Card>

              <Card className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-xl bg-surface overflow-hidden">
                  <Image
                    src="/icons/step2.png"
                    alt="Illustration showing course path outline"
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
                <h3 className="text-heading text-lg text-primary mb-3">2. Observe Your Path</h3>
                <p className="text-body text-sm text-muted">
                  Review the structured lessons generated for you. Adjust the topics to match your exact goals and set your weekly schedule.
                </p>
              </Card>

              <Card className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-xl bg-surface overflow-hidden">
                  <Image
                    src="/icons/step3.png"
                    alt="Illustration showing learning progress"
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
                <h3 className="text-heading text-lg text-primary mb-3">3. Learn & Build Habits</h3>
                <p className="text-body text-sm text-muted">
                  Start learning immediately. Complete lessons in 5 minutes, track your streak, and earn XP to build a durable daily study habit.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="border-b border-border bg-background py-24">
          <div className="mx-auto max-w-[72rem] px-6">
            <div className="mb-16 text-center max-w-2xl mx-auto">
              <h2 className="text-heading text-primary mb-4 text-3xl sm:text-4xl">
                What Our Learners Say
              </h2>
              <p className="text-body text-lg text-muted font-normal">
                Real results from professionals who built a daily habit.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="flex flex-col justify-between">
                <p className="text-body italic text-primary mb-6">
                  &ldquo;Learnium helped me master React in just 3 weeks. The bite-sized lessons fit perfectly into my busy schedule!&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-label text-cta-text font-bold text-sm">
                    S
                  </div>
                  <div className="ml-3">
                    <h4 className="text-heading text-sm text-primary font-semibold">Sarah Chen</h4>
                    <p className="text-body text-xs text-muted">Software Developer</p>
                  </div>
                </div>
              </Card>

              <Card className="flex flex-col justify-between">
                <p className="text-body italic text-primary mb-6">
                  &ldquo;Finally learned data analysis! The personalized approach made complex topics actually enjoyable.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-label text-cta-text font-bold text-sm">
                    M
                  </div>
                  <div className="ml-3">
                    <h4 className="text-heading text-sm text-primary font-semibold">Marcus Johnson</h4>
                    <p className="text-body text-xs text-muted">Marketing Manager</p>
                  </div>
                </div>
              </Card>

              <Card className="flex flex-col justify-between">
                <p className="text-body italic text-primary mb-6">
                  &ldquo;The progress tracking keeps me motivated. I&apos;ve completed 5 courses and counting!&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-label text-cta-text font-bold text-sm">
                    A
                  </div>
                  <div className="ml-3">
                    <h4 className="text-heading text-sm text-primary font-semibold">Anna Rodriguez</h4>
                    <p className="text-body text-xs text-muted">Student</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-surface py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-display text-primary mb-6 text-3xl sm:text-5xl leading-tight">
              Start Your Microlearning Journey Today
            </h2>
            <p className="text-body text-muted mb-8 text-lg sm:text-xl max-w-2xl mx-auto">
              Join thousands of professionals mastering new skills, five minutes at a time. Start your first AI-generated course now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="primary" href="/signup" className="w-full sm:w-auto px-10 py-4 text-lg">
                Start Learning Free
              </Button>
              <Button variant="secondary" href="/login" className="w-full sm:w-auto px-10 py-4 text-lg">
                Sign In
              </Button>
            </div>
            <p className="text-body mt-6 text-sm text-muted">
              No credit card required • Build custom courses instantly • Learn at your pace
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12 text-muted">
        <div className="mx-auto max-w-[72rem] px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand">
                  <span className="text-label text-cta-text font-bold">L</span>
                </div>
                <span className="text-heading text-xl text-primary font-bold">Learnium</span>
              </div>
              <p className="text-body text-sm text-muted">
                Empowering professionals with AI-driven structured learning.
              </p>
            </div>
            <div>
              <h4 className="text-heading text-sm text-primary mb-4 font-semibold uppercase tracking-wider">Account</h4>
              <ul className="space-y-2 text-body text-sm">
                <li>
                  <Link href="/login" className="focus-ring hover:text-primary transition-colors duration-150">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="focus-ring hover:text-primary transition-colors duration-150">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-heading text-sm text-primary mb-4 font-semibold uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-body text-sm">
                <li>
                  <Link href="#features" className="focus-ring hover:text-primary transition-colors duration-150">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="focus-ring hover:text-primary transition-colors duration-150">
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-heading text-sm text-primary mb-4 font-semibold uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2 text-body text-sm">
                <li>
                  <Link href="/terms" className="focus-ring hover:text-primary transition-colors duration-150">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="focus-ring hover:text-primary transition-colors duration-150">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-body text-xs text-muted">
            <p>
              &copy; {new Date().getFullYear()} Learnium. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
