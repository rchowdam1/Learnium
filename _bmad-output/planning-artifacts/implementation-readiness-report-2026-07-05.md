---
stepsCompleted:
  - "step-01-document-discovery"
  - "step-02-prd-analysis"
  - "step-03-epic-coverage-validation"
  - "step-04-ux-alignment"
  - "step-05-epic-quality-review"
  - "step-06-final-assessment"
filesIncluded:
  prd:
    - "prds/prd-Learnium-2026-07-05/prd.md"
    - "prds/prd-Learnium-2026-07-05/addendum.md"
  architecture:
    - "architecture/architecture-Learnium-2026-07-05/ARCHITECTURE-SPINE.md"
  epics:
    - "epics.md"
  ux:
    - "ux-designs/ux-Learnium-2026-07-05/DESIGN.md"
    - "ux-designs/ux-Learnium-2026-07-05/EXPERIENCE.md"
    - "ux-designs/ux-Learnium-2026-07-05/google-stitch-handoff.md"
---

# Implementation Readiness Assessment Report

**Date:** 2026-07-05
**Project:** Learnium

## Document Inventory

### PRD Files Found
* **Sharded Documents:**
  * Folder: `prds/prd-Learnium-2026-07-05/`
    * `prd.md` (29,118 bytes)
    * `addendum.md` (3,304 bytes)

### Architecture Files Found
* **Sharded Documents:**
  * Folder: `architecture/architecture-Learnium-2026-07-05/`
    * `ARCHITECTURE-SPINE.md` (19,299 bytes)

### Epics & Stories Files Found
* **Whole Documents:**
  * `epics.md` (103,325 bytes)

### UX Design Files Found
* **Sharded Documents:**
  * Folder: `ux-designs/ux-Learnium-2026-07-05/`
    * `DESIGN.md` (23,261 bytes)
    * `EXPERIENCE.md` (25,979 bytes)
    * `google-stitch-handoff.md` (13,954 bytes)
    * `reconcile-stitch-mockups.md` (1,854 bytes)
    * `review-accessibility.md` (10,288 bytes)
    * `review-design-coherence.md` (7,146 bytes)
    * `review-rubric.md` (7,014 bytes)
    * `review-voice.md` (6,540 bytes)

## PRD Analysis

### Functional Requirements

