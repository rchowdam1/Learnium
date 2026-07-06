---
baseline_commit: TODO-set-by-dev
---

# Story 1.7: Onboarding Flow Routing

Status: done

## Story

As a new learner,
I want a short onboarding after signup,
so that Learnium feels personalized before I reach the dashboard.

## Acceptance Criteria

1. Given a user completes signup or first OAuth login without an onboarding-complete flag, when auth callback finishes, then the user is routed to onboarding instead of directly to `/dashboard` and returning users with onboarding complete skip onboarding.

2. Given onboarding step 1 (topic interest), when the user submits a topic or selects a starter interest, then the choice is persisted on the profile or onboarding record and the user advances to step 2 without losing input on transient network error.

3. Given onboarding step 2 (daily goal tier — shell only), when the user selects a preset tier (Casual / Regular / Serious), then the selection is persisted to the profile (`daily_goal_tier` or equivalent column added in this story) and full daily-goal XP logic is deferred to Epic 4 but the stored tier is readable by downstream epics.

4. Given onboarding completes, when the user taps Continue, then they land on `/dashboard` with onboarding-complete flag set and they can change daily goal tier later from Settings (Story 1.8).

5. Given onboarding UI requirements, when steps render on mobile, then layouts follow onboarding mockups as layout reference with token-accurate styling (UX-DR10, UX-DR21) and all controls meet 44px minimum touch targets (NFR8).

## Tasks / Subtasks

- [x] Create `/onboarding` route (AC: 1)
  - [x] Create `app/(app)/onboarding/page.tsx` — multi-step onboarding flow.
  - [x] Add `/onboarding` to `middleware.ts` `protectedPaths`.
  - [x] Read `daily_goal_tier` from profile to detect if onboarding is already complete.

- [x] Step 1: Topic Interest (AC: 2, 5)
  - [x] UI: text input or pre-set topic chips (e.g., "Science", "History", "Technology", "Business").
  - [x] Use `Input` and `Pill` components from Story 1.2.
  - [x] Persist selected topic to profile (e.g. `onboarding_topic` column or equivalent).
  - [x] Handle transient network errors gracefully — retain user input.

- [x] Step 2: Daily Goal Tier (AC: 3, 5)
  - [x] Three preset tiers: Casual, Regular, Serious (specific XP values deferred to Epic 4).
  - [x] Use `Button` or `Card` components for tier selection.
  - [x] Persist `daily_goal_tier` to profile on selection.
  - [x] Use `Button` variant="progress" for the Continue/Complete action.

- [x] Completion step (AC: 4)
  - [x] Set `onboarding_complete` flag on profile (or rely on `daily_goal_tier` being set).
  - [x] Show success message with Nova voice — celebratory but not over-the-top.
  - [x] "Continue" button routes to `/dashboard`.

- [x] Mobile responsiveness (AC: 5)
  - [x] All touch targets ≥44px (`min-h-11`).
  - [x] Single-column layout on mobile.
  - [x] Token-accurate styling using design tokens from Story 1.1.

- [x] API endpoint (AC: 2, 3)
  - [x] Create `app/api/save-onboarding/route.ts` — accepts `{ topic: string, daily_goal_tier: string }`.
  - [x] Updates profile with onboarding data.
  - [x] Returns `{ success: true }` on success.

- [x] Verification
  - [x] `npx eslint app/(app)/onboarding/ app/api/save-onboarding/ --ext .tsx,.ts --fix`
  - [x] `npm run build`
  - [x] Verify middleware protects `/onboarding`

## Dev Notes

### Scope Boundaries

Create onboarding flow shell. Do NOT:
- Implement full daily-goal XP calculation (Epic 4)
- Implement Set generation from onboarding topic
- Change the existing auth routing logic (already updated in Story 1.6)
- Create complex animations

### Design Tokens

- Use `Button` variants: primary for navigation, progress for Continue/Complete
- Use `Card` for tier selection cards
- Use `Input` for topic text input
- Typography: `text-display` for headings, `text-body` for instructions

### Previous Story Intelligence

- Story 1.6 already routes new users to `/onboarding` when `daily_goal_tier` is not set
- Story 1.3 created the `(app)` route group — place onboarding inside it
- The `StatusChrome` from Story 1.4 renders in AppNav — onboarding pages get the shared shell automatically
