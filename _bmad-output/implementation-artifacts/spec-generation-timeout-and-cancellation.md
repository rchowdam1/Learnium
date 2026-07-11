---
title: 'Generation timeout and cancellation'
type: 'bugfix'
created: '2026-07-11'
status: 'done'
route: 'one-shot'
---

# Generation timeout and cancellation

## Intent

**Problem:** A stalled OpenRouter response could leave set generation spinning indefinitely with no way to close the modal.

**Approach:** Bound the full provider/retry operation, propagate cancellation through the browser and server, and prevent cancelled or stale requests from persisting a set.

## Suggested Review Order

**Server lifecycle**

- Provider calls share one abortable generation budget across the retry path.
  [`route.ts:269`](../../../app/api/input-check/route.ts#L269)

- Cancellation is honored before every post-generation database side effect.
  [`route.ts:333`](../../../app/api/input-check/route.ts#L333)

**Modal lifecycle**

- Unmount, close, and duplicate-submit paths share one request controller.
  [`CreateSetModal.tsx:59`](../../../app/components/modals/CreateSetModal.tsx#L59)

- Stale and cancelled responses cannot create or close a reopened modal.
  [`CreateSetModal.tsx:255`](../../../app/components/modals/CreateSetModal.tsx#L255)

**Local routing**

- OpenRouter attribution now targets the active local application URL.
  [`.env.local:2`](../../../.env.local#L2)
