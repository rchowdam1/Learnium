# Learnium

Personalized microlearning powered by AI.

## Getting Started

1. Copy `.env.example` to `.env.local` and fill in the required variables (no secrets in `.env.example`).
2. Start local Supabase (Postgres + Auth + pgvector) if you develop against the local stack — apply migrations under `supabase/migrations/` (includes Study Buddy `document_chunks` + hybrid retrieval RPCs).
3. Run the Next.js app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Study Buddy document ingest and chat run entirely in Next.js (`lib/ingest/` + Supabase pgvector). The legacy Python service under `rag/` is **not** required for local development or Study Buddy.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_URL` | Site base URL (default `http://localhost:3000`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_API_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service-role key (privileged ops) |
| `OPENROUTER_API_KEY` | OpenRouter API key (required for AI) |
| `OPENROUTER_MODEL` | Chat / set generation / buddy answers — `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` |
| `OPENROUTER_VISION_MODEL` | Image text extraction during ingest — same Nemotron Omni free slug |
| `OPENROUTER_AUDIO_MODEL` | Audio/video understanding during ingest — same Nemotron Omni free slug |
| `OPENROUTER_TRANSCRIPTION_MODEL` | Audio/video transcription during ingest — same Nemotron Omni free slug |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | Plus plan price id |

Embeddings for Study Buddy retrieval are **local** feature-hash vectors (384-d) in `lib/ingest/embed.ts` — not an OpenRouter/OpenAI embeddings API.

Legacy (unused for Study Buddy): `RAG_SERVICE_URL` / `NEXT_PUBLIC_RAG_SERVICE_URL` pointed at the old Python FastAPI + Chroma sidecar. Leave them unset.

## Study Buddy ingest (current)

- Browser uploads files (multipart) to `/api/create-buddy` — PDF, Office, text/code, images, audio/video (max 8 files).
- Server extracts text via `lib/ingest/`, chunks, embeds locally (384-d), stores rows in Supabase `document_chunks` (pgvector + FTS), RLS by `profile_id` + `study_bot_id`.
- Chat via `/api/send-chat`: hybrid retrieval (`match_document_chunks` + `keyword_document_chunks`) then OpenRouter chat.
- Buddy is usable when ingest returns `chunks_count > 0`.

## Testing

### Unit & Integration Tests (Vitest)
Unit smoke tests verify page rendering, accessibility landmarks, and routing redirect rules.
To run the Vitest suite:
```bash
npm run test
```

### End-to-End Tests (Playwright)
E2E smoke tests verify browser-level flows like page loading and form renders.
To install the Playwright browser binaries:
```bash
npx playwright install chromium
```
To run the Playwright suite:
```bash
npm run test:e2e
```

## Continuous Integration (CI)
A GitHub Actions workflow is configured in `.github/workflows/ci.yml`. It runs lint check, production build, unit tests, and E2E tests automatically on push and pull requests to `main` or `master`.
