# Learnium

Personalized microlearning powered by AI.

## Getting Started

1. Copy `.env.example` to `.env.local` and fill in the required variables (no secrets in `.env.example`).
2. Start the local Supabase environment (Postgres + Auth + pgvector) running via Docker (port 54321) if you develop against the local stack (e.g. `supabase start`) — apply migrations under `supabase/migrations/` (includes Study Buddy `document_chunks` + hybrid retrieval RPCs).
3. Run the Next.js app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Study Buddy RAG is **client-side chunk + embed** (MiniLM in-browser) with **Supabase Storage + pgvector** for persistence. Generation uses **DeepSeek V4 Flash** via OpenRouter when `OPENROUTER_*` model env vars are set; if those are unset, `lib/openrouter.ts` falls back to free Nemotron (`nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`). Free accounts get **750MB** of Study Buddy file storage.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_URL` | Site base URL (default `http://localhost:3000`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_API_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service-role key (privileged ops) |
| `OPENROUTER_API_KEY` | OpenRouter API key (required for AI) |
| `OPENROUTER_MODEL` | Chat / set generation / buddy answers — `deepseek/deepseek-v4-flash` |
| `OPENROUTER_VISION_MODEL` | Image extract — `deepseek/deepseek-v4-flash` |
| `OPENROUTER_AUDIO_MODEL` | Audio/video extract — `deepseek/deepseek-v4-flash` |
| `OPENROUTER_TRANSCRIPTION_MODEL` | Legacy server-side extract path only; live client media uses VISION + AUDIO via `/api/extract-media` |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | Plus plan price id |

Embeddings are **browser MiniLM** (`Xenova/all-MiniLM-L6-v2`, 384-d via `@huggingface/transformers`), not OpenRouter. Feature-hash in `lib/ingest/embed.ts` is a fallback only. Model env vars must be the approved paid slug (`deepseek/deepseek-v4-flash`) or any OpenRouter slug ending in `:free` (see `lib/openrouter.ts`).

## Study Buddy ingest (current)

1. Create modal preflight: `GET /api/storage-usage` (used/cap).
2. `POST /api/create-buddy` (JSON) creates the buddy shell and returns storage quota.
3. Browser extracts text (pdf.js / mammoth / zip for pptx; media via `POST /api/extract-media` + DeepSeek vision/audio models).
4. Browser chunks + embeds with MiniLM, then `POST /api/ingest-document` stores the raw file in Supabase Storage and inserts `document_chunks`.
5. Limits: **max 100MB/file**, **max 8 files** per buddy; free tier **750MB** total (`claim_study_storage` RPC); Plus: 5GB.
6. On empty or failed create (no chunks / exception), client calls `POST /api/delete-buddy` to clean up the shell.
7. Chat: client MiniLM `queryEmbedding` (384-d) so retrieval matches ingest space; `POST /api/send-chat` runs hybrid retrieval (`match_document_chunks` + `keyword_document_chunks`) + DeepSeek answer.
8. Citations: sources chip + panel in chat UI; persisted on `study_bot_chats.citations`.
9. Supported: pdf, docx, pptx, xlsx, txt/md/csv, images, mp3/wav/m4a, mp4, and common code/notes types (see `lib/ingest/allowed-types.ts`).

### Key Study Buddy API routes

| Route | Role |
| --- | --- |
| `POST /api/create-buddy` | Create buddy shell |
| `POST /api/ingest-document` | Store file + chunk rows |
| `POST /api/extract-media` | Vision/audio media extract |
| `GET /api/storage-usage` | Storage used/cap preflight |
| `POST /api/send-chat` | Hybrid RAG chat + citations |
| `POST /api/delete-buddy` | Delete buddy (incl. create cleanup) |

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
