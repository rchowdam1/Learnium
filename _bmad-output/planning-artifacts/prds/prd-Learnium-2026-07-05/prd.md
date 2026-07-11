---
title: Learnium PRD
status: draft
created: 2026-07-05
updated: 2026-07-05
---

# PRD: Learnium

*Working title — confirm.*

## 0. Document Purpose

This PRD defines Learnium's public-launch scope for the founding team and downstream workflows (UX design, architecture, epics/stories). It builds on an existing working codebase (topic-based Set generation, Lessons, Study Buddy chat, freemium quota and billing plumbing) — features that exist today are marked **(existing — harden)**; everything else is new. Vocabulary is anchored in §3 Glossary; features are grouped in §4 with globally numbered FRs; everything inferred without confirmation carries an inline `[ASSUMPTION]` tag, indexed in §10.

## 1. Vision

Learnium turns any topic into a structured, gamified course in seconds. A learner types what they want to learn — "intro to options trading," "Renaissance art," "Kubernetes basics" — and Learnium generates a sequenced Set of Lessons they can work through like a Duolingo course, with an AI Study Buddy available at every step to explain, quiz, and encourage.

Duolingo proved that streaks, XP, and leagues can keep millions of people learning a language every day — but that engagement machine has never been available for *everything else* people want to learn. AI chat tutors (ChatGPT, Gizmo, and peers) answer questions but hand the learner a blank page: no structure, no progression, no reason to come back tomorrow. Learnium's wedge is the combination the market research shows nobody owns yet: **generated structured courses with real gamified progression**. The comparable products either generate content without progression mechanics or gamify only fixed content catalogs.

For the product to earn paying subscribers rather than one-session tourists, it must beat the three failure modes that kill AI-learning products: hallucinated content, shallow content, and retention collapse after the novelty fades. This PRD therefore treats content quality controls and the retention loop (streaks, spaced-repetition Review, Learning Paths) as first-class scope, not polish.

## 2. Target User

### 2.1 Jobs To Be Done