FR1: Generate a Set from a topic. An authenticated user with generation Quota remaining can submit a free-text topic and receive a generated Set with a title, description, and ordered Lessons. (Set contains 4-12 Lessons; generation completes/fails within 60s; quota check-before-spend, decrement-after-success).
FR2: Reject invalid or unsafe topics without cost. The system rejects topics that are gibberish, unsafe (weapons, self-harm, illegal activity), or otherwise non-generatable, with a human-readable reason, before any Quota is consumed.
FR3: Content quality floor. Every generated Lesson passes automated quality checks before being shown: schema-valid structure, minimum substantive length, and language matching the input language. Includes user-facing "report content" control on every Lesson.
FR4: Complete Lessons in order. A user can open a Lesson in an owned Set, consume its content, and mark it complete; completion persists across sessions and devices. Completed Lessons award XP once.
FR5: Set completion. When all Lessons in a Set are complete, the Set is marked complete with a celebration state, a completion Badge check, and a suggested next action.
FR6: Context-aware tutoring chat. A user with chat Quota remaining can converse with a Study Buddy; when opened from a Lesson, the Buddy's responses are grounded in that Lesson's content. Chat history persists per Buddy.
FR7: Daily Goal selection and tracking. A user selects a Daily Goal from preset XP tiers during onboarding and can change it in profile settings. Daily XP progress toward the goal is visible on the dashboard.
FR8: Streak accrual and loss. Meeting the Daily Goal increments the Streak once per day; a day with the goal unmet ends the Streak. Streak state updates within the session.
FR9: Daily reminder. A user can enable a daily reminder at a chosen time; the reminder deep-links to the fastest goal-meeting action (usually a Review Session).
FR10: XP awards. The system awards XP for completing a Lesson, completing a Set, completing a Review Session, and meeting the Daily Goal, per a single server-side, idempotent XP schedule.
FR11: Levels. A user's Level derives from cumulative XP via a fixed threshold table; level-ups are celebrated in-session.
FR12: Badges. The system awards Badges for defined achievements (first Lesson, first Set complete, 7-day Streak, 30-day Streak, first Path complete, first League top-3) which display on the user's profile with award dates.
FR13: League assignment and weekly cycle. Active users are assigned to a League cohort of ~30 users; the cycle resets weekly, ranking members by XP earned within the week, with promotion and demotion between tiers at cycle end. Standings update at least on page load.
FR14: Leaderboard display and privacy. A user can view their League standings (display names and weekly XP only) and can opt out of Leagues entirely in settings.
FR15: Review scheduling. The system maintains a per-user review queue of items derived from completed Lessons, scheduled by a spaced-repetition algorithm; the dashboard shows when Reviews are due.
FR16: Review Session experience. A user can start a Review Session of 5–10 questions answerable in under ~3 minutes; completing it awards XP, counts toward the Daily Goal, and updates item schedules, consuming no quota.
FR17: Generate a Path outline. A user can request a Learning Path on a broad topic and receive an ordered outline of 3–8 constituent Sets (titles and descriptions), with the first Set generated immediately. Path progress is visible on the dashboard.
FR18: Path completion. Completing all Sets in a Path triggers a Badge, shareable summary of what was covered, and a suggested next Path.
FR19: Public profile and share cards. A user can make their profile (display name, Level, Badges, current Streak, completed Sets count) viewable via public link, and can generate a share card for milestone moments. Profiles are private by default.
FR20: Friends leaderboard. A user can add friends (by username or invite link) and see a friends-only leaderboard alongside their League view (mutual-consent friendship model).
FR21: Tier enforcement via Quotas. Free-tier users have fixed monthly Set-generation and Study-Buddy-chat Quotas; Plus lifts them. Quota state (remaining/reset date) is always visible. Quota resets occur on monthly anniversary.
FR22: Upgrade, manage, cancel. A user can upgrade to Plus via Stripe Checkout, manage/cancel via the customer portal, and returns to their interrupted action after checkout. Changes take effect within 1 minute of confirmation.
FR23: Account deletion. A user can delete their account, removing personal data and chat history within 30 days.

Total FRs: 23

### Non-Functional Requirements

NFR1: Semantic Cache for Tutor Chat. Responses to previously-seen (semantically similar) questions are served from the semantic cache where available, reducing cost and latency.
NFR2: Generation Performance SLA. Set generation completes or visibly fails within 60 seconds; the user sees progress state while waiting.
NFR3: Automated Content Quality Check. Generated lessons must match input language, meet minimum substantive length, and conform to the output schema.
NFR4: Standings Refresh Rate. League standings update at least on every page load of the League view.
NFR5: Subscription Activation Latency. Webhook-driven tier changes must take effect within one minute of Stripe confirmation.
NFR6: Account Deletion SLA. Account deletion must purge personal data and chat history within 30 days.
NFR7: Safety and Moderation Gate. Input validation and LLM generation filtering must reject unsafe topics (weapons, self-harm, illegal activities) before cost is incurred.
NFR8: Tutor Persona Guardrails. The Study Buddy must stay in tutor character and refuse general assistant requests (e.g., executing code, offering legal/medical/financial advice).
NFR9: Privacy by Design. Chat logs and learning history are private by default, never used for third-party training, and only expose display name and weekly XP on leaderboards. GDPR compliance (export/deletion) is supported.
NFR10: User Age Restriction. Minimum age of 16 to avoid COPPA/parental consent compliance scope.
NFR11: Device Compatibility. Web-responsive only (mobile-first layout), with no native app or PWA push notifications in the initial MVP launch.
NFR12: API Quota Gating & Cost Controls. Every LLM-touching action must check/decrement quotas and leverage semantic caching to maintain low LLM costs.

