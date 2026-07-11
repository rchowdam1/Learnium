---
title: 'Integrated profile categories'
type: 'refactor'
created: '2026-07-11'
status: 'done'
route: 'one-shot'
---

# Integrated profile categories

## Intent

**Problem:** The narrow standalone categories card looked disconnected from the Profile page’s horizontal dashboard composition.

**Approach:** Integrate categories as a secondary row inside Progress overview, using honest data language and a normalized semantic category list.

## Suggested Review Order

- Category data is trimmed, deduplicated case-insensitively, and capped at three values.
  [`page.tsx:133`](../../../app/(app)/profile/page.tsx#L133)

- Integrated row aligns categories with the existing progress hierarchy.
  [`page.tsx:287`](../../../app/(app)/profile/page.tsx#L287)

- Semantic list and bounded pills prevent reconciliation and overflow issues.
  [`page.tsx:291`](../../../app/(app)/profile/page.tsx#L291)
