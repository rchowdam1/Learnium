import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-[#142937]">
      {/*Header*/}
      <header className="bg-[#142937] text-[#f5ede3]">
        <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Learnium</h1>
          <button className="rounded-full border-2 border-[#f5ede3] bg-transparent px-4 py-2 font-semibold transition hover:bg-[#f5ede3]/10 hover:scale-105">
            Sign Up
          </button>
        </nav>
      </header>

      {/*Main*/}
      <main className="flex-grow">
        {/*HERO*/}
        <section className="relative flex flex-col items-center justify-center text-center px-6 py-24 sm:py-32 max-w-3xl mx-auto animate-fadeIn">
          <h2 className="text-5xl sm:text-6xl font-extrabold leading-tight">
            Learn Things Easier
          </h2>
          <p className="mt-6 text-lg/8 max-w-xl">
            Learnium's AI breaks any topics into bite-sized lessons so you can
            learn on the go anytime, anywhere.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button className="rounded-full bg-[#142937] px-8 py-3 text-[#f5ede3] font-semibold shadow-lg transition hover:scale-105">
              Get Started
            </button>
            <Link href="#information">
              <button className="rounded-full border-2 border-[#142937] px-8 py-3 font-semibold transition hover:bg-[#142937]/10 hover:scale-105">
                Learn More
              </button>
            </Link>
          </div>
        </section>

        {/*Features*/}
        <section className="mt-24 px-6 pb-20">
          <h3 className="text-3xl font-bold text-center text-[#142937]">
            Why Learnium?
          </h3>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/*Card 1*/}
            <div className="bg-[#142937] rounded-2xl shadow-xl p-6 flex flex-col items-center transition hover:shadow-2xl hover:scale-105 animate-fadeIn border-2 border-[#142937]">
              <div className="relative w-20 h-20">
                <Image src="/icons/ai.png" alt="AI Icon" layout="fill" />
              </div>

              <h4 className="mt-4 text-xl font-semibold text-white">
                AI-powered Lessons
              </h4>
              <p className="mt-2 text-center text-white">
                Just give us a topic and a description; we instantly create a
                custom roadmap of bite-sized lessons—no manual work needed.
              </p>
            </div>

            {/*Card 2*/}
            <div
              className="bg-[#142937]
                rounded-2xl
                shadow-xl
                p-6
                flex
                flex-col
                items-center
                transition
                hover:shadow-2xl
                hover:scale-105
                animate-fadeIn
                delay-[150ms]
                border-2 border-[#142937]"
            >
              <div className="relative w-20 h-20">
                <Image src="/icons/clock.png" alt="clock" layout="fill" />
              </div>

              <h4 className="mt-4 text-xl font-semibold text-white">
                Build Good Habits
              </h4>

              <p className="mt-2 text-center text-white">
                Just doing 1 lesson a day can go a long way. Start your journey
                of productivity today.
              </p>
            </div>

            {/*Card 3*/}
            <div
              className="bg-[#142937]
                rounded-2xl
                shadow-xl
                p-6
                flex
                flex-col
                items-center
                transition
                hover:shadow-2xl
                hover:scale-105
                animate-fadeIn
                delay-[300ms]
                border-2 border-[#142937]"
            >
              <div className="relative w-20 h-20">
                <Image
                  src="/icons/mobile.png"
                  alt="Mobile Icon"
                  layout="fill"
                />
              </div>

              <h4 className="mt-4 text-xl font-semibold text-white">
                Busy Schedule? No Worries!
              </h4>

              <p className="mt-2 text-center text-white">
                Our bite-sized lessons are designed to be easy to digest and can
                be completed anytime, anywhere!
              </p>
            </div>
          </div>
        </section>

        {/*HOWWWWWWWWWWW*/}
        <section className="bg-[#142937] py-24 px-6" id="information">
          <h3 className="text-3xl font-bold text-center text-white">
            How It Works
          </h3>

          <div className="mt-16 mx-auto max-w-4xl space-y-16">
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
              <div className="relative w-24 h-24 lg:w-32 lg:h-32">
                <Image src="/icons/step1.png" alt="Step 1 Icon" layout="fill" />
              </div>
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
              <div className="relative w-24 h-24 lg:w-32 lg:h-32">
                <Image src="/icons/step2.png" alt="Step 2 Icon" layout="fill" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col-reverse items-center gap-8 lg:flex-row lg:gap-16 animate-fadeIn delay-[400ms]">
              <div>
                <h4 className="text-2xl font-semibold text-white">
                  3. Learn & Track Progress
                </h4>
                <p className="mt-2 text-white max-w-lg">
                  Start your first lesson immediately. Progress auto-saves. Pick
                  up exactly where you left off—desktop or mobile.
                </p>
              </div>
              <div className="relative w-24 h-24 lg:w-32 lg:h-32">
                <Image src="/icons/step3.png" alt="Step 3 Icon" layout="fill" />
              </div>
            </div>
          </div>
        </section>

        {/* Final Call-to-Action */}
        <section className="px-6 py-20 text-center animate-fadeIn delay-[600ms]">
          <h3 className="text-3xl font-semibold">
            Ready to Learn Things Easier?
          </h3>
          <button
            className="
              mt-8
              rounded-full
              bg-[#142937]
              px-10
              py-3
              text-[#f5ede3]
              text-lg
              font-semibold
              shadow-lg
              transition
              hover:scale-105
            "
          >
            Start Today
          </button>
          <p className="mt-4 text-[#142937]/60">
            Be the first to know when Learnium launches.
          </p>
        </section>
      </main>

      {/* ─────────── FOOTER ─────────── */}
      <footer className="bg-[#142937] text-[#f5ede3]">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-[#f5ede3]/80">
          &copy; {new Date().getFullYear()} Learnium. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
