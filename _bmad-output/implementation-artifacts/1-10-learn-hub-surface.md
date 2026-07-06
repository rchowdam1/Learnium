---
baseline_commit: TODO-set-by-dev
---

# Story 1.10: Learn Hub Surface

Status: peer-review

## Story

As a learner,
I want a dedicated Learn tab to browse Sets and start new topics,
so that content creation and study have a clear home.

## Acceptance Criteria

1. Given authenticated user taps Learn in the 5-tab nav, when Learn hub loads at its dedicated route, then user sees their Sets list, create-new-topic CTA, and placeholder/active Path section (UX-DR10) and layout uses tokenized cards from Story 1.2.

2. Given user taps create new topic, when Create Set flow opens, then existing `CreateSetModal` / controller is integrated into Learn hub and successful generation navigates to `/sets/[setId]` per Story 2.4.

3. Given user has no Sets yet, when Learn hub renders, then first-run empty state with Nova voice encourages first topic (UX-DR14, UX-DR22) and CTA is ≥44px on mobile (NFR8).

4. Given Epic 7 Paths are not yet implemented, when Learn hub renders, then Path section shows disabled/coming-soon state without broken navigation and Epic 7.1 can replace placeholder without restructuring Learn hub.

## Tasks / Subtasks

- [x] Replace Learn tab stub with full page (AC: 1, 3)
  - [x] Replace `app/(app)/learn/page.tsx` stub with full Learn hub implementation.
  - [x] Fetch user's Sets via existing `/api/get-sets` endpoint.
  - [x] Display Sets as `Card` components in a responsive grid.
  - [x] Each Set card shows: title, description preview, progress indicator, category pill.

- [x] Create New Topic CTA (AC: 2)
  - [x] Import and integrate `CreateSetController` from `@/app/components/controllers/CreateSetController`.
  - [x] Import and integrate `CreateSetModal` from `@/app/components/modals/CreateSetModal`.
  - [x] On successful generation, navigate to `/sets/[setId]`.
  - [x] CTA button: `Button` variant="primary" with icon, ≥44px.

- [x] Empty state (AC: 3)
  - [x] When Sets array is empty, show friendly empty state.
  - [x] Nova voice copy: encouraging, warm, not condescending.
  - [x] Prominent CTA to create first topic.

- [x] Paths placeholder (AC: 4)
  - [x] Section labeled "Learning Paths" (or similar).
  - [x] Disabled state with "Coming soon" copy.
  - [x] Use `opacity-50 cursor-not-allowed` styling.
  - [x] Structure so Epic 7 can easily activate this section.

- [x] Responsive layout (AC: 1, 3)
  - [x] Set cards in responsive grid: 1 col mobile, 2 col tablet, 3 col desktop.
  - [x] All touch targets ≥44px.
  - [x] Uses `Card` component from Story 1.2.

- [x] Verification
  - [x] `npx eslint app/(app)/learn/ --ext .tsx --fix`
  - [x] `npm run build`
  - [x] `npx vitest run` (existing tests pass)

## Dev Notes

### Scope Boundaries

Replace the Learn tab stub with a functional page. Do NOT:
- Change Set generation logic (Epic 2)
- Implement Learning Paths (Epic 7)
- Change the `CreateSetModal` component behavior
- Add new API endpoints

### Existing Components to Use
- `CreateSetController` / `CreateSetModal` — already exist in `app/components/controllers/` and `app/components/modals/`
- `Card` — from `app/components/ui/Card`
- `Pill` — from `app/components/ui/Pill`
- `Button` — from `app/components/ui/Button`
- `ProgressBar` — from `app/components/ui/ProgressBar`
- `/api/get-sets` — existing endpoint returns user's sets

### Previous Story Intelligence
- Story 1.3 created the `/learn` stub page — replace it completely
- Story 1.2 built all the UI primitives needed here
- The existing `SetCards` component in `app/components/cards/` can be used as-is or wrapped
