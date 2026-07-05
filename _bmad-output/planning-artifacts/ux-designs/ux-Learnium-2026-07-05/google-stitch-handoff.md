# Google Stitch Handoff — Learnium

**How to use this file.** Open [Google Stitch](https://stitch.withgoogle.com). Paste **Section 1 (Design System)** first so Stitch fixes the visual language, then generate screens one at a time using the **Section 2** per-screen prompts (paste one, generate, refine, move on). Generate **mobile-first**, then use Stitch's responsive/adapt to produce the desktop projection. Save every export (HTML + images) back into this run folder's `mockups/` directory.

The two spines are the source of truth and **win on any conflict** with Stitch output: `./DESIGN.md` (visual identity) and `./EXPERIENCE.md` (behavior/IA). This prompt is a faithful projection of them — if Stitch drifts, correct it back toward the spines.

---

## Section 1 — Design System (paste this first)

> Design a web app called **Learnium** — "grown-up Duolingo": a gamified, science-based learning platform for **adult professionals (ages 29–41)**. Users type a topic and get an AI-generated course of ~5-minute lessons, with XP, levels, streaks, weekly leagues, and spaced-repetition reviews. The feel is **bold and modern** — Linear/Vercel premium restraint at the base, Duolingo celebratory energy only at reward moments, Brilliant-style credible learning polish. Mobile-first, must be excellent on phones. Design **both light and dark modes to equal quality.**
>
> **Color — palette "Midnight Ink / Pure".** Pure neutrals so the two accent colors feel earned.
> - Background: pure white `#FFFFFF` (light) / pure black `#000000` (dark)
> - Surface / card: `#F7F8FA` (light) / `#0C1116` (dark); raised card `#FFFFFF` / `#18222C`
> - Border (hairline): `#E6E9EE` / `#1C2530`
> - Text: primary `#0B0F14` / `#F5F7FA`, muted `#5A6672` / `#8B98A5`
> - Brand navy `#142937` (light) / lightened `#5B7E9A` (dark) - logo, headers, emphasis
> - **Primary button is INVERTED:** light = navy fill `#142937` + white text; dark = white fill `#FFFFFF` + black text (Vercel-style). Restrained and premium.
> - **Accent lime `#84CC16`** (glow `#B8F135`) is the reward color. Use it only for XP bursts, level-ups, correct answers, and completion/continue actions. Always-on progress bars/rings use muted progress lime `#4D7C0F` in light mode and `#84CC16` in dark mode.
> - **Streak amber `#F59E0B`** — streak flames 🔥 only.
> - Error `#DC2626` / `#F87171`.
>
> **Typography — 3 roles.**
> - Display / celebration headlines: **Bricolage Grotesque** (extra-bold 800), tight leading, negative tracking.
> - Functional headings, UI labels, and standalone numbers (XP, streak, level, %, rank): **Space Grotesk** (bold 700). Numbers use tabular lining figures so counters do not jitter. Numbers inside display celebration headlines can stay in the display font.
> - Body text: **Inter** (regular 400), line-height 1.6.
>
> **Shape & depth.** Crisp geometry: cards/buttons/inputs `border-radius: 12px`; modals/hero/celebration surfaces `16px`; pills, XP chips, avatars, and the mascot are fully rounded. **Mostly flat** — structure from hairline borders, not shadows. Soft shadows ONLY on modals, popovers, and celebration overlays. Generous whitespace. Content max-width ~1152px; single-column stacking on mobile; 44px minimum touch targets.
>
> **Mascot — Nova.** The AI study buddy is a character named **Nova**, a crisp geometric **North Star** (a sharp 4- or 5-point star, NOT an animal). It has expression states: encouraging (steady/warm), skeptical (a subtle raised-brow for honest nudges), and celebratory (a full starburst for wins). Nova appears in the study-buddy chat, empty states, and celebration moments. Nova's voice is witty and brutally honest but never degrading — a smart friend who won't let you BS your own progress.
>
> Apply this system to every screen I ask for next. Keep it consistent, accessible (WCAG AA contrast in both modes, visible focus states, real buttons), and mobile-first.

---

## Section 2 — Per-screen prompts

Paste one at a time. Each already assumes the Section 1 system. Where a screen has key states, they're listed — generate the primary state first, then the variants.

### 1. Landing (marketing)
> A marketing landing page for Learnium. Hero with a big Bricolage Grotesque headline "**Learn anything. Actually finish it.**", a one-line subhead about turning any topic into a gamified, science-backed course, and an inverted primary CTA "Start learning free". Below: a 3-up feature row (AI-generated courses / streaks & XP / spaced-repetition review), a short "how it works" 3-step strip, and a footer. Include a small Nova star mark near the hero. Premium, spacious, confident. Both light and dark. NOTE: use real product copy, no fake testimonials or invented statistics.

### 2. Signup (age-gate 16+)
> A clean signup screen for Learnium. Email + password fields, a "Continue with Google" button, and a required **date-of-birth / 16+ age gate** before the account is created. Inverted primary "Create account" button. Minimal, centered card on a pure background, hairline-bordered inputs with a visible focus ring. Show the error state for "under 16". Light and dark.

### 3. Login
> A login screen matching signup: email + password, "Continue with Google", inverted primary "Log in", and a "Forgot password?" link. Same minimal centered card. Light and dark.

### 4. Onboarding (topic + daily goal)
> A two-step onboarding for Learnium. Step 1: a large friendly topic input — "**What do you actually want to learn?**" — with example chips (e.g. "Behavioral economics", "SQL fundamentals", "Options trading") and Nova encouraging beside it. Step 2: pick a **Daily Goal** — three tiers (Casual / Regular / Serious) shown as selectable XP-target cards. Inverted primary "Start" button. Mobile-first, spacious. Light and dark.

### 5. Dashboard (Home)
> The Learnium home dashboard, mobile-first with a fixed bottom nav bar of 5 tabs (Home, Learn, Review, Leagues, Profile). Top area shows a **Daily Goal progress ring**, a **streak flame with day count (🔥 12)** in amber, and an **XP pill** in lime — all using tabular numerals. A "Reviews due" card as the cheapest daily action (with a lime "Start review" button). Below: "Continue learning" cards for active Sets/Paths, each a hairline-bordered card with title, a muted progress bar, lesson count, and a lime "Continue" button. Quota remaining is visible in the top bar. Flat, spacious, both light and dark. Desktop version: same content with a top nav bar instead of bottom.

### 6. Learn (topic input + your courses)
> The "Learn" tab for Learnium. Top: the topic input to generate a new course (with a "Generate course" inverted button). Below: a grid/list of the user's Sets and Learning Paths as cards — title, category pill, description, muted progress bar, lesson count. Each generated Set card carries a small persistent "AI-generated — verify important facts" note. Empty state: Nova + "Nothing here yet. What do you want to learn?" Light and dark.

### 7. Learning Path map
> A **Learning Path** map for Learnium: a vertical journey of ordered **Sets** shown as connected nodes (like a course roadmap), states: completed (lime fill with check), active (navy face with a muted progress ring and subtle glow), and locked (muted, grey). Path title and description at top, overall Path progress. Tapping the active node continues. Mobile-first vertical scroll. Light and dark.

### 8. Set / Lesson chain
> Inside a Set in Learnium: a vertical **lesson chain** of ordered lesson nodes (Duolingo-style path) with the same three states — complete (lime + check), active (navy + muted progress ring + glow pulse), locked (grey). Set title and progress at top, "Lesson 3 of 8" in tabular numerals. A small Nova entry point to open the study buddy. Mobile-first. Light and dark.

### 9. Lesson interior (content + quiz)
> A single lesson view in Learnium: readable Inter body content (~5-min lesson) with a clean reading measure, then an embedded **check question** (multiple choice). Show the answer-reveal state: correct answer highlighted, Nova's short "here's why" explanation, and a lime "+10 XP" pill on correct. A lime "Complete lesson" progress button at the bottom, and a persistent "Ask Nova" affordance. Include the wrong-answer state (explains, never just buzzes). Light and dark.

### 10. Nova chat (Study Buddy)
> The **Nova study-buddy chat** for Learnium, opened from inside a lesson so it's grounded in that lesson. Chat bubbles: user right-aligned, Nova left-aligned with the geometric star avatar. A "Nova is thinking…" state. Input at the bottom with a send button, and a small **chat quota remaining** indicator. Show the **out-of-quota state**: an inline "You're out of free chats — Plus lifts the cap" upsell, while making clear the lesson still continues without Nova. Nova's tone is witty and helpful. Light and dark.

### 11. Set-complete celebration
> A **celebration overlay** for finishing a Set in Learnium. A rounded (16px) card with a soft shadow floating over a dimmed background. **Nova in full starburst state**, a big Bricolage Grotesque headline ("Set complete!"), the XP earned and a **Badge** earned shown in tabular numerals with bright lime reward accents and glow. A suggested next action ("Start the next Set") as the primary button. Celebratory but still adult — energy is concentrated here. Light and dark.

### 12. Level-up celebration
> A **level-up celebration overlay** for Learnium: Nova starburst, a Bricolage headline "Level 6", the new level in large tabular numerals inside a navy level badge wrapped by a muted progress ring toward the next level, plus the XP that triggered it. Lime glow accents, soft-shadowed 16px card over a dim background. Restrained-but-rewarding. Light and dark.

### 13. Review Session
> A **spaced-repetition Review Session** for Learnium: a focused, distraction-free single-question card (5–10 questions, ~3 minutes). Progress dots at top, the question in the card, answer options, and a reveal state with a lime "Correct" progress button and a secondary "Again" button. On completion, a compact summary with XP earned and "Streak saved — day 12". Emphasize speed and calm. Mobile-first. Light and dark.

### 14. Leagues / Leaderboard
> A **weekly League leaderboard** for Learnium: a list of ~30 players ranked by weekly XP. Each row: rank (tabular numeral), rounded avatar, display name, weekly XP (tabular numeral). The **promotion zone** (top) marked with a muted progress top-border and the **demotion zone** (bottom) subtly marked. The current user's row is tinted/highlighted. A small header showing the league name and time remaining in the week. Privacy-respecting (name + weekly XP only). Light and dark.

### 15. Profile (private — XP / Levels / Badges / Streak)
> The user's **private Profile** in Learnium: a header with avatar, display name, current **Level** (navy badge + muted progress ring), total XP and current **streak** (tabular numerals). A **Badges** grid (earned badges in color with earned dates, unearned ones greyed): first Lesson, first Set, 7-day streak, 30-day streak, first Path, first League top-3. A stats strip (Sets completed, lessons, review accuracy). A link into Settings. Light and dark.

### 16. Public profile / share card
> A **public, shareable profile card** for Learnium (private by default; this is the opt-in public view). Shows only display name, Level, key Badges, streak, and Sets-completed count — no private data. Plus a compact **milestone share card** design (e.g. "Priya reached Level 6 on Learnium") suitable for sharing. Clean, brandable, light and dark.

### 17. Subscriptions / Paywall
> A **paywall / subscriptions** screen for Learnium shown when a Free user hits their monthly quota. Clearly reassure what is **kept** (progress, XP, streak — nothing deleted) and what **Plus unlocks** (higher/unlimited course generation + study-buddy chats). A Free-vs-Plus comparison, the Plus price, and an inverted primary "Upgrade to Plus" button (Stripe Checkout). Nova present with a non-pushy honest line. Also show the always-visible "quota remaining + reset date" pattern. Light and dark.

### 18. Account / Settings
> A **Settings** screen for Learnium: sections for Daily Goal (editable tier), reminder time, **League participation opt-out** toggle, theme (light/dark/system), account (email, manage subscription / customer portal), and a clearly-marked **Delete account** action (30-day, GDPR). Clean list/section layout, hairline dividers, accessible controls. Light and dark.

---

## Section 3 — Global reminders for every screen

- **Both modes, real.** Every screen in light AND dark; the old build faked dark mode — don't.
- **Lime is precious.** Bright lime is for XP / level-up / correct / completion actions. Always-on progress uses muted progress lime; do not use bright lime as generic chrome.
- **Inverted primary CTA**, never a lime or navy-everywhere button.
- **Standalone numbers** (XP, streak, level, %, rank, quota) in Space Grotesk tabular numerals; display-headline numbers may stay in Bricolage.
- **Flat by default**, hairline borders; shadow only on modals/popovers/celebrations.
- **Three radii only:** 12px default, 16px modals/hero, full for pills/avatars/Nova.
- **Mobile-first**, 44px targets, single-column stacking, real accessible controls with visible focus.
- **No fake content** on the landing page (no invented testimonials/stats).
- **Nova is a geometric star**, not an animal; keep it consistent across every appearance.

---

## After Stitch

1. Save exports into `../ux-Learnium-2026-07-05/mockups/`.
2. Stitch also emits its own `DESIGN.md` — treat it as **input**, not truth: reconcile it against *this* run's `DESIGN.md` (ours wins) and lift any good refinements back into ours.
3. Return here to run Update mode and fold the mockups + any layout decisions back into both spines, then flip them to `status: final`.
