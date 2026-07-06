---
name: Learnium
type: architecture-spine
purpose: build-substrate
altitude: feature
paradigm: Modular server-first layered monolith with sidecar RAG service
scope: Learnium public-launch implementation across Next.js app, Supabase data/auth, Stripe billing, and Python RAG service
status: final
created: 2026-07-05
updated: 2026-07-05
binds:
  - PRD FR-1..FR-23
  - EXPERIENCE.md
  - DESIGN.md
sources:
  - ../../../project-context.md
  - ../prds/prd-Learnium-2026-07-05/prd.md
  - ../prds/prd-Learnium-2026-07-05/addendum.md
  - ../../../../EXPERIENCE.md
  - ../../../../DESIGN.md
companions: []
---

# Architecture Spine - Learnium

## Design Paradigm

Learnium uses a **modular server-first layered monolith with a sidecar RAG service**.

```mermaid
flowchart LR
  UI[App Router pages and components] --> Actions[Server actions and API routes]
  Actions --> Domain[Server-owned domain mutations]
  Domain --> Supabase[(Supabase Auth and Postgres)]
  Actions --> Stripe[Stripe]
  Actions --> RAG[Python RAG sidecar]
  RAG --> Cache[(Semantic cache)]
  RAG --> Vector[(Chroma vector store)]
  RAG --> OpenAI[OpenAI]
  Middleware[Next middleware] --> UI
```

Dependency direction is inward to server authority. Components display state and request work; API routes and server actions enforce auth, quota, validation, persistence, and provider calls. The Python RAG service owns retrieval, semantic cache checks, and tutor response generation behind a configured service URL.

## Invariants & Rules

### AD-1 - Modular Server-First Boundary [ADOPTED]

- **Binds:** All application features.
- **Prevents:** Independent feature work creating competing browser clients, direct provider calls, REST shapes, or database/RAG crossings.
- **Rule:** UI components may call server actions, API routes, or the browser Supabase client only for browser-safe reads/auth flows. All mutations with auth, billing, quota, progress, AI, or privacy impact go through server actions or `app/api/<kebab-case-action>/route.ts`.

### AD-2 - Auth And Route Protection [ADOPTED]

- **Binds:** Accounts, dashboard, Sets, Lessons, Buddy chat, subscriptions, profile, future Review/League/Path surfaces.
- **Prevents:** Protected user data appearing on public routes or privileged Supabase access leaking into the browser.
- **Rule:** `middleware.ts` `protectedPaths` is the single route gate for authenticated app surfaces, server code must use `lib/server.ts` `createClient()` for cookie-bound Supabase access, and every user-owned object read/write must prove ownership through its parent `profile_id`. The browser client in `lib/supabase.ts` is only for browser-safe auth/read patterns.

### AD-3 - Quota Transaction Ordering [ADOPTED]

- **Binds:** Set generation, Path generation, Study Buddy chat, future LLM-touching actions.
- **Prevents:** Quota loss on rejected/failed actions, duplicate decrements on retry, and paid-tier inconsistency.
- **Rule:** Quota counters are mutated only by database RPCs or a single quota domain service backed by atomic database writes. Launch default is no reservation: authenticate -> validate input -> check available quota -> call provider -> validate output -> persist durable result -> `consume_*_quota` -> return success. Provider, validation, or persistence failure does not spend user quota. Read endpoints do not reset or consume quota.

### AD-4 - Server-Owned Progress And Rewards

- **Binds:** Lesson completion, Set completion, XP, Level, Daily Goal, Streak, Badge, Review completion, League XP.
- **Prevents:** Client-forged progress, duplicate XP, inconsistent cross-device counters, and League farming through UI replay.
- **Rule:** Reward and progress changes are server-authoritative idempotent events with dedupe keys. Client animations only display committed state returned by the server.

### AD-5 - Generated Content Integrity

- **Binds:** Sets, Lessons, Path outlines, quizzes/check questions, Review question banks, report-content loop.
- **Prevents:** Malformed, shallow, wrong-language, unsafe, or untraceable AI output becoming learning state.
- **Rule:** Generated learning content must pass schema validation, minimum quality checks, safety checks, and input-language checks before being shown or persisted as user progress. Persisted Lessons keep reportable identity and every generated Set carries the AI-generated disclosure.

### AD-6 - RAG Sidecar Contract [ADOPTED]

