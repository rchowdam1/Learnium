---
stepsCompleted:
  - step-01-documents-confirmed
  - step-01-requirements-extracted
  - step-01-requirements-confirmed
  - step-02-epics-approved
  - step-03-stories-generated
  - step-04-validated
  - workflow-complete
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-Learnium-2026-07-05/prd.md
  - _bmad-output/planning-artifacts/prds/prd-Learnium-2026-07-05/addendum.md
  - _bmad-output/planning-artifacts/architecture/architecture-Learnium-2026-07-05/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Learnium-2026-07-05/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Learnium-2026-07-05/EXPERIENCE.md
---

# Learnium - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Learnium, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: An authenticated user with generation quota remaining can submit a free-text topic and receive a generated Set with a title, description, and 4-12 ordered Lessons with non-empty content; quota is decremented only after successful generation, generation completes or visibly fails within 60 seconds, and progress is visible while waiting.

FR2: The system rejects gibberish, unsafe, or otherwise non-generatable topics with a human-readable category-specific reason before consuming generation quota.

FR3: Every generated Lesson passes schema validation, minimum substantive length checks, input-language matching, and content-quality checks before display; malformed Sets are regenerated or fail cleanly, and every Lesson exposes a report-content control stored with Lesson identity.

FR4: A user can open a Lesson in an owned Set, consume its content, and mark it complete; completion persists across sessions and devices, completed Lessons cannot award duplicate XP, and Set progress is always visible.

FR5: When all Lessons in a Set are complete, the Set is marked complete exactly once per user per Set, with a celebration state, Badge check, and suggested next action.

FR6: A user with chat quota remaining can converse with a context-aware Study Buddy; when opened from a Lesson, responses are grounded in that Lesson, chat history persists, quota is checked before model calls and decremented only after successful response, and out-of-quota users see a Plus upsell while continuing the Lesson.

FR7: A user selects a Daily Goal from preset XP tiers during onboarding, can change it in profile settings, and sees daily XP progress toward the goal on the dashboard using the user's local timezone for day boundaries.

FR8: Meeting the Daily Goal increments the Streak once per day in-session; a day with the goal unmet ends the Streak subject to the streak-protection decision, and streak loss shows the previous length plus restart prompt rather than a bare zero.

FR9: A user can enable a daily reminder at a chosen time; the v1 channel is assumed to be email and the reminder deep-links to the fastest goal-meeting action, usually a Review Session.

FR10: The system awards XP server-side only for Lesson completion, Set completion, Review Session completion, and Daily Goal completion using a single server-side XP schedule; each XP-earning event is idempotent.

FR11: A user's Level derives from cumulative XP via a fixed threshold table, and level-ups are celebrated in-session.

FR12: The system awards one-time Badges for defined achievements including first Lesson, first Set complete, 7-day Streak, 30-day Streak, first Path complete, and first League top-3; Badges display on the user's profile with award dates.

FR13: Active users are assigned to a weekly League cohort, ranked by XP earned that week, promoted or demoted between tiers at cycle end, excluded from next cohorts when inactive, and appear in at most one cohort at a time; standings update at least on every League page load.

FR14: A user can view League standings showing only display name, Level, and weekly XP, and can opt out of Leagues entirely; opted-out users neither appear in nor see standings.

FR15: The system maintains a per-user review queue of items derived from completed Lessons and scheduled by a spaced-repetition algorithm; the dashboard shows due Reviews.

FR16: A user can start a Review Session of 5-10 questions answerable in under approximately 3 minutes; completion awards XP, counts toward the Daily Goal, consumes no generation or chat quota, and updates each item's next-due schedule based on correctness.

FR17: A user can request a Learning Path on a broad topic and receive an ordered outline of 3-8 constituent Sets with titles and descriptions, with the first Set generated immediately; Path progress is visible, and completing a Set in a Path offers one-tap generation of the next Set when quota permits.

FR18: Completing all Sets in a Path triggers a first-class celebration with Badge, shareable summary of covered material, and suggested next Path.

FR19: A user can make their profile public via link and generate milestone share cards for Set completion, Path completion, and Streak milestones; profiles are private by default, private profiles expose no data to unauthenticated viewers, and share cards contain no data beyond public profile fields.

FR20: A user can add friends by username or invite link and view a friends-only leaderboard alongside the League view using a mutual-consent friendship model.

FR21: Free-tier users have fixed monthly Set-generation and Study-Buddy-chat quotas while Plus lifts them; quota state and reset date are always visible, every quota-consuming action checks before spending, and quota resets occur on the user's monthly anniversary date without user action.

FR22: A user can upgrade to Plus via Stripe Checkout, manage or cancel via the customer portal, and return to the interrupted action after checkout; webhook-driven tier changes take effect within one minute of Stripe confirmation, cancellation downgrades at period end, and progress, XP, Streaks, and content are never deleted on downgrade.

FR23: A user can delete their account, removing personal data and chat history within 30 days per the privacy constraint.

### NonFunctional Requirements

NFR1: Generated content and Study Buddy responses must refuse unsafe topics at both input validation and generation layers, and the Study Buddy must remain a tutor rather than a general-purpose assistant.

NFR2: Generated Sets must include a persistent "AI-generated - verify important facts" disclosure and every content surface must support reporting for triage.

NFR3: The system must prevent hallucinated, malformed, shallow, wrong-language, unsafe, or untraceable AI output from becoming persisted learning state through schema, safety, language, and minimum-quality checks.

NFR4: Chat logs and learning history are private personal data: private by default, deletable, never used to train third-party models, and never exposed through social features beyond explicit privacy-limited projections.

NFR5: The product must support GDPR-grade export and deletion rights from launch and enforce a minimum age of 16 before account creation.

NFR6: Every LLM-touching action must be quota-gated, cache-checked where applicable, or generation-deferred to control cost; LLM cost per weekly active user is a tracked counter-metric.

NFR7: Responses to semantically similar Study Buddy questions should be served from the semantic cache when available to reduce latency and cost.

NFR8: The responsive web experience must be excellent on phones; every touch target must be at least 44px and layouts must stack cleanly on small viewports.

NFR9: All copy, state feedback, and destructive/legal flows must follow the Nova voice rules, with wit disabled for irreversible actions and never used to shame a user after failure or streak loss.

NFR10: Accessibility is a launch constraint: real controls, skip links, landmarks, visible focus, aria-live feedback, reduced-motion support, keyboard navigation, meaningful screen-reader labels for gamified indicators, and focus protection from sticky or fixed chrome.

NFR11: Product UI must support light and dark modes as co-equal experiences with AA contrast on all text and interaction states.

NFR12: The system must preserve check-before-spend and decrement-after-success ordering for Set generation, Path generation, and Study Buddy chat.

NFR13: Progress, rewards, quotas, and social participation states must remain consistent across sessions and devices.

NFR14: Subscription entitlement must be derived from verified Stripe lifecycle events, not client redirects or checkout success pages alone.

NFR15: Scheduled and delayed work for reminders, League cycles, quota resets, review scheduling, and account deletion must be server-owned, idempotent, and auditable.

NFR16: Launch hardening must address the current lack of automated test framework and CI before public release.

### Additional Requirements

> **Amendment 2026-07-11:** Stories and requirements that mandate the Python RAG sidecar, `RAG_SERVICE_URL`, Chroma, or LangCache as the **live** Study Buddy path are **superseded** by Next.js `lib/ingest/` + Supabase `document_chunks` (pgvector). See Architecture Spine amendment.

