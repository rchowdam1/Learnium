import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-primary flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-[72rem] items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand">
              <span className="text-label text-cta-text">L</span>
            </div>
            <h1 className="text-heading text-2xl">Learnium</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="#features" className="focus-ring text-label text-muted hover:text-primary">
              Features
            </Link>
            <Link href="#how-it-works" className="focus-ring text-label text-muted hover:text-primary">
              How It Works
            </Link>
            <Link href="/login">
              <button className="focus-ring text-label text-primary hover:text-brand cursor-pointer">
                Sign In
              </button>
            </Link>
            <Link href="/signup">
              <button className="focus-ring min-h-11 rounded-xl bg-cta px-6 py-2 text-label text-cta-text hover:bg-cta-hover cursor-pointer">
                Get Started Free
              </button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="border-b border-border bg-background">
          <div className="mx-auto max-w-[72rem] px-6 py-24 sm:py-32">
            <div className="text-center">
              <h1 className="text-display text-5xl leading-tight sm:text-7xl">
                Master Any Skill with AI-Powered Learning
              </h1>
              <p className="text-body mx-auto mt-8 max-w-3xl text-xl text-muted sm:text-2xl">
                Transform complex topics into bite-sized, personalized lessons.
                Learn faster, retain more, and achieve your goals with
                Learnium&apos;s intelligent learning platform.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/signup">
                  <button className="focus-ring min-h-11 rounded-xl bg-cta px-8 py-4 text-label text-lg text-cta-text hover:bg-cta-hover cursor-pointer">
                    Start Learning Today
                  </button>
                </Link>
                <Link href="#demo">
                  <button className="focus-ring min-h-11 rounded-xl border border-border-interactive px-8 py-4 text-label text-lg text-primary hover:bg-surface cursor-pointer">
                    Watch Demo
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface py-16">
          <div className="mx-auto max-w-[72rem] px-6">
            <div className="text-center">
              <p className="text-body mb-12 text-lg text-muted">Why Microlearning Works</p>
              <div className="grid gap-8 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-surface-raised p-6">
                  <div className="text-numeral text-heading mb-3 text-4xl text-primary">~50%</div>
                  <p className="text-heading mb-2 text-primary">Better Retention</p>
                  <p className="text-body text-sm text-muted">
                    Short, focused lessons improve information retention and
                    reduce cognitive overload
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-surface-raised p-6">
                  <div className="text-numeral text-heading mb-3 text-4xl text-primary">5 Min</div>
                  <p className="text-heading mb-2 text-primary">Fits Your Schedule</p>
                  <p className="text-body text-sm text-muted">
                    Learn during commutes, coffee breaks, or whenever you have a
                    few minutes
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-surface-raised p-6">
                  <div className="text-numeral text-heading mb-3 text-4xl text-primary">3x</div>
                  <p className="text-heading mb-2 text-primary">Faster Progress</p>
                  <p className="text-body text-sm text-muted">
                    Focused learning paths help you achieve your goals 3x faster
                    than traditional methods
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-background py-24">
          <div className="mx-auto max-w-[72rem] px-6">
            <div className="mb-16 text-center">
              <h2 className="text-heading mb-4 text-4xl">Why Choose Learnium?</h2>
              <p className="text-body mx-auto max-w-2xl text-xl text-muted">
                Our AI-powered platform adapts to your learning style and pace
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-surface-raised p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-surface">
                  <Image
                    src="/icons/ai.png"
                    alt="AI Icon"
                    width={32}
                    height={32}
                  />
                </div>
                <h3 className="text-heading mb-4 text-2xl">AI-Powered Curriculum</h3>
                <p className="text-body text-muted">
                  Simply describe your learning goal, and our AI creates a
                  personalized roadmap of bite-sized lessons tailored to your
                  needs.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-raised p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-surface">
                  <Image
                    src="/icons/clock.png"
                    alt="Clock Icon"
                    width={32}
                    height={32}
                  />
                </div>
                <h3 className="text-heading mb-4 text-2xl">Learn at Your Pace</h3>
                <p className="text-body text-muted">
                  Flexible scheduling with progress tracking. Learn 5 minutes or
                  2 hours a day—your journey, your timeline.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-raised p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-surface">
                  <Image
                    src="/icons/mobile.png"
                    alt="Mobile Icon"
                    width={32}
                    height={32}
                  />
                </div>
                <h3 className="text-heading mb-4 text-2xl">
                  Anywhere, Anytime
                </h3>
                <p className="text-body text-muted">
                  Seamless learning across all devices. Start on your phone,
                  continue on desktop—never miss a beat.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-brand py-24 text-cta-text">
          <div className="mx-auto max-w-[72rem] px-6">
            <div className="mb-16 text-center">
              <h2 className="text-heading mb-4 text-4xl">How It Works</h2>
              <p className="text-body text-xl text-surface">
                Three simple steps to start your learning journey
              </p>
            </div>
            <div className="grid gap-12 md:grid-cols-3">
              <div className="flex flex-col-reverse items-center gap-8 lg:flex-row lg:gap-16 animate-fadeIn">
                <div>
                  <h4 className="text-heading text-2xl">1. Pick a Topic</h4>
                  <p className="text-body mt-2 max-w-lg text-surface">
                    Enter any subject—&ldquo;Basics of Guitar&rdquo; or &ldquo;Intro to Machine
                    Learning.” Our AI instantly analyzes core concepts.
                  </p>
                </div>
                <Image
                  src="/icons/step1.png"
                  alt="Step 1 Icon"
                  width={96}
                  height={96}
                  style={{ width: "auto", height: "auto", maxWidth: "128px" }}
                />
              </div>
              <div className="flex flex-col-reverse items-center gap-8 lg:flex-row-reverse lg:gap-16 animate-fadeIn delay-[200ms]">
                <div>
                  <h4 className="text-heading text-2xl">
                    2. Observe Lesson Content
                  </h4>
                  <p className="text-body mt-2 max-w-lg text-surface">
                    Look over the amount of lessons and the topics. Create your
                    own schedule to finish the lessons.
                  </p>
                </div>
                <Image
                  src="/icons/step2.png"
                  alt="Step 2 Icon"
                  width={96}
                  height={96}
                  style={{ width: "auto", height: "auto", maxWidth: "128px" }}
                />
              </div>
              <div className="flex flex-col-reverse items-center gap-8 lg:flex-row lg:gap-16 animate-fadeIn delay-[400ms]">
                <div>
                  <h4 className="text-heading text-2xl">
                    3. Learn & Track Progress
                  </h4>
                  <p className="text-body mt-2 max-w-lg text-surface">
                    Start your first lesson immediately. Progress auto-saves.
                    Pick up exactly where you left off—desktop or mobile.
                  </p>
                </div>
                <Image
                  src="/icons/step3.png"
                  alt="Step 3 Icon"
                  width={96}
                  height={96}
                  style={{ width: "auto", height: "auto", maxWidth: "128px" }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface py-24">
          <div className="mx-auto max-w-[72rem] px-6">
            <div className="mb-16 text-center">
              <h2 className="text-heading mb-4 text-4xl">
                What Our Learners Say
              </h2>
              <p className="text-body text-xl text-muted">Real results from real learners</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-surface-raised p-8">
                <div className="mb-4 flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-label text-cta-text">
                    S
                  </div>
                  <div className="ml-4">
                    <h4 className="text-heading">Sarah Chen</h4>
                    <p className="text-body text-muted">Software Developer</p>
                  </div>
                </div>
                <p className="text-body italic text-primary">
                  &ldquo;Learnium helped me master React in just 3 weeks. The
                  bite-sized lessons fit perfectly into my busy schedule!&rdquo;
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-raised p-8">
                <div className="mb-4 flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-label text-cta-text">
                    M
                  </div>
                  <div className="ml-4">
                    <h4 className="text-heading">
                      Marcus Johnson
                    </h4>
                    <p className="text-body text-muted">Marketing Manager</p>
                  </div>
                </div>
                <p className="text-body italic text-primary">
                  &ldquo;Finally learned data analysis! The personalized approach made
                  complex topics actually enjoyable.&rdquo;
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-raised p-8">
                <div className="mb-4 flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-label text-cta-text">
                    A
                  </div>
                  <div className="ml-4">
                    <h4 className="text-heading">
                      Anna Rodriguez
                    </h4>
                    <p className="text-body text-muted">Student</p>
                  </div>
                </div>
                <p className="text-body italic text-primary">
                  &ldquo;The progress tracking keeps me motivated. I&apos;ve completed 5
                  courses and counting!&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-brand py-24 text-cta-text">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-display mb-6 text-4xl">
              Start Your Microlearning Journey Today
            </h2>
            <p className="text-body mb-8 text-xl text-surface">
              Join thousands of learners who are mastering new skills one
              bite-sized lesson at a time. Begin your personalized microlearning
              journey now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <button className="focus-ring min-h-11 rounded-xl bg-surface-raised px-10 py-4 text-label text-lg text-primary hover:bg-surface cursor-pointer">
                  Start Microlearning Today
                </button>
              </Link>
              <Link href="/login">
                <button className="focus-ring min-h-11 rounded-xl border border-cta-text px-10 py-4 text-label text-lg text-cta-text hover:bg-surface-raised hover:text-primary cursor-pointer">
                  Sign In
                </button>
              </Link>
            </div>
            <p className="text-body mt-6 text-sm text-surface">
              No credit card required • Start anytime • Learn at your pace
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-brand py-12 text-cta-text">
        <div className="mx-auto max-w-[72rem] px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-raised">
                  <span className="text-label text-brand">L</span>
                </div>
                <h3 className="text-heading text-xl text-cta-text">Learnium</h3>
              </div>
              <p className="text-body text-surface">
                Empowering learners worldwide with AI-driven education.
              </p>
            </div>
            <div>
              <h4 className="text-heading mb-4 text-cta-text">Product</h4>
              <ul className="space-y-2 text-body text-surface">
                <li>
                  <Link
                    href="#features"
                    className="focus-ring hover:text-cta-text"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#how-it-works"
                    className="focus-ring hover:text-cta-text"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="focus-ring hover:text-cta-text"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-heading mb-4 text-cta-text">Support</h4>
              <ul className="space-y-2 text-body text-surface">
                <li>
                  <Link
                    href="/help"
                    className="focus-ring hover:text-cta-text"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="focus-ring hover:text-cta-text"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="focus-ring hover:text-cta-text"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-heading mb-4 text-cta-text">Company</h4>
              <ul className="space-y-2 text-body text-surface">
                <li>
                  <Link
                    href="/about"
                    className="focus-ring hover:text-cta-text"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="focus-ring hover:text-cta-text"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="focus-ring hover:text-cta-text"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border-strong pt-8 text-center text-body text-surface">
            <p>
              &copy; {new Date().getFullYear()} Learnium. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
