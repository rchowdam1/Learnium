---
project_name: 'Learnium'
user_name: 'Arnav'
date: '2026-07-05'
sections_completed: ['technology_stack']
# next: language_specific_rules
existing_patterns_found: 12
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- Next.js 15.3.3 (App Router), React 19.0.0, TypeScript 5 (`strict: true`)
- Supabase: `@supabase/ssr` 0.6.1 + `@supabase/supabase-js` 2.50.0 — auth + Postgres
- Stripe 18.4.0 — subscriptions/billing
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- Separate Python/FastAPI microservice in `rag/` (not built by Next.js): LangChain, Chroma vector store, OpenAI SDK, Redis LangCache (`langcache` pkg) for semantic response caching
- zod 3.25.62 (LLM output schema validation), franc 6.2.0 (language detection), axios 1.13.2, react-hot-toast 2.5.2, lucide-react 0.511.0
- **No test framework configured** (no Jest/Vitest/Playwright) — known gap, not yet a project convention

## Critical Implementation Rules

_Documented after discovery phase_
