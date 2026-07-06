---
baseline_commit: a3a84055adb9a09e9eea3d7c9a9a8991612796cd
---

# Story 1.4: Persistent Chrome with Status Slots

Status: ready-for-dev

## Story

As a learner,
I want XP, streak, daily goal, and quota status always visible in the app chrome,
so that I always know where I stand without hunting through menus.

## Acceptance Criteria

1. Given the persistent chrome defined in UX-DR9, when an authenticated user views any tabbed app page, then the chrome displays slots for XP pill, streak flame, daily-goal progress, and quota remaining, and slots are present on both mobile bottom-bar layout and desktop top-bar layout.

2. Given reward systems are not yet implemented (Epics 3–5), when chrome data APIs return zero or placeholder values, then chrome renders gracefully with zero-state copy (e.g. "0 XP", "— streak", "Goal: —", "Sets: —") and no runtime errors occur from missing backend fields.

3. Given profile/quota read endpoints exist or are stubbed, when chrome mounts, then it fetches committed server state via a single read API or server component, and chrome does not mutate XP, streak, or quota client-side.

4. Given a screen reader user navigates the app, when gamified indicators are present in chrome, then XP, streak, level, and quota elements have meaningful aria labels (NFR10, UX-DR20).

## Tasks / Subtasks

- [x] Create `StatusChrome` component (AC: 1, 2, 3, 4)
  - [x] Create `app/components/nav/StatusChrome.tsx` with named export.
  - [x] Four status slots: XP pill (numeral typography), streak flame icon (amber), daily-goal progress (muted lime), quota remaining (Sets: N left).
  - [x] Each slot uses tokenized styling from Story 1.2 primitives where applicable.
  - [x] Desktop: horizontal row in the `#chrome-slot` div already present in AppNav's `<header>`.
  - [x] Mobile: inline in the bottom bar area, or collapsed into a minimal single row above the tab bar. Use `hidden md:flex` / `flex md:hidden` patterns to show appropriate layout.
  - [x] All gamified indicators have meaningful `aria-label` attributes (e.g. `aria-label="0 XP"`, `aria-label="No streak"`, `aria-label="Daily goal not set"`).

- [x] Integrate StatusChrome into AppNav (AC: 1)
  - [x] Import and render `<StatusChrome />` in `app/components/nav/AppNav.tsx`.
  - [x] Desktop: render inside the existing `<div id="chrome-slot">` in the `<header>`.
  - [x] Mobile: render above or integrated into the fixed bottom nav bar.

- [x] Zero-state data handling (AC: 2)
  - [x] All four slots accept optional props or fetch data with graceful fallbacks.
  - [x] If data is null/undefined/zero, render placeholder text matching the AC-2 examples.
  - [x] No runtime errors from undefined properties — use optional chaining and defaults.

- [x] Fetch committed server state (AC: 3)
  - [x] Use existing `/api/get-profile-data` endpoint (already returns profile data) to fetch XP, streak, level, daily_goal_tier.
  - [x] Use existing `/api/get-subscription-status` for quota remaining.
  - [x] Fetch via a single `useEffect` with `Promise.all` or similar pattern — avoid cascading waterfalls.
  - [x] Chrome is read-only: no mutations to XP, streak, or quota happen from the component.

- [x] Accessibility annotations (AC: 4)
  - [x] XP pill: `aria-label` with current XP value.
  - [x] Streak flame: `aria-label` with current streak count and icon hidden via `aria-hidden="true"`.
  - [x] Daily goal: `aria-label` describing goal tier and progress.
  - [x] Quota: `aria-label` with remaining sets count.

- [x] Verification
  - [x] Run `npx eslint app/components/nav/ --ext .tsx --fix`
  - [x] Run `npm run build` (or `npx next build`) to verify compilation
  - [x] Manually verify chrome renders on `/dashboard`, `/learn`, `/review`, `/leagues`, `/profile`

## Dev Notes

### Scope Boundaries

This story adds read-only status indicators to the app chrome created in Story 1.3. It does NOT:
- Implement XP/streak/level/goal reward logic (Epic 3–4)
- Change the quota system (Epic 5)
- Modify the middleware or auth gate
- Add new API endpoints — uses existing `/api/get-profile-data` and `/api/get-subscription-status`

### Architecture Notes

- The `#chrome-slot` div already exists in `AppNav.tsx` (line 98) — render StatusChrome inside it for desktop.
- Mobile: the bottom bar has limited space. Consider a narrow strip above the tab bar showing just XP + streak, or a collapsed pill that expands on tap.
- StatusChrome should be a client component (`"use client"`) since it fetches data.

### Data Sources

- `/api/get-profile-data`: returns profile object with `xp`, `streak`, `level`, `daily_goal_tier` fields (verify actual response shape).
- `/api/get-subscription-status`: returns `sets_remaining` or similar quota info.
- Both endpoints require authentication — they work inside the (app) route group protected by middleware.

### Design Tokens

- XP pill: use `Pill` variant="xp" from Story 1.2
- Streak flame: `text-amber` (amber reserved for streaks per UX-DR7), use lucide-react `Flame` icon
- Daily goal: `bg-accent-progress` (muted lime for always-on progress)
- Quota: simple text with `text-numeral` typography

### Previous Story Intelligence

- Story 1.3 already fixed the `(app/)` → `(app)` route group issue. Build on the correct layout.
- AppNav currently has a `welcome {username}` placeholder — StatusChrome should augment, not replace, the chrome slot.
- The `fill` prop on lucide-react icons was flagged in 1.3 review — avoid using `fill` on lucide icons; use CSS classes for fill color instead.