- **Binds:** Study Buddy, uploaded Buddy documents, future grounded tutor endpoints.
- **Prevents:** UI/API routes bypassing retrieval/cache, divergent chat schemas, and ungrounded general assistant behavior.
- **Rule:** Next.js server code communicates with the Python RAG service only through configured HTTP endpoints using service-to-service authentication; browser code never calls RAG directly with arbitrary `buddyId`. RAG does not trust raw object ids without a signed/server-authenticated request. Request/response payloads are governed by a versioned contract artifact shared by Next.js and Python, and RAG endpoints check semantic cache before model calls.

### AD-7 - Stripe As Billing Source Of Truth [ADOPTED]

- **Binds:** Free/Plus tier, checkout, customer portal, quota lifts, cancellation/downgrade.
- **Prevents:** Client redirects or checkout success pages granting paid capabilities before Stripe confirms them.
- **Rule:** Subscription entitlement is derived from verified Stripe subscription lifecycle events (`customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`) mapped idempotently by Stripe event id and customer id. `checkout.session.completed` resumes interrupted intent but does not by itself grant entitlement. Cancellation applies at period end unless Stripe reports immediate entitlement loss. Quota RPCs read the derived entitlement; webhooks do not directly spend user quota.

### AD-8 - Privacy-Minimized Social Projection

- **Binds:** Public profiles, Leagues, friends leaderboard, share cards.
- **Prevents:** Chat logs, private learning history, private profile fields, or non-consented users leaking through social features.
- **Rule:** Public/social reads use explicit privacy-limited projections: display name, Level, Badges, current Streak, completed Sets count, and weekly XP. Profiles are private by default. League participation is opt-in through participation settings; opt-out removes the user from current and future visible standings, blocks standings access, and preserves only private audit data needed for integrity.

### AD-9 - Zero-Quota Review Sessions

- **Binds:** Review Sessions, Daily Goal retention loop, Review question sourcing.
- **Prevents:** Daily streak retention depending on live LLM calls, generation quota, or paid chat quota.
- **Rule:** Review Sessions use persisted question banks and server-owned review schedule state. Completing a Review consumes no generation quota and no Study Buddy chat quota.

### AD-10 - Deployable Service Configuration

- **Binds:** Next.js deployment, Python RAG deployment, Supabase service role, Stripe webhooks, OpenAI keys.
- **Prevents:** Localhost-only production, secrets in browser bundles, service-role leakage, and environment drift.
- **Rule:** Provider keys and service URLs live in environment variables scoped to the deployed service. Next.js calls RAG through `RAG_SERVICE_URL`; service-role Supabase access is restricted to server-only privileged modules and never used for regular user-facing queries.

### AD-11 - Scheduled Work Authority

- **Binds:** Reminders, League weekly cycles, quota resets, review scheduling, delayed account deletion/export.
- **Prevents:** UI page loads, browser timers, or scattered route handlers becoming the source of operational truth.
- **Rule:** Scheduled and delayed work is owned by server-side job entrypoints with idempotent run keys, a database lock/audit record per run, bounded retries, and recorded outcome. Page loads may display or request current state, but they do not define cycle boundaries or delayed processing.

### AD-12 - Canonical Object Ownership

- **Binds:** `setId`, `lessonId`, `quizId`, `buddyId`, `chatId`, profile, Review, Path, League, and social mutations.
- **Prevents:** Client-supplied ids crossing tenants or mutating another user's learning state.
- **Rule:** Any route/action that receives an object id proves ownership through a parent `profile_id` or an explicit public/social projection before returning or mutating data. Id-only reads/writes are invalid even when the route is behind middleware.

### AD-13 - Canonical Chat Write Path

- **Binds:** Study Buddy messages, chat quota, semantic cache/RAG calls.
- **Prevents:** Alternate endpoints bypassing quota, creating orphan messages, or saving assistant messages not produced by the canonical tutor path.
- **Rule:** One server endpoint owns the chat transaction: authenticate, check chat quota, call RAG, persist user and assistant messages, consume quota, return committed state. Any legacy or helper endpoint may only delegate to that owner or be limited to migration/admin use.

### AD-14 - Buddy RAG Ingestion Lifecycle

- **Binds:** Study Buddy creation, uploaded documents, Chroma/vector ingestion, Buddy readiness.
- **Prevents:** Supabase showing a Buddy as usable while RAG ingestion failed, or RAG accepting poisoned chunks for another user's Buddy.
- **Rule:** Buddy creation progresses through server-owned lifecycle states: `pending_db -> pending_rag -> ready` or `failed`. Only `ready` Buddies can answer chat. Retries use an idempotency key for the Buddy/document set, failed ingestion records cleanup status, and the server mediates every document upload to RAG.

### AD-15 - Generated Content Atomicity