- **Functional:** "Turn my vague curiosity or upskilling goal into a concrete course I can actually finish, without hunting for scattered YouTube videos and articles."
- **Functional:** "Give me a daily, bite-sized way to make progress on learning something, in the gaps of my day."
- **Emotional:** "Make me feel like I'm making measurable progress — I want the streak, the level, the finished course."
- **Emotional:** "Don't make me feel stupid — let me ask 'dumb' questions privately to a tutor with infinite patience."
- **Social:** "Let me show (myself and others) that I'm the kind of person who keeps learning." [ASSUMPTION: social JTBD is secondary at launch; leaderboards/sharing serve it but aren't the acquisition hook.]

### 2.2 Non-Users (v1)

- **K-12/university students seeking homework help or exam prep tied to a specific syllabus.** Learnium generates general-knowledge courses, not curriculum-aligned coursework. (Confirmed: students are not the primary target.)
- **Enterprises/teams buying seats for compliance or role training** — no admin, SSO, or reporting in v1.
- **Credential seekers** — Learnium does not issue certificates or accredited credentials in v1.

### 2.3 Key User Journeys

[ASSUMPTION: These journeys were authored on the Fast path, not narrated by the user — confirm or correct the personas and beats.]

- **UJ-1. Dana turns a commute curiosity into a course before her coffee's done.**
  Dana, 34, a product marketer who keeps a "things to learn someday" note on her phone, hears a podcast mention behavioral economics. That evening she lands on Learnium's landing page, signs up with Google, and types "behavioral economics for beginners." Within seconds she sees a generated Set: a titled course with ~6 ordered Lessons and a one-line promise of what she'll know at the end. She completes Lesson 1 in about five minutes, earns her first XP, and is prompted to set a Daily Goal. **Climax:** the Lesson 1 completion screen — XP awarded, streak started, Lesson 2 unlocked. **Resolution:** she has an account, an active Set, a 1-day Streak, and a reason to return tomorrow. **Edge case:** if generation fails or the topic is rejected (gibberish, unsafe), she gets a clear message and her free Set quota is *not* consumed.

- **UJ-2. Marcus asks the "dumb question" he'd never ask a colleague.**
  Marcus, 41, an operations manager working through a "SQL fundamentals" Set to stay relevant, hits a Lesson on joins that doesn't click. He opens his Study Buddy from within the Lesson and asks "explain this like I'm five." The Study Buddy re-explains using the Lesson's own content and offers a quick check question. He gets it right, returns to the Lesson, and completes it. **Climax:** the moment the re-explanation lands and the check question confirms it. **Resolution:** Lesson complete, confidence intact, one buddy-chat consumed from his quota. **Edge case:** if he's out of free chats, he sees exactly what the paid tier lifts and can continue the Lesson without the Buddy.

- **UJ-3. Priya's streak drags her back on a day she'd have skipped.**
  Priya, 29, day 11 of a Streak, gets the daily reminder at her chosen time. She's tired and nearly ignores it, but the streak counter and a 3-minute Review Session (spaced-repetition questions from Lessons she completed last week) feel doable. She completes the Review on her phone's browser in the elevator, keeps the Streak, and sees she's moved up two places in her League. **Climax:** "Streak saved — day 12" plus the League movement. **Resolution:** retention loop closed with zero new-content generation cost. **Edge case:** if she misses a day, the 1-day auto-repair grace period is applied automatically (once per calendar month) to keep her streak alive. If she has already used the monthly grace period, she can purchase a Streak Freeze using 500 XP to restore the streak, preventing streak loss and encouraging her to continue.

- **UJ-4. Ravi hits the free ceiling and pays because the value is already proven.**
  Ravi, 38, has finished two free Sets and started a Learning Path on data analytics. He tries to generate the next Set in the Path and hits his monthly free-Set quota. The paywall shows what he keeps (progress, streak, XP) and what Plus unlocks (higher/unlimited generation and Buddy quotas). He subscribes via Stripe checkout and lands back exactly where he was, with the Set generating. **Climax:** frictionless return to the interrupted action post-payment. **Resolution:** paying subscriber mid-Path. **Edge case:** payment failure returns him to the paywall with progress intact; nothing is double-charged or double-decremented.

## 3. Glossary

- **Set** — A generated course on a single topic: an ordered collection of Lessons with a title and description. The atomic unit of generation and the unit the free-tier generation Quota counts.
- **Lesson** — One ordered unit of content within a Set. Completable; completion is tracked per user and awards XP.
- **Learning Path** — An ordered sequence of Sets forming a longer curriculum toward a broader goal (e.g., "Data Analytics" = 5 Sets). Contains Sets; a Set may exist standalone or within a Path.
- **Study Buddy** — The AI tutor chat attached to a user's learning context. Conversational; each user message consumes one unit of the chat Quota.
- **XP** — Points awarded for completing Lessons, Sets, Review Sessions, and Daily Goals. Monotonically increasing per user; determines Level.
- **Level** — A user-visible rank derived from cumulative XP via a fixed threshold table.
- **Streak** — Count of consecutive days on which the user met their Daily Goal. Resets on a missed day if the user has no streak freeze available and has already exhausted the 1-day monthly auto-repair grace period.
- **Daily Goal** — A user-selected daily XP target. Meeting it advances the Streak.
- **League** — A weekly leaderboard cohort of users grouped by recent XP activity; users are ranked within their League by XP earned that week.
- **Badge** — A named, dated award for a defined achievement (first Set completed, 7-day Streak, etc.). Awarded once per badge type per user.
- **Review Session** — A short spaced-repetition quiz assembled from material in the user's completed Lessons, scheduled by a recurrence algorithm.
- **Quota** — A per-user, per-period allowance. Two v1 Quotas: Set generations and Study Buddy chats. Free tier has fixed caps; Plus lifts them.
- **Free / Plus** — The two subscription tiers. Free is the default; Plus is the paid Stripe subscription that raises Quotas.

## 4. Features

### 4.1 Set Generation **(existing — harden)**

**Description:** The core magic moment (realizes UJ-1). A user enters a topic; Learnium validates the input, generates a structured Set (title, description, ordered Lessons), and drops the user into it. Validation rejects gibberish, unsafe, and non-generatable inputs *before* consuming Quota. Generation quality is a launch-blocking concern: shallow or hallucinated content is the #1 comparable-product failure mode.

**Functional Requirements:**

#### FR-1: Generate a Set from a topic
An authenticated user with generation Quota remaining can submit a free-text topic and receive a generated Set with a title, description, and ordered Lessons. Realizes UJ-1.

**Consequences (testable):**
- A valid topic produces a Set with ≥ 4 and ≤ 12 Lessons, each with non-empty content. [ASSUMPTION: 4–12 range; tune with content design.]
- Quota is decremented only after successful generation (check-before-spend, decrement-after-success).
- Generation completes or visibly fails within 60 seconds; the user sees progress state while waiting. [ASSUMPTION: 60s ceiling.]

#### FR-2: Reject invalid or unsafe topics without cost
The system rejects topics that are gibberish, unsafe (weapons, self-harm, illegal activity), or otherwise non-generatable, with a human-readable reason, before any Quota is consumed. Realizes UJ-1 edge case.

**Consequences (testable):**
- A rejected input never decrements the generation Quota.
- The rejection message states the category of problem, not a generic error.

#### FR-3: Content quality floor
Every generated Lesson passes automated quality checks before being shown: schema-valid structure, minimum substantive length, and language matching the input language. Realizes the anti-hallucination constraint (§5-adjacent; see Constraints §6).

**Consequences (testable):**
- Output failing schema validation is regenerated or the generation fails cleanly — malformed Sets are never persisted for the user.
- A user-facing "report content" control exists on every Lesson; reports are stored with Lesson identity for triage.

**Out of Scope:** human editorial review of generated content pre-publication; user editing of generated Lessons.

### 4.2 Lessons and Progression **(existing — harden)**

**Description:** Users work through a Set Lesson by Lesson. Completion is explicit, persisted, and rewarded (XP). Set completion is derived from all Lessons complete and is a Badge/celebration moment.

**Functional Requirements:**

#### FR-4: Complete Lessons in order
A user can open a Lesson in an owned Set, consume its content, and mark it complete; completion persists across sessions and devices. Realizes UJ-1, UJ-2.

**Consequences (testable):**
- Re-opening a completed Lesson shows completed state; completing it again awards no additional XP.
- Progress (n of m Lessons) is visible on the Set at all times.

#### FR-5: Set completion
When all Lessons in a Set are complete, the Set is marked complete with a celebration state, a completion Badge check, and a suggested next action (next Set in Path, Review, or new topic).

**Consequences (testable):**
- Set completion fires exactly once per user per Set.

### 4.3 Study Buddy **(existing — harden)**

**Description:** The AI tutor (realizes UJ-2). Reachable from within a Lesson context; answers grounded in the current Lesson's content when opened from a Lesson. Each user message consumes chat Quota, checked before spend.

**Functional Requirements:**

#### FR-6: Context-aware tutoring chat
A user with chat Quota remaining can converse with a Study Buddy; when opened from a Lesson, the Buddy's responses are grounded in that Lesson's content. Realizes UJ-2.

**Consequences (testable):**
- Chat history persists per Buddy and reloads on return.
- Quota check precedes any model call; quota decrements only after a successful response (existing ordering preserved).
- Out-of-quota users see the Plus upsell and can continue the Lesson without the Buddy.

**Feature-specific NFRs:**
- Responses to previously-seen (semantically similar) questions are served from the semantic cache where available, reducing cost and latency.

### 4.4 Streaks and Daily Goals *(new)*

**Description:** The core retention mechanic (realizes UJ-3). Users pick a Daily Goal (XP target) during onboarding; meeting it daily advances a Streak, prominently displayed everywhere. A daily reminder at a user-chosen time supports it.

**Functional Requirements:**

#### FR-7: Daily Goal selection and tracking
A user selects a Daily Goal from preset XP tiers during onboarding and can change it in profile settings. Daily XP progress toward the goal is visible on the dashboard.

**Consequences (testable):**
- Day boundaries are computed in the user's local timezone. [ASSUMPTION: local-midnight day boundary.]

#### FR-8: Streak accrual and loss
Meeting the Daily Goal increments the Streak once per day. A day with the goal unmet triggers the streak protection logic: first, an automatic 1-day repair grace period (usable once per calendar month); if already used, the system checks if the user has a Streak Freeze purchased (using XP), consuming it to protect the streak. If no protection is available, the streak ends. Realizes UJ-3.

**Consequences (testable):**
- Streak state updates within the session in which the goal is met — no overnight batch delay for the user-visible counter.
- Streak-loss state shows the previous streak length and a restart prompt, not a bare zero.
- Streak freezes can be purchased in the shop for 500 XP, up to a maximum balance of 2.

#### FR-9: Daily reminder
A user can enable a daily reminder at a chosen time; the reminder is delivered via email notifications for v1, deep-linking to the fastest goal-meeting action (usually a Review Session).

### 4.5 XP, Levels, and Badges *(new)*

**Description:** The reward spine every other mechanic hangs off. XP sources: Lesson completion, Set completion, Review Sessions, Daily Goal bonus. Levels are XP thresholds. Badges mark named milestones.

**Functional Requirements:**

#### FR-10: XP awards
The system awards XP for: completing a Lesson, completing a Set, completing a Review Session, and meeting the Daily Goal, per a single server-side XP schedule.

**Consequences (testable):**
- XP is awarded server-side only; no client-originated XP mutation is accepted.
- Each XP-earning event awards XP at most once (idempotent per event).

#### FR-11: Levels
A user's Level derives from cumulative XP via a fixed threshold table; level-ups are celebrated in-session.

#### FR-12: Badges
The system awards Badges for defined achievements (at minimum: first Lesson, first Set complete, 7-day Streak, 30-day Streak, first Path complete, first League top-3). Badges display on the user's profile with award dates.

**Consequences (testable):**
- Each Badge type is awarded at most once per user.

### 4.6 Leagues and Leaderboards *(new)*

**Description:** Weekly competitive cohorts (supports UJ-3). Users are grouped into Leagues of ~30 active users; weekly XP ranks them. Top performers promote to a higher League tier, bottom performers demote. [ASSUMPTION: Duolingo-style promotion/demotion tiers; cohort size ~30.]

**Functional Requirements:**

#### FR-13: League assignment and weekly cycle
Active users are assigned to a League cohort; the cycle resets weekly, ranking members by XP earned within the week, with promotion and demotion between tiers at cycle end.

**Consequences (testable):**
- Users appear in at most one League cohort at a time; inactive users (zero XP that week) are excluded from the next cycle's cohorts.
- League standings update at least on every page load of the League view. [ASSUMPTION: near-real-time not required for v1.]

#### FR-14: Leaderboard display and privacy
A user can view their League standings (display names and weekly XP only) and can opt out of Leagues entirely in settings.

**Consequences (testable):**
- Opted-out users neither appear in nor see League standings.
- No profile data beyond display name, Level, and weekly XP is exposed to cohort members.

### 4.7 Review Sessions (Spaced Repetition) *(new)*

**Description:** The anti-"retention collapse" and anti-"shallow learning" mechanic (realizes UJ-3). Learnium schedules short quizzes drawing on material from the user's completed Lessons, spaced per a recurrence algorithm. Review is deliberately the *cheapest* daily action — quick to complete, no generation Quota cost — making it the default streak-keeper.

**Functional Requirements:**

#### FR-15: Review scheduling
The system maintains a per-user review queue of items derived from completed Lessons, scheduled by a spaced-repetition algorithm; the dashboard shows when Reviews are due. [ASSUMPTION: algorithm choice (SM-2-family vs. simpler fixed intervals) is an architecture decision — addendum.]

#### FR-16: Review Session experience
A user can start a Review Session of 5–10 questions answerable in under ~3 minutes; completing it awards XP and counts toward the Daily Goal. Realizes UJ-3.

**Consequences (testable):**
- Review Sessions consume no generation or chat Quota.
- Answering an item updates that item's next-due schedule (correct → longer interval, incorrect → shorter).

**Out of Scope:** user-authored flashcards; importing external decks.

### 4.8 Learning Paths *(new)*

**Description:** The depth mechanic answering "shallow content" (realizes UJ-4). Where a Set is a single course, a Path is a curriculum: an ordered sequence of Sets toward a bigger goal. Users can request a Path on a broad topic; Learnium generates the Path outline first (Set titles + descriptions), then generates each Set as the user reaches it — keeping cost aligned with actual progress.

**Functional Requirements:**

#### FR-17: Generate a Path outline
A user can request a Learning Path on a broad topic and receive an ordered outline of 3–8 constituent Sets (titles and descriptions), with the first Set generated immediately. [ASSUMPTION: 3–8 Sets per Path; outline generation costs one generation-Quota unit, and each subsequent Set costs one as the user unlocks it — confirm quota accounting.]

**Consequences (testable):**
- Path progress (Sets complete / total) is visible on the dashboard.
- Reaching the end of a Set inside a Path offers one-tap generation of the next Set (Quota permitting). Realizes UJ-4.

#### FR-18: Path completion
Completing all Sets in a Path is a first-class celebration: Badge, shareable summary of what was covered, and a suggested next Path.

### 4.9 Social Layer *(new — thinnest launch slice)*

**Description:** [ASSUMPTION — phasing]: Social was selected for launch scope, but the proposed launch slice is deliberately thin: Leagues (§4.6) carry the competitive-social load, plus profile sharing and a friends leaderboard — no follows, feeds, comments, or DMs at launch (see §5 Non-Goals and §6.2). The load-bearing social act at launch is *showing progress*, not communicating.

**Functional Requirements:**

#### FR-19: Public profile and share cards
A user can make their profile (display name, Level, Badges, current Streak, completed Sets count) viewable via public link, and can generate a share image/card for milestone moments (Set complete, Path complete, Streak milestones). Profiles are private by default.

**Consequences (testable):**
- Private profiles return no data to unauthenticated viewers.
- Share cards contain no data beyond what the user's public profile exposes.

#### FR-20: Friends leaderboard
A user can add friends (by username or invite link) and see a friends-only leaderboard alongside their League view. [ASSUMPTION: mutual-consent friendship model.]

### 4.10 Accounts, Tiers, and Billing **(existing — harden)**

**Description:** Email/password and Google sign-in exist; Stripe subscription and customer-portal plumbing exist. v1 formalizes the Free/Plus tier boundary around the two Quotas (realizes UJ-4).

**Functional Requirements:**

#### FR-21: Tier enforcement via Quotas
Free-tier users have a fixed monthly quota of 5 Set generations and 30 Study Buddy chat messages. The Plus tier, priced at $9.99/month, lifts these limits to unlimited Set generations (subject to fair-use caps) and unlimited Study Buddy chat messages. Quota state (remaining / reset date) is always visible to the user.

**Consequences (testable):**
- Every Quota-consuming action checks remaining Quota before spending (existing ordering preserved).
- Quota resets occur on the user's monthly anniversary date without user action.

#### FR-22: Upgrade, manage, cancel
A user can upgrade to Plus via Stripe Checkout, manage/cancel via the customer portal, and returns to their interrupted action after checkout. Realizes UJ-4.

**Consequences (testable):**
- Webhook-driven tier changes take effect within one minute of Stripe confirmation.
- Cancellation downgrades at period end, never mid-period; progress, XP, Streaks, and content are never deleted on downgrade.

#### FR-23: Account deletion
A user can delete their account, removing personal data and chat history within 30 days, per §6 Privacy.

## 5. Non-Goals (Explicit)

- **Not a language-learning app.** No pronunciation, speech, or language-course mechanics; users wanting that have Duolingo.
- **Not a homework/exam-prep tool.** No syllabus alignment, no problem-set solving, no essay writing.
- **Not a UGC platform in v1.** No user-authored courses, no marketplace, no community content moderation burden.
- **Not a full social network.** No feeds, comments, DMs, or follower graphs in v1 — the social layer is §4.9's thin slice only.
- **No credentials.** No certificates, no accreditation claims.
- **No native mobile apps in v1.** Responsive web only; the web experience must be excellent on phones. [ASSUMPTION — confirm.]
- **No enterprise/team features in v1.**

## 6. Constraints and Guardrails

**Safety (content).** Generated content and Study Buddy responses must refuse unsafe topics (FR-2 categories) at both the input gate and the generation layer. The Study Buddy stays in tutor character and does not become a general-purpose assistant (no code execution requests, no medical/legal/financial advice beyond educational framing). Every content surface has a report control (FR-3).

**Accuracy (anti-hallucination).** The #1 comparable-product failure mode. v1 controls: schema-validated generation, grounding Buddy responses in Lesson content, the report-content loop with weekly triage, and a published "AI-generated — verify important facts" disclosure on every Set. [ASSUMPTION: no human review pipeline at launch; the report loop plus regeneration is the v1 mechanism.] `[NOTE FOR PM]` If report rates exceed the SM-C2 threshold post-launch, a retrieval-grounded generation upgrade becomes the top roadmap item.
**Accuracy (anti-hallucination).** The #1 comparable-product failure mode. v1 controls: schema-validated generation, grounding Buddy responses in Lesson content, the report-content loop with weekly triage, and a published "AI-generated — verify important facts" disclosure on every Set. 

**Privacy.** Chat logs and learning history are personal data: private by default (FR-19), deletable (FR-23), never used to train third-party models, and never exposed via Leagues beyond display name + XP (FR-14). GDPR-grade data-subject rights (export, deletion) apply from launch. Minimum age 16.

**Cost.** Every LLM-touching action is Quota-gated, cache-checked (semantic cache before model calls), or generation-deferred (Paths generate Sets lazily, FR-17). LLM cost per weekly-active user is a tracked counter-metric (SM-C3). Free-tier Quotas are the cost throttle.

**LLM Integration & OpenRouter.** All LLM calls (content generation, Study Buddy chat, quizzes) route through OpenRouter as the default gateway. This integration is entirely environment-driven and depends on the presence of `OPENROUTER_API_KEY` and server-only model env vars. No hardcoded direct-provider endpoints are permitted in the Next.js app.

> **Amendment 2026-07-11:** Study Buddy retrieval is implemented in Next.js (`lib/ingest/`) with Supabase pgvector — not the FastAPI RAG service. Embeddings are local 384-d feature-hash vectors. All OpenRouter chat/vision/audio/transcription env vars use `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`.

## 7. MVP Scope

### 7.1 In Scope (launch)

All of §4, phased as follows.

- **Phase A — Harden & retain (pre-launch):** §4.1–4.3 production-hardening, §4.4 Streaks/Daily Goals, §4.5 XP/Levels/Badges, §4.7 Review Sessions, §4.10 tier enforcement. 
- **Phase B — Compete & deepen (launch or fast-follow, ≤4 weeks post-launch):** §4.6 Leagues, §4.8 Learning Paths.
- **Phase C — Show & invite (fast-follow):** §4.9 Social layer (public profiles, share cards, friends leaderboard).

### 7.2 Out of Scope for MVP

- Native mobile apps — web-responsive carries v1.
- User-authored or edited course content.
- Human content review pipeline.
- Certificates/credentials, enterprise features, offline mode, localization.

## 8. Success Metrics

**Primary**
- **SM-1: Activation** — % of new signups who complete ≥1 Lesson in their first session. Target ≥ 60%.
- **SM-2: D7 retention** — % of activated users returning and earning XP on day 7. Target ≥ 25%.
- **SM-3: Free→Plus conversion** — % of users hitting a Quota wall who subscribe within 7 days. Target ≥ 5% of wall-hitters.

**Secondary**
- **SM-4: Streak adoption** — % of WAU with a Streak ≥ 3 days. Target ≥ 35%.
- **SM-5: Review habit** — % of daily goal-meeting sessions that include a Review Session. Target ≥ 40%.
- **SM-6: Set completion rate** — % of generated Sets that reach completion within 30 days. Target ≥ 30%.

**Counter-metrics (do not optimize)**
- **SM-C1: Streak anxiety churn** — % of users who quit within 3 days of losing a Streak ≥ 7 days. If > 20%, the streak-loss mechanic needs softening.
- **SM-C2: Content report rate** — reports per 1,000 Lesson views. Alert threshold > 5.
- **SM-C3: LLM cost per WAU** — must not exceed a fixed ceiling set by unit economics.
- **SM-C4: XP integrity** — anomalous XP accrual per League cohort.

## 9. Resolved Product Decisions

1. **Pricing and Quotas (FR-21):** Free Tier is set to 5 Set generations and 30 Study Buddy chat messages per month. Plus Tier is $9.99/month for unlimited Set generations and chats.
2. **Streak Protection (FR-8):** Includes a 1-day auto-repair grace period (once per calendar month) and a purchasable Streak Freeze (500 XP, max 2 held).
3. **League Cohorting (FR-13):** 5 tiers with cohorts of 30 active users; top 5 promote, bottom 5 demote. Weekly reset is global UTC (Sunday 23:59 UTC).
4. **Lesson Interior Format (FR-3):** Lessons consist of structured text paragraphs with inline check questions (multiple-choice or short text) for real-time verification.
5. **Reminder Channel (FR-9):** Email-only for v1.
6. **Product Name:** "Learnium" is the official launch name.

## 10. Assumptions Index


1. §2.1 — Social JTBD is secondary at launch (not the acquisition hook). (Confirmed)
2. §2.3 — All four UJs were authored, not user-narrated; personas and beats need confirmation. (Confirmed)
3. §4.1 FR-1 — Sets contain 4–12 Lessons; generation SLA 60 seconds. (Confirmed)
4. §4.4 FR-7 — Day boundaries at user-local midnight. (Confirmed)
5. §4.4 FR-9 — v1 reminder channel is email (web-only launch). (Resolved and Confirmed)
6. §4.6 — Duolingo-style League tiers, cohort ~30, weekly cycle; standings refresh on page load is enough. (Confirmed)
7. §4.7 FR-15 — Spaced-repetition algorithm choice deferred to architecture. (Confirmed)
8. §4.8 FR-17 — Paths span 3–8 Sets; quota accounting = 1 unit for outline, 1 per subsequent Set. (Confirmed)
9. §4.9 — Social launch slice is thin (profiles + share cards + friends leaderboard); phased to Phase C. (Confirmed)
10. §4.9 FR-20 — Mutual-consent friendship model. (Confirmed)
11. §4.10 FR-21 — Placeholder pricing: Free = 5 generations + 30 chats/mo; Plus ≈ $9.99/mo. (Resolved and Confirmed)
12. §5 — No native mobile apps in v1 (responsive web only). (Confirmed)
13. §6 — No human content review at launch; report loop + automated checks suffice. Age gate 16+. (Confirmed)
14. §7.1 — Three-phase launch sequencing (A: retention core, B: Leagues+Paths, C: social). (Confirmed)
15. §8 — All metric targets are placeholders pending baseline data. (Confirmed)