- Architecture specifies a modular server-first layered monolith with ~~a sidecar Python RAG service~~ **in-process Study Buddy ingest + Supabase pgvector** (2026-07-11); no greenfield starter template is specified.
- UI components may call server actions, API routes, or browser-safe Supabase reads only; all mutations with auth, billing, quota, progress, AI, or privacy impact must go through server actions or verb-style `app/api/<kebab-case-action>/route.ts` endpoints.
- `middleware.ts` `protectedPaths` is the single authenticated route gate; every new protected surface for dashboard additions, Reviews, Leagues, Paths, profile, and settings must be registered precisely because matching is prefix-based.
- Server code must use `lib/server.ts` `createClient()` for cookie-bound Supabase access; service-role Supabase access must stay isolated in privileged server-only modules.
- User-owned object reads and writes must prove ownership through parent `profile_id` or explicit public/social projections; id-only mutation paths are invalid.
- Quota counters must be mutated by database RPCs or a single quota domain service backed by atomic database writes.
- Reward and progress changes must be server-authoritative idempotent events with dedupe keys; client animations display committed state only.
- ~~Next.js server code must call the RAG sidecar only through configured HTTP endpoints…~~ **Superseded:** Study Buddy ingest/chat stay in Next.js (`/api/create-buddy`, `/api/send-chat`, `lib/ingest/`); browser never writes vectors or calls OpenRouter for buddy RAG.
- ~~RAG request/response payloads must be governed by a versioned contract artifact shared by Next.js and Python…~~ **Superseded:** retrieval + prompt assembly live in `lib/ingest/`; embeddings are local 384-d feature-hash.
- Stripe subscription entitlement must be mapped idempotently by Stripe event id and customer id from verified subscription lifecycle events.
- Social reads must use privacy-limited projections only: display name, Level, Badges, current Streak, completed Sets count, and weekly XP.
- Review Sessions must use persisted question banks and server-owned review schedule state, consuming no generation quota and no Study Buddy chat quota.
- Environment variables must replace localhost-only or hardcoded provider configuration, including OpenRouter model slugs, server secrets, Stripe keys, and service-role keys. (`RAG_SERVICE_URL` is legacy/unused.)
- Scheduled jobs must own reminders, League weekly cycles, quota resets, review scheduling, delayed account deletion/export, and related audit records.
- Study Buddy chat must have one canonical transaction endpoint: authenticate, check chat quota, hybrid-retrieve chunks, call OpenRouter, persist user and assistant messages, consume quota, and return committed state.
- Buddy creation and document ingestion must be server-mediated; only buddies with `chunks_count > 0` after ingest may answer chat.
- Multi-table generated content writes must use transaction-first Postgres functions or equivalent atomic persistence before quota consumption.
- Streak and Daily Goal boundaries use the user's stored timezone; League cycles use one global reset boundary; billing and quota reset dates follow Stripe or the server quota policy.
- Signup must enforce the 16+ age gate before account creation, and AI provider calls must use privacy-approved settings while avoiding unnecessary personal data in prompts.
- ~~Deploy hardening must move the RAG URL out of `app/api/send-chat/route.ts`, … pin Python dependencies including LangCache…~~ **Superseded 2026-07-11** for Study Buddy; remaining harden items: service-role provisioning, Stripe webhook import, CI.
- Existing implementation notes identify Next.js 15 App Router, Supabase auth/Postgres/**pgvector**, Stripe, OpenRouter, and quota plumbing for `sets_remaining` and `chats_remaining`. Python/FastAPI RAG + Redis LangCache are **legacy**.
- OpenRouter is the default LLM provider gateway. Existing OpenAI-compatible SDK/client surfaces may remain where they enable a drop-in migration, but provider base URLs, API keys, model slugs, and optional OpenRouter attribution headers must be env-driven and server-only.
- Launch phasing per PRD §7.1: Phase A (pre-launch harden and retain — Sets, Lessons, Buddy, Streaks/Daily Goals, XP/Levels/Badges, Review Sessions, billing/tiers), Phase B (Leagues and Learning Paths, launch or ≤4 weeks post-launch), Phase C (social layer — public profiles, share cards, friends leaderboard).

### UX Design Requirements

UX-DR1: Implement the Midnight Ink / Pure token system for light and dark modes, including background, surface, border, text, brand, CTA, reward, streak, semantic, and progress colors from `DESIGN.md`.

UX-DR2: Implement the three-role typography system: Bricolage Grotesque for display and celebrations, Space Grotesk for functional headings, labels, and standalone gamified numerals, and Inter for body copy.

UX-DR3: Ensure all gamified standalone numbers, including XP, streak, level, League rank, and progress percentages, use tabular lining numerals to prevent counter jitter.

UX-DR4: Enforce the 4px spacing scale and three-radius system (`xl`, `2xl`, `full`) across cards, buttons, inputs, modals, pills, avatars, progress rings, and overlays.

UX-DR5: Build tokenized button variants: inverted primary CTA, secondary, tertiary, and lime progress/reward button reserved for Continue Lesson, Complete, and Correct actions only.

UX-DR6: Build tokenized card, pill, progress bar, progress ring, streak flame, level badge, lesson node, input, modal, navigation, leaderboard row, review-session card, celebration overlay, Nova avatar, and toast components with documented light/dark states.

UX-DR7: Reserve bright lime for reward and completion moments, muted lime for always-on progress, and amber exclusively for streak flames; avoid ad hoc color palettes, broad gradients, and heavy shadows.

UX-DR8: Implement a persistent 5-tab primary navigation with Home, Learn, Review, Leagues, and Profile; mobile uses a fixed bottom bar, desktop uses a top bar.

UX-DR9: Keep XP, streak, Daily Goal progress, and quota remaining always reachable from persistent chrome.

UX-DR10: Implement all named app surfaces: Landing, Signup, Login, Onboarding, Dashboard, Learning Path map, Set/Lesson viewer, Lesson quiz, Nova chat, Set-complete celebration, Level-up celebration, Review Session, Leagues, private profile, public profile, paywall/subscriptions, account/settings.

UX-DR11: Implement the Path -> Sets -> Lessons -> check questions hierarchy with one-level modal stacking only.

UX-DR12: Implement lesson/path nodes with ordered unlock behavior, distinct locked/active/complete states that do not rely on color alone, and keyboard-accessible traversal.

UX-DR13: Implement Nova chat behavior with a lesson-context header, grounded responses, visible thinking state, fixed bottom composer, quota row, persisted history, and inline out-of-quota upsell that preserves Lesson continuity.

UX-DR14: Implement state patterns for loading/generating, first-run empty, no due reviews, generation failure, network error, rejected topic, out-of-quota, offline, success, and celebration states with specified copy behavior and quota-preserving guarantees.

UX-DR15: Implement generation loading as visible progress for up to the 60-second ceiling with retained topic input and no bare spinner-only state.

UX-DR16: Implement Review Session UX as a 5-10 question, under-3-minute, zero-quota flow with no enforced countdown in v1 and accessible correct/again answer controls.

UX-DR17: Implement the daily retention loop from reminder deep-link to Review, XP award, Daily Goal met, Streak saved, and League movement with in-session feedback.

UX-DR18: Implement paywall behavior that first reassures users their progress, XP, streak, and content are safe, compares Free versus Plus, preserves interrupted intent, and keeps browser Back navigation intact.

UX-DR19: Implement public/social surfaces using privacy-limited data only and make profiles private by default.

UX-DR20: Implement the accessibility floor: real controls instead of clickable divs, skip-to-content links, one main landmark, labeled nav landmarks, no alert feedback, visible focus rings, focus not obscured by sticky chrome, keyboard navigation, aria labels for gamified indicators, reduced-motion behavior, 44px targets, accessible age gate, and accessible account deletion/export flows.

UX-DR21: Use Stitch mockups only as layout references while treating `DESIGN.md` and `EXPERIENCE.md` as binding for tokens, behavior, accessibility, and final copy.

UX-DR22: Implement Nova's voice across copy-bearing states: sharp, warm, never degrading, with skepticism limited to behavior, not personhood, and disabled for destructive or legal confirmation flows.

### FR Coverage Map

FR1: Epic 2 — Generate Set from topic (harden existing flow)
FR2: Epic 2 — Reject invalid/unsafe topics before quota spend
FR3: Epic 2 — Content quality floor and report-content control
FR4: Epic 2 — Complete Lessons in order with visible progress
FR5: Epic 2 — Set completion celebration and next-action prompt
FR6: Epic 2 — Context-aware in-lesson Nova Study Buddy chat
FR7: Epic 4 — Daily Goal selection, tracking, and timezone boundaries
FR8: Epic 4 — Streak accrual, loss, and soft-loss UI
FR9: Epic 4 — Daily email reminder with Review deep-link
FR10: Epic 3 — Server-side idempotent XP awards
FR11: Epic 3 — Level from cumulative XP with in-session celebration
FR12: Epic 3 — One-time Badges with profile display (extended in Epics 6–8)
FR13: Epic 6 — Weekly League cohort assignment and cycle
FR14: Epic 6 — League standings display and opt-out
FR15: Epic 4 — Review queue and spaced-repetition scheduling
FR16: Epic 4 — Review Session experience (zero-quota)
FR17: Epic 7 — Learning Path outline and lazy Set generation
FR18: Epic 7 — Path completion celebration and summary
FR19: Epic 8 — Public profile and milestone share cards
FR20: Epic 8 — Friends leaderboard with mutual consent
FR21: Epic 5 — Tier enforcement via monthly quotas
FR22: Epic 5 — Stripe upgrade, manage, cancel with interrupted-action return
FR23: Epic 5 — Account deletion with GDPR-grade data removal

## Epic List

### Epic 1: Experience Foundation & App Shell
Users can discover Learnium, sign up with a 16+ age gate, complete onboarding, and navigate a cohesive accessible app with design tokens, 5-tab navigation, and Nova voice.
**Brownfield status:** ~90% NEW (auth pages exist; shell does not). **Stories:** 1.1–1.10
**FRs covered:** Enables all FRs; onboarding shell supports FR7
**UX/NFR:** UX-DR1–10, UX-DR20–22 · NFR8, NFR10, NFR11, NFR16
**Phase:** A

### Epic 2: Harden Core Learning Loop
Users can enter any topic, receive a quality-validated course, complete lessons with visible progress, celebrate Set completion, and get grounded Nova help during lessons.
**Brownfield status:** ~60% EXISTS, ~40% HARDEN
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6
**UX/NFR:** UX-DR11–15 · NFR1–4, NFR6–7, NFR12
**Stories:** 2.1–2.17
**Phase:** A

### Epic 3: Progress, XP & Recognition
Users earn XP for completing lessons and sets, level up with celebration, and collect one-time badges for milestones.
**Brownfield status:** ~100% NEW
**FRs covered:** FR10, FR11, FR12 (first Lesson/Set badges; streak/path/league badges wired in later epics)
**Phase:** A

### Epic 4: Daily Habits & Review Sessions
Users set a daily goal, build streaks, receive reminders, and keep skills sharp with zero-quota Review Sessions — the full retention loop.
**Brownfield status:** ~100% NEW (quiz banks at Set-gen time are partial foundation for FR15)
**FRs covered:** FR7, FR8, FR9, FR15, FR16
**UX/NFR:** UX-DR16, UX-DR17 · NFR15
**Phase:** A

### Epic 5: Plus Membership & Account Trust
Users always see quota status, upgrade to Plus when limits are reached, manage subscription, and delete account with privacy guarantees.
**Brownfield status:** ~50% EXISTS, ~50% HARDEN
**FRs covered:** FR21, FR22, FR23
**UX/NFR:** UX-DR18 · NFR4, NFR5, NFR14
**Stories:** 5.1–5.7
**Phase:** A

### Epic 6: Weekly Leagues
Users compete in weekly XP-ranked cohorts, see promotion/demotion between tiers, or opt out entirely.
**Brownfield status:** ~100% NEW
**FRs covered:** FR13, FR14
**Phase:** B

### Epic 7: Learning Paths
Users request multi-Set curricula on broad topics, progress through ordered Sets with lazy generation, and celebrate Path completion.
**Brownfield status:** ~100% NEW
**FRs covered:** FR17, FR18
**Phase:** B

### Epic 8: Share Progress & Connect
Users make profiles public, generate milestone share cards, and compete with friends on a private leaderboard.
**Brownfield status:** ~100% NEW
**FRs covered:** FR19, FR20
**UX/NFR:** UX-DR19
**Phase:** C

## Epic 1: Experience Foundation & App Shell

Users can discover Learnium, sign up with a 16+ age gate, complete onboarding, and navigate a cohesive accessible app with design tokens, 5-tab navigation, and Nova voice.

### Story 1.1: Design Token System and Typography

As a learner,
I want the app to look and feel consistent in both light and dark mode,
So that every screen feels like one polished product rather than disconnected pages.

**Acceptance Criteria:**

**Given** the token definitions in `DESIGN.md`
**When** the design system is applied globally via Tailwind v4 and `globals.css`
**Then** all semantic color tokens (background, surface, border, text, brand, CTA, accent, streak, semantic states) resolve correctly in light and dark mode
**And** both themes are co-equal with AA contrast on primary text and interactive states (NFR11)

**Given** the typography roles in `DESIGN.md`
**When** any page renders headings, body copy, labels, or gamified numerals
**Then** Bricolage Grotesque is used for display/celebration, Space Grotesk for functional headings and labels, and Inter for body copy (UX-DR2)
**And** standalone gamified numbers use tabular lining numerals to prevent layout jitter (UX-DR3)

**Given** the spacing and radius system in `DESIGN.md`
**When** components use spacing and border-radius
**Then** values follow the 4px spacing scale and the three-radius system (`xl`, `2xl`, `full`) (UX-DR4)

**Given** the existing codebase uses hardcoded hex values (e.g. `#142937`, `#166ea8`)
**When** this story is complete
**Then** landing, auth, and dashboard surfaces consume tokens instead of inline hex colors
**And** no new hardcoded palette values are introduced in changed files

---

### Story 1.2: Core UI Component Library

As a learner,
I want buttons, cards, inputs, and feedback elements to behave consistently everywhere,
So that I can predict how to interact with any screen.

**Acceptance Criteria:**

**Given** the component specs in `DESIGN.md`
**When** a developer imports shared UI primitives
**Then** tokenized variants exist for: primary CTA (inverted), secondary, tertiary, and lime progress/reward button (UX-DR5)
**And** lime progress button is reserved for Continue Lesson, Complete, and Correct actions only (UX-DR7)

**Given** cards, pills, progress bars, inputs, modals, and toasts are needed on a page
**When** those components render in light and dark mode
**Then** each has documented resting, hover, focus, disabled, and error states using design tokens (UX-DR6)
**And** interactive controls use a visible 3:1 boundary at rest and a 2px focus ring with offset (UX-DR20)

**Given** reward vs progress vs streak color rules
**When** components use accent colors
**Then** bright lime is used only for reward/completion moments, muted lime for always-on progress, and amber exclusively for streak indicators (UX-DR7)
**And** broad gradients and heavy shadows are not used on new components

**Given** feedback must be accessible
**When** success, error, or info messages display
**Then** toasts use the shared toast component with `aria-live` polite announcements
**And** `alert()` is not used anywhere in updated surfaces (UX-DR20)

---

### Story 1.3: App Layout Shell and 5-Tab Navigation

As a learner,
I want persistent navigation to Home, Learn, Review, Leagues, and Profile,
So that I can reach any major area of the app in one tap.

**Acceptance Criteria:**

**Given** an authenticated user on any protected app route
**When** the page renders on mobile (<768px)
**Then** a fixed bottom navigation bar shows five tabs: Home, Learn, Review, Leagues, Profile (UX-DR8)
**And** each tab target is at least 44px with an accessible label (NFR8)

**Given** an authenticated user on desktop (≥768px)
**When** the page renders
**Then** a top navigation bar shows the same five tabs with logo left and status chrome right-aligned (UX-DR8)
**And** the active tab is indicated by more than color alone (icon + label + aria-current)

**Given** route structure for primary tabs
**When** navigation links are clicked
**Then** Home resolves to `/dashboard`, Learn to a Learn hub route, Review to `/review`, Leagues to `/leagues`, and Profile to `/profile`
**And** each route renders inside the shared app layout shell without full-page remount of chrome

**Given** unauthenticated users on public routes (landing, login, signup)
**When** those pages render
**Then** the 5-tab bar is not shown
**And** marketing/auth layout remains distinct but token-consistent

---

### Story 1.4: Persistent Chrome with Status Slots

As a learner,
I want XP, streak, daily goal, and quota status always visible in the app chrome,
So that I always know where I stand without hunting through menus.

**Acceptance Criteria:**

**Given** the persistent chrome defined in UX-DR9
**When** an authenticated user views any tabbed app page
**Then** the chrome displays slots for XP pill, streak flame, daily-goal progress, and quota remaining
**And** slots are present on both mobile bottom-bar layout and desktop top-bar layout

**Given** reward systems are not yet implemented (Epics 3–5)
**When** chrome data APIs return zero or placeholder values
**Then** chrome renders gracefully with zero-state copy (e.g. "0 XP", "— streak", "Goal: —", "Sets: —")
**And** no runtime errors occur from missing backend fields

**Given** profile/quota read endpoints exist or are stubbed
**When** chrome mounts
**Then** it fetches committed server state via a single read API or server component
**And** chrome does not mutate XP, streak, or quota client-side

**Given** a screen reader user navigates the app
**When** gamified indicators are present in chrome
**Then** XP, streak, level, and quota elements have meaningful aria labels (NFR10, UX-DR20)

---

### Story 1.5: Landing Page Refresh

As a prospective learner,
I want a credible landing page that explains Learnium's value,
So that I understand why I should sign up before creating an account.

**Acceptance Criteria:**

**Given** an unauthenticated visitor opens `/`
**When** the landing page loads on mobile and desktop
**Then** the page uses the Midnight Ink / Pure token system with co-equal light/dark support (UX-DR1, UX-DR10)
**And** primary CTA routes to signup and secondary CTA routes to login

**Given** Nova voice guidelines in `EXPERIENCE.md`
**When** landing copy renders
**Then** headline and supporting copy are sharp, warm, and never condescending (UX-DR22, NFR9)
**And** copy communicates generated structured courses with gamified progression (PRD vision)

**Given** mobile-first requirements (NFR8)
**When** the landing page renders on a phone-width viewport
**Then** layout stacks in a single column, all touch targets are ≥44px, and text remains readable without horizontal scroll
**And** Stitch mockups are used as layout reference only; tokens and behavior follow `DESIGN.md` / `EXPERIENCE.md` (UX-DR21)

**Given** accessibility requirements
**When** the landing page is keyboard-navigated
**Then** skip-to-content link is available, one `<main>` landmark exists, and focus order is logical (UX-DR20)

---

### Story 1.6: Auth Pages Refresh

As a new or returning learner,
I want signup and login pages that match the product's visual quality,
So that auth feels trustworthy and consistent with the rest of Learnium.

**Acceptance Criteria:**

**Given** unauthenticated users navigate to `/signup` or `/login`
**When** those pages render
**Then** they use shared tokenized inputs, buttons, and typography from Stories 1.1–1.2 (UX-DR10)
**And** Google OAuth and email/password flows remain functional

**Given** OAuth and email confirmation redirects currently hardcode `localhost:3000`
**When** auth flows run in staging or production
**Then** redirect URLs derive from environment configuration (e.g. `NEXT_PUBLIC_SITE_URL`)
**And** signup confirmation and OAuth callback land on the correct origin

**Given** auth error states (invalid credentials, duplicate email, network failure)
**When** errors occur
**Then** inline or toast feedback uses Nova voice without shaming the user (NFR9, UX-DR22)
**And** feedback is announced via accessible toast/inline patterns, not `alert()` (UX-DR20)

**Given** successful login or signup
**When** auth completes
**Then** new users route into onboarding (Story 1.7) and returning users route to `/dashboard`
**And** protected routes remain gated by `middleware.ts`

**Given** signup or first-time Google OAuth before any account exists
**When** the user attempts to create an account
**Then** they must confirm age 16+ via checkbox before Supabase auth proceeds (NFR5, AD-17, UX-DR20)
**And** users indicating under 16 cannot create an account or profile row

---

### Story 1.7: Onboarding Flow Routing

As a new learner,
I want a short onboarding after signup,
So that Learnium feels personalized before I reach the dashboard.

**Acceptance Criteria:**

**Given** a user completes signup or first OAuth login without an onboarding-complete flag
**When** auth callback finishes
**Then** the user is routed to onboarding instead of directly to `/dashboard`
**And** returning users with onboarding complete skip onboarding

**Given** onboarding step 1 (topic interest)
**When** the user submits a topic or selects a starter interest
**Then** the choice is persisted on the profile or onboarding record
**And** the user advances to step 2 without losing input on transient network error

**Given** onboarding step 2 (daily goal tier — shell only)
**When** the user selects a preset tier (Casual / Regular / Serious)
**Then** the selection is persisted to the profile (`daily_goal_tier` or equivalent column added in this story)
**And** full daily-goal XP logic is deferred to Epic 4 but the stored tier is readable by downstream epics

**Given** onboarding completes
**When** the user taps Continue
**Then** they land on `/dashboard` with onboarding-complete flag set
**And** they can change daily goal tier later from Settings (Story 1.8)

**Given** onboarding UI requirements
**When** steps render on mobile
**Then** layouts follow onboarding mockups as layout reference with token-accurate styling (UX-DR10, UX-DR21)
**And** all controls meet 44px minimum touch targets (NFR8)

---

### Story 1.8: Settings Page and Route Protection

As a learner,
I want a dedicated settings area and reliable route protection,
So that my account preferences and app sections are secure and discoverable.

**Acceptance Criteria:**

**Given** authenticated users navigate to `/settings`
**When** the settings page loads
**Then** it renders inside the app layout shell with sections for Account, Daily Goal (read/edit tier), Reminders (placeholder), Theme, and League participation (placeholder) (UX-DR10)
**And** the page uses tokenized components from Story 1.2

**Given** `middleware.ts` is the single auth gate (Architecture AD-2)
**When** this story ships
**Then** `protectedPaths` includes `/dashboard`, `/sets`, `/profile`, `/subscriptions`, `/buddy`, `/review`, `/leagues`, `/paths`, and `/settings`
**And** prefix matching is documented in code comments to prevent accidental over-matching

**Given** an unauthenticated request to any protected path
**When** middleware runs
**Then** the user is redirected to `/login` with return URL preserved where safe
**And** no protected page HTML is served

**Given** settings placeholders for future epics
**When** reminder, league opt-out, or theme controls are not yet implemented
**Then** controls render as disabled with helper copy explaining availability
**And** no broken mutations are exposed

---

### Story 1.9: Accessibility Floor and Test/CI Scaffold

As a learner using assistive technology,
I want the app to meet a documented accessibility floor from launch,
So that I can navigate and learn without barriers.

**Acceptance Criteria:**

**Given** any page updated in Epic 1
**When** audited for accessibility
**Then** interactive elements are real controls (`button`, `a`, `input`) — not clickable `div`s (UX-DR20)
**And** each page has skip-to-content, one `<main>` landmark, and labeled navigation landmarks

**Given** keyboard navigation
**When** a user tabs through landing, auth, onboarding, and tabbed app shell
**Then** focus rings are visible on all interactive elements
**And** focus is not fully obscured by fixed bottom or top chrome (UX-DR20)

**Given** `prefers-reduced-motion: reduce`
**When** celebration or transition animations would run
**Then** motion is reduced or replaced with static states per `EXPERIENCE.md`
**And** essential state changes remain perceivable without animation

**Given** no automated test framework exists today (NFR16)
**When** this story ships
**Then** Vitest (or agreed unit runner) and Playwright are configured with at least one smoke test per critical path: landing load, auth page render, protected route redirect
**And** a GitHub Actions workflow runs lint, build, and tests on pull requests

**Given** CI runs on a clean checkout
**When** tests execute
**Then** they pass without manual local setup beyond documented env vars
**And** test commands are documented in `README` or project-context

**Given** the user goes offline during app use
**When** connectivity is lost
**Then** cached read-only content (e.g. open Set) remains viewable where already loaded
**And** an accessible offline toast explains actions will retry when connected — no `alert()` (UX-DR14)

**Given** deploy hardening for Study Buddy vector path
**When** CI and deploy docs are updated
**Then** Supabase migrations including `document_chunks` / pgvector RPCs are documented and applied
**And** deployment documents OpenRouter model env vars, service-role module provisioning — **not** `RAG_SERVICE_URL` / Python LangCache (Architecture AD-10, amended 2026-07-11)

> _Historical AC (superseded 2026-07-11): pin `langcache` in `rag/requirements.txt` and document `RAG_SERVICE_URL`._

---

### Story 1.10: Learn Hub Surface

As a learner,
I want a dedicated Learn tab to browse Sets and start new topics,
So that content creation and study have a clear home.

**Acceptance Criteria:**

**Given** authenticated user taps Learn in the 5-tab nav
**When** Learn hub loads at its dedicated route
**Then** user sees their Sets list, create-new-topic CTA, and placeholder/active Path section (UX-DR10)
**And** layout uses tokenized cards from Story 1.2

**Given** user taps create new topic
**When** Create Set flow opens
**Then** existing `CreateSetModal` / controller is integrated into Learn hub
**And** successful generation navigates to `/sets/[setId]` per Story 2.4

**Given** user has no Sets yet
**When** Learn hub renders
**Then** first-run empty state with Nova voice encourages first topic (UX-DR14, UX-DR22)
**And** CTA is ≥44px on mobile (NFR8)

**Given** Epic 7 Paths are not yet implemented
**When** Learn hub renders
**Then** Path section shows disabled/coming-soon state without broken navigation
**And** Epic 7.1 can replace placeholder without restructuring Learn hub

---

---

## Epic 2: Harden Core Learning Loop

Users can enter any topic, receive a quality-validated course, complete lessons with visible progress, celebrate Set completion, and get grounded Nova Study Buddy help during lessons.

### Story 2.1: Fix Set Generation Quota Ordering

As a learner,
I want my generation quota spent only when a Set is successfully created,
So that failed or rejected generations do not waste my monthly allowance.

**Acceptance Criteria:**

**Given** an authenticated user with generation quota remaining
**When** they submit a valid topic for Set generation
**Then** the server follows authenticate → validate input → check quota → call provider → validate output → persist Set → consume quota → return success (Architecture AD-3, NFR12)
**And** quota is not decremented if generation, validation, or persistence fails

**Given** the current `input-check` route decrements quota before the LLM call
**When** this story ships
**Then** `decrementRequests()` / `consume_set_quota` runs only after the full Set graph is durable and valid
**And** behavior matches the existing correct pattern in `send-chat` (check → act → persist → decrement)

**Given** a generation failure after a transient error
**When** the user retries with the same topic
**Then** they still have their original quota available
**And** the UI retains the topic input for retry (UX-DR14)

**Given** unauthenticated requests to the generation endpoint
**When** `/api/input-check` is called without a valid session
**Then** the API returns 401 with `{ success: false, message }`
**And** no quota or provider call occurs

---

### Story 2.2: Topic Validation and Category-Specific Rejection

As a learner,
I want clear feedback when my topic cannot be turned into a course,
So that I understand why and can try a different topic without losing quota.

**Acceptance Criteria:**

**Given** a user submits gibberish, empty, or non-generatable input
**When** server-side validation runs before any quota check or LLM call
**Then** the request is rejected with a category-specific message (e.g. gibberish, unsafe, non-generatable) (FR2)
**And** generation quota is not consumed

**Given** a topic matches unsafe categories (weapons, self-harm, illegal activity)
**When** a pre-LLM safety gate or validated classifier runs
**Then** the rejection message states the category of problem, not a generic error (FR2, NFR1)
**And** the rejection is logged for triage without persisting a Set

**Given** client-side validation in `CreateSetModal`
**When** server-side validation is added
**Then** title, description, and category are all validated on the server with matching rules
**And** client and server rejection categories are consistent

**Given** a rejected topic
**When** the user sees the error
**Then** copy follows Nova voice — direct, not shaming (NFR9, UX-DR22)
**And** the modal retains the user's input for editing (UX-DR14)

---

### Story 2.3: Content Quality Validation and Atomic Set Persistence

As a learner,
I want every generated Lesson to meet a quality floor before I see it,
So that I can trust the course content is structured, substantive, and in my language.

**Acceptance Criteria:**

**Given** LLM output is returned for a Set
**When** post-generation validation runs before persistence
**Then** output must pass hardened Zod schema: 4–12 lessons, non-empty paragraphs, matching quiz count, 4 options per question, valid answer index (FR1, FR3)
**And** prompts and schema no longer allow 3–5 lesson Sets

**Given** generated lesson content
**When** minimum substantive length and language checks run
**Then** `franc` (or equivalent) verifies content matches the input language (FR3)
**And** shallow or empty paragraphs cause validation failure, not persistence

**Given** validation fails after a provider call
**When** retry policy allows up to N regeneration attempts
**Then** the system retries or fails cleanly without persisting a malformed Set (FR3)
**And** quota is not consumed on validation failure (depends on Story 2.1 ordering)

**Given** a valid Set passes all checks
**When** `createSet()` persists lessons, paragraphs, quizzes, questions, and options
**Then** writes occur atomically via a Postgres function or transaction (Architecture AD-15)
**And** partial Sets are never left in the database on mid-write failure

---

### Story 2.4: Generation Progress UX and 60-Second Ceiling

As a learner,
I want visible progress while my course is being generated,
So that I know the system is working and what to expect if it takes a while.

**Acceptance Criteria:**

**Given** a user submits a topic for generation
**When** generation begins
**Then** the UI shows staged progress states (validating → generating → saving) — not a bare spinner (UX-DR15, FR1)
**And** the user's topic input remains visible and editable until generation locks

**Given** generation exceeds expected duration
**When** 60 seconds elapse without success or explicit failure
**Then** the UI shows a timeout message with retry guidance (FR1 assumption: 60s ceiling)
**And** quota is not consumed if generation did not complete successfully

**Given** a network interruption during generation
**When** the client loses connectivity
**Then** a toast displays Nova-voice retry copy without blocking the modal permanently (UX-DR14)
**And** retained input allows immediate retry when connectivity returns

**Given** successful generation completes
**When** the Set is persisted
**Then** the user is navigated to `/sets/[setId]` (or equivalent) to begin Lesson 1
**And** dashboard Set list updates without requiring a full page refresh

---

### Story 2.5: Report Content Control and AI Disclosure

As a learner,
I want to report problematic AI content and see that content is AI-generated,
So that I can flag issues and verify important facts myself.

**Acceptance Criteria:**

**Given** a user views any Lesson in a generated Set
**When** the lesson content renders
**Then** a persistent "AI-generated — verify important facts" disclosure is visible on the Set/Lesson surface (NFR2)
**And** the disclosure is present in both light and dark mode

**Given** a user encounters incorrect or harmful lesson content
**When** they tap Report content on a Lesson
**Then** a modal collects reason/category and submits to `POST /api/report-content` (FR3)
**And** the report is stored with `lesson_id`, `profile_id`, reason, and timestamp

**Given** a report is submitted successfully
**When** the server confirms persistence
**Then** the user sees accessible toast confirmation
**And** submitting again for the same lesson/session does not create duplicate spam reports without explicit intent

**Given** content reporting supports triage
**When** an admin or internal tool queries reports (API or table)
**Then** reports are joinable to lesson and set identity for investigation
**And** no chat logs or unrelated PII are included in the report payload (NFR4)

---

### Story 2.6: Lesson Progression Hardening

As a learner,
I want to work through Lessons in order with clear progress on the Set page,
So that I always know where I am in the course.

**Acceptance Criteria:**

**Given** a user opens an owned Set at `/sets/[setId]`
**When** the page loads
**Then** progress displays as "n of m Lessons" with a progress bar at all times on the Set page (FR4)
**And** `LessonChain` shows locked, active, and complete states that do not rely on color alone (UX-DR12)

**Given** API routes for set and lesson data (`get-set-data`, `mark-lesson-complete`)
**When** any request includes a `setId` or `lessonId`
**Then** the server verifies authentication and ownership via Set → profile_id (Architecture AD-12)
**And** cross-tenant access returns 403/404 without leaking existence

**Given** a user completes a Lesson quiz
**When** `mark-lesson-complete` runs
**Then** server validates prior lessons in the Set are complete before accepting completion
**And** re-completing an already-complete quiz returns early without duplicate side effects (FR4)

**Given** a user reopens a completed Lesson
**When** the lesson renders
**Then** completed state is shown from server-authoritative flags
**And** duplicate XP awards are prevented (hook point ready for Epic 3; no client-side completion mutation)

**Given** quiz answer submission
**When** the client sends selected options
**Then** option IDs match between `get-set-data` response and `mark-lesson-complete` payload
**And** scores and `previousAnswers` reload correctly on return visits

---

### Story 2.7: Set Completion Celebration and Next Actions

As a learner,
I want a meaningful celebration when I finish an entire Set,
So that I feel accomplished and know what to do next.

**Acceptance Criteria:**

**Given** a user completes the final Lesson quiz in a Set
**When** all lessons are marked complete
**Then** `mark-set-complete` runs and sets `sets.completed` exactly once per user per Set (FR5)
**And** repeated calls are idempotent (early return if already complete)

**Given** Set completion fires for the first time
**When** the server confirms completion
**Then** `SetCompleteModal` (or celebration overlay) displays with Nova celebration copy (FR5, UX-DR14)
**And** the modal is reliably triggered — not toast-only

**Given** the celebration overlay renders
**When** the user dismisses or continues
**Then** suggested next actions include at least: start a new topic, go to dashboard, Review placeholder, and Path placeholder when user has active Path context (FR5)
**And** reduced-motion preference is respected (UX-DR20)

**Given** Set completion occurs
**When** badge evaluation is not yet implemented (Epic 3)
**Then** completion still succeeds without error
**And** a hook/event is emitted that Epic 3 can subscribe to for "first Set complete" badge

---

### Story 2.8: In-Lesson Nova Panel

As a learner,
I want to open Nova Study Buddy from within a Lesson,
So that I can ask questions without leaving my course.

**Acceptance Criteria:**

**Given** a user is viewing a Lesson on `/sets/[setId]`
**When** they tap the Nova / Study Buddy affordance
**Then** an in-lesson panel or drawer opens with lesson context in the header (FR6, UX-DR13)
**And** the Lesson content remains accessible behind or beside the panel

**Given** the Nova panel is open
**When** the user closes or dismisses it
**Then** lesson progress and position are unchanged
**And** focus returns to a sensible element in the lesson view (UX-DR20)

**Given** mobile viewport
**When** the Nova panel opens
**Then** layout adapts per mockups — fixed bottom composer, readable message history, ≥44px send target (NFR8, UX-DR13)
**And** sticky chrome does not permanently obscure the message input (focus-not-obscured)

**Given** the standalone `/buddy/[buddyId]` route still exists for document-upload buddies
**When** this story ships
**Then** in-lesson Nova uses lesson-scoped chat identity (lesson/set context), distinct from document buddy cards on dashboard
**And** both entry points share the canonical chat transaction endpoint (Architecture AD-13)

---

### Story 2.9: Lesson-Grounded Chat and RAG Contract

As a learner,
I want Nova's answers grounded in the Lesson I'm studying,
So that explanations stay relevant and trustworthy.

**Acceptance Criteria:**

**Given** Nova is opened from a Lesson
**When** the user sends a message
**Then** `send-chat` includes `lessonId` / `setId` and server loads lesson paragraph content for grounding (FR6)
**And** the RAG or tutor prompt instructs answers to use lesson content, not general knowledge alone (NFR1)

**Given** user asks for out-of-scope assistant behavior (code execution, medical/legal/financial advice beyond educational framing)
**When** the tutor processes the message
**Then** Nova refuses with educational framing and stays in tutor character (NFR1, PRD §6 Safety)
**And** refusal does not consume chat quota if no successful assistant response is produced

**Given** `/api/send-chat` receives a lesson- or buddy-grounded chat request
**When** retrieval runs
**Then** hybrid Supabase RPCs (`match_document_chunks` + `keyword_document_chunks`) scope by `profile_id` and `study_bot_id` (Architecture AD-6, amended 2026-07-11)
**And** OpenRouter answers using retrieved context — no Python RAG sidecar call

**Given** Study Buddy retrieval configuration
**When** Next.js answers chat
**Then** embeddings are local 384-d feature-hash vectors — not an external embeddings API
**And** browser code never calls OpenRouter or writes `document_chunks` directly

> _Historical AC (superseded 2026-07-11): Python RAG sidecar, semantic LangCache, `RAG_SERVICE_URL`, shared Next/Python schema artifact._

**Given** chat messages are persisted
**When** a successful response returns
**Then** user and assistant messages are stored with lesson/buddy association
**And** history reloads when the user reopens Nova from the same Lesson (FR6)

---

### Story 2.10: Chat Quota Hardening and Out-of-Quota Upsell

As a learner,
I want fair chat quota usage and a clear path to Plus when I'm out of messages,
So that I can keep learning even when Nova is unavailable.

**Acceptance Criteria:**

**Given** a user with chat quota remaining
**When** they send a Nova message from the in-lesson panel
**Then** quota is checked before any model/RAG call and decremented only after a successful assistant response (FR6, NFR12)
**And** failed provider or persistence errors do not consume quota

**Given** a user with zero chat quota
**When** they attempt to send a message
**Then** an inline Plus upsell displays what Plus unlocks (FR6, UX-DR18 shell)
**And** the Lesson remains fully usable — user can continue reading and completing without Nova

**Given** the orphan `save-chat-message` route
**When** this story ships
**Then** the route is removed or restricted to delegate through the canonical `send-chat` transaction (Architecture AD-13)
**And** no alternate path bypasses quota checks

**Given** buddy ownership validation
**When** `send-chat` or `get-buddy-data` receives a `buddyId`
**Then** server verifies `study_bots.profile_id` matches the authenticated user
**And** cross-tenant buddy access returns 403

**Given** chat quota refresh for monthly model (full logic in Epic 5)
**When** this story ships
**Then** `chats_remaining` is readable in the Nova panel quota row
**And** out-of-quota copy uses Nova voice without shaming (NFR9)

**Given** Nova assistant messages in chat
**When** user views a response
**Then** report-content control is available per message and reports store message identity for triage (NFR2)
**And** chat surfaces include AI-generated disclosure consistent with lesson content (NFR2)

---

### Story 2.11: Buddy RAG Ingestion Lifecycle

As a learner,
I want document-upload Study Buddies to become available only when ingestion succeeds,
So that I never chat with a Buddy whose knowledge base failed to load.

**Acceptance Criteria:**

**Given** a user creates a document-upload Buddy
**When** creation starts
**Then** Buddy progresses through server-owned states: `pending_db` → `pending_rag` → `ready` | `failed` (Architecture AD-14)
**And** only `ready` Buddies accept chat requests

**Given** RAG ingestion is in progress
**When** user views Buddy card or opens chat
**Then** UI shows thinking/ingesting state with Nova voice copy
**And** chat composer is disabled until `ready`

**Given** ingestion fails
**When** retries are exhausted
**Then** Buddy is marked `failed` with cleanup status and retry key recorded
**And** user sees actionable retry or support message without orphan vectors

**Given** `send-chat` receives a non-ready `buddyId`
**When** request is processed
**Then** API returns `{ success: false, code: 'readiness' }` without consuming chat quota
**And** server mediates all document uploads to RAG — browser never uploads directly to vector store

---

### Story 2.12: AI Provider Privacy Configuration

As a platform,
I want AI provider calls configured to protect learner privacy,
So that personal learning data is never used to train third-party models.

**Acceptance Criteria:**

**Given** OpenRouter and RAG provider configuration
**When** deployed to any environment
**Then** provider calls use product-approved privacy settings (no training on customer data) (NFR4, AD-17)
**And** configuration is env-driven and documented in deploy checklist

**Given** prompts sent to generation or tutor endpoints
**When** payloads are constructed
**Then** unnecessary PII (email, full name) is excluded from prompts
**And** only minimum lesson/content context required for grounding is included

**Given** chat logs and uploaded documents
**When** sent to providers
**Then** data handling complies with PRD §6 Privacy — not used for third-party model training (NFR4)
**And** integration tests verify privacy flags are set on provider client initialization

---

### Story 2.13: Provider Environment Contract

As a platform operator,
I want one documented OpenRouter provider contract,
So that every LLM-touching endpoint can be configured without code changes.

**Acceptance Criteria:**

**Given** any deployed environment
**When** provider configuration is loaded
**Then** server-only env vars define `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`, generation model, tutor/chat model, embedding model decision, and optional OpenRouter attribution headers
**And** no browser-exposed `NEXT_PUBLIC_*` variable contains provider secrets

**Given** existing OpenAI-compatible SDK usage
**When** the provider client is initialized
**Then** the base URL and API key point to OpenRouter
**And** model names are read from env, not hardcoded as direct-provider model ids

**Given** configuration is missing or invalid
**When** an LLM-touching route starts
**Then** it fails fast with a server log and user-safe `{ success: false, code: 'provider' }` response
**And** no quota is consumed

---

### Story 2.14: Next.js Generation Client Drop-In Swap

As a learner,
I want Set and Path generation to behave the same after the provider pivot,
So that the migration does not change learning flows.

**Acceptance Criteria:**

**Given** `/api/input-check` or any Set/Path generation endpoint calls the model
**When** OpenRouter is configured
**Then** the existing schema validation, zod parsing, safety checks, and input-language checks still run before persistence
**And** quota is checked before provider work and decremented only after durable success (NFR12)

**Given** OpenAI-compatible response parsing differs for the selected OpenRouter model
**When** structured output is requested
**Then** the route either uses a compatible structured-output path or normalizes the response before existing schema validation
**And** malformed output fails cleanly without consuming quota

**Given** provider errors, rate limits, or model routing failures
**When** they occur
**Then** the user sees the existing generation-failure UX copy pattern
**And** logs include provider error category without leaking prompt content or personal data

---

### Story 2.15: Study Buddy Chat Provider Path _(amended 2026-07-11)_

As a learner,
I want Nova Study Buddy chat to keep grounded answers after the provider pivot,
So that tutoring quality is preserved.

**Acceptance Criteria:**

**Given** `/api/send-chat` answers Study Buddy messages
**When** OpenRouter is configured
**Then** chat completion calls route through OpenRouter using `OPENROUTER_MODEL` (`nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`)
**And** context comes from Supabase hybrid retrieval in `lib/ingest/` — **not** the Python `rag/` sidecar

**Given** embeddings are needed for retrieval
**When** vectors are produced
**Then** the implementation uses local 384-d feature-hash embeddings matching `document_chunks.embedding`
**And** no OpenRouter/OpenAI embeddings API is required for the live path

**Given** chat returns an answer
**When** Next.js persists chat messages
**Then** the canonical chat write path remains authenticate -> check quota -> retrieve + OpenRouter -> persist user/assistant messages -> decrement quota -> return committed state
**And** provider failure does not save orphan assistant messages or consume chat quota

> _Historical title/AC referenced “Python RAG Chat Provider Swap” / `/api/chat` sidecar — superseded 2026-07-11._

---

### Story 2.16: Provider Privacy, Cost, and Model Routing Audit

As a platform,
I want the OpenRouter pivot audited against privacy and cost rules,
So that Learnium's PRD promises remain true after migration.

**Acceptance Criteria:**

**Given** prompts for generation, Study Buddy chat, Path outline generation, or future LLM endpoints
**When** payloads are assembled
**Then** unnecessary PII such as email and full name is excluded
**And** only minimum owned lesson, buddy, or topic context needed for grounding is sent (NFR4)

**Given** OpenRouter model routing is configured
**When** model env vars are reviewed
**Then** every LLM-touching flow has a named model, fallback policy, and cost class
**And** the LLM cost per weekly-active-user metric remains trackable (NFR6)

**Given** provider data handling policy is documented
**When** deployment checklist is reviewed
**Then** it confirms learner chats, uploads, learning history, and generated progress data are not used to train third-party models
**And** provider logs/redaction/retention assumptions are captured for launch review

---

### Story 2.17: Compatibility Verification and Rollback

As a maintainer,
I want a small verification and rollback plan for the provider pivot,
So that OpenRouter can be adopted without blocking launch hardening.

**Acceptance Criteria:**

**Given** the provider pivot is implemented
**When** smoke verification runs locally
**Then** Set generation, invalid-topic rejection, Study Buddy chat, semantic-cache hit behavior, and quota decrement-after-success are manually verified or covered by available tests
**And** failures are categorized as configuration, provider, validation, quota, or persistence

**Given** OpenRouter is unavailable or a selected model regresses
**When** rollback is needed
**Then** switching env vars can route back to the previous OpenAI-compatible endpoint or a known-good OpenRouter model without code changes
**And** rollback does not require database migration or persisted content changes

**Given** docs are updated
**When** a future agent reads project context, architecture, PRD addendum, or this story
**Then** OpenRouter is clearly the default provider gateway
**And** OpenAI-compatible SDK references are understood as client compatibility, not direct OpenAI vendor commitment

---

---

## Epic 3: Progress, XP & Recognition

Users earn XP for completing lessons and sets, level up with celebration, and collect one-time badges for milestones.

### Story 3.1: XP Events Schema and Reward Service

As a learner,
I want XP awarded reliably by the server for my learning actions,
So that my progress cannot be forged or duplicated.

**Acceptance Criteria:**

**Given** no XP system exists in the database today
**When** this story ships
**Then** an `xp_events` table (or equivalent) is created with: `profile_id`, `event_type`, `entity_id`, `xp_amount`, `dedupe_key`, `created_at` (FR10, Architecture AD-4)
**And** a unique constraint on `dedupe_key` prevents duplicate awards for the same event

**Given** the PRD XP schedule placeholder (Lesson = 10, Set = 25, etc.)
**When** the reward service awards XP
**Then** amounts are read from a single server-side config or table — not hardcoded in route handlers
**And** the schedule is documented in code or config for tuning without PRD changes

**Given** a reward award request
**When** `awardXp(profileId, eventType, entityId)` is called
**Then** the service inserts an idempotent event and updates `profile.total_xp` (or materialized aggregate) atomically
**And** returns `{ xpAwarded, totalXp, level, leveledUp }` for client display

**Given** RLS policies on `xp_events`
**When** a browser client attempts direct insert
**Then** inserts are denied
**And** only server actions / API routes using service role or SECURITY DEFINER RPCs can write XP

---

### Story 3.2: Wire XP into Lesson and Set Completion

As a learner,
I want to earn XP when I complete a Lesson or finish a Set,
So that my effort is recognized immediately.

**Acceptance Criteria:**

**Given** a user completes a Lesson quiz for the first time
**When** `mark-lesson-complete` succeeds
**Then** the reward service awards Lesson-completion XP exactly once per lesson per user (FR10)
**And** the API response includes `{ xpAwarded, totalXp, level, leveledUp }`

**Given** a user re-completes an already-complete Lesson
**When** `mark-lesson-complete` runs
**Then** no additional XP is awarded (FR4, FR10)
**And** the response indicates `xpAwarded: 0`

**Given** a user completes all Lessons in a Set for the first time
**When** `mark-set-complete` succeeds
**Then** Set-completion XP is awarded exactly once per user per Set (FR10)
**And** Lesson XP and Set XP can both apply in the same session without double-counting Set XP on retry

**Given** completion APIs return reward state
**When** the client receives the response
**Then** XP pill animation displays the server-committed value — never a client-calculated increment (Architecture AD-4, UX-DR9)
**And** animations respect `prefers-reduced-motion` (UX-DR20)

---

### Story 3.3: Level Threshold Table and Computation

As a learner,
I want my Level to reflect my cumulative XP,
So that I can see how far I've come over time.

**Acceptance Criteria:**

**Given** a fixed level threshold table (config or DB seed)
**When** cumulative XP is updated after any award
**Then** the user's level is computed as the highest threshold not exceeding `total_xp` (FR11)
**And** level values are monotonically non-decreasing

**Given** a user crosses a level threshold
**When** XP is awarded
**Then** the reward service sets `leveledUp: true` and returns the new level
**And** the previous level is included in the response for animation purposes

**Given** profile read endpoints (`get-profile-data`)
**When** profile data is fetched
**Then** `totalXp` and `level` are included in the response
**And** values match the sum of `xp_events` (or materialized aggregate)

**Given** level is displayed in persistent chrome
**When** chrome refreshes after an award
**Then** level uses tabular lining numerals (UX-DR3)
**And** level badge component follows `DESIGN.md` token specs (UX-DR6)

---

### Story 3.4: Level-Up Celebration and Chrome Display

As a learner,
I want an in-session celebration when I level up,
So that advancing feels rewarding without leaving my flow.

**Acceptance Criteria:**

**Given** a completion API returns `leveledUp: true`
**When** the client processes the response
**Then** a celebration overlay displays with Nova starburst, new level in display typography, and XP earned (FR11, UX-DR6, UX-DR14)
**And** the overlay can be dismissed with keyboard (Escape) and primary button

**Given** `prefers-reduced-motion: reduce`
**When** level-up would animate
**Then** a static celebration state is shown without motion effects (UX-DR20)
**And** screen readers announce the level change via `aria-live`

**Given** persistent chrome from Epic 1
**When** level or XP changes
**Then** XP pill and level indicator update from server state after award
**And** chrome never shows stale XP after a successful completion in-session (NFR13)

**Given** Nova voice for celebrations
**When** level-up copy displays
**Then** copy is sharp and warm — e.g. acknowledges real achievement without condescension (UX-DR22, NFR9)
**And** wit is not used to mock prior level or progress

---

### Story 3.5: Badge Catalog and Award Service

As a learner,
I want badges awarded once for defined achievements,
So that milestones feel permanent and meaningful.

**Acceptance Criteria:**

**Given** no badge system exists today
**When** this story ships
**Then** `badges` (catalog) and `user_badges` (`profile_id`, `badge_type`, `awarded_at`) tables are created (FR12)
**And** unique constraint on `(profile_id, badge_type)` enforces one award per badge per user

**Given** the launch badge catalog (first Lesson, first Set, 7-day Streak, 30-day Streak, first Path, first League top-3)
**When** the catalog is seeded
**Then** all six badge types exist with display name and icon reference
**And** streak/path/league badges are awardable by downstream epics via `awardBadge(profileId, badgeType)`

**Given** an `awardBadge` service call
**When** the user has not yet earned the badge
**Then** a row is inserted with `awarded_at` timestamp and the badge is returned
**And** duplicate calls are idempotent (no error, no second row)

**Given** badge awards are server-authoritative
**When** a client attempts direct insert to `user_badges`
**Then** RLS denies the write
**And** only server routes/RPCs can award badges

---

### Story 3.6: First Lesson and First Set Badges

As a learner,
I want badges when I complete my first Lesson and first Set,
So that early wins feel celebrated.

**Acceptance Criteria:**

**Given** a user completes their first Lesson ever
**When** `mark-lesson-complete` awards XP successfully
**Then** the "first Lesson" badge is awarded via the badge service (FR12)
**And** the completion response includes `{ badgeAwarded: { type, name } }` when applicable

**Given** a user completes their first Set ever
**When** `mark-set-complete` fires for the first time
**Then** the "first Set complete" badge is awarded (FR12)
**And** Set celebration overlay can optionally reveal the badge (hook for Story 2.7 UI)

**Given** a user already holds the first Lesson or first Set badge
**When** they complete another lesson or set
**Then** no duplicate badge is awarded
**And** no error is surfaced to the user

**Given** Set completion from Story 2.7
**When** badge check runs
**Then** badge evaluation does not block or fail Set completion if badge service is unavailable
**And** failures are logged server-side for retry

---

### Story 3.7: Profile Rewards Display

As a learner,
I want to see my XP, Level, and Badges on my profile,
So that I can review my accomplishments over time.

**Acceptance Criteria:**

**Given** a user navigates to `/profile`
**When** the profile page loads
**Then** total XP, current Level, and a badge grid with award dates are displayed (FR12)
**And** gamified numbers use tabular lining numerals (UX-DR3)

**Given** a user has no badges yet
**When** the profile renders
**Then** an encouraging empty state explains how to earn first badges
**And** empty state copy follows Nova voice (UX-DR22)

**Given** badges are privacy-sensitive
**When** profile is private (default for FR19)
**Then** full badge list is visible only to the authenticated owner on `/profile`
**And** no public projection occurs until Epic 8

**Given** profile stats already show lesson/set counts
**When** rewards display is added
**Then** existing stat cards remain functional and token-consistent
**And** layout follows profile mockups as layout reference (UX-DR21)

---

---

## Epic 4: Daily Habits & Review Sessions

Users set a daily goal, build streaks, receive reminders, and keep skills sharp with zero-quota Review Sessions — the full retention loop.

### Story 4.1: Daily Goal Tiers and Timezone Storage

As a learner,
I want to choose a daily XP goal and have my day boundaries respect my timezone,
So that progress feels fair wherever I live.

**Acceptance Criteria:**

**Given** preset daily goal tiers (e.g. Casual 10 / Regular 20 / Serious 30 / Intense 50 XP)
**When** tier configuration is defined server-side
**Then** each tier maps to a daily XP target used by all downstream daily-goal logic (FR7)
**And** tiers are readable from onboarding (Story 1.7) and Settings

**Given** a new or existing user
**When** they select or change a daily goal tier in onboarding or Settings
**Then** `profile.daily_goal_tier` and `profile.daily_goal_xp_target` are persisted
**And** changes apply to the current local day forward without retroactive streak changes

**Given** timezone requirements (FR7, Architecture AD-16)
**When** a user signs up or opens Settings
**Then** browser-detected IANA timezone is stored on `profile.timezone` with manual override available
**And** all daily-goal and streak day boundaries use this timezone — not server UTC

**Given** Settings daily goal section from Epic 1
**When** this story ships
**Then** tier selector is enabled (no longer placeholder)
**And** copy explains what meeting the goal means for streaks (FR8 preview)

---

### Story 4.2: Daily XP Ledger and Dashboard Progress

As a learner,
I want to see how much XP I've earned today toward my daily goal,
So that I know how close I am to keeping my streak alive.

**Acceptance Criteria:**

**Given** a user earns XP from any source (lessons, sets — Epic 3; reviews — Story 4.7)
**When** XP is awarded
**Then** a `daily_xp_ledger` entry increments XP for `(profile_id, local_date)` where `local_date` derives from stored timezone (FR7)
**And** ledger writes are idempotent per underlying XP event

**Given** a user opens the dashboard (Home tab)
**When** the page loads
**Then** a Daily Goal progress ring or bar shows `todayXp / goalTarget` (FR7, UX-DR9)
**And** persistent chrome daily-goal slot reflects the same committed server values

**Given** a new local day begins in the user's timezone
**When** the dashboard or chrome refreshes
**Then** today's progress resets to 0 toward the same tier target
**And** yesterday's ledger row remains queryable for streak evaluation

**Given** mobile layout
**When** daily goal progress renders
**Then** the widget meets 44px touch targets if interactive and uses muted lime for always-on progress (UX-DR7, NFR8)

---

### Story 4.3: Streak Tracking and Soft-Loss UI

As a learner,
I want my streak to grow when I meet my daily goal and see encouragement if I miss a day,
So that I'm motivated to return without feeling punished.

**Acceptance Criteria:**

**Given** streak fields on profile (`current_streak`, `longest_streak`, `last_goal_met_date`)
**When** a user's daily XP meets or exceeds their goal target
**Then** streak increments at most once per local day in the same session (FR8)
**And** `last_goal_met_date` updates to that local date

**Given** a user meets their daily goal during a session
**When** the goal threshold is crossed
**Then** chrome streak flame updates without overnight batch delay (FR8)
**And** optional "Streak saved" micro-celebration displays (UX-DR17)

**Given** a local day ends without meeting the daily goal
**When** streak evaluation runs via scheduled job at user's local midnight boundary (Architecture AD-11, NFR15)
**Then** `current_streak` resets per product policy (hard loss v1 unless Q2 freeze ships later)
**And** soft-loss UI shows previous streak length plus restart prompt — never a bare zero (FR8, UX-DR22)

**Given** user's `current_streak` reaches 7 or 30 days
**When** streak increments cross the threshold
**Then** corresponding streak badge is awarded idempotently via badge service (FR12)
**And** badge appears on profile with `awarded_at` date

**Given** streak display in chrome and profile
**When** rendered
**Then** amber is used only for streak flame indicators (UX-DR7)
**And** streak value has an accessible label for screen readers (NFR10)

---

### Story 4.4: Review Queue Schema and Lesson Seeding

As a learner,
I want review items created from lessons I've completed,
So that spaced repetition has material to schedule.

**Acceptance Criteria:**

**Given** no review tables exist today
**When** this story ships
**Then** `review_items` table is created with: `profile_id`, source `question_id` (or quiz ref), `next_due_at`, `interval_days`, `last_result`, `created_at` (FR15, Architecture AD-9)
**And** RLS enforces profile ownership on all review rows

**Given** a user completes a Lesson for the first time (Story 2.6)
**When** `mark-lesson-complete` succeeds
**Then** review items are seeded from that lesson's persisted question bank (FR15, addendum: generation-time banking)
**And** seeding is idempotent — re-completion does not duplicate items

**Given** seeded review items
**When** created
**Then** initial `next_due_at` is set per v1 policy (e.g. 1 day from completion)
**And** no LLM or generation quota is consumed (Architecture AD-9)

**Given** ownership validation on review mutations
**When** any review API receives IDs
**Then** server proves ownership via `profile_id` (Architecture AD-12)
**And** cross-tenant access is rejected

---

### Story 4.5: Spaced-Repetition Scheduler

As a learner,
I want review items rescheduled based on whether I remembered them,
So that harder material returns sooner and known material spreads out.

**Acceptance Criteria:**

**Given** v1 fixed-interval ladder (e.g. 1d → 3d → 7d → 21d per addendum)
**When** scheduler logic is implemented server-side
**Then** correct answers lengthen `interval_days` and incorrect answers shorten toward minimum 1d (FR16)
**And** algorithm is encapsulated so SM-2 can replace it later without schema break

**Given** review items with `next_due_at` in the past or present
**When** `GET /api/review/due` is called for authenticated user
**Then** response returns count and items due for scheduling display (FR15)
**And** query uses stored timezone for "due today" semantics where applicable

**Given** scheduled job infrastructure (Architecture AD-11)
**When** review scheduling job runs
**Then** it uses idempotent run keys and audit log
**And** page loads display current state but do not define schedule truth

**Given** inactive users with no due items
**When** due endpoint returns empty
**Then** response is explicit empty state — not an error
**And** dashboard can render "No reviews due" copy (UX-DR14)

---

### Story 4.6: Review Session Flow

As a learner,
I want a short review session I can finish in a few minutes,
So that I can keep knowledge fresh without generating new content.

**Acceptance Criteria:**

**Given** a user with due review items
**When** they start a Review Session from `/review`
**Then** server assembles 5–10 questions from due items (FR16, UX-DR16)
**And** session is completable in under ~3 minutes (descriptive, no enforced countdown in v1)

**Given** an active Review Session
**When** the user answers each question with Correct / Again controls
**Then** controls are real buttons ≥44px with accessible labels (UX-DR16, NFR8)
**And** feedback uses toast or inline `aria-live` — not `alert()` (UX-DR20)

**Given** each answer submission
**When** graded server-side
**Then** item `next_due_at` and `interval_days` update per scheduler (FR16, Story 4.5)
**And** no generation or chat quota RPC is called (Architecture AD-9)

**Given** session completion
**When** all session questions are answered
**Then** a summary screen shows items reviewed and XP placeholder hook for Story 4.7
**And** user can return to dashboard or start another session if more items are due

---

### Story 4.7: Wire Review and Daily Goal into XP

As a learner,
I want Review Sessions and meeting my daily goal to award XP,
So that reviews count toward progression and streaks.

**Acceptance Criteria:**

**Given** Epic 3 reward service exists
**When** a Review Session completes
**Then** Review-completion XP is awarded once per session via idempotent dedupe key (FR10, FR16)
**And** API returns `{ xpAwarded, totalXp, level, leveledUp }`

**Given** review XP is awarded
**When** daily ledger is updated
**Then** today's XP progress increments toward daily goal (FR7, Story 4.2)
**And** crossing the goal triggers streak increment per Story 4.3

**Given** daily goal is met via any combination of lesson, set, or review XP
**When** threshold is crossed
**Then** Daily Goal completion bonus XP is awarded once per local day (FR10)
**And** bonus award is idempotent per `(profile_id, local_date)`

**Given** retention loop UX (UX-DR17)
**When** daily goal is met after a Review Session
**Then** in-session feedback can chain: XP → goal met → streak saved
**And** reduced-motion path remains accessible

---

### Story 4.8: Dashboard Due Reviews and Review Tab

As a learner,
I want to see when reviews are due and reach them from the Review tab,
So that spaced repetition is a first-class daily action.

**Acceptance Criteria:**

**Given** the 5-tab nav from Epic 1
**When** user taps Review
**Then** `/review` renders inside app shell with due count, start session CTA, and empty state (FR15, UX-DR8, UX-DR10)
**And** route is protected in `middleware.ts`

**Given** due reviews exist
**When** dashboard (Home) loads
**Then** a Due Reviews card shows count and primary CTA to start session (FR15)
**And** card copy positions Review as fastest streak-keeping action (UX-DR17)

**Given** no due reviews
**When** Review tab or dashboard card renders
**Then** empty state explains when reviews will return with Nova voice (UX-DR14, UX-DR22)
**And** user can still browse completed Sets from Learn tab

**Given** first-run user with no completed lessons
**When** Review tab opens
**Then** empty state explains reviews unlock after completing lessons
**And** CTA links to Learn / dashboard — not a dead end

---

### Story 4.9: Daily Email Reminders

As a learner,
I want a daily reminder at my chosen time,
So that I don't forget to meet my goal on busy days.

**Acceptance Criteria:**

**Given** reminder preferences on profile (`reminder_enabled`, `reminder_time`, uses `timezone`)
**When** user enables reminder in Settings
**Then** preferences persist and can be disabled later (FR9)
**And** time picker uses accessible controls (UX-DR20)

**Given** a scheduled job runs periodically (Architecture AD-11, NFR15)
**When** local time matches user's `reminder_time` and reminders are enabled
**Then** one email per user per local day is sent with idempotent `reminder_sent_log` (FR9)
**And** duplicate sends for the same day are prevented

**Given** reminder email content
**When** rendered
**Then** copy uses Nova voice and deep-links to `/review` (or fastest goal-meeting path) (FR9, UX-DR17)
**And** email includes unsubscribe / disable link to Settings

**Given** email provider integration (Resend, SendGrid, or equivalent)
**When** send fails transiently
**Then** job retries with bounded attempts and logs outcome
**And** user is not spammed with duplicates on retry success

---

## Epic 5: Plus Membership & Account Trust

Users always see quota status, upgrade to Plus when limits are reached, manage subscription, and delete account with privacy guarantees.

### Story 5.1: Monthly Quota Model and Visibility

As a learner,
I want to always see my remaining quotas and reset date,
So that I can plan my learning around my limits.

**Acceptance Criteria:**

**Given** the legacy daily quota model in `ProfileUpdates.ts`
**When** this story ships
**Then** Set and chat quotas use monthly anniversary reset on `profile.quota_reset_at` (FR21)
**And** Free-tier caps follow product config (placeholder: 5 sets + 30 chats/month per PRD assumption)

**Given** quota read on profile, chrome, and generation/chat surfaces
**When** any page loads
**Then** user sees `sets_remaining`, `chats_remaining`, and reset date (FR21)
**And** values are server-authoritative — not client guesses (NFR13)

**Given** every quota-consuming action
**When** initiated
**Then** server checks remaining quota before provider calls (FR21, NFR12)
**And** read endpoints do not reset or consume quota

**Given** Plus subscription active (`is_subscribed`)
**When** quota is evaluated
**Then** elevated limits apply per product config
**And** free-tier caps are not applied to subscribed users

---

### Story 5.2: Stripe Webhook and Entitlement Sync

As a learner,
I want my Plus status to activate soon after I pay,
So that I can immediately continue what I was doing.

**Acceptance Criteria:**

**Given** the current webhook stub in `app/api/webhook/route.ts`
**When** this story ships
**Then** handlers process `customer.subscription.created`, `updated`, and `deleted` (FR22, NFR14, Architecture AD-7)
**And** missing `NextRequest` import is fixed

**Given** a verified Stripe event
**When** webhook processes it
**Then** `is_subscribed` and quota caps update idempotently by Stripe `event.id` (FR22)
**And** tier changes take effect within one minute of Stripe confirmation

**Given** a persisted `checkout_intents` row from Story 5.3
**When** subscription webhook confirms entitlement
**Then** server resumes interrupted action from intent record — not URL params alone (FR22, Architecture AD-7)
**And** intent is marked consumed idempotently

**Given** `checkout.session.completed`
**When** received
**Then** it resumes interrupted intent metadata but does not alone grant entitlement (Architecture AD-7)
**And** customer row is created or linked if missing

**Given** cancellation at period end
**When** Stripe reports period-end downgrade
**Then** user returns to Free tier without deleting progress, XP, streaks, or content (FR22)
**And** webhook handles immediate vs period-end loss per Stripe state

---

### Story 5.3: Checkout, Portal, and Return-to-Intent

As a learner,
I want frictionless upgrade and subscription management,
So that paying feels safe and reversible.

**Acceptance Criteria:**

**Given** a user hits a quota wall (generation or chat)
**When** paywall or upgrade CTA is shown
**Then** UX first reassures progress, XP, streak, and content are safe (FR22, UX-DR18)
**And** Free vs Plus comparison is clear before checkout

**Given** user initiates Plus upgrade from paywall or quota wall
**When** Stripe Checkout opens
**Then** server persists `checkout_intents` (owner, action type, target URL, expiry) before redirect (FR22, UJ-4)
**And** `success_url` returns user to interrupted action using intent resolution — not query params alone

**Given** payment failure or abandoned checkout
**When** user returns
**Then** no double charge or double quota decrement occurs
**And** paywall re-displays with progress intact

**Given** a subscribed user
**When** they open billing in Settings or `/subscriptions`
**Then** Stripe Customer Portal opens for manage/cancel (FR22)
**And** tier naming aligns with product ("Plus" not "Pro")

---

### Story 5.4: 16+ Age Gate Reinforcement

As a platform,
I want the 16+ age requirement enforced consistently across all account-creation paths,
So that no signup path bypasses COPPA-scope protections.

**Acceptance Criteria:**

**Given** age gate ships in Story 1.6 for primary signup/OAuth
**When** this story ships
**Then** all alternate account-creation paths (invite links, future OAuth providers) enforce the same 16+ gate
**And** no profile bootstrap completes without age confirmation on record

**Given** user declines or indicates under 16 on any path
**When** they attempt to continue
**Then** account is not created and clear copy explains the restriction
**And** no profile row or auth user persists

**Given** accessibility requirements
**When** age gate renders on any path
**Then** controls are real checkboxes/buttons with labels and focus order (UX-DR20)
**And** confirmation is not pre-checked by default

---

### Story 5.5: Account Deletion and Data Cascade

As a learner,
I want to delete my account and know my data will be removed,
So that I trust Learnium with my learning history.

**Acceptance Criteria:**

**Given** user requests deletion from Settings or Profile
**When** they confirm via accessible destructive confirm (wit disabled, UX-DR22)
**Then** account enters deletion flow per GDPR policy (FR23, NFR5)
**And** confirmation copy states 30-day removal timeline

**Given** deletion is confirmed
**When** server processes request
**Then** personal data cascade includes: profile, sets, lessons, chats, buddies, XP events, badges, review items, league memberships (FR23)
**And** Stripe subscription is cancelled per policy

**Given** `document_chunks` (pgvector) data for user buddies
**When** deletion runs
**Then** cascade/delete removes that user's chunk rows (Architecture AD-14, amended 2026-07-11)
**And** cleanup status is logged for retry on failure

> _Historical AC referenced RAG/Chroma cleanup via Python sidecar — superseded._

**Given** soft-delete vs immediate hard-delete policy
**When** implemented
**Then** auth login is disabled immediately and data purge completes within 30 days (FR23)
**And** user receives confirmation email where applicable

---

### Story 5.6: GDPR Export Request

As a learner,
I want to export my personal data,
So that I can exercise my data portability rights.

**Acceptance Criteria:**

**Given** GDPR export requirement (NFR5)
**When** user requests export from Settings
**Then** server queues export job with idempotent request key
**And** export includes profile, learning history, chats, XP, badges — not other users' data

**Given** export job completes
**When** within SLA (e.g. 72 hours)
**Then** user receives download link or email with machine-readable bundle (JSON or ZIP)
**And** link expires after reasonable window

**Given** export while account is active
**When** processing
**Then** user can continue using the app
**And** export does not mutate or delete live data

---

### Story 5.7: Quota Reset Scheduled Job

As a learner,
I want my monthly quotas to reset automatically on my anniversary date,
So that I don't have to take action to regain my free allowance.

**Acceptance Criteria:**

**Given** `profile.quota_reset_at` monthly anniversary model (Story 5.1)
**When** scheduled job runs daily
**Then** users whose reset date has passed receive refreshed `sets_remaining` and `chats_remaining` per tier (FR21, NFR15)
**And** job uses idempotent run keys and audit log per Architecture AD-11

**Given** Plus subscriber
**When** quota reset runs
**Then** elevated caps apply per `is_subscribed` state
**And** reset does not downgrade subscription status

**Given** job processes a user
**When** reset completes
**Then** `quota_reset_at` advances to next monthly anniversary
**And** chrome and profile quota displays reflect new values on next read (NFR13)

---

## Epic 6: Weekly Leagues

Users compete in weekly XP-ranked cohorts, see promotion/demotion between tiers, or opt out entirely.

### Story 6.1: League Schema and Weekly XP Ledger

As a learner,
I want my weekly XP tracked for competition,
So that league rankings reflect this week's effort only.

**Acceptance Criteria:**

**Given** no league tables exist
**When** this story ships
**Then** tables exist for `league_tiers`, `leagues` (cohorts), `league_memberships`, and `weekly_xp_ledger` (FR13, Architecture AD-8)
**And** RLS prevents cross-user membership reads beyond public projection rules

**Given** any XP award from Epic 3/4
**When** XP event is committed
**Then** `weekly_xp_ledger` increments for `(profile_id, week_start)` using global UTC week boundary (FR13, Architecture AD-16)
**And** ledger write is idempotent per XP event

**Given** league tier seed data
**When** deployed
**Then** at least 3 tiers exist (e.g. Bronze / Silver / Gold) with configurable promotion/demotion slots
**And** tier names are product-tunable without schema change

---

### Story 6.2: Cohort Assignment and Weekly Cycle Jobs

As a learner,
I want to be placed in a fair weekly cohort,
So that I compete against similarly active learners.

**Acceptance Criteria:**

**Given** week start job runs (Architecture AD-11)
**When** new cycle begins
**Then** opted-in active users are assigned to cohorts of ~30 by tier (FR13)
**And** each user appears in at most one cohort at a time

**Given** user had zero weekly XP last cycle
**When** next assignment runs
**Then** inactive user is excluded from next cycle's cohorts (FR13)
**And** membership row reflects inactive/skipped state

**Given** cycle end job runs
**When** week closes
**Then** cohort ranks by weekly XP; top N promote, bottom N demote per tier config (FR13)
**And** job is idempotent with audit record per run

**Given** job failure
**When** retry runs
**Then** duplicate promotions/demotions do not occur
**And** outcome is logged for ops review

---

### Story 6.3: League Standings API and Page

As a learner,
I want to see my weekly standings and rank,
So that competition motivates me to learn more.

**Acceptance Criteria:**

**Given** authenticated opted-in user opens `/leagues`
**When** page loads
**Then** standings show display name, Level, and weekly XP only (FR14, Architecture AD-8)
**And** standings refresh on each page load (FR13)

**Given** promotion and demotion zones
**When** standings render
**Then** UI indicates top promotion and bottom demotion bands per mockups (UX-DR10, UX-DR21)
**And** zones are understandable without color alone

**Given** user's own row
**When** displayed
**Then** it is visually distinguished and keyboard focusable
**And** weekly XP uses tabular numerals (UX-DR3)

**Given** mobile layout
**When** Leagues page renders
**Then** layout matches weekly league mockups as reference with token-accurate styling
**And** touch targets ≥44px (NFR8)

---

### Story 6.4: League Opt-Out and Privacy

As a learner,
I want to opt out of leagues entirely,
So that I can learn without public competition.

**Acceptance Criteria:**

**Given** Settings league participation toggle (placeholder from Epic 1)
**When** user opts out
**Then** `profile.league_opt_in = false` persists (FR14)
**And** user is removed from current cohort standings

**Given** opted-out user
**When** they open `/leagues` or standings API
**Then** they neither appear in nor see cohort standings (FR14)
**And** friendly copy explains how to opt back in

**Given** opted-out user earns XP
**When** weekly ledger updates
**Then** XP still accrues for personal progress but not public standings
**And** no league membership is created while opted out

**Given** privacy projection rules
**When** any league read occurs
**Then** only display name, Level, and weekly XP are exposed — never email, chat, or private history (FR14, NFR4)

---

### Story 6.5: League Top-3 Badge

As a learner,
I want recognition when I finish top 3 in my league,
So that weekly wins feel celebrated.

**Acceptance Criteria:**

**Given** cycle end job determines final ranks (Story 6.2)
**When** user finishes rank 1–3 in their cohort
**Then** "first League top-3" badge is awarded via badge service if not already earned (FR12)
**And** award is idempotent per user per badge type

**Given** badge is awarded
**When** user next opens profile or leagues
**Then** badge appears with `awarded_at` date (FR12)
**And** optional notification toast uses Nova voice

**Given** user already has badge
**When** they top-3 again in a later week
**Then** no duplicate badge is created
**And** profile still shows original award date

---

## Epic 7: Learning Paths

Users request multi-Set curricula on broad topics, progress through ordered Sets with lazy generation, and celebrate Path completion.

### Story 7.1: Learning Path Schema and Outline API

As a learner,
I want to request a curriculum outline on a broad topic,
So that I have a structured long-term learning plan.

**Acceptance Criteria:**

**Given** no path tables exist
**When** this story ships
**Then** `learning_paths` and `path_sets` (ordered slots with title, description, `set_id` nullable, `status`) are created (FR17)
**And** ownership is via `profile_id` with RLS

**Given** user submits broad topic on Learn hub
**When** `POST /api/create-path` runs
**Then** LLM returns outline of 3–8 constituent Sets (titles + descriptions only) (FR17)
**And** one generation quota unit is checked before call and consumed only after durable outline persist (NFR12)

**Given** outline validation fails
**When** schema or safety checks fail
**Then** no Path is persisted and quota is not consumed
**And** user sees category-specific error (FR2 pattern)

---

### Story 7.2: First Set Immediate Generation on Path Create

As a learner,
I want the first Set in my Path generated right away,
So that I can start learning immediately.

**Acceptance Criteria:**

**Given** a valid Path outline was persisted
**When** Path creation completes
**Then** Set #1 generates immediately using existing Set pipeline (FR17, Story 2.1–2.3)
**And** `path_sets[0].set_id` links to the created Set

**Given** first Set generation fails
**When** error occurs after outline persist
**Then** Path remains with slot 1 in `failed` or `pending` state for retry
**And** user can retry generation without duplicate outline quota charge

**Given** successful creation
**When** user lands on Path map
**Then** first node is active; later nodes are locked (UX-DR11, UX-DR12)
**And** user is navigable to `/paths/[pathId]`

---

### Story 7.3: Path Map UI and Progress Display

As a learner,
I want to see my Path as a visual map of Sets,
So that I understand how far I've come in the curriculum.

**Acceptance Criteria:**

**Given** user opens `/paths/[pathId]`
**When** page loads
**Then** vertical path map shows ordered Set nodes with locked / active / complete states (FR17, UX-DR11, UX-DR12)
**And** progress shows `completedSets / totalSets` (FR17)

**Given** Path contains mixed generated and pending Sets
**When** map renders
**Then** pending slots show title/description from outline
**And** completed Sets link to existing `/sets/[setId]` viewer

**Given** keyboard navigation
**When** user tabs through nodes
**Then** each node is focusable with visible focus ring
**And** state is not conveyed by color alone (UX-DR12, UX-DR20)

**Given** dashboard Learn hub
**When** user has active Paths
**Then** Path cards show progress summary alongside standalone Sets (FR17)
**And** layout follows learning path mockups as reference (UX-DR21)

---

### Story 7.4: Lazy Next-Set Generation

As a learner,
I want the next Set generated when I'm ready,
So that I only spend quota on content I'll actually use.

**Acceptance Criteria:**

**Given** user completes the last Lesson in Path Set N
**When** Set completion fires
**Then** Path map offers one-tap "Generate next Set" on slot N+1 (FR17)
**And** CTA checks generation quota before starting

**Given** user taps generate next Set with quota available
**When** generation succeeds
**Then** new Set links to `path_sets[N+1]` and node unlocks
**And** one generation quota unit is consumed only after success

**Given** user is out of quota
**When** they tap generate
**Then** paywall from Epic 5 displays with safe progress messaging (UX-DR18)
**And** Path progress and completed Sets remain intact

**Given** generation in progress
**When** UI waits
**Then** staged progress pattern from Story 2.4 is reused
**And** topic context comes from outline slot — not re-prompted

---

### Story 7.5: Path Completion Celebration and Badge

As a learner,
I want a major celebration when I finish an entire Path,
So that completing a curriculum feels as big as it is.

**Acceptance Criteria:**

**Given** all Sets in a Path are complete
**When** final Set completion is detected
**Then** Path completion event fires exactly once per user per Path (FR18)
**And** idempotent server handler prevents duplicate celebrations

**Given** Path completion
**When** celebration overlay displays
**Then** Nova celebration, XP summary, and covered topics list appear (FR18, UX-DR14)
**And** "first Path complete" badge is awarded if applicable (FR12)

**Given** celebration dismiss
**When** user continues
**Then** suggested next Path or new topic CTA is shown (FR18)
**And** share card hook is available for Epic 8 without blocking flow

---

### Story 7.6: Path Shareable Summary

As a learner,
I want a summary of what I covered in a completed Path,
So that I can remember or share my achievement.

**Acceptance Criteria:**

**Given** Path completion (Story 7.5)
**When** user requests summary
**Then** server returns list of Set titles/topics covered — no private chat or email data (FR18)
**And** summary uses only data user already owns

**Given** summary UI
**When** displayed
**Then** copy is suitable for milestone share card input in Epic 8
**And** respects reduced motion for any preview animation

**Given** incomplete Path
**When** summary is requested
**Then** partial progress summary may show Sets completed so far
**And** full curriculum summary requires Path completion

---

## Epic 8: Share Progress & Connect

Users make profiles public, generate milestone share cards, and compete with friends on a private leaderboard.

### Story 8.1: Profile Visibility and Public Profile Route

As a learner,
I want to control whether my profile is public,
So that I choose what others can see.

**Acceptance Criteria:**

**Given** profiles are private by default (FR19)
**When** new users are created
**Then** `profile.is_public = false` and no public slug is exposed
**And** Settings includes visibility toggle

**Given** user enables public profile
**When** they save Settings
**Then** a stable public URL is available (e.g. `/u/[username]`) (FR19)
**And** only privacy-limited fields are exposed: display name, Level, Badges, Streak, completed Sets count (Architecture AD-8)

**Given** unauthenticated visitor opens private profile URL
**When** profile is private
**Then** no learner data is returned — 404 or empty projection (FR19)
**And** no enumeration of email or internal IDs

**Given** authenticated owner views public URL
**When** profile is public
**Then** they see the same projection as anonymous visitors plus owner banner
**And** private fields (email, quotas, chat) remain hidden

---

### Story 8.2: Milestone Share Cards

As a learner,
I want shareable cards for big milestones,
So that I can show progress to others.

**Acceptance Criteria:**

**Given** Set complete, Path complete, or Streak milestone (7/30 day)
**When** user taps Share from celebration or profile
**Then** share card generates with milestone type, display name, Level, and streak/Badge as applicable (FR19)
**And** card contains no data beyond public profile fields (FR19)

**Given** share card rendering
**When** preview displays
**Then** visual design follows milestone mockups with token-accurate colors (UX-DR19, UX-DR21)
**And** user can download image or copy link per v1 web capability

**Given** private profile user
**When** they attempt share
**Then** prompt explains public profile requirement or shares anonymized card per policy
**And** no private learning content leaks in image or metadata

---

### Story 8.3: Friendship Model and Requests

As a learner,
I want to add friends with mutual consent,
So that my leaderboard reflects people I know.

**Acceptance Criteria:**

**Given** no friendship tables exist
**When** this story ships
**Then** `friendships` table exists with `requester_id`, `addressee_id`, `status` (pending/accepted/declined), timestamps (FR20)
**And** unique constraint prevents duplicate pairs

**Given** user searches by exact username
**When** `GET /api/friends/lookup?username=` is called
**Then** matching display user is returned without exposing email (FR20)
**And** rate limiting prevents enumeration abuse

**Given** user sends friend request
**When** addressee accepts
**Then** friendship becomes `accepted` only after explicit accept — not auto mutual (FR20)
**And** either party can remove friendship later

---

### Story 8.4: Invite Link Friend Flow

As a learner,
I want to invite friends via a link,
So that connecting is easy outside the app.

**Acceptance Criteria:**

**Given** user generates invite link from Profile or Friends UI
**When** link is created
**Then** signed token maps to `requester_id` with expiry (FR20)
**And** token is single-use or limited per product policy

**Given** recipient opens invite URL authenticated
**When** they accept
**Then** friendship request is created or auto-accepted per mutual-consent rules
**And** invalid/expired tokens show clear error

**Given** recipient is not logged in
**When** they open invite link
**Then** they are prompted to sign up or login then return to accept
**And** intent is preserved through auth flow

---

### Story 8.5: Friends Leaderboard

As a learner,
I want a friends-only leaderboard,
So that I can compete with people I know without a public league.

**Acceptance Criteria:**

**Given** user has accepted friends
**When** they view Friends tab on Leagues page (or dedicated section)
**Then** leaderboard shows friends ranked by weekly XP with display name and Level (FR20)
**And** only accepted mutual friends appear

**Given** user with no friends
**When** section renders
**Then** empty state prompts add-by-username or invite link
**And** CTA uses Nova voice without social pressure shaming (UX-DR22)

**Given** privacy rules
**When** friends leaderboard loads
**Then** no private Sets, chat, or email are exposed (NFR4, Architecture AD-8)
**And** opted-out league users can still use friends board

**Given** friend is removed
**When** leaderboard refreshes
**Then** removed user no longer appears
**And** historical weekly XP does not leak through cached client state

---

### Story 8.6: Streak Milestone Share and Profile Polish

As a learner,
I want streak milestones to feel shareable and my public profile polished,
So that long-term consistency is visible to others I choose.

**Acceptance Criteria:**

**Given** user reaches 7-day or 30-day streak
**When** streak milestone fires (Epic 4)
**Then** optional share card CTA appears post-celebration (FR19)
**And** 7-day and 30-day streak badges award via Epic 3 service if not already earned (FR12)

**Given** public profile page `/u/[username]`
**When** rendered for anonymous visitor
**Then** layout matches public profile mockups with token styling (UX-DR19, UX-DR21)
**And** page includes Level, Badges, Streak, completed Sets count only

**Given** owner preview
**When** toggling public profile in Settings
**Then** live preview shows visitor view before saving
**And** turning public off immediately revokes anonymous access