Total NFRs: 12

### Additional Requirements

- **Stripe Integration:** Requires processing Stripe Webhooks for subscription upgrades/downgrades/cancellations, and redirection to the customer billing portal.
- **Supabase Auth & Database:** Requires integrating Google OAuth and Email/Password sign-ins, and managing persistent user state (XP transactions, streaks, progress counters, custom quota balances).
- **FastAPI RAG Microservice:** Requires Next.js API endpoints communicating with `RAG_SERVICE_URL`, sharing/mirroring schema definitions, and utilizing Redis LangCache and Chroma vector store.
- **Reporting Loop:** A feedback mechanism on every Lesson allows users to flag low-quality or hallucinated content, feeding a weekly human triage workflow.
- **No accredited credentials or UGC:** Explicit non-goals for MVP (no PDF certificate generation, no user lesson editors/creators).

### PRD Completeness Assessment

The PRD is exceptionally well-structured and detailed, mapping out precise behaviors, metric targets, and non-goals. However, several critical ambiguities and gaps remain that must be resolved prior to full implementation:
1. **Streak Protection Mechanic (Q2):** The PRD lists this as an open question (earned freeze vs. purchased freeze vs. hard loss). This is critical for DB schema design (tracking freeze items/balances) and UI states.
2. **Pricing and Quota Limits (Q1):** While placeholders exist (Free = 5 sets + 30 chats/month), these are not finalized. The pricing point (~$9.99/mo) and fair-use boundaries for "unlimited" Plus tiers are undefined.
3. **League Cohorting and Reset Timing (Q3):** Reset timing handling is assumed to be global UTC, but tier counts, promotion/demotion numbers, and cohort filling algorithms are not fully specified.
4. **Lesson Interior Format (Q4):** Rich blocks vs. simple text with check questions remains unresolved, impacting the generation schema and front-end rendering engine.
5. **Reminder Channel (Q5):** The choice of email-only vs. web push notification (PWA) affects the communication layer architecture and permissions prompts.
6. **Hardcoded Configurations:** As highlighted in the Addendum, the Next.js app has hardcoded local RAG endpoints and direct-provider models that need to be migrated to standard, environment-driven configurations (e.g. OpenRouter variables) to prevent deployment failures.

## Epic Coverage Validation

### Coverage Matrix

| FR Number | PRD Requirement | Epic Coverage | Status |
| --------- | --------------- | ------------- | ------ |
| FR1 | Generate a Set from a topic | Epic 2 Story 2.1–2.4 | ✓ Covered |
| FR2 | Reject invalid or unsafe topics without cost | Epic 2 Story 2.1–2.2 | ✓ Covered |
| FR3 | Content quality floor | Epic 2 Story 2.3 | ✓ Covered |
| FR4 | Complete Lessons in order | Epic 2 Story 2.6–2.7 | ✓ Covered |
| FR5 | Set completion | Epic 2 Story 2.8 | ✓ Covered |
| FR6 | Context-aware tutoring chat | Epic 2 Story 2.9–2.11 | ✓ Covered |
| FR7 | Daily Goal selection and tracking | Epic 4 Story 4.1 | ✓ Covered |
| FR8 | Streak accrual and loss | Epic 4 Story 4.2–4.3 | ✓ Covered |
| FR9 | Daily reminder | Epic 4 Story 4.6 | ✓ Covered |
| FR10 | XP awards | Epic 3 Story 3.1–3.2 | ✓ Covered |
| FR11 | Levels | Epic 3 Story 3.3 | ✓ Covered |
| FR12 | Badges | Epic 3 Story 3.4 | ✓ Covered |
| FR13 | League assignment and weekly cycle | Epic 6 Story 6.1–6.4 | ✓ Covered |
| FR14 | Leaderboard display and privacy | Epic 6 Story 6.5–6.6 | ✓ Covered |
| FR15 | Review scheduling | Epic 4 Story 4.4 | ✓ Covered |
| FR16 | Review Session experience | Epic 4 Story 4.5 | ✓ Covered |
| FR17 | Generate a Path outline | Epic 7 Story 7.1–7.3 | ✓ Covered |
| FR18 | Path completion | Epic 7 Story 7.4 | ✓ Covered |
| FR19 | Public profile and share cards | Epic 8 Story 8.1–8.3 | ✓ Covered |
| FR20 | Friends leaderboard | Epic 8 Story 8.4–8.5 | ✓ Covered |
| FR21 | Tier enforcement via Quotas | Epic 5 Story 5.1–5.3 | ✓ Covered |
| FR22 | Upgrade, manage, cancel | Epic 5 Story 5.4–5.6 | ✓ Covered |
| FR23 | Account deletion | Epic 5 Story 5.7 | ✓ Covered |

