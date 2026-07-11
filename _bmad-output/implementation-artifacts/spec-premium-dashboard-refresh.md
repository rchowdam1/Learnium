---
title: 'Premium dashboard refresh'
type: 'refactor'
created: '2026-07-11'
status: 'done'
route: 'one-shot'
---

# Premium dashboard refresh

## Intent

**Problem:** The authenticated dashboard felt sparse and unfinished, overflowed horizontally, crowded the desktop header, and displayed `NaN%` for empty profiles.

**Approach:** Recompose the surface around a compact workspace introduction, discrete metrics, a stronger library hierarchy, and purposeful empty states while preserving existing data and creation flows.

## Suggested Review Order

**Dashboard composition**

- Entry point establishes the premium hierarchy, safe metrics, and resource-specific loading states.
  [`page.tsx:246`](../../../app/(app)/dashboard/page.tsx#L246)

- Empty states turn unused space into focused Nova-led onboarding.
  [`page.tsx:407`](../../../app/(app)/dashboard/page.tsx#L407)

**Responsive foundations**

- Cards now size to their grid instead of forcing horizontal overflow.
  [`SetCards.tsx:47`](../../../app/components/cards/SetCards.tsx#L47)

- Shared progress bars respect narrow card boundaries.
  [`Progress.tsx:13`](../../../app/components/misc/Progress.tsx#L13)

**Navigation clarity**

- Desktop navigation remains compact without losing accessible names.
  [`AppNav.tsx:82`](../../../app/components/nav/AppNav.tsx#L82)

- Status chrome keeps high-value signals visible without crowding the header.
  [`StatusChrome.tsx:57`](../../../app/components/nav/StatusChrome.tsx#L57)
