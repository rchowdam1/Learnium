---
project_name: 'Learnium'
user_name: 'Arnav'
date: '2026-07-11'
sections_completed:
  [
    'technology_stack',
    'language_rules',
    'framework_rules',
    'testing_rules',
    'quality_rules',
    'workflow_rules',
    'anti_patterns',
  ]
status: 'complete'
rule_count: 32
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- Next.js 15.3.3 (App Router), React 19.0.0, TypeScript 5 (`strict: true`)
- Supabase: `@supabase/ssr` 0.6.1 + `@supabase/supabase-js` 2.50.0 — auth + Postgres + **pgvector**; local schema via `supabase/migrations/`
- Stripe 18.4.0 — subscriptions/billing (`lib/stripe.ts`)
- Tailwind CSS v4 (`@tailwindcss/postcss`); design primitives under `app/components/ui/`
- OpenRouter via OpenAI-compatible SDK (`openai` 5.3.0) — base URL `https://openrouter.ai/api/v1`
  - All model env vars (`OPENROUTER_MODEL`, `OPENROUTER_VISION_MODEL`, `OPENROUTER_AUDIO_MODEL`, `OPENROUTER_TRANSCRIPTION_MODEL`) use free multimodal `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`
- Study Buddy RAG: **in-process** Next.js `lib/ingest/` — extract (pdf-parse, mammoth, JSZip, vision/transcription), chunk, **local 384-d feature-hash embeddings**, store in `document_chunks`, hybrid retrieve via `match_document_chunks` + `keyword_document_chunks`
- `rag/` Python FastAPI + Chroma + LangCache is **legacy / unused** for create-buddy and send-chat — do not wire new features to it
- zod 3.25.62, franc 6.2.0, axios 1.13.2, react-hot-toast 2.5.2, lucide-react 0.511.0
- Tests: Vitest 4 (`tests/smoke`, jsdom) + Playwright (`tests/e2e`); CI in `.github/workflows/ci.yml`

## Critical Implementation Rules

### Language-Specific Rules

- `strict: true` in `tsconfig.json` — do not add `any` or loosen strictness to silence errors
- Use path alias `@/*` (maps to project root) instead of relative `../../` chains
- Named exports only — no default exports in `lib/`, `actions/`, or API routes (`lib/stripe.ts` is the existing exception)
- Two Supabase client factories, do not conflate: `lib/supabase.ts` `createSupabaseClient()` (browser) vs `lib/server.ts` `createClient()` (server, async, cookie-based)
- Never throw for expected failure paths. Pattern: destructure `{ data, error }` from every Supabase call, `if (error)` → `console.log` message + early return
  - API routes return `NextResponse.json({ success: false, message }, { status })`
  - Server actions in `actions/*.ts` return `false`
- Success responses keep the same envelope: `{ success: true, ... }` (routes) or a truthy typed object (actions) — don't introduce thrown exceptions or a different response shape

### Framework-Specific Rules

- API routes live at `app/api/<kebab-case-action>/route.ts`, one per verb-style action (e.g. `get-buddies`, `mark-lesson-complete`) — not grouped as RESTful resources
- Authenticated shell pages live under `app/(app)/` (dashboard, learn, review, leagues, profile, settings, onboarding); dynamic learning surfaces stay at `app/sets/[setId]` and `app/buddy/[buddyId]`
- `middleware.ts` `protectedPaths` is the single auth gate — any new protected top-level route MUST be added there or it stays publicly accessible
- Components are PascalCase `.tsx` grouped by UI role under `app/components/{cards,controllers,lessons,misc,modals,nav,study-buddy,ui}`, not by feature — place new components in the matching role folder; reusable design-system primitives go in `ui/`
- Study Buddy ingest/chat stay in Next.js: browser multipart → `/api/create-buddy` → `ingestBuddyDocuments`; chat → `/api/send-chat` → `retrieveBuddyContext` / `answerWithContext`. Do **not** call `RAG_SERVICE_URL` or the Python `rag/` service for the live path
- Embeddings are local feature-hash (`lib/ingest/embed.ts`, 384 dims matching `document_chunks.embedding`) — not OpenRouter/OpenAI embeddings API
- LLM provider configuration is OpenRouter-first and env-driven: `OPENROUTER_API_KEY`, hardcoded OpenRouter base URL in current routes, model env vars above, plus `HTTP-Referer` / `X-Title` attribution headers. Do not hardcode direct provider models or swap to the Responses API
- Mutations with auth, billing, quota, progress, AI, or privacy impact go through server actions or API routes — not browser-direct provider/DB writes

