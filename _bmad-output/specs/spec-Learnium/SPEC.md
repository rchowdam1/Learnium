---
id: SPEC-Learnium
companions:
  - glossary.md
  - requirements-catalog.md
  - visual-references.md
  - ../../planning-artifacts/ux-designs/ux-Learnium-2026-07-05/DESIGN.md
  - ../../planning-artifacts/ux-designs/ux-Learnium-2026-07-05/EXPERIENCE.md
  - ../../planning-artifacts/architecture/architecture-Learnium-2026-07-05/ARCHITECTURE-SPINE.md
sources:
  - ../../planning-artifacts/prds/prd-Learnium-2026-07-05/prd.md
  - ../../planning-artifacts/prds/prd-Learnium-2026-07-05/addendum.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability only; consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Learnium

## Why

Learnium captures the market gap between AI chat tutors and fixed-catalog gamified learning: adult professionals need any topic turned into a structured course with real progression, daily retention, and private tutoring. The launch must prove generated learning can avoid hallucinated, shallow, one-session novelty by combining content quality controls with Duolingo-style XP, streaks, Reviews, Paths, and paid quota boundaries.

## Capabilities

- **CAP-1**
  - **intent:** Authenticated users can turn a valid free-text topic into a structured Set of ordered Lessons.
  - **success:** A valid topic produces a schema-valid Set with 4-12 non-empty Lessons within 60 seconds, persists it for the user, and decrements generation quota only after successful persistence; rejected or failed generation never spends quota.
- **CAP-2**
  - **intent:** Users can progress through ordered Lessons and complete Sets with durable, rewarded learning state.
  - **success:** Lesson completion persists across sessions/devices, re-completion awards no duplicate XP, progress is always visible as n-of-m, and Set completion fires exactly once per user per Set.
- **CAP-3**
  - **intent:** Users can ask Nova, the Study Buddy, for private lesson-grounded tutoring help.
  - **success:** Lesson-opened chat answers are grounded in that Lesson, chat history persists, quota is checked before model work and decremented only after a successful response, semantic cache is used where available, and out-of-quota users can continue the Lesson without Nova.
- **CAP-4**
  - **intent:** Users can select a Daily Goal, receive reminders, and maintain a Streak through quick daily learning.
  - **success:** Daily XP progress is visible, day boundaries use the user's local timezone, meeting the goal updates the Streak in-session once per day, earned streak freezes protect missed days, misses without a freeze hard-reset with soft restart copy, and email plus web push/PWA reminders deep-link to the fastest goal-meeting action.
- **CAP-5**
  - **intent:** Users earn XP, Levels, and Badges from meaningful learning events.
  - **success:** XP is server-awarded and idempotent per event, Levels derive from cumulative XP thresholds, level-ups celebrate in-session, and each Badge type is awarded at most once with an award date.
- **CAP-6**
  - **intent:** Users can complete short spaced-repetition Review Sessions from completed Lessons.
  - **success:** A Review Session contains 5-10 text, quiz, diagram, or image-supported questions, is answerable in under about 3 minutes, consumes no generation or chat quota, awards XP toward the Daily Goal, and updates each item's next-due schedule by answer result.
- **CAP-7**
  - **intent:** Users can pursue broader goals through ordered Learning Paths made of Sets.
  - **success:** A Path request returns a 3-8 Set outline with the first Set generated, dashboard/path progress is visible, the next Set can be generated one-tap when reached subject to quota, and full Path completion triggers a Badge, shareable summary, and next-Path suggestion.
- **CAP-8**
  - **intent:** Users can show progress and compare weekly XP without Learnium becoming a full social network.
  - **success:** Weekly League cohorts reset on a global UTC boundary and rank active users by XP with promotion/demotion, users can opt out entirely, standings expose only display name, Level, and weekly XP, public profiles are private by default, share cards expose only public-profile data, and friends leaderboards use mutual consent.
