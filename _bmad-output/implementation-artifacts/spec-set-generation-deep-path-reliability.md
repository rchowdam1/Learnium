---
title: 'Set generation deep-path reliability'
type: 'bugfix'
created: '2026-07-11'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'fe464494bbe50ad0798ce6592f06efbcf1e909d9'
context:
  - '{project-root}/_bmad-output/project-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A high-complexity learning set can appear stuck for several minutes and ultimately be cut off by the five-minute route limit. The current design may serialize up to 50 deep lesson writes, permits each provider call to run for five minutes, and exposes only simulated progress to the learner.

**Approach:** Make deep-path generation fit within the deployed request lifetime: apply short, bounded provider attempts; generate independent lesson batches concurrently at a safe fixed limit; preserve sequential planning; and surface real server phase/progress updates to the modal. A terminal failure must be explicit and retryable, never an indefinite spinner or partial persisted set.

## Boundaries & Constraints

**Always:** Keep the existing score-to-depth scale, high-effort hidden reasoning, optional research, 75% pass threshold, atomic graph persistence, quota behavior, and cancellation semantics. Use OpenRouter Chat Completions and the existing JSON/schema normalization flow. Never persist until every requested lesson and quiz has validated.

**Ask First:** Increasing the product’s maximum lesson count beyond 50, introducing durable background jobs, changing quota consumption, or weakening deep-path density/quiz requirements.

**Never:** Do not fabricate incomplete lessons/quizzes as a fallback, remove cancellation, or rely on a server timeout longer than the platform route limit.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Deep path | Score 9–10, 40–50 lessons | Progress advances with completed/total lesson count; total request completes within route budget when provider responses are healthy | Fail explicitly if bounded budget is exceeded; no DB graph write |
| Slow provider | A content call exceeds per-call allowance | Abort just that attempt and return a retryable provider/generation timeout | Modal stops loading and shows actionable failure |
| Client cancel | User closes modal during generation | Browser abort propagates; server stops work and writes nothing | No stale success callback or toast |
| Content failure | One batch fails schema/JSON repair | Entire set fails before persistence | Existing set quota is not consumed |

</frozen-after-approval>

## Code Map

- `lib/sets/openrouter-client.ts` -- shared OpenRouter JSON request construction, timeout, parsing, and repair behavior.
- `lib/sets/generate-content.ts` -- batch scheduling, progress callbacks, and output assembly for planned lessons.
- `lib/sets/generate-set.ts` -- phase orchestration connecting server-visible progress with generation work.
- `app/api/input-check/route.ts` -- route budget, authenticated orchestration, and streamed progress response.
- `app/components/modals/CreateSetModal.tsx` -- modal request lifecycle and learner-visible progress/error state.
- `tests/smoke/` -- focused regression coverage for batch concurrency/progress and abort behavior where test seams permit.

## Tasks & Acceptance

**Execution:**
- [x] `lib/sets/openrouter-client.ts` -- impose a per-call timeout that composes with the request abort signal, including JSON-repair calls, so no single provider request consumes the full route window.
- [x] `lib/sets/generate-content.ts` -- replace unbounded sequential deep-batch execution with cancellation-aware, concurrency-limited scheduling; retain deterministic final lesson order and report completed/total progress after each batch.
- [x] `lib/sets/generate-set.ts` and `app/api/input-check/route.ts` -- enforce a route-safe generation budget and retain detailed server phase logging; transport remains the existing final JSON envelope.
- [x] `app/components/modals/CreateSetModal.tsx` -- retain cancellation/stale-response protections and communicate that deep lessons are generated in parallel.
- [x] `tests/smoke/` -- run the existing regression suite plus strict type, lint, and production-build checks.

**Acceptance Criteria:**
- Given a 50-lesson deep path with provider calls that complete within the configured per-call limit, when the user creates the set, then bounded parallel generation completes without exceeding the API route duration and saves exactly the planned lesson/quiz count in plan order.
- Given a provider request that exceeds its allowance or returns unrecoverable invalid JSON, when generation runs, then the request returns a retryable terminal error, the modal exits loading, and no graph/quota mutation occurs.
- Given generation is in progress, when a lesson batch completes, then the modal announces the actual generation phase and completed lesson count rather than only cycling timed copy.
- Given the user closes the modal during generation, when the abort reaches any in-flight or queued batch, then remaining work is not started, no set is persisted, and reopening the modal cannot be affected by the old request.

## Spec Change Log

- Review found that up-to-50-lesson paths cannot be guaranteed inside one request. The user authorized a Supabase durable background job. KEEP: bounded provider calls, deterministic lesson order, atomic quota persistence, real progress, and cancellation.

## Design Notes

The route’s `maxDuration = 300` is the outer constraint. A small concurrency cap is preferable to 50 concurrent calls: it reduces expected wall time while respecting provider capacity and avoiding a thundering herd. The content assembler must index results by planned batch, not completion order, so concurrent completion cannot rearrange the curriculum.

## Verification

**Commands:**
- `npm run lint` -- expected: no lint errors.
- `npx tsc --noEmit` -- expected: strict type check passes.
- `npm test` -- expected: smoke suite passes, including new scheduling/cancellation coverage.
- `npm run build` -- expected: production build completes.

## Suggested Review Order

**Request and job lifecycle**

- Authenticated enqueue returns immediately and deduplicates concurrent submissions.
  [`route.ts:22`](../../app/api/input-check/route.ts#L22)

- Cancellation confirms an active owned row actually changed.
  [`route.ts:211`](../../app/api/input-check/route.ts#L211)

**Durable worker**

- Verified service-role invocation gates privileged worker execution.
  [`index.ts:24`](../../supabase/functions/generate-set-job/index.ts#L24)

- Background orchestration validates every batch and persists progress monotonically.
  [`index.ts:478`](../../supabase/functions/generate-set-job/index.ts#L478)

- Supabase runtime starts work after returning the enqueue acknowledgment.
  [`index.ts:637`](../../supabase/functions/generate-set-job/index.ts#L637)

**Database safety**

- Stale claims are recoverable while active claims remain exclusive.
  [`20260711213559_finalize_generation_job_state.sql:3`](../../supabase/migrations/20260711213559_finalize_generation_job_state.sql#L3)

- Graph, metadata, quota, and successful job state commit atomically.
  [`20260711214156_fix_atomic_objectives_jsonb.sql:1`](../../supabase/migrations/20260711214156_fix_atomic_objectives_jsonb.sql#L1)

- Browser inserts are restricted to pristine queued jobs; worker RPCs remain service-only.
  [`20260711213736_restrict_generation_job_clients.sql:1`](../../supabase/migrations/20260711213736_restrict_generation_job_clients.sql#L1)

**Progress UI**

- Single-flight polling renders real phase and lesson progress.
  [`CreateSetModal.tsx:173`](../../app/components/modals/CreateSetModal.tsx#L173)

- Accessible live status and confirmed cancellation replace simulated phases.
  [`CreateSetModal.tsx:440`](../../app/components/modals/CreateSetModal.tsx#L440)
