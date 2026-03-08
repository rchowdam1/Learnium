import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col text-[#142937]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#142937] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <h1 className="text-2xl font-bold text-[#142937]">Learnium</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="#features"
              className="text-[#142937] hover:text-blue-600 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-[#142937] hover:text-blue-600 transition-colors"
            >
              How It Works
            </Link>
            <Link href="/login">
              <button className="text-[#142937] hover:text-blue-600 font-medium transition-colors">
                Sign In
              </button>
            </Link>
            <Link href="/signup">
              <button className="rounded-full bg-[#142937] text-white px-6 py-2 font-semibold shadow-lg hover:bg-[#1a3a4a] transition-all hover:scale-105">
                Get Started Free
              </button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32">
            <div className="text-center">
              <h1 className="text-5xl sm:text-7xl font-extrabold leading-tight bg-gradient-to-r from-[#142937] to-blue-600 bg-clip-text text-transparent">
                Master Any Skill with AI-Powered Learning
              </h1>
              <p className="mt-8 text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Transform complex topics into bite-sized, personalized lessons.
                Learn faster, retain more, and achieve your goals with
                Learnium's intelligent learning platform.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/signup">
                  <button className="rounded-full bg-[#142937] text-white px-8 py-4 text-lg font-semibold shadow-xl hover:bg-[#1a3a4a] transition-all hover:scale-105 hover:shadow-2xl">
                    Start Learning Today
                  </button>
                </Link>
                <Link href="#demo">
                  <button className="rounded-full border-2 border-[#142937] text-[#142937] px-8 py-4 text-lg font-semibold hover:bg-[#142937] hover:text-white transition-all hover:scale-105">
                    Watch Demo
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="text-gray-600 mb-12 text-lg">
                Why Microlearning Works
              </p>
              <div className="grid gap-8 md:grid-cols-3">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-transparent rounded-2xl">
                  <div className="text-4xl font-bold text-blue-600 mb-3">
                    ~50%
                  </div>
                  <p className="text-gray-700 font-semibold mb-2">
                    Better Retention
                  </p>
                  <p className="text-gray-600 text-sm">
                    Short, focused lessons improve information retention and
                    reduce cognitive overload
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-50 to-transparent rounded-2xl">
                  <div className="text-4xl font-bold text-green-600 mb-3">
                    5 Min
                  </div>
                  <p className="text-gray-700 font-semibold mb-2">
                    Fits Your Schedule
                  </p>
                  <p className="text-gray-600 text-sm">
                    Learn during commutes, coffee breaks, or whenever you have a
                    few minutes
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-purple-50 to-transparent rounded-2xl">
                  <div className="text-4xl font-bold text-purple-600 mb-3">
                    3x
                  </div>
                  <p className="text-gray-700 font-semibold mb-2">
                    Faster Progress
                  </p>
                  <p className="text-gray-600 text-sm">
                    Focused learning paths help you achieve your goals 3x faster
                    than traditional methods
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#142937] mb-4">
                Why Choose Learnium?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our AI-powered platform adapts to your learning style and pace
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all hover:scale-105">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <Image
                    src="/icons/ai.png"
                    alt="AI Icon"
                    width={32}
                    height={32}
                  />
                </div>
                <h3 className="text-2xl font-semibold text-[#142937] mb-4">
                  AI-Powered Curriculum
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Simply describe your learning goal, and our AI creates a
                  personalized roadmap of bite-sized lessons tailored to your
                  needs.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all hover:scale-105">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <Image
                    src="/icons/clock.png"
                    alt="Clock Icon"
                    width={32}
                    height={32}
                  />
                </div>
                <h3 className="text-2xl font-semibold text-[#142937] mb-4">
                  Learn at Your Pace
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Flexible scheduling with progress tracking. Learn 5 minutes or
                  2 hours a day—your journey, your timeline.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all hover:scale-105">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <Image
                    src="/icons/mobile.png"
                    alt="Mobile Icon"
                    width={32}
                    height={32}
                  />
                </div>
                <h3 className="text-2xl font-semibold text-[#142937] mb-4">
                  Anywhere, Anytime
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Seamless learning across all devices. Start on your phone,
                  continue on desktop—never miss a beat.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-[#142937] text-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-blue-100">
                Three simple steps to start your learning journey
              </p>
            </div>
            <div className="grid gap-12 md:grid-cols-3">
              {/* Step 1 */}
              <div className="flex flex-col-reverse items-center gap-8 lg:flex-row lg:gap-16 animate-fadeIn">
                <div>
                  <h4 className="text-2xl font-semibold text-white">
                    1. Pick a Topic
                  </h4>
                  <p className="mt-2 text-white/80 max-w-lg">
                    Enter any subject—“Basics of Guitar” or “Intro to Machine
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

              {/* Step 2 */}
              <div className="flex flex-col-reverse items-center gap-8 lg:flex-row-reverse lg:gap-16 animate-fadeIn delay-[200ms]">
                <div>
                  <h4 className="text-2xl font-semibold text-white">
                    2. Observe Lesson Content
                  </h4>
                  <p className="mt-2 text-white max-w-lg">
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

              {/* Step 3 */}
              <div className="flex flex-col-reverse items-center gap-8 lg:flex-row lg:gap-16 animate-fadeIn delay-[400ms]">
                <div>
                  <h4 className="text-2xl font-semibold text-white">
                    3. Learn & Track Progress
                  </h4>
                  <p className="mt-2 text-white max-w-lg">
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

        {/* Testimonials */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#142937] mb-4">
                What Our Learners Say
              </h2>
              <p className="text-xl text-gray-600">
                Real results from real learners
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#142937] rounded-full flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-[#142937]">Sarah Chen</h4>
                    <p className="text-gray-600">Software Developer</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Learnium helped me master React in just 3 weeks. The
                  bite-sized lessons fit perfectly into my busy schedule!"
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#142937] rounded-full flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-[#142937]">
                      Marcus Johnson
                    </h4>
                    <p className="text-gray-600">Marketing Manager</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Finally learned data analysis! The personalized approach made
                  complex topics actually enjoyable."
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#142937] rounded-full flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-[#142937]">
                      Anna Rodriguez
                    </h4>
                    <p className="text-gray-600">Student</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "The progress tracking keeps me motivated. I've completed 5
                  courses and counting!"
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-gradient-to-r from-[#142937] to-blue-600 text-white">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Start Your Microlearning Journey Today
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of learners who are mastering new skills one
              bite-sized lesson at a time. Begin your personalized microlearning
              journey now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <button className="rounded-full bg-white text-[#142937] px-10 py-4 text-lg font-semibold shadow-xl hover:bg-gray-100 transition-all hover:scale-105">
                  Start Microlearning Today
                </button>
              </Link>
              <Link href="/login">
                <button className="rounded-full border-2 border-white text-white px-10 py-4 text-lg font-semibold hover:bg-white hover:text-[#142937] transition-all hover:scale-105">
                  Sign In
                </button>
              </Link>
            </div>
            <p className="mt-6 text-blue-200 text-sm">
              No credit card required • Start anytime • Learn at your pace
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#142937] text-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-[#142937] font-bold text-sm">L</span>
                </div>
                <h3 className="text-xl font-bold">Learnium</h3>
              </div>
              <p className="text-blue-100">
                Empowering learners worldwide with AI-driven education.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-blue-100">
                <li>
                  <Link
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#how-it-works"
                    className="hover:text-white transition-colors"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-blue-100">
                <li>
                  <Link
                    href="/help"
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-white transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-blue-100">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-200">
            <p>
              &copy; {new Date().getFullYear()} Learnium. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