- **CAP-9**
  - **intent:** Users can understand quota limits, upgrade to Plus, and manage billing without losing progress.
  - **success:** Users receive 5 Set generations on signup, ongoing Free includes 3 Set generations and 20 Buddy chats per month, Plus is $9.99/month, quota state shows remaining count and reset date, every quota-consuming action checks before spend, Stripe-confirmed subscription changes apply within one minute, checkout returns to the interrupted action, cancellation downgrades at period end, and progress/content/XP/Streaks survive downgrade.
- **CAP-10**
  - **intent:** Users can create and delete privacy-respecting accounts.
  - **success:** Signup enforces a 16+ age gate before account creation, and account deletion removes personal data and chat history within 30 days.

## Constraints

- Generated content and Study Buddy responses must reject gibberish, unsafe, illegal, self-harm, weapons, and non-generatable topics before quota spend; Nova stays in tutor character and does not become a general-purpose assistant.
- Anti-hallucination controls are launch-blocking: schema validation, minimum substantive length, input-language match, lesson grounding, per-Lesson report controls, weekly report triage, and an "AI-generated - verify important facts" disclosure on every generated Set.
- All LLM-touching actions are cost-controlled by quota gates, semantic cache where applicable, or lazy generation; Review Sessions must use persisted question banks and zero live generation/chat quota.
- Learning history, chats, and uploaded materials are personal data: private by default, deletable, not used to train third-party models, and never exposed socially beyond explicit privacy-limited projections.
- V1 is responsive web only and must be excellent on phones; native mobile apps, enterprise/team administration, credentials/accreditation, user-authored course marketplaces, and full social networking are out of scope.
- Implementation must preserve server authority for auth, route protection, quota ordering, rewards, ownership checks, Stripe entitlements, generated content atomicity, scheduled work, social projections, and time boundaries as defined in `ARCHITECTURE-SPINE.md`.
- Product behavior and UI must follow `EXPERIENCE.md`; visual implementation must follow `DESIGN.md`, including co-equal light/dark modes, token-driven styling, real controls, accessible focus, and Nova's North Star voice.

## Non-goals

- Not a language-learning app: no pronunciation, speech, or language-course-specific mechanics.
- Not a homework or exam-prep tool: no syllabus alignment, problem-set solving, or essay writing.
- Not a UGC platform in v1: no user-authored courses, course marketplace, or community content moderation.
- Not a full social network: no feeds, comments, DMs, or follower graph in v1.
- No certificates, accreditation claims, native mobile apps, offline mode, enterprise seats, SSO, admin reporting, or broad localization beyond generating content in the user's input language.

## Success signal

Launch is successful when new users can sign up, generate a valid Set, complete a first Lesson, earn XP, start a Streak, and return for Review without quota loss, privacy leakage, or malformed AI content. Product proof is measured by activation of at least 60% first-session Lesson completion, D7 XP-earning retention of at least 25%, and at least 5% Free-to-Plus conversion among users who hit a quota wall, while keeping content report rate, streak-loss churn, LLM cost per WAU, and XP abuse below their counter-metric thresholds.

## Assumptions

- Social motivation is secondary to learning/progression at launch; Leagues and sharing support identity but are not the acquisition hook.
- Personas and journey beats are authored planning assumptions, not directly user-narrated evidence.
- Sets contain 4-12 Lessons and generation has a 60-second user-visible ceiling.
- Streak day boundaries use user-local midnight.
- Leagues use Duolingo-style tiers, cohorts of about 30 active users, weekly global UTC cycles, and standings refreshed on page load rather than realtime.
- Review algorithm choice is deferred to architecture; fixed intervals are acceptable for v1 if the recurrence state can evolve.
- Learning Paths contain 3-8 Sets; outline generation costs one generation quota unit and each later Set costs one when unlocked.
- Social launch slice is public profiles, share cards, and friends leaderboard only, with mutual-consent friendship.
- Three-phase launch sequence is Phase A retention core, Phase B Leagues plus Paths, Phase C social.
- Metric targets are founder-calibration placeholders pending baseline data.

## Open Questions

- What are the final League tier names and promotion/demotion counts?
- What is the final launch name, since Learnium remains a working title?