- **Binds:** Set, Lesson, paragraph, quiz, question, option, Path, and Review bank creation.
- **Prevents:** Partial persisted courses after mid-loop failure or quota spend before durable content exists.
- **Rule:** Multi-table generated content writes use transaction-first Postgres functions for Postgres-owned graphs. If a provider-side artifact requires compensation, it must record cleanup status and retry key. Quota consumption happens only after the full content graph is durable and valid.

### AD-16 - Time Boundary Ownership

- **Binds:** Daily Goals, Streaks, reminders, League cycles, quota resets, billing periods.
- **Prevents:** Different teams using incompatible day/week/month boundaries for retention, competition, and billing.
- **Rule:** Streak and Daily Goal boundaries use the user's stored timezone. League cycles use one global reset boundary. Billing and quota reset dates follow Stripe/subscription period authority unless a server-owned quota policy explicitly overrides them.

### AD-17 - Age Gate And Provider Privacy

- **Binds:** Signup, account creation, generated content, Study Buddy, uploaded documents, chat logs, learning history.
- **Prevents:** Under-scope child accounts and use of personal learning data in ways the product privacy constraint forbids.
- **Rule:** Signup enforces the 16+ age gate before account creation. User chats, uploaded documents, learning history, and generated progress data are not sent to providers for training; AI provider calls must use product-approved privacy settings and avoid unnecessary personal data in prompts.

## Consistency Conventions

| Concern | Convention |
| --- | --- |
| API shape | Route folders stay verb-style kebab case under `app/api/<action>/route.ts`; responses use `{ success: true, ... }` or `{ success: false, message }`. |
| Supabase clients | Browser code uses `createSupabaseClient()` only for browser-safe flows; server code uses async `createClient()` from `lib/server.ts`; service-role code stays isolated. |
| Data naming | Database tables/columns are `snake_case`; TypeScript values are `camelCase`; mappings happen at the Supabase call site until codegen/ORM is adopted. |
| Expected failures | Do not throw for expected Supabase/provider failures; return the existing envelope and preserve user input/quota. |
| Protected surfaces | New authenticated top-level routes must be added to `middleware.ts` `protectedPaths`; be precise because matching is prefix-based. |
| Ownership paths | `lessonId` and `quizId` authorize through Lesson -> Set -> profile; `buddyId` and chat authorize through Study Buddy -> profile; Review items authorize through profile; Path Sets authorize through Path owner or standalone Set owner. |
| AI schemas | Shared AI/RAG payloads are versioned in a contract artifact checked by both Next.js and Python before rollout. |
| Accessibility | Real controls, visible focus, `aria-live` feedback, reduced motion, persistent-chrome focus protection, and 44px targets are implementation constraints, not visual polish. |
| Env contract | Browser-exposed Supabase values use `NEXT_PUBLIC_*`; server secrets, Stripe keys, RAG URL, model names, and service-role keys stay server-only. |
| Service-role boundary | Service-role Supabase access is limited to named server-only privileged modules for account deletion, profile bootstrap/repair, and admin reconciliation; regular user-facing reads/writes cannot import it. |
| API errors | API failures keep `{ success: false, message, code, retryable }`; `code` distinguishes auth, authorization, validation, quota, provider, readiness, billing, and unknown failures. |

## Stack

| Name | Version |
| --- | --- |
| Next.js | 15.3.3 manifest baseline; npm latest checked as 16.2.10 on 2026-07-05 |
| React | 19.0.0 manifest baseline; npm latest checked as 19.2.7 on 2026-07-05 |
| TypeScript | 5.x |
| Supabase SSR | 0.6.1 manifest baseline; npm latest checked as 0.12.0 on 2026-07-05 |
| Supabase JS | 2.50.0 manifest baseline; npm latest checked as 2.110.0 on 2026-07-05 |
| Stripe Node | 18.4.0 manifest baseline; npm latest checked as 22.3.0 on 2026-07-05 |
| Tailwind CSS | 4.x manifest baseline; npm latest checked as 4.3.2 on 2026-07-05 |
| OpenAI JS | 5.3.0 manifest baseline; npm latest checked as 6.45.0 on 2026-07-05 |
| Python RAG | FastAPI, LangChain, Chroma, OpenAI, Pydantic, Redis LangCache pattern |

## Structural Seed

```text
Learnium/
  app/                    # App Router pages, API routes, providers, UI components
    api/                  # Verb-style server endpoints for auth, billing, chat, progress
    components/           # Role-grouped UI components
    sets/[setId]/         # Set/Lesson learning surfaces
    buddy/[buddyId]/      # Study Buddy surfaces
  actions/                # Server action mutations and DB operation helpers
  lib/                    # Supabase, Stripe, server-only provider clients
  rag/                    # Python RAG sidecar, vector store, semantic cache integration
  _bmad-output/           # Planning artifacts, PRD, UX, architecture
```