### Testing Rules

- Unit/component smoke tests: `tests/smoke/*.test.tsx` via Vitest (`npm test`); setup in `tests/setup.ts`
- E2E smoke tests: `tests/e2e/*.spec.ts` via Playwright (`npm run test:e2e`); Vitest excludes `tests/e2e`
- Quality gate: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`, `npm run test:e2e`
- Prefer extending existing smoke coverage over adding heavy fixture frameworks unless a story requires it

### Code Quality & Style Rules

- ESLint: `eslint-config-next` (`next/core-web-vitals`, `next/typescript`) flat config, no custom overrides. No Prettier configured
- Naming: API route folders `kebab-case`, components `PascalCase.tsx`, functions/variables `camelCase`
- Database tables/columns are `snake_case` (e.g. `study_bot_chats`, `is_user_message`) with no ORM/codegen — manually translate `camelCase` ↔ `snake_case` at each Supabase call site
- Local schema source of truth for greenfield/local: `supabase/migrations/*.sql` — keep app queries aligned with migration columns
- Comments are sparse, used only for non-obvious multi-step logic (e.g. DB insert ordering in `actions/dbops.ts`) — not JSDoc, not required per-function
- Accessibility is an implementation constraint: real controls, visible focus, `aria-live` where feedback matters, respect reduced motion, ~44px targets

### Development Workflow Rules

- Branch names are personal/feature-based (`arnav`, `semantic_cache`) — no `feat/`/`fix/` prefix convention
- Commit messages: short, lowercase, descriptive (no Conventional Commits prefix)
- PRs merged via GitHub — no PR template or required status checks beyond CI
- CI (`.github/workflows/ci.yml`) on PRs and pushes to `main`/`master`: `npm ci`, lint, build, unit tests, Playwright E2E (Chromium)
- Planning/architecture artifacts live under `_bmad-output/`; treat `ARCHITECTURE-SPINE.md` as the decision authority when code and docs diverge on intent

### Critical Don't-Miss Rules

- `lib/admin.ts` holds a Supabase **service-role** client (`SUPABASE_SERVICE_ROLE_KEY`, bypasses RLS), used only for privileged server-only ops (`deleteUser`, `createProfile`). It is **gitignored** (`/lib/admin.ts`) — exists locally but not in version control; never use it for regular user-facing queries, and don't assume it's present in a fresh clone
- `middleware.ts` protects a path if pathname equals the entry **or** starts with `path + "/"` (exact/subpath, not naive `startsWith(path)`). Still be precise when adding paths to avoid unintended overlaps
- Every user-owned object read/write must prove ownership through parent `profile_id` (or an explicit public projection). Id-only access is invalid even behind middleware
- **LLM provider is OpenRouter** via `openai` Chat Completions (`chat.completions.create`) with `response_format: { type: "json_object" }` where JSON is required — do NOT use the Responses API. Always include OpenRouter attribution headers
- Study Buddy vectors live in Supabase `document_chunks` with RLS (`profile_id = auth.uid()`). Retrieval RPCs must pass both `filter_study_bot_id` and `filter_profile_id`. Browser never writes chunks or calls OpenRouter directly for buddy RAG
- Stripe webhook route must keep raw `request.text()` body + `stripe-signature` validation before `constructEvent`. Entitlement comes from subscription lifecycle events, not checkout success alone
- Quota ordering is strict: authenticate → validate → check quota → call provider/ingest → validate output → persist → decrement quota. Never spend quota on failed provider/validation/persistence
- Buddy readiness: treat Buddies as chat-ready only when ingest succeeds with `chunks_count > 0`; failed/empty ingest must not look usable
- Review Sessions must not consume generation or chat quota
- Signup enforces 16+ age gate; do not send chats/docs/learning history to providers for training

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-07-11
