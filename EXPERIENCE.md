---
name: Learnium
description: Experience spine for Learnium — grown-up Duolingo. IA, behavior, states, interactions, accessibility, and the daily retention loop for a web-only, mobile-first gamified learning platform. Nova is the AI Study Buddy character.
status: final
updated: 2026-07-11
design: ./DESIGN.md
sources:
  - ../../prds/prd-Learnium-2026-07-05/prd.md
  - ../../prds/prd-Learnium-2026-07-05/addendum.md
  - ./.memlog.md
---

# Learnium — Experience Spine

> How the product *works*. Visual identity (color, type, radii, component looks) lives in `DESIGN.md` and is referenced by token — e.g. `{colors.accent}`, `{components.xp-pill}`, `{typography.numeral}` — never restated here. Where the PRD left a choice open, it is flagged `[OPEN]` or `[ASSUMPTION]` rather than hard-committed.
>
> **Shipped vs target:** This spine describes both live product behavior and the product vision. Sections and bullets marked **shipped** reflect what agents/humans should treat as true today. Sections marked **target** / **roadmap** / **placeholder** are aspirational — keep them for product direction, but do not implement or document them as if they already ship.

## Foundation

**Form-factor: responsive web-only. No native app in v1** (PRD §5, Assumption #12). The product must be *excellent on phones* — mobile-first, single-column stacking on small viewports, every target ≥ 44px. Desktop is the wider projection of the same surfaces, not a separate product.

**Age gate: 16+** (PRD §6, Assumption #13) — enforced at signup, before any account exists. This is a COPPA-scope decision, not a soft preference.

**No third-party UI system.** Tailwind v4 + custom components (project-context). The component library does *not* do the behavioral work for us, so behavior is specified here in full; `DESIGN.md` owns only the visual specs. `DESIGN.md` is the visual identity reference; **Nova** (the North Star AI Study Buddy) is the character whose voice this spine governs in microcopy — Nova's brand *look and voice-as-identity* live in `DESIGN.md.Brand & Style`.

Light and dark are co-equal (memlog) — every surface and state below must be authored in both.

## Information Architecture

**Primary navigation (shipped)** — a persistent 5-tab bar on main app surfaces. Mobile: fixed bottom bar (`{components.nav-mobile-bottom-bar}`). Desktop: top bar (`{components.nav-top-bar}`) with the XP pill + streak flame + avatar right-aligned.

| Tab | Surface | Purpose | Status |
|---|---|---|---|
| Home | Dashboard | Daily goal ring, streak, active Sets, resume point | Shipped |
| Learn | Sets & generation | Topic input, owned Sets, generation entry; Paths = coming soon | Shipped (Paths placeholder) |
| Review | Due queue | Start a Review Session; cheapest daily streak-keeper | **Placeholder** page |
| Leagues | Leaderboard | Weekly cohort standing, promotion/demotion zones | **Placeholder** page |
| Profile | XP / Levels / Badges / settings | Identity, achievements, chat-quota counter, settings entry | Shipped |

**AppNav everywhere (shipped):** The main navigation bar `AppNav` has replaced the legacy `AuthNav` across all root-level authenticated pages (sets/[setId], buddy/[buddyId], subscriptions) to resolve overlapping headers and missing links, providing a unified top-bar shell and `StatusChrome` functionality. Other views like the Dashboard, Learn, Review, Leagues, and Profile continue to use the 5-tab app shell.

Persistent chrome on the main shell (shipped display): **XP pill**, **streak flame**, **level**, **Daily-Goal progress**, and **sets remaining** are shown. **Chat quota is not in chrome** — it lives on Profile. Note: XP/streak *award* on lesson complete is **not fully wired** (display chrome exists; pipeline incomplete — see Shipped vs placeholder).

### Shipped vs placeholder (agents: trust this first)

| Area | Status | Notes |
|---|---|---|
| Auth + 16+ age gate | **Shipped** | Enforced at signup before account creation |
| 5-tab nav shell | **Shipped** | Dashboard / Learn / Review / Leagues / Profile |
| Review tab | **Placeholder** | Route exists; full Review Session loop is target |
| Leagues tab | **Placeholder** | Route exists; weekly cohort/leaderboard is target |
| Learning Paths | **Placeholder** | "Coming soon" on Learn; Path maps/generation target |
| Onboarding | **Shipped** | Topic + daily goal only → dashboard (no first-Set gen in onboarding) |
| Set generation + daily set quota | **Shipped** | Free 1/day; Plus/Pro 5/day; input-check + quota-gated create |
| Study Buddy (create, upload, RAG chat) | **Shipped** | First-class product surface — not in-lesson tutor |
| Nova in-lesson tutor | **Target / roadmap** | Grounded chat from inside a Lesson (UJ-2) |
| Storage quotas for buddy files | **Shipped** | Free 750MB / Plus 5GB; max 100MB/file; 8 files/buddy |
| Chat quota (claim-before-LLM) | **Shipped** | Counter on Profile; consume before LLM; not in chrome |
| XP / streak chrome display | **Shipped (display)** | Values shown in shell |
| XP / streak award on lesson complete | **Not fully wired** | Pipeline incomplete — do not treat awards as reliable |
| Daily reminders (email/push) | **Target / roadmap** | Retention loop depends on this; not shipped as described |
| Stripe Pro (~$9.99) | **Shipped** | UI may say **Pro** not Plus; treat as paid tier |
| Set viewer / buddy chat chrome | **Shipped** | AppNav, not full 5-tab shell |

### All surfaces

| Surface | Reached from | Purpose / PRD trace | Status |
|---|---|---|---|
| Landing | Public root | Value prop, sign-up CTA. | Shipped |
| Signup | Landing | Email/password or Google; **age-gate 16+** here. FR-21, §6. | Shipped |
| Login | Landing / Signup | Returning auth. | Shipped |
| Onboarding | First login after signup | **Shipped:** topic pick + **Daily-Goal tier** → dashboard. **Target (UJ-1):** first Set generation during onboarding. FR-7. | Shipped (gen climax = target) |
| Dashboard (Home) | Primary nav / app open | Streak, Daily-Goal ring, resume. FR-7, FR-8. Due Reviews = target until Review ships. | Shipped (partial) |
| Learning Path map | Learn / dashboard resume | Ordered Sets in a Path; locked/active/complete nodes. FR-17, FR-18. | **Target** (coming soon on Learn) |
| Set / Lesson viewer | Set card (AppNav) | Ordered Lessons within a Set. FR-4. | Shipped |
| Lesson quiz | Inside a Lesson | Embedded check questions; answer/reveal. FR-3, FR-4. `[OPEN]` interior format (§9 Q4). | Partial / as built |
| **Study Buddy** (first-class) | Own surface / create flow | Create buddy, file upload, client MiniLM embed, RAG chat, sources chip. Quota-gated. | **Shipped** |
| Nova in-lesson chat | In-Lesson entry | Context-grounded tutoring from a Lesson. FR-6, UJ-2. | **Target / roadmap** |
| Set-complete celebration | Last Lesson complete | Badge check, next-action suggestion. FR-5. | Target / partial |
| Level-up celebration | XP threshold crossed mid-session | Level-up moment. FR-11. | Target (depends on XP pipeline) |
| Review Session | Review tab / reminder deep-link | 5–10 Q, <3 min, zero-quota. FR-15, FR-16, UJ-3. | **Target** (tab is placeholder) |
| Leagues / Leaderboard | Primary nav | Weekly cohort ranking. FR-13, FR-14, UJ-3. | **Target** (tab is placeholder) |
| Profile — private (self) | Primary nav | XP, Level, Badges, Streak, **chat quota counter**, settings. FR-10–12, FR-19. | Shipped |
| Profile — public | Share link | Read-only display name/Level/Badges/Streak/Sets count. FR-19. | As built / target |
| Subscriptions / Paywall | Quota wall / settings | Free vs Pro (~$9.99) via Stripe. FR-21, FR-22, UJ-4. UI may say Pro not Plus. | Shipped |
| Account / Settings | Profile | Daily Goal, reminder time, **League opt-out**, delete account, theme. FR-7, FR-9, FR-14, FR-23. | Partial (reminders/leagues target) |

### Mockup Coverage

The `mockups/` folder provides visual references for the full app. Use them as screen-level layout guidance only; `DESIGN.md` and this `EXPERIENCE.md` win on any conflict.

| Surface group | Primary mockup references | Build guidance |
|---|---|---|
| Landing / auth / onboarding | `mockups/landing_learnium_*`, `mockups/signup_*`, `mockups/login_*`, `mockups/onboarding_*` | Keep the centered, restrained composition. Signup must keep the accessible 16+ age gate and inline error behavior from this spine even when the mockup omits details. |
| Dashboard / Learn | `mockups/home_dashboard_*`, `mockups/home_learnium_*`, `mockups/learn_*` | Desktop uses goal/review metrics beside active learning cards; mobile stacks metrics, reviews, then continue cards. XP, streak, level, daily-goal, and **sets remaining** remain persistent chrome; **chat quota is Profile-only** (shipped). Paths = coming soon. |
| Learning path / lesson chain | `mockups/learning_path_*`, `mockups/lesson_chain_*` | **Target / Paths coming soon.** Use the vertical timeline direction with explicit complete/active/locked affordances. Active node is enlarged; locked and complete states must not rely on color alone. |
| Lesson / quiz / review | `mockups/lesson_*`, `mockups/review_session_*`, `mockups/review_summary_*` | Lesson: as built under AppNav. Review mockups are **target** (Review tab is placeholder). Review has no enforced timer. |
| Study Buddy / Nova chat | `mockups/nova_assistant_*` | **Shipped:** first-class Study Buddy RAG (AppNav), not full tab shell. **Target mockup shape:** lesson-context header + in-lesson Nova (UJ-2). Prefer sources chip for RAG; do not require lesson-context header for Study Buddy. |
| Paywall / profile / leagues / settings | `mockups/paywall_*`, `mockups/profile_*`, `mockups/public_profile_*`, `mockups/weekly_league_*`, `mockups/settings_*` | Preserve reassurance-first paywall, privacy-limited public profile, weekly league list, and clean settings sections. Legal/destructive flows use factual copy, not Nova wit. |
| Celebrations / share artifacts / brand assets | `mockups/set_celebration_*`, `mockups/level_up_*`, `mockups/milestone_share_card_*`, `mockups/learnium_logo`, Nova/badge image mockups | Use as visual reference for reward concentration and Nova starburst. They do not override token colors, motion-reduction behavior, or final copy. |
**Hierarchy:** Path → contains → Sets → contain → Lessons → contain → check questions. Modals stack **one level deep only** (celebration, paywall, report-content, delete-confirm) — never a modal atop a modal.

**FR-area → surface map:** Set generation (FR-1–3) → Learn + generation state overlay (**shipped**). Lessons/progression (FR-4–5) → Set/Lesson viewer + Set-complete. **Study Buddy (shipped, first-class)** → create buddy + RAG chat (not the same as FR-6 in-lesson Nova). **Nova in-lesson tutor (FR-6, target)** → Lesson-grounded chat. Streaks/Daily Goal (FR-7–9) → Onboarding + Dashboard + Settings (display shipped; award/reminder pipeline partial). XP/Levels/Badges (FR-10–12) → Profile + celebration overlays (chrome shipped; awards not fully wired). Leagues (FR-13–14) → Leagues (**placeholder**). Review (FR-15–16) → Review tab (**placeholder**). Paths (FR-17–18) → Path map (**coming soon**). Social (FR-19–20) → Public profile + Leagues (friends). Accounts/tiers/billing (FR-21–23) → Paywall + Settings.

## Voice and Tone

Applied microcopy for **Nova**. Brand voice itself (witty, brutally honest, never degrading — the smart friend who won't let you BS your progress) lives in `DESIGN.md.Brand & Style`. The rule that outranks wit: **encourage on failure, never shame** — especially never shame a broken streak (PRD SM-C1; memlog soft-loss).

| Situation | Do (Nova) | Don't |
|---|---|---|
| Empty state (no Sets) | "Nothing here yet. What do you actually want to learn? Type it." | "You have no courses. 😢" |
| Streak loss | "Your 11-day streak took a day off. It happens. Pick it back up today — I'll be here." | "You lost your streak! 💔 Start over from 0." |
| Quota hit / paywall | "You've used today's free Set. Your progress is safe. Pro lifts the daily cap when you're ready." | "Limit reached. Upgrade now!!!" |
| Wrong quiz answer | "Not quite — the answer's B. Here's why, so it sticks." | "Wrong. ❌" / "Incorrect, try again." |
| Correct answer | "Nailed it. +10 XP." | "Correct!!! 🎉🎉 Amazing genius!" |
| Level-up | "Level 6. You've earned it — this stuff is getting real." | "OMG you leveled up!!! So proud!" |
| Content rejection (gibberish) | "I couldn't make a real course out of that one. Try a clearer topic — like 'intro to options trading.'" | "Invalid input. Error." |
| Review reminder | "3 minutes keeps your streak alive. Quick Review?" | "Don't break your streak! Do it now or lose everything!" |

Honest beats (Nova's skeptical state) are allowed and encouraged — "You've skipped this quiz three times. Bold. Let's actually do it." — but they land on *behavior*, never on the person, and never on a missed day.

Skeptical beats fire at most once per item per session, never after a missed day, and never stacked with streak-loss copy. If the user then engages, Nova drops the skepticism immediately.

Every copy-bearing state - including State Patterns, Content Integrity acknowledgements, billing failures, and settings confirmations - is governed by this voice table. On destructive/legal confirms (delete account, age gate, GDPR export), Nova's wit is off: plain, factual, respectful. Wit garnishes wins, never irreversible actions.

## Component Patterns

Behavioral only. Visual specs live in `DESIGN.md.Components`.

| Component | Behavioral rules |
|---|---|
| **Lesson node / path progression** (`{components.lesson-node}`) | Ordered unlock: only the next incomplete Lesson is **active**; later nodes stay **locked** until predecessors complete. Completion persists **cross-device and cross-session** (FR-4) — server-authoritative, re-opening a completed Lesson shows completed state. |
| **XP award** (`{components.xp-pill}`) | **Target behavior:** awarded **server-side only**, on completion event, **idempotent** per event (FR-10). No client-originated XP. The pill animation is a *display* of a value the server already committed — never the source of truth. **Shipped today:** chrome shows XP/level; the award pipeline on lesson complete is **not fully wired**. |
| **Streak** (`{components.streak-flame}`) | **Target behavior:** increments **once per day** when the Daily Goal is met, in the same session (no overnight batch, FR-8). Day boundary = user-local midnight `[ASSUMPTION #4]`. A missed day ends the streak → **soft-loss** state shows previous length + restart prompt, never a bare zero. Recovery/freeze/repair mechanic is `[OPEN]` (§9 Q2). **Shipped today:** flame/count display in chrome; award on goal/lesson complete **not fully wired**. |
| **Progress persistence** | All progress (Lesson completion, Set %, Path %, XP, streak, review schedule) is server-persisted and reloads identically on any device. |
| **Study Buddy chat (shipped)** | First-class surface: create a buddy, upload files (≤100MB each, ≤8 files/buddy), **client MiniLM embed**, RAG chat with **sources chip**. Chat quota: **claim/consume before LLM**; counter on Profile (not chrome). Storage: Free 750MB / Plus|Pro 5GB. Uses **AppNav**. |
| **Nova in-lesson chat (target)** (`{components.nova-avatar}`) | **Target / roadmap:** grounded in the current Lesson's content when opened from a Lesson (FR-6, UJ-2). Not the same product as Study Buddy RAG. Each user message = one chat-Quota unit with claim-first ordering. Out-of-quota → paid-tier upsell inline, **but the Lesson continues** without Nova. |
| **Leaderboard** (`{components.leaderboard-row}`) | Weekly cohort of ~30 active users `[ASSUMPTION #6]`. Ranked by XP earned that week. Promotion (top) / demotion (bottom) at cycle end; tier counts `[OPEN]` (§9 Q3). Refreshes on each Leagues page load — near-real-time not required. Opted-out users neither appear nor see standings (FR-14). |
| **Review Session** (`{components.review-session-card}`) | 5-10 questions, completable in <3 min (FR-16). **Zero generation and zero chat Quota cost.** Awards XP and counts toward the Daily Goal. Correct answers lengthen the next interval; incorrect answers shorten it. No enforced countdown in v1; "<3 min" is descriptive only. If a timer is ever introduced, users can extend/disable it and the streak is never lost because of a timeout. Questions sourced from banks generated at Set-generation time `[ASSUMPTION: addendum]`. |
| **Set generation (shipped)** | Topic → input-check → `create_set_graph_with_quota` (or equivalent). Reject gibberish/unsafe **without consuming set quota** (FR-2). Daily set quotas: Free **1/day**, Plus/Pro **5/day** (refresh daily — not a monthly free-Set pool). Target UX: 4–12 Lessons `[ASSUMPTION #3]`, ≤60s visible progress (FR-1). |
| **Modals** | All modals (e.g., `CreateSetModal`, `CreateStudyBuddyModal`) must be fully controlled components. Uncontrolled implementations are banned to prevent stale state form-submission failures and ensure reliable reset behavior on open/close. |

## State Patterns

Every data surface must handle these. "AI-generated — verify important facts" disclosure appears on **every generated Set** (PRD §6).

| State | Where it appears | Treatment |
|---|---|---|
| **Loading / generating** | Set gen, Path outline gen | Visible progress up to the 60s ceiling (FR-1). Nova present with an encouraging line, e.g. "Building your course on '[topic]' - the good ones take a few seconds. Hang tight." Rotate 2-3 variants so repeat generations do not feel canned. Never a bare spinner with no time signal. |
| **Empty — first run** | Dashboard, Learn (no Sets) | Nova + topic input prompt. "What do you actually want to learn?" Single primary action. |
| **Empty — no due reviews** | Review tab | "Nothing due right now. Your brain gets a break — come back when items ripen." No fake queue. |
| **Error - generation failure** | Set gen | Clear retry. **Quota not consumed** on failure (FR-1/FR-2 ordering). Nova copy: "That one's on me - the generator hiccuped, not you. Your topic's still here, and your quota's untouched. Try again?" |
| **Error - network** | Any | Toast (`{components.toast}`, never `alert()`), retained input, retry. No blocking full-screen error for transient loss. Nova copy: "Lost the connection for a second. Nothing's lost - tap to retry." |
| **Rejected** | Topic input | Human-readable, category-specific reason (gibberish / unsafe). **Quota untouched** (FR-2). Return focus to the input. |
| **Out-of-quota** | Set gen, Study Buddy chat | The **current action completes** if already permitted; the *next* one hits the paywall. Paywall shows what's kept (progress/XP/streak) vs what Pro lifts (FR-21). **Target:** in-lesson Nova continues the Lesson without chat. |
| **Offline** | Any | One toast: "You're offline - I'll sync everything the moment you're back. Keep going where you can." Reads from cache where possible; no data loss on reconnect. `[ASSUMPTION]` - no offline *authoring* of generation in v1. |
| **Success / celebration** | Lesson/Set/Path complete, level-up, streak milestone, promotion | Celebration overlay (`{components.celebration-overlay}`) with Nova in starburst state, XP/level in `{typography.numeral}`. Set-complete copy example: "Set done. You actually finished it - most people do not. Here's what's next." Respects reduced-motion (see Accessibility). |

## Interaction Primitives

- **Topic input & generation** — Type topic → submit → validation gate → generating state (≤60s, visible) → land in the Set. Rejection/failure returns to input with reason, quota intact.
- **Lesson completion & advance** — Explicit "Complete" (lime progress button, `{components.button-progress}`) → server commits → XP animates → next node unlocks → advance.
- **Quiz answer / reveal** — Select answer → reveal correct/incorrect with Nova's why → correct awards XP inline. Wrong answers explain, never just buzz.
- **XP-gain animation triggers** — Fires only *after* the server confirms the award (Lesson complete, Set complete, Review complete, Daily-Goal met). Display follows truth.
- **Streak-flame update** — Updates in-session the moment the Daily Goal is met; no reload needed (FR-8).
- **Level-up celebration trigger** — Fires when cumulative XP crosses a threshold mid-session (FR-11), overlaid on the current surface.
- **Pull-to-refresh / scroll** - Pull-to-refresh on mobile list surfaces (Dashboard, Review queue, Leagues), with non-drag equivalents: refresh on navigation/load and a visible refresh control where manual refresh matters. Vertical scroll only; no horizontal-scroll traps - wide content scrolls inside its own container.
- **Study Buddy / Nova send / thinking states** — Send → visible "thinking" state (not a frozen UI) → grounded response. **Shipped chat quota:** claim/consume **before** LLM. **Target in-lesson Nova:** grounded in Lesson content (UJ-2).
- **Navigation** — Uses real history navigation. **Fix the prior bug: do NOT use `router.replace` where it breaks browser Back.** Back must return to the prior surface (e.g., paywall → back → interrupted action still intact). Deep-links (reminder → Review) must be back-navigable.

## Accessibility Floor

Behavioral a11y. Visual contrast (AA in both light and dark) is `DESIGN.md`'s job.

- **Real controls.** Fix the audit: tab switches and lesson nodes were `onClick` on `<div>`/`<h2>`. Every interactive element must be a real `<button>`/`<a>` with correct role, `aria` state, and keyboard operability. **No `onClick` on non-interactive elements.**
- **Landmarks and bypass.** Each app surface has a skip-to-content link, one `<main>`, and properly labelled `<nav>` landmarks so keyboard and screen-reader users can bypass repeated top/bottom chrome.
- **No `alert()` feedback** — all feedback is toasts (`{components.toast}`) or inline, screen-reader-announced via `aria-live`.
- **Visible focus rings** on every control (2px info ring per `DESIGN.md`), never suppressed.
- **Focus not obscured.** Sticky top nav and fixed mobile bottom nav must set scroll-padding / scroll-margin equal to chrome height so keyboard focus is never fully hidden behind persistent bars.
- **Keyboard navigation** through the entire lesson path (node → node in order), the leaderboard rows, quiz options, and Nova chat. `Tab` order follows reading order; `Esc` closes the topmost modal/overlay.
- **Screen-reader labels** for gamified indicators: XP ("420 XP, up 40"), streak ("12-day streak"), progress ("Lesson 3 of 6, 50 percent"). Numerals are decorative-looking but must be announced meaningfully.
- **Reduced motion** - `prefers-reduced-motion` skips celebration/level-up/XP-burst animation, active-node glow pulses, looping streak-flame motion, and any repeated decorative animation; the *outcome* (new XP, level, "Streak saved") shows immediately, statically.
- **Target size** ≥ 44px on every touch/click target (mobile-first).
- **Age-gate + GDPR flows accessible** - signup age gate and account-deletion/export flows (FR-23) are fully keyboard- and screen-reader-operable, with visible programmatic labels, inline `aria-live` errors, no default-to-pass age selection, clear confirmation, and no dark patterns. Destructive copy is factual: "This permanently deletes your account and all progress within 30 days. This can't be undone."

## Key Flows

Personas and beats mirror the PRD §2.3. **Label status carefully:** journeys below are product vision unless marked shipped. Agents must not treat target climaxes as live behavior.

### Onboarding (shipped today)

1. User lands on Landing, signs up (email/password or Google); **age-gate 16+** passes.
2. Onboarding: **topic interest + Daily-Goal tier only**.
3. Lands on **Dashboard** — no Set is generated inside onboarding.
4. First Set generation happens later from **Learn** (input-check + daily set quota).

### UJ-1 — Dana turns a commute curiosity into a course before her coffee's done *(target journey)*

> **Target / roadmap.** Shipped onboarding stops at topic + daily goal → dashboard. First-Set generation climax is the *vision*, not the live onboarding path.

1. Dana lands on Landing, signs up with Google (age-gate 16+ passes). **(auth shipped)**
2. Onboarding: she types "behavioral economics for beginners." **(topic step shipped; gen during onboarding = target)**
3. Generating state shows visible progress (≤60s); Nova is encouraging. **(target in onboarding; gen exists on Learn)**
4. A Set appears — title, one-line promise, ~6 ordered Lessons.
5. She picks a Daily-Goal tier. **(shipped; order today is topic + goal without gen)**
6. She opens Lesson 1, works through it (~5 min), hits Complete.
7. **CLIMAX (target):** the completion + first-Set magic moment — XP awarded, **1-day Streak started**, Lesson 2 unlocks, Nova in starburst. *XP/streak award pipeline not fully wired today.*
8. Resolution: account + active Set + 1-day streak + a reason to return. Edge: generation fail/rejection → clear message, **set quota not consumed**.

### UJ-2 — Marcus asks the "dumb question" he'd never ask a colleague *(target: in-lesson Nova)*

> **Target / roadmap for in-lesson Nova.** **Shipped alternative:** first-class **Study Buddy** — create a buddy, upload materials, client MiniLM embed, RAG chat with sources chip. Do not conflate Study Buddy RAG with lesson-grounded Nova tutor.

1. Marcus is in a "SQL fundamentals" Set; the Lesson on joins doesn't click.
2. He opens **Nova from within the Lesson** (grounded in this Lesson's content). **(target)**
3. Privately, he asks "explain this like I'm five."
4. Nova re-explains using the Lesson's own material, offers a quick check question.
5. He answers; it's right.
6. **CLIMAX:** the judgment-free unblock — the re-explanation lands and the check confirms it, no colleague, no embarrassment. One chat-quota unit spent (claim-first).
7. Resolution: returns to the Lesson, completes it, confidence intact. Edge: out of free chats → sees exactly what Pro lifts, **continues the Lesson without Nova**.

### UJ-3 — Priya's streak drags her back on a day she'd have skipped *(target — Review, reminders, Leagues)*

> **Target / roadmap.** Review and Leagues tabs are **placeholders**; daily reminders and full XP/streak award on Review complete are not shipped as described.

1. Priya, day 11, gets the daily reminder at her chosen time. **(target)**
2. Tired, nearly ignores it — but the streak counter + a 3-min Review feel doable.
3. Reminder deep-links straight to the Review Session (fastest goal-meeting action). **(target)**
4. She does 5–10 questions in the elevator, on her phone browser, **zero generation/chat quota cost**.
5. Completing awards XP → Daily Goal met → **Streak saved, day 12**. **(award pipeline not fully wired)**
6. **CLIMAX:** "Streak saved — day 12" plus **League promotion movement** — she's moved up two places. **(Leagues placeholder)**
7. Resolution: retention loop closed with zero new-content cost. Edge: if she'd missed the day → soft streak-loss state that motivates restart, not abandonment (`[OPEN]` §9 Q2).

### UJ-4 — Ravi hits the free ceiling and pays because the value is already proven *(mostly target path shape; daily quota shipped)*

> **Shipped:** daily set quotas (Free 1/day, Plus/Pro 5/day) and Stripe Pro (~$9.99). **Target:** Learning Paths, monthly free-Set framing (retired — use daily), and seamless return-to-interrupted-action polish.

1. Ravi has used today's free Set generation (or hit Pro daily cap).
2. He tries to generate another Set → hits **daily** set Quota (not a monthly free pool).
3. Paywall shows what he **keeps** (progress, streak, XP) vs what Pro unlocks.
4. He subscribes via Stripe Checkout (~$9.99 Pro; UI may say Pro not Plus).
5. Tier change lands (webhook, <1 min); **target:** returned **exactly to the interrupted action**.
6. **CLIMAX (target):** seamless return — the next Set is generating, no re-navigation, no lost place.
7. Resolution: paying subscriber with higher daily set + storage limits. Edge: payment failure → back to paywall with progress intact; **nothing double-charged or double-decremented**. Nova copy: "Payment didn't go through - and nothing was charged. Your progress is exactly where you left it. Want to try again?"

## Retention Loop *(target — launch-critical)*

> **Target / roadmap.** The loop is product vision. Review, reminders, League movement, and reliable XP/streak awards on complete are **not fully shipped** — see Shipped vs placeholder.

The daily loop launch depends on (PRD §7.1 Phase A rationale). Each step must be frictionless because retention collapse is a launch-week failure mode:

**Reminder → fastest goal-meeting action (usually Review) → XP → Daily Goal met → Streak kept → League standing moves.**

- The daily **reminder** (email at v1 `[ASSUMPTION #5]`; web push is `[OPEN]` §9 Q5) deep-links to the *cheapest* streak-keeper, not the homepage. **(target)**
- Reminder tone never escalates, guilt-trips, or references what is "at stake" - one calm nudge, same voice whether the streak is 2 days or 200.
- **Review is deliberately the cheapest daily action** — <3 min, zero quota cost — so keeping a streak never requires spending generation quota or money. This is a design commitment, not an accident (FR-16). **(Review tab placeholder today)**
- Meeting the Daily Goal is what advances the streak; Review is the lowest-friction path to meeting it.
- The loop closes visibly: streak-flame ticks up, XP pill animates, League row shifts — all in-session. **(display chrome exists; award + Leagues incomplete)**
- Anti-anxiety guardrail: streak loss is **soft** (SM-C1). The loop pulls users back; it must never punish them for a missed day.

## Study Buddy (shipped) vs Nova in-lesson (target)

Do **not** collapse these into one surface:

| | Study Buddy **(shipped)** | Nova in-lesson tutor **(target / roadmap)** |
|---|---|---|
| Entry | First-class create/manage buddy flow | Open from inside a Lesson |
| Grounding | Uploaded files → client **MiniLM** embed → **RAG** chat; **sources chip** | Current Lesson content (FR-6) |
| Files | Max **100MB**/file, **8 files**/buddy; storage Free **750MB** / Plus|Pro **5GB** | N/A (lesson text) |
| Chrome | **AppNav** | In-lesson overlay/panel (as designed) |
| Quota | Chat units: **claim/consume before LLM**; counter on **Profile**, not chrome | Same chat-quota family when built; Lesson continues if out of quota |
| Journeys | Live product for "ask my materials" | UJ-2 climax (judgment-free unblock in a Lesson) |

Nova remains the **voice/character** for microcopy across the app (`DESIGN.md` brand). Character voice ≠ shipping in-lesson tutor.

## Quota, Tiers & Paywall behavior

### Shipped truth

- **Tiers:** Free (default) and **Pro** via Stripe (~**$9.99**/mo). UI copy may say **Pro** rather than Plus; treat Pro as the paid tier. (Docs/PRD may still say Plus — map Plus → Pro in shipped UI.)
- **Set generation quota (daily, not monthly):**
  - Free: **1 Set/day**
  - Plus/Pro: **5 Sets/day**
  - Quotas **refresh daily** — do **not** document or implement "5 free Sets this month."
- **Set gen path:** topic → **input-check** → create with quota (`create_set_graph_with_quota` or equivalent). Rejected/failed generation does **not** consume set quota.
- **Storage (Study Buddy files):** Free **750MB** / Plus|Pro **5GB**; max **100MB** per file; **8 files** per buddy.
- **Chat quota:** counter on **Profile**; **claim/consume before LLM** (claim-first). **Not shown in main chrome.**
- **Chrome shows:** XP, streak, level, daily goal, **sets remaining**. Chat remaining is Profile-only.
- **XP/streak awards:** chrome values display, but the **award pipeline on lesson complete is not fully wired** — do not assume completion always mutates XP/streak.

### Target paywall behavior (keep for vision)

- **Always visible set remaining** in chrome (partially shipped as sets remaining; full FR-21 chat visibility in chrome is not the shipped chat UX — chat is on Profile).
- **Wall behavior:** the action *in progress* completes if already permitted; the *next* one shows the paywall. The paywall always states what is **kept** (progress, XP, streak, content — never deleted on downgrade) vs what Pro lifts.
- **Return-to-interrupted-action:** after upgrade (or after a failed payment returns to the paywall), the user lands back **exactly** where they were, with the blocked action ready to proceed — no re-navigation (FR-22, UJ-4). Requires preserving intent across the Stripe round-trip and not clobbering Back history.
- Downgrade/cancel takes effect at period end; content, XP, streaks, and progress are never deleted.

## Content Integrity *(invented — anti-hallucination)*

The #1 comparable-product failure mode (PRD §6). v1 mechanisms, all behavioral:

- **Schema validation** — generated output must pass schema + minimum-length + input-language checks before it is ever shown or persisted (FR-3). Malformed Sets are regenerated or fail cleanly — never persisted for the user.
- **Study Buddy grounding (shipped)** — RAG over user-uploaded materials with sources chip; not free-form ungrounded assistant.
- **Lesson grounding (target)** — Nova's answers are grounded in the current Lesson's content when opened from a Lesson (FR-6); Nova stays in tutor character (no general-assistant, no code-exec, no medical/legal/financial advice beyond educational framing).
- **Per-Lesson "report content" control** — present on **every** Lesson (FR-3). Report loop: user reports → stored with Lesson identity → weekly triage. Reporting is one tap, non-blocking, and acknowledged ("Thanks — we'll look at this one"). No public shaming of content, no immediate takedown UI in v1.
- **AI-generated disclosure** — "AI-generated — verify important facts" appears on **every generated Set** (PRD §6). Persistent, not a dismissible one-time banner.
- `[NOTE]` If report rates exceed the SM-C2 threshold post-launch, retrieval-grounded generation becomes the top roadmap item (PRD §6) — out of v1 experience scope.

---

*Every value referenced above uses `DESIGN.md` tokens by name. This spine owns behavior, IA, states, interactions, accessibility, and journeys; `DESIGN.md` owns the visual identity. On visual/behavioral conflict, each spine wins in its own domain.*
