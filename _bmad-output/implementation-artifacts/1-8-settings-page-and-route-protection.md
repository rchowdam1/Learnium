---
baseline_commit: TODO-set-by-dev
---

# Story 1.8: Settings Page and Route Protection

Status: ready-for-review

## Story

As a learner,
I want a dedicated settings area and reliable route protection,
so that my account preferences and app sections are secure and discoverable.

## Acceptance Criteria

1. Given authenticated users navigate to `/settings`, when the settings page loads, then it renders inside the app layout shell with sections for Account, Daily Goal (read/edit tier), Reminders (placeholder), Theme (placeholder), and League participation (placeholder) (UX-DR10) and uses tokenized components from Story 1.2.

2. Given `middleware.ts` is the single auth gate (Architecture AD-2), when this story ships, then `protectedPaths` includes `/dashboard`, `/sets`, `/profile`, `/subscriptions`, `/buddy`, `/review`, `/leagues`, `/paths`, `/settings`, `/onboarding` and prefix matching is documented in code comments to prevent accidental over-matching.

3. Given an unauthenticated request to any protected path, when middleware runs, then the user is redirected to `/login` with return URL preserved where safe and no protected page HTML is served.

4. Given settings placeholders for future epics, when reminder, league opt-out, or theme controls are not yet implemented, then controls render as disabled with helper copy explaining availability and no broken mutations are exposed.

## Tasks / Subtasks

- [x] Create `/settings` route (AC: 1)
  - [x] Create `app/(app)/settings/page.tsx` with sections layout.
  - [x] Use `Card` component for section containers.
  - [x] Use `Button` and `Input` components where appropriate.

- [x] Account section (AC: 1)
  - [x] Display user email (read-only).
  - [x] Display account creation date or membership info.
  - [x] Sign-out button (reuse existing signOut logic).
  - [x] Link to subscription management (`/subscriptions`).

- [x] Daily Goal section (AC: 1)
  - [x] Read current `daily_goal_tier` from profile.
  - [x] Show current tier with option to change (Casual/Regular/Serious).
  - [x] Use same tier selection pattern from onboarding (Story 1.7).

- [x] Placeholder sections (AC: 4)
  - [x] Reminders: disabled toggle with "Coming soon" copy.
  - [x] Theme: disabled toggle or select with "Auto (follows system)" copy.
  - [x] League participation: disabled with "Coming in a future update" copy.
  - [x] All disabled controls use `opacity-50 cursor-not-allowed` and are not interactive.

- [x] Route protection audit (AC: 2)
  - [x] Verify `protectedPaths` includes all app routes.
  - [x] Add `/settings` and `/onboarding` if not already present.
  - [x] Add code comment warning about prefix matching behavior.

- [x] Verification
  - [x] `npx eslint app/(app)/settings/ --ext .tsx --fix`
  - [x] `npm run build`
  - [x] Test: unauthenticated visit to `/settings` → redirect to `/login`
  - [x] Test: authenticated visit → settings page loads

## Dev Notes

### Scope Boundaries

Create settings page shell. Do NOT:
- Implement theme switching (just placeholder)
- Implement email reminders (Epic 4)
- Implement league opt-out (Epic 6)
- Change Stripe/subscription pages

### Previous Story Intelligence

- Story 1.7 created onboarding with tier selection — reuse the same pattern
- Story 1.6 added `/onboarding` to middleware — ensure `/settings` is also protected
- The `daily_goal_tier` column is populated by onboarding (1.7) — read it here
