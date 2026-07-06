---
project_name: 'Learnium'
user_name: 'Arnav'
date: '2026-07-05'
sections_completed: ['technology_stack', 'language_specific_rules', 'framework_specific_rules', 'testing_rules', 'code_quality_rules', 'workflow_rules', 'critical_dont_miss_rules']
status: 'complete'
rule_count: 25
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- Next.js 15.3.3 (App Router), React 19.0.0, TypeScript 5 (`strict: true`)
- Supabase: `@supabase/ssr` 0.6.1 + `@supabase/supabase-js` 2.50.0 — auth + Postgres
- Stripe 18.4.0 — subscriptions/billing
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- OpenRouter via OpenAI-compatible SDK (`openai` npm package) — base URL `https://openrouter.ai/api/v1`, free model default `meta-llama/llama-3.2-3b-instruct:free`, configurable via `OPENROUTER_MODEL` env var
- Separate Python/FastAPI microservice in `rag/` (not built by Next.js): LangChain, Chroma vector store, OpenRouter via OpenAI-compatible SDK/client configuration, Redis LangCache (`langcache` pkg) for semantic response caching
- zod 3.25.62 (LLM output schema validation), franc 6.2.0 (language detection), axios 1.13.2, react-hot-toast 2.5.2, lucide-react 0.511.0
- **Test framework configured**: Vitest smoke tests, Playwright E2E smoke tests, and GitHub Actions CI are present.

## Critical Implementation Rules

### Language-Specific Rules

- `strict: true` in `tsconfig.json` — do not add `any` or loosen strictness to silence errors
- Use path alias `@/*` (maps to project root) instead of relative `../../` chains
- Named exports only — no default exports in `lib/`, `actions/`, or API routes
- Two Supabase client factories, do not conflate: `lib/supabase.ts` `createSupabaseClient()` (browser) vs `lib/server.ts` `createClient()` (server, async, cookie-based)
- Never throw for expected failure paths. Pattern: destructure `{ data, error }` from every Supabase call, `if (error)` → `console.log` message + early return
  - API routes return `NextResponse.json({ success: false, message }, { status })`
  - Server actions in `actions/*.ts` return `false`
- Success responses keep the same envelope: `{ success: true, ... }` (routes) or a truthy typed object (actions) — don't introduce thrown exceptions or a different response shape

### Framework-Specific Rules

- API routes live at `app/api/<kebab-case-action>/route.ts`, one per verb-style action (e.g. `get-buddies`, `mark-lesson-complete`) — not grouped as RESTful resources. Follow this naming for new endpoints.
- `middleware.ts` `protectedPaths` array is the single auth gate — any new protected top-level route MUST be added there or it stays publicly accessible
- Components are PascalCase `.tsx` grouped by UI role under `app/components/{cards,controllers,lessons,misc,modals,nav,study-buddy}`, not by feature — place new components in the matching role folder
- Next.js ↔ Python RAG service boundary: communication only via configured `RAG_SERVICE_URL` endpoints, no shared types — mirror any schema change (e.g. `OutputSchema`) manually in `rag/main.py`'s Pydantic models
- New RAG endpoints should check the semantic cache (`rag/scache.py`, Redis LangCache) before calling the LLM, matching the pattern in `/api/chat`
- LLM provider configuration should be OpenRouter-first and env-driven: `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`, server-only model names, and optional OpenRouter app attribution headers. Do not hardcode direct provider models or base URLs in route handlers.

### Testing Rules

- Automated frontend smoke tests exist under `tests/smoke` and `tests/e2e`. Use `npm run lint`, `npx tsc --noEmit`, `npm test -- --run`, `npm run build`, and `npm run test:e2e` for the current quality gate.

### Code Quality & Style Rules

- ESLint: `eslint-config-next` (`next/core-web-vitals`, `next/typescript`) flat config, no custom overrides. No Prettier configured.
- Naming: API route folders `kebab-case` (`get-buddy-data`), components `PascalCase.tsx`, functions/variables `camelCase`
- Database tables/columns are `snake_case` (e.g. `study_bot_chats`, `is_user_message`) with no ORM/codegen — agents must manually translate `camelCase` ↔ `snake_case` at each Supabase call site
- Comments are sparse, used only for non-obvious multi-step logic (e.g. DB insert ordering in `actions/dbops.ts`) — not JSDoc, not required per-function

### Development Workflow Rules

- Branch names are personal/feature-based (`arnav`, `semantic_cache`) — no `feat/`/`fix/` prefix convention
- Commit messages: short, lowercase, descriptive (no Conventional Commits prefix)
- PRs merged via GitHub — no PR template or required status checks
- CI is configured in `.github/workflows/ci.yml` for pull requests and pushes to `main`/`master`: install, lint, build, unit tests, and E2E smoke tests.

### Critical Don't-Miss Rules

- `lib/admin.ts` holds a Supabase **service-role** client (`SUPABASE_SERVICE_ROLE_KEY`, bypasses RLS), used only for privileged server-only ops (`deleteUser`, `createProfile`). It's **gitignored** (`/lib/admin.ts`) — exists locally but not in version control; never use it for regular user-facing queries, and don't assume it's present/populated in a fresh clone.
- `middleware.ts` gates `protectedPaths` via `url.pathname.startsWith(path)` — a **prefix match, not exact**. New routes with overlapping prefixes (e.g. `/dashboardX` vs `/dashboard`) can be unintentionally protected/unprotected. Be precise when adding paths.
- **LLM provider is OpenRouter** via the OpenAI-compatible SDK (`openai` npm package). The base URL is `https://openrouter.ai/api/v1`. API key is `OPENROUTER_API_KEY`. The model is configured via `OPENROUTER_MODEL` env var (defaults to free `meta-llama/llama-3.2-3b-instruct:free`). All LLM calls use Chat Completions API (`chat.completions.create`) with `response_format: { type: "json_object" }` — do NOT use the Responses API as OpenRouter doesn't support it. Always include `HTTP-Referer` and `X-Title` headers for OpenRouter attribution.
- RAG service URL is configured via `RAG_SERVICE_URL` env var (defaults to `http://localhost:8000` for local dev).
- Stripe webhook route imports `NextRequest` and validates the `stripe-signature` header before `constructEvent`; preserve the raw `.text()` body pattern for new Stripe webhook work.
- Quota ordering is strict: check quota → call LLM → validate output → persist → decrement quota. Preserve check-before-spend, decrement-after-success ordering.

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

Last Updated: 2026-07-05
