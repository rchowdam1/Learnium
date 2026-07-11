# Learnium PRD Addendum

_Depth that belongs downstream (architecture, UX, solution design) — not part of the PRD's requirements surface._

## Amendment 2026-07-11 (revised) — Client MiniLM + DeepSeek Study Buddy

The Python/FastAPI RAG microservice notes below are **historical**. Live Study Buddy path (code truth as of this revision):

### Ingest pipeline

1. **`POST /api/create-buddy`** — **JSON shell only** `{ title, description, category }`. Creates the `study_bots` row and returns storage quota snapshot. **No multipart**, no server-side extract/chunk/embed on this route. Old multipart form is rejected with guidance to use `/api/ingest-document`.
2. **Browser extract** — text types via pdf.js / mammoth / zip (pptx) client-side; images/audio/video via **`POST /api/extract-media`** (DeepSeek multimodal through OpenRouter).
3. **Browser chunk + embed** — primary: **client MiniLM** (`Xenova/all-MiniLM-L6-v2`, 384-d via `@huggingface/transformers` in `lib/ingest/client/embed.ts`). **Fallback:** local feature-hash in `lib/ingest/embed.ts` if MiniLM fails to load.
4. **`POST /api/ingest-document`** — multipart: raw file + pre-embedded chunks JSON. Server claims storage (`claim_study_storage` RPC), stores file in Supabase Storage (`study-documents`), inserts `document_chunks` (pgvector + FTS, RLS by `profile_id` / `study_bot_id`). Browser does **not** write vectors via a direct Supabase client; only this authenticated route inserts rows after ownership + quota checks.
5. **Supporting APIs:** `GET /api/storage-usage`, `POST /api/delete-buddy` (cascades docs/chunks; releases storage).

### Chat

- **`POST /api/send-chat`:** authenticate → validate → verify buddy ownership → **atomic `consume_chat_quota` (claim before LLM)** → hybrid retrieval (`match_document_chunks` + `keyword_document_chunks`) using optional client `queryEmbedding` (384-d) or server feature-hash fallback → OpenRouter answer → persist user/assistant messages (assistant may include **citations**) → return `{ success, assistantMessage, citations }`.
- **No `lessonId` / `setId` grounding on send-chat today** — lesson-grounded chat remains a **planned** product requirement (FR6 / Story 2.9), not live API behavior.

### OpenRouter / embeddings env contract

| Variable | Live contract |
| --- | --- |
| `OPENROUTER_API_KEY` | Required for generation, chat, multimodal extract |
| `OPENROUTER_MODEL` | `deepseek/deepseek-v4-flash` (chat / set gen / buddy answers) |
| `OPENROUTER_VISION_MODEL` | `deepseek/deepseek-v4-flash` |
| `OPENROUTER_AUDIO_MODEL` | `deepseek/deepseek-v4-flash` |
| `OPENROUTER_TRANSCRIPTION_MODEL` | `deepseek/deepseek-v4-flash` |
| `OPENROUTER_BASE_URL` | **Not used.** Base URL is **hardcoded** `https://openrouter.ai/api/v1` in server clients |
| Embeddings | **Not** an OpenRouter/OpenAI embeddings API. Client MiniLM primary; feature-hash fallback. Dim **384** |

`lib/openrouter.ts` allows free `:free` slugs or explicitly approved paid models (currently `deepseek/deepseek-v4-flash`). Default free slug remains as code fallback only; **documented product env contract is DeepSeek V4 Flash**, not Nemotron-for-all.

### Storage limits

- Free: **750MB** total Study Buddy file storage
- Plus: **5GB**
- Max **100MB** per file; max **8** files per buddy create flow (`lib/ingest/limits.ts`)

### What is not required for live path

- **`RAG_SERVICE_URL` / Chroma / LangCache / live Python `rag/` folder** — not part of create-buddy, ingest, or chat. Any `rag/` tree is legacy/reference only.
- Server-side multipart create-buddy ingest (`ingestBuddyDocuments` on create) — superseded by JSON shell + client pipeline + `ingest-document`.
- `pending_db` → `pending_rag` readiness machine — **not live** as a buddy-level state machine. Document rows may carry a `status` (default `ready`); fuller readiness gating remains **remaining/planned** if product wants chat blocked until chunks exist.

