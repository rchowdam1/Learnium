# `rag/` — DEPRECATED

**Status (2026-07-11):** Legacy / unused for Study Buddy create + chat.

Study Buddy document ingest and retrieval now live in the Next.js app:

- Ingest / extract / chunk / embed: [`lib/ingest/`](../lib/ingest/)
- Storage + hybrid search: Supabase `document_chunks` (pgvector) — see `supabase/migrations/20260711043419_study_buddy_vector_chunks.sql`
- Create buddy: `POST /api/create-buddy` (multipart upload)
- Chat: `POST /api/send-chat` → `retrieveBuddyContext` + OpenRouter

Do **not** start this FastAPI + Chroma service for normal development. `RAG_SERVICE_URL` / `NEXT_PUBLIC_RAG_SERVICE_URL` are unused for the live Study Buddy path.

This folder is retained only for historical reference until it is removed from the repo.