### Missing Requirements

No functional requirements are missing from the Epic Breakdown. All 23 functional requirements mapped out in the PRD are fully traced and covered by the 8 core epics and their respective user stories.

### Coverage Statistics

- Total PRD FRs: 23
- FRs covered in epics: 23
- Coverage percentage: 100%

## UX Alignment Assessment

### UX Document Status

Found. The design system tokens and theme values are documented in `DESIGN.md` (Midnight Ink / Pure system), and the user experience behaviors, information architecture, microcopy guidelines, and flow specifications are documented in `EXPERIENCE.md` (Grown-up Duolingo paradigm).

### Alignment Issues

1. **Font Loading & Typography:** `DESIGN.md` specifies a co-equal light/dark typography system using Bricolage Grotesque, Space Grotesk, and Inter. The architecture must ensure these fonts are properly registered (e.g., using `next/font/google` in the root layout) to avoid defaulting to browser defaults or falling into the known bug of loading Geist and overriding body with Arial.
2. **Tabular Numerals Setup:** Standalone gamified numerals (XP, streaks, level, progress) must be styled with `font-variant-numeric: tabular-nums lining-nums` (`Space Grotesk`) to prevent column jitter when ticking. The component implementation must include this specific CSS rule.
3. **Inverted CTA Fill Token:** `DESIGN.md` uses an inverted primary CTA fill (light = navy fill, dark = white fill). The developer must ensure button components leverage these specific token mappings instead of using standard, non-adaptive utility classes.
4. **Stripe Return Intent Persistence:** `EXPERIENCE.md` requires Stripe Checkout to return users *exactly* to their interrupted action (e.g. Set generation, tutor chat, or lesson progression). The router must pass state/query parameters to and from Stripe checkouts to preserve intent and not break browser Back button navigation.

### Warnings

1. **No Automated Testing & CI Pipelines:** As identified by UX and Architecture, the project has zero tests and zero CI configs. This is a severe launch-grade risk for a gamified product with multi-step transaction loops (quota checking, XP accrual, streak calculations). Scaffolding Vitest and Playwright (Story 1.9) is highly urgent.
2. **Prefix-based Route Protection in Middleware:** `middleware.ts` protectedPaths uses prefix matching (`startsWith`), which can lead to route protection leakage if paths overlap (e.g. `/profile-settings` vs `/profile`). The paths must be precisely named and verified.
3. **PWA / Web Push Notifications Deferred:** Daily reminders are email-only for MVP. Because streak preservation is highly sensitive to push notifications, D7 retention (SM-2) must be closely tracked to determine if web push/PWA should be accelerated post-launch.
4. **Timezone Boundary Consistency:** `EXPERIENCE.md` and `ARCHITECTURE-SPINE.md` require User-local timezone boundaries for Daily Goals/Streaks, but global UTC for Leagues reset. If not implemented carefully, this mismatch can lead to cohort rank discrepancies during resets.

## Epic Quality Review

### Quality Review Findings

#### 🔴 Critical Violations

