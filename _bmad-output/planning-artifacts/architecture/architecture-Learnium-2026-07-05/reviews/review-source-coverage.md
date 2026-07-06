---
review: source-coverage
target: ../ARCHITECTURE-SPINE.md
status: complete
reviewed: 2026-07-05
reviewer: subagent-1
sources:
  - ../../../prds/prd-Learnium-2026-07-05/prd.md
  - ../../../prds/prd-Learnium-2026-07-05/addendum.md
  - ../../../../../EXPERIENCE.md
  - ../../../../../DESIGN.md
  - ../../../ux-designs/ux-Learnium-2026-07-05/google-stitch-handoff.md
  - ../../../ux-designs/ux-Learnium-2026-07-05/reconcile-stitch-mockups.md
  - ../../../ux-designs/ux-Learnium-2026-07-05/review-accessibility.md
  - ../../../ux-designs/ux-Learnium-2026-07-05/review-design-coherence.md
  - ../../../ux-designs/ux-Learnium-2026-07-05/review-voice.md
---

# Source Coverage Review - Learnium Architecture Spine

## Verdict

**Conditional pass with required source-coverage fixes.**

The architecture spine captures most load-bearing product inputs: server-authoritative progress/rewards, quota transaction ordering, generated-content validation, RAG/cache boundary, Stripe webhook authority, social privacy projection, zero-quota Reviews, scheduled work, ownership checks, canonical chat path, and generated-content atomicity. Those are the right architectural invariants for the PRD and addendum.

The main gaps are not broad omissions of feature areas. They are missing or weakened source constraints that should be architectural, not left only to UX copy or implementation memory: the pre-account 16+ age gate, third-party model data-use privacy, exact checkout return-to-intent/back-history preservation, and user-local day-boundary semantics for daily goals/streaks.

## Findings

| Severity | Location | Source requirement | Finding | Required action |
| --- | --- | --- | --- | --- |
| **HIGH** | `ARCHITECTURE-SPINE.md` AD-2/Auth and route protection, capability map FR-21..FR-23 | `EXPERIENCE.md:21` requires **Age gate: 16+ enforced at signup, before any account exists**; PRD privacy requires minimum age 16 (`prd.md:293`). | The spine covers authenticated route protection and ownership, but does not bind the **pre-account signup gate**. This is a distinct architectural boundary because Supabase signup can create an account before profile creation unless the app gates DOB/age verification before calling auth. | Add an invariant for signup/account creation: no Supabase auth user/profile/session is created until 16+ eligibility is verified; age-gate errors are handled without account side effects; store only the minimum age-verification data needed. |
| **HIGH** | `ARCHITECTURE-SPINE.md` AD-6/RAG, AD-10/deploy config, AD-8/privacy projection | PRD privacy states chat logs and learning history are personal data and are **never used to train third-party models** (`prd.md:293`). | The spine protects social/public projections and secret handling, but does not carry the provider data-use constraint into the RAG/LLM architecture. Given OpenRouter/RAG are core dependencies, this needs an explicit provider-policy invariant, not just a product promise. | Add a privacy/data-processing rule for LLM providers: user learning history, chats, uploads, and generated content are sent only under provider settings/contracts that prohibit training use; logs/redaction/retention are bounded; no raw private data is emitted to analytics or public traces. |
| **MED** | `ARCHITECTURE-SPINE.md` AD-7/Stripe source of truth | PRD says users return to their interrupted action after checkout (`prd.md:268`); UX requires landing **exactly** where they were and preserving Back history (`EXPERIENCE.md:223`, `EXPERIENCE.md:142`). | AD-7 says checkout return flows "may resume interrupted intent," which weakens a source-level must. It also does not state the durable intent/continuation mechanism needed to survive Stripe round trips, failures, webhook delay, and browser Back. | Strengthen AD-7 or add a checkout-continuation invariant: blocked action intent is persisted server-side with owner, action type, target, expiry, and idempotency key; checkout success/failure returns to that intent without consuming quota twice or replacing browser history incorrectly. |
| **MED** | `ARCHITECTURE-SPINE.md` AD-4/Scheduled work, Deferred table | Daily goals/streaks use user-local midnight (`prd.md:150`, `EXPERIENCE.md:112`); league reset likely global UTC per addendum (`addendum.md:23`). | The spine has scheduled-work authority and defers league reset details, but does not explicitly separate **user-local daily boundaries** from **global league cycle boundaries**. This is important because streak events, review reminders, daily XP ledgers, quota visibility, and league weekly XP ledgers use different time semantics. | Add a time-boundary convention: store user timezone; daily goal/streak ledger keys are computed by user-local date; league cycles use the chosen global reset; quota monthly resets use billing/profile anniversary semantics. |
| **LOW** | `ARCHITECTURE-SPINE.md` Consistency Conventions / Accessibility | UX accessibility floor includes skip links/landmarks, focus-not-obscured for sticky nav, keyboard navigation through lesson paths/leaderboards/quiz/chat, no `alert()`, reduced motion, age-gate/GDPR accessible flows (`EXPERIENCE.md:147`-`157`). | The spine compresses accessibility to one broad row. That may be enough for a spine, but some source constraints are structural and shared-component relevant, especially persistent nav focus offsets and real-control navigation patterns for lesson nodes. | Optionally expand the accessibility convention to name persistent-chrome focus protection, real button/anchor path nodes, and shared `aria-live` feedback/toast infrastructure. This can also live in implementation stories if architecture wants to stay thin. |

## Coverage Strengths

- **Quota/cost controls are well covered.** AD-3 and AD-15 preserve check-before-spend, decrement-after-success, and generated-content atomicity from PRD FR-1/FR-2/FR-6/FR-21 and the addendum.
- **Reward/progress integrity is well covered.** AD-4 correctly makes XP, streak, badges, Review completion, and League XP server-owned idempotent events, matching PRD FR-4/FR-5/FR-8/FR-10/FR-12 and UX component rules.
- **Review Sessions are correctly protected as zero-quota.** AD-9 captures persisted question banks and no generation/chat quota spend, matching PRD FR-15/FR-16 and addendum question-sourcing guidance.
- **Generated-content quality is materially covered.** AD-5 and AD-15 capture schema validation, quality/language/safety checks, reportable Lesson identity, AI disclosure, and no partial persisted courses.
- **Existing implementation hardening is well represented.** AD-10 covers env-configured RAG URL and service-role isolation; Deferred covers test/CI, dependency pinning, RAG hosting, and Stripe event details.
- **Social/privacy projection is aligned for public surfaces.** AD-8 limits public/leagues/friends data to the PRD-approved fields and covers League opt-out behavior.

## Non-Issues / Acceptable Deferrals

- Exact Free/Plus quotas, pricing, fair-use caps, streak-protection mechanic, league tier counts, Review algorithm, reminder channel, and upgrade to newer framework/library versions are appropriately deferred because product or implementation detail remains open.
- The architecture does not need to restate the full visual token system. DESIGN.md remains the visual source of truth. The accessibility row is the only area where the visual/behavioral source creates structural implementation obligations.
- README.md is stock Next.js and does not add useful product constraints; its lack of coverage in the spine is not a defect.