### Tests / CI

Vitest + Playwright and `.github/workflows/ci.yml` **exist** (lint, build, unit, e2e). Earlier “no test framework / no CI” notes are **struck**.

---

## Existing implementation notes (for architecture)

- Stack: Next.js 15 (App Router) + Supabase (auth/Postgres/**pgvector**/Storage) + Stripe + OpenRouter. ~~separate Python/FastAPI RAG microservice (`rag/`) using LangChain, Chroma…~~ **Superseded 2026-07-11** — see amendment above; `rag/` not required for live Study Buddy.
- Quota plumbing: `sets_remaining` with refresh-date reset logic (`input-check`); chat uses **`consume_chat_quota`** (atomic claim-before-LLM on `/api/send-chat`). Citations returned on successful assistant messages.
- ~~Semantic cache pattern (`rag/scache.py`) should front any new LLM-touching endpoint~~ — **superseded for Study Buddy**; cost control remains quota-gated OpenRouter calls. Reintroduce caching only if product re-adopts it explicitly.

## Deploy-hardening items (Phase A "harden" scope, architecture backlog)

- ~~RAG service URL hardcoded to `http://localhost:8000` in `app/api/send-chat/route.ts`~~ — **Resolved 2026-07-11:** send-chat uses `lib/ingest` + OpenRouter; no RAG sidecar URL.
- LLM provider config: `OPENROUTER_API_KEY` + env-selected model slugs (`OPENROUTER_MODEL`, `OPENROUTER_VISION_MODEL`, `OPENROUTER_AUDIO_MODEL`, `OPENROUTER_TRANSCRIPTION_MODEL`) — **live defaults: `deepseek/deepseek-v4-flash`**. Base URL is hardcoded to OpenRouter (no `OPENROUTER_BASE_URL` env).
- `lib/admin.ts` (service-role client) is gitignored — deployment story must provision it; never expose to user-facing paths.
- `middleware.ts` `protectedPaths` is a prefix-match allowlist and the single auth gate — every new protected surface (dashboard additions, leagues, reviews, paths) must be registered there.
- ~~No test framework and no CI exist~~ — **Resolved:** Vitest, Playwright, and GitHub Actions CI are in repo (`npm run test`, `npm run test:e2e`, `.github/workflows/ci.yml`). Continue expanding coverage for launch-grade paths.
- Known bug: `app/api/webhook/route.ts` types param as `NextRequest` without importing it.

## Mechanism decisions deferred from the PRD

- **Spaced-repetition algorithm** (FR-15): candidates are an SM-2-family algorithm vs. simple fixed-interval ladder (1d/3d/7d/21d). Fixed intervals are likely sufficient for v1 given questions are generated, not user-authored.
- **Review question sourcing** (FR-16): generate question banks at Set-generation time (amortized cost, enables zero-LLM-cost Reviews) vs. on-demand. Generation-time banking is strongly implied by the §6 Cost guardrail and UJ-3's "zero new-content generation cost."
- **League reset timing** (Q3): a single global UTC reset is operationally simplest; per-user timezone resets complicate cohort fairness.
- **XP schedule starting point** (FR-10): e.g., Lesson = 10 XP, Review = 10 XP, Daily Goal bonus = 5 XP, Set completion = 25 XP; Daily Goal tiers 10/20/30/50. Placeholder for tuning.
- **Lesson-grounded send-chat** (FR-6): still product intent; not implemented on the live `/api/send-chat` body (no `lessonId`).

## Research digest (competitive grounding)

- Closest comparable: **Gizmo**; broader field includes AI chat tutors (ChatGPT et al.) and fixed-catalog gamified apps (Duolingo, Brilliant).
- Identified market gap Learnium occupies: **generated structured courses with gamified progression** — comparables have one or the other, not both.
- Top failure modes in the space (drove §6 guardrails and SM-C2): hallucinated content, shallow content, retention collapse after novelty.