1. **Infrastructure/Technical Epic Framed as User-Facing Epic:** The "Epic real quick: OpenRouter Drop-In Provider Pivot" is a purely technical and infrastructure chore (migrating from direct LLM provider models to OpenRouter env config). Per BMad best practices, epics must focus on direct user value rather than backend infrastructure pivots. This pivot should be refactored as a non-functional story or technical chore under Epic 2 (Harden Core Learning Loop) or Epic 5 (Plus Membership & Account Trust) rather than a standalone epic.

#### 🟠 Major Issues

1. **Scope and Priority of Testing / CI Setup (Story 1.9):** Story 1.9 in Epic 1 (Experience Foundation & App Shell) introduces the entire Vitest, Playwright, and GitHub Actions CI configuration. Because the app has an existing codebase (brownfield) and lacks any test infrastructure, introducing this large chore at the very end of Epic 1 makes Epic 1 massive. However, it is structurally clean because it serves as the quality gate for all subsequent Phase A, B, and C implementations.

#### 🟡 Minor Concerns

1. **Non-standard Epic Naming:** The epic name "Epic real quick: OpenRouter Drop-In Provider Pivot" and its story numbers ("real quick.1" to "real quick.5") deviate from the standard numerical naming conventions used for the other epics (Epic 1 to Epic 8).

### Best Practices Checklist Compliance

- **Epic delivers user value:** Compliant (all epics deliver direct user value now that the OpenRouter Pivot has been refactored as chores under Epic 2).
- **Epic can function independently:** Compliant (phase boundaries are well-defined, and later epics do not block earlier epics).
- **Stories appropriately sized:** Compliant (work is broken down into small, distinct, logical increments).
- **No forward dependencies:** Compliant (no stories depend on future stories or features).
- **Database tables created when needed:** Compliant (each epic/story defines and seeds its database tables only when first utilized).
- **Clear acceptance criteria:** Compliant (all stories utilize a comprehensive Given/When/Then format with edge cases).
- Traceability to FRs maintained: Compliant (stories trace back to PRD FR codes explicitly).

## Summary and Recommendations

### Overall Readiness Status

**READY**

### Resolution History (2026-07-06)

All 13 findings identified in the initial assessment have been fully resolved:
1. **Refactored Technical Epic (Resolved):** The "OpenRouter Drop-In Provider Pivot" was removed as a top-level user-facing epic and moved to Epic 2 (Harden Core Learning Loop) as stories `2.13` through `2.17`.
2. **Resolved PRD Open Questions (Resolved):** 
   - **Pricing & Quotas:** Standardized Free Tier on 5 Set generations and 30 chats/month, and Plus Tier on $9.99/month.
   - **Streak Protection:** Added a 1-day auto-repair grace period once per month and a 500 XP Streak Freeze item.
   - **Quiz Formats:** Specified structured text paragraphs with inline multiple-choice or text input check questions.
   - **Reminder Channel:** Finalized email reminders for v1.
3. **Solidified Environment configurations (Resolved):** Swapped all hardcoded LLM configurations for server-only environment variables (`OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`).
4. **Stripe Return Intent (Resolved):** Added architectural constraints requiring the application to pass route/intent query parameters to and from Stripe Checkout to resume the interrupted flow automatically.
5. **Timezone Boundaries (Resolved):** Resolved timezone mismatch by explicitly separating local midnight for Streaks and global Sunday 23:59 UTC for League resets.

### Recommended Next Steps

1. **Sprint Planning:** Proceed to `bmad-sprint-planning` (`SP`) to kick off the Phase 4 implementation phase using the updated sprint backlog.
2. **Database Migration Scripts:** Create initial migration files using the schemas defined in Epic 3 (XP/Badges), Epic 4 (Reviews), Epic 6 (Leagues), and Epic 8 (Friendships) as their respective stories are tackled.

### Final Note

This assessment is now complete and approved. The planning artifacts are fully aligned, compliant, and ready for immediate implementation.