```mermaid
erDiagram
  PROFILE ||--o{ SET : owns
  SET ||--o{ LESSON : contains
  LESSON ||--o{ QUESTION : checks
  PROFILE ||--o{ STUDY_BOT : owns
  STUDY_BOT ||--o{ STUDY_BOT_CHAT : contains
  PROFILE ||--o{ XP_EVENT : earns
  PROFILE ||--o{ BADGE_AWARD : receives
  PROFILE ||--o{ REVIEW_ITEM : schedules
  REVIEW_ITEM ||--o{ REVIEW_ATTEMPT : records
  PROFILE ||--o{ LEAGUE_MEMBERSHIP : joins
  LEAGUE ||--o{ LEAGUE_MEMBERSHIP : contains
  LEARNING_PATH ||--o{ PATH_SET : orders
  SET ||--o{ PATH_SET : appears_in
```

```mermaid
sequenceDiagram
  participant User
  participant Next as Next API/Action
  participant DB as Supabase
  participant AI as Generator/RAG
  User->>Next: request quota-consuming action
  Next->>DB: authenticate and check quota
  Next->>Next: validate input
  Next->>AI: generate or answer
  AI-->>Next: candidate output
  Next->>Next: schema/content validation
  Next->>DB: persist durable result
  Next->>DB: decrement quota / record event
  Next-->>User: success with committed state
```

## Capability To Architecture Map

| Capability / Area | Lives in | Governed by |
| --- | --- | --- |
| FR-1..FR-3 Set generation and content quality | `app/api/input-check`, generation routes/actions, Supabase Sets/Lessons | AD-3, AD-5, AD-10, AD-15 |
| FR-4..FR-5 Lessons and progression | `app/sets/[setId]`, lesson components, progress actions | AD-4, AD-5, AD-12, AD-15 |
| FR-6 Study Buddy | `app/api/send-chat`, `rag/main.py`, `rag/scache.py` | AD-3, AD-6, AD-10, AD-13, AD-14 |
| FR-7..FR-9 Daily Goals, Streaks, reminders | profile/settings, scheduled jobs | AD-4, AD-11, AD-16 |
| FR-10..FR-12 XP, Levels, Badges | server event handlers, Supabase reward tables | AD-4 |
| FR-13..FR-14 Leagues | league routes/views, scheduled cycle jobs, privacy projections | AD-4, AD-8, AD-11, AD-16 |
| FR-15..FR-16 Review Sessions | Review tab, review tables/job handlers | AD-4, AD-9, AD-11 |
| FR-17..FR-18 Learning Paths | Path map, generation actions, path tables | AD-3, AD-5 |
| FR-19..FR-20 Social layer | public profile, share cards, friends leaderboard | AD-8 |
| FR-21..FR-23 Billing and account deletion | Stripe routes/webhooks, profile quota fields, deletion jobs | AD-3, AD-7, AD-11, AD-16, AD-17 |

## Deferred

| Decision | Deferred Because |
| --- | --- |
| Exact Free/Plus quota numbers, pricing, and fair-use cap | Product/unit economics still open; architecture binds ordering and authority, not numbers. |
| Streak protection mechanic | Product behavior is open; architecture only needs idempotent streak events and soft-loss support. |
| League tier count and promotion/demotion counts | Product tuning can happen below this spine as long as weekly cohort authority and privacy rules hold. |
| Fixed interval vs SM-2 Review algorithm | V1 can start with fixed intervals; recurrence state is server-owned so the algorithm can evolve. |
| Email vs web push reminders | V1 assumes web/email; push/PWA requires a later platform decision and permission model. |
| RAG production host and vector/cache managed services | Deploy hardening must select hosting for Python, Chroma persistence, and Redis/LangCache before launch. |
| Test framework and CI shape | Required for launch hardening, but exact Jest/Vitest/Playwright/GitHub Actions composition belongs to test architecture setup. |
| Next 16 / React 19.2 upgrade | Local stack is valid but behind current npm releases; upgrade should be assessed separately from the launch spine. |
| Python dependency pinning and model config | `rag/requirements.txt` is unpinned and missing `langcache`; deploy hardening must pin packages and move hardcoded model names to env config. |
| Exact Stripe API version and handler details | The spine binds subscription event classes and idempotency; exact SDK/API version and handler mapping need billing implementation design. |
