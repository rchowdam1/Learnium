# Technology Currency And Deploy-Fit Review

Reviewer: subagent 3
Date: 2026-07-05
Scope: `_bmad-output/planning-artifacts/architecture/architecture-Learnium-2026-07-05/ARCHITECTURE-SPINE.md`

## Verdict

PASS WITH CAVEATS.

The architecture spine correctly identifies the local stack, verifies major current-version gaps, and defers the right launch-hardening decisions for RAG hosting, Python dependency pinning, Stripe webhook/API-version design, and Next/React upgrade assessment. I do not see a stale technology choice that is asserted as launch-ready without a matching invariant or Deferred entry.

The main caveat is wording: several rows say "pinned locally" even though `package.json` uses caret ranges for most packages and dependencies are not installed in this workspace. Treat those as manifest baselines plus lockfile-resolved versions, not hard pins except where exact versions are declared.

## Findings

### Medium: "Pinned locally" overstates several JavaScript package constraints

Evidence:
- Spine stack rows say "pinned locally" for Supabase SSR, Supabase JS, Stripe Node, Tailwind CSS, and the OpenAI-compatible JS client at `ARCHITECTURE-SPINE.md:157-161`.
- `package.json` uses exact versions only for `next` and `eslint-config-next`; React, Supabase, Stripe, Tailwind, the OpenAI-compatible client, and most others use caret ranges.
- `npm ls ... --depth=0` returned an empty tree, so there is no installed `node_modules` state to verify at runtime in this workspace.

Impact:
- The architecture correctly captures the intended local baseline, but "pinned" may mislead implementers into assuming deterministic installs without relying on `package-lock.json` or a package-manager policy.

Recommendation:
- No architecture-spine edit is required for gate approval if the team treats this as a wording caveat. If revised later, prefer "manifest baseline / lockfile-resolved locally" except for exact package versions.

### Medium: Deploy-fit is properly deferred, not currently satisfied

Evidence:
- Spine asserts the target invariant: Next calls RAG through `RAG_SERVICE_URL` at `ARCHITECTURE-SPINE.md:105`.
- Current code still calls `http://localhost:8000/api/chat` in `app/api/send-chat/route.ts:59`.
- Spine defers "RAG production host and vector/cache managed services" at `ARCHITECTURE-SPINE.md:237`.
- Current RAG Chroma store persists to local `./chroma_db` in `rag/main.py:71`.
- Vercel supports Python ASGI/WSGI and FastAPI functions, but the Python runtime is Beta and production persistence must be externalized.

Impact:
- Vercel is a plausible host for the Next.js app and possibly the FastAPI sidecar, but the current repo is not production-deployable as-is because service URL, vector persistence, and cache hosting are not fully configured.

Recommendation:
- Keep this deferred until deploy hardening selects RAG topology, vector persistence, cache provider, environment variables, and Python runtime/version policy.

### Low: Python RAG dependency and integration caveats are correctly deferred

Evidence:
- Spine Python RAG row names FastAPI, LangChain, Chroma, OpenRouter/OpenAI-compatible clients, Pydantic, and Redis LangCache pattern at `ARCHITECTURE-SPINE.md:162`.
- `rag/requirements.txt` is unpinned and omits `langcache`, while `rag/scache.py:2` imports it.
- Current PyPI baselines checked: `langcache` 0.13.0, `langchain-chroma` 1.1.0, `chromadb` 1.5.9, Python `openai` 2.44.0.
- LangChain's current Chroma docs install/use the dedicated `langchain-chroma` integration package; current code imports `Chroma` from `langchain_community.vectorstores`.
- Spine explicitly defers Python dependency pinning, missing `langcache`, and model env config at `ARCHITECTURE-SPINE.md:240`.

Impact:
- This is not a spine defect because the risk is named and deferred. It should remain a launch-hardening blocker, not an implementation assumption.

Recommendation:
- Before deploy, pin RAG dependencies, add `langcache`, decide whether to migrate to `langchain-chroma`, and move hardcoded `gpt-4` from `rag/main.py:52` into environment configuration.

### Low: Stripe authority is correctly modeled, implementation details remain deferred

Evidence:
- Spine makes Stripe webhook-confirmed state authoritative at `ARCHITECTURE-SPINE.md:91-94`.
- Stack row records Stripe Node `18.4.0` vs current npm `22.3.0` at `ARCHITECTURE-SPINE.md:159`.
- Stripe's v18 migration guide ties v18 to API version `2025-03-31.basil`, and newer Stripe SDKs are available.
- Current webhook handler has the raw body/signature shape but does not yet process event types and currently references `NextRequest` without importing it at `app/api/webhook/route.ts:6`.
- Spine defers Stripe event matrix and API version pinning at `ARCHITECTURE-SPINE.md:241`.

Impact:
- No stale/asserted billing tech call in the spine. The architecture states the correct source of truth and defers the implementation details that are still open.

Recommendation:
- Keep event matrix, webhook idempotency, subscription state mapping, and API version pinning as billing-design follow-up.

## Verified Tech Calls

- Next.js: local manifest uses `15.3.3`; current official docs/npm show `16.2.10`. Spine records both and defers Next 16 upgrade.
- React: local manifest uses `^19.0.0`; current npm/React release line is `19.2.7`. Spine records both and defers upgrade.
- Supabase SSR/JS: `@supabase/ssr` browser/server split matches current Supabase SSR guidance. Env convention correctly says browser-exposed values should use `NEXT_PUBLIC_*`.
- Tailwind/PostCSS: current repo uses `@tailwindcss/postcss` and `@import "tailwindcss"`, matching Tailwind v4 PostCSS guidance.
- Stripe: stack version lag and webhook authority are identified; implementation details are deferred.
- RAG: LangChain/OpenRouter compatibility/Chroma/LangCache risks are not asserted as production-ready; they are deferred.
- Vercel: suitable for the Next.js app; FastAPI is plausible on Vercel Python runtime, but production RAG persistence/topology is correctly deferred.

## Sources Checked

- Local files: `ARCHITECTURE-SPINE.md`, `package.json`, `rag/requirements.txt`, `app/api/send-chat/route.ts`, `rag/main.py`, `rag/scache.py`, `lib/server.ts`, `lib/supabase.ts`, `postcss.config.mjs`, `app/globals.css`, `app/api/webhook/route.ts`.
- Registry checks: `npm view next/react/@supabase/ssr/@supabase/supabase-js/stripe/tailwindcss/@tailwindcss/postcss/openai version`; `pip index versions langcache/langchain-chroma/chromadb/openai`.
- Primary/current docs:
  - Next.js docs: https://nextjs.org/docs
  - React npm/package and React 19.2 release: https://www.npmjs.com/package/react, https://react.dev/blog/2025/10/01/react-19-2
  - Supabase SSR client docs: https://supabase.com/docs/guides/auth/server-side/creating-a-client
  - Tailwind PostCSS install docs: https://tailwindcss.com/docs/installation/using-postcss
  - Stripe SDK docs and stripe-node v18 migration guide: https://docs.stripe.com/sdks, https://github.com/stripe/stripe-node/wiki/Migration-guide-for-v18
  - Vercel Python/FastAPI docs: https://vercel.com/docs/functions/runtimes/python, https://vercel.com/docs/frameworks/backend/fastapi
  - LangChain Chroma docs: https://docs.langchain.com/oss/python/integrations/vectorstores/chroma
