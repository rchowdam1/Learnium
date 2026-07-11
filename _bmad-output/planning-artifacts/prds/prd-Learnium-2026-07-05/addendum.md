# Learnium PRD Addendum

_Depth that belongs downstream (architecture, UX, solution design) — not part of the PRD's requirements surface._

## Amendment 2026-07-11 — Study Buddy ingest + pgvector

The Python/FastAPI RAG microservice notes below are **historical**. Live Study Buddy path:

- Browser multipart upload → `/api/create-buddy` → `lib/ingest/` (multi-type extract, chunk, local 384-d feature-hash embeddings) → Supabase `document_chunks` (pgvector + FTS, RLS).
- Chat → `/api/send-chat` → hybrid retrieval RPCs → OpenRouter.
- All OpenRouter model env vars (`OPENROUTER_MODEL`, `OPENROUTER_VISION_MODEL`, `OPENROUTER_AUDIO_MODEL`, `OPENROUTER_TRANSCRIPTION_MODEL`) use the free multimodal slug `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`. Embeddings remain local 384-d feature-hash (not OpenRouter).
- `RAG_SERVICE_URL` / Chroma / LangCache are **not** required for create-buddy or chat. See `rag/README.md` (deprecated).

## Existing implementation notes (for architecture)

- Stack: Next.js 15 (App Router) + Supabase (auth/Postgres/**pgvector**) + Stripe + OpenRouter. ~~separate Python/FastAPI RAG microservice (`rag/`) using LangChain, Chroma…~~ **Superseded 2026-07-11** — see amendment above; `rag/` retained as legacy only.
- Quota plumbing already exists: `sets_remaining` with refresh-date reset logic (`input-check`), `chats_remaining` with `decrement_chat_quota` RPC. The strict ordering (check → generate → persist → decrement) in `/api/send-chat` is the pattern FR-1/FR-6 codify as product behavior.
- ~~Semantic cache pattern (`rag/scache.py`) should front any new LLM-touching endpoint~~ — **superseded for Study Buddy**; cost control remains quota-gated OpenRouter calls. Reintroduce caching only if product re-adopts it explicitly.

## Deploy-hardening items (Phase A "harden" scope, architecture backlog)

- ~~RAG service URL hardcoded to `http://localhost:8000` in `app/api/send-chat/route.ts`~~ — **Resolved 2026-07-11:** send-chat uses `lib/ingest` + OpenRouter; no RAG sidecar URL.
- LLM provider config must stay OpenRouter-driven: `OPENROUTER_API_KEY` and env-selected model slugs for generation, tutor chat, and multimodal ingest (`OPENROUTER_VISION_MODEL`, `OPENROUTER_AUDIO_MODEL`, `OPENROUTER_TRANSCRIPTION_MODEL`) — all set to `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`.
- `lib/admin.ts` (service-role client) is gitignored — deployment story must provision it; never expose to user-facing paths.
- `middleware.ts` `protectedPaths` is a prefix-match allowlist and the single auth gate — every new protected surface (dashboard additions, leagues, reviews, paths) must be registered there.
- No test framework and no CI exist — Phase A hardening should include scaffolding both (launch-grade stakes; see `bmad-testarch-framework`).
- Known bug: `app/api/webhook/route.ts` types param as `NextRequest` without importing it.

## Mechanism decisions deferred from the PRD

- **Spaced-repetition algorithm** (FR-15): candidates are an SM-2-family algorithm vs. simple fixed-interval ladder (1d/3d/7d/21d). Fixed intervals are likely sufficient for v1 given questions are generated, not user-authored.
- **Review question sourcing** (FR-16): generate question banks at Set-generation time (amortized cost, enables zero-LLM-cost Reviews) vs. on-demand. Generation-time banking is strongly implied by the §6 Cost guardrail and UJ-3's "zero new-content generation cost."
- **League reset timing** (Q3): a single global UTC reset is operationally simplest; per-user timezone resets complicate cohort fairness.
- **XP schedule starting point** (FR-10): e.g., Lesson = 10 XP, Review = 10 XP, Daily Goal bonus = 5 XP, Set completion = 25 XP; Daily Goal tiers 10/20/30/50. Placeholder for tuning.

## Research digest (competitive grounding)

- Closest comparable: **Gizmo**; broader field includes AI chat tutors (ChatGPT et al.) and fixed-catalog gamified apps (Duolingo, Brilliant).
- Identified market gap Learnium occupies: **generated structured courses with gamified progression** — comparables have one or the other, not both.
- Top failure modes in the space (drove §6 guardrails and SM-C2): hallucinated content, shallow content, retention collapse after novelty.
