---
title: 'Premium profile refresh'
type: 'refactor'
created: '2026-07-11'
status: 'done'
route: 'one-shot'
---

# Premium profile refresh

## Intent

**Problem:** The profile page scattered identity, progress, statistics, and completed learning across disconnected cards while treating valid zero values as missing data.

**Approach:** Recompose the page into a premium identity header, stable metric row, focused progress panels, and an accessible learning-history disclosure with honest error and empty states.

## Suggested Review Order

**Profile composition**

- Entry point normalizes API data and distinguishes failures from empty profiles.
  [`page.tsx:118`](../../../app/(app)/profile/page.tsx#L118)

- Identity header and metric row establish the primary information hierarchy.
  [`page.tsx:227`](../../../app/(app)/profile/page.tsx#L227)

- Progress and categories use balanced panels without misleading quota visualization.
  [`page.tsx:256`](../../../app/(app)/profile/page.tsx#L256)

**Learning history**

- Completed-set actions now navigate for both Pro and Free users.
  [`page.tsx:36`](../../../app/(app)/profile/page.tsx#L36)

- Disclosure remains semantically connected while collapsed.
  [`page.tsx:301`](../../../app/(app)/profile/page.tsx#L301)

**Accessibility support**

- Shared progress bars now expose normalized values to assistive technology.
  [`Progress.tsx:18`](../../../app/components/misc/Progress.tsx#L18)
