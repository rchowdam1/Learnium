# Learnium

Learnium is an AI-powered microlearning and study assistant web application. It transforms any topic into structured, bite-sized lessons with interactive quizzes, and lets learners upload `.pdf` or `.pptx` study materials to chat with a custom Retrieval-Augmented Generation (RAG) **Study Buddy**.

---

## Features

- **AI-Generated Microlearning Sets**
  - Enter a title, topic description, and category (Business, Communication, Creativity, Health, Humanities, Mathematics, Productivity, Science, Technology, Test Prep, or Miscellaneous).
  - Generates 3–5 focused lessons (3–5 paragraphs each) along with a 3–5 question multiple-choice quiz per lesson using OpenAI (`gpt-4o`) with Zod structured outputs.
  - Client- and server-side input validation and content moderation with flagged query logging.
  - Sequential lesson progression (`LessonChain`), auto-saved quiz scores, answer review, and set completion tracking.

- **AI Study Buddies (RAG Document Chat)**
  - Upload up to 4 `.pdf` or `.pptx` files to build a custom Study Buddy.
  - A dedicated Python FastAPI service (`rag/`) extracts document text (`pdfplumber`, `python-pptx`), splits it into overlapping chunks, embeds chunks via OpenAI Embeddings, and stores them in a persistent ChromaDB vector store scoped per Study Buddy.
  - Context-aware Q&A powered by LangChain + `gpt-4`, accelerated by **Redis LangCache** semantic caching (`rag/scache.py`) to return cached answers for semantically similar questions.
  - Persistent conversation history and daily chat quota tracking in Supabase.

- **Authentication & Route Protection**
  - Email/password sign-up (with email confirmation) and sign-in, plus Google OAuth powered by Supabase Auth (`@supabase/ssr`).
  - Next.js Middleware (`middleware.ts`) automatically refreshes auth sessions and protects `/dashboard`, `/sets`, `/profile`, and `/subscriptions`.
  - Self-service account deletion via Supabase Admin API.

- **Dashboard & Learning Analytics**
  - SWR-powered dashboard with optimistic UI updates and quick switching between **Learning Sets** and **Study Buddies**.
  - Profile page displaying daily request quota, active vs. completed sets, top learning categories, completed lessons, overall progress percentage, and average quiz score.

- **Subscriptions & Billing**
  - **Free** ($0/month): 1 daily request, up to 3 active sets, quizzes after each lesson, 3–5 lessons per set.
  - **Pro** ($9.99/month): 5 daily requests, up to 10 active sets, active recall sessions, and access to completed set contents.
  - Integrated with Stripe Checkout, Stripe Customer Billing Portal, and Stripe Webhooks.

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Web App** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, SWR, Zod, Lucide React, React Hot Toast |
| **Auth & Database** | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) |
| **AI & Microlearning** | OpenAI API (`gpt-4o`, structured outputs via `zodTextFormat`) |
| **RAG Microservice** | Python, FastAPI, Uvicorn, LangChain, OpenAI Embeddings, `gpt-4`, ChromaDB, `pdfplumber`, `python-pptx` |
| **Semantic Caching** | Redis LangCache (`langcache`) |
| **Payments** | Stripe Checkout, Billing Portal, and Webhooks |
| **CI** | GitHub Actions (`.github/workflows/webpack.yml`) building across Node.js 18, 20, and 22 |

---

## Project Structure

```text
Learnium/
├── actions/                  # Server-side Supabase DB operations & profile quota helpers
│   ├── dbops.ts              # Set, lesson, quiz, study buddy, and document persistence
│   └── ProfileUpdates.ts     # Daily request quota decrement, refund, and reset logic
├── app/
│   ├── api/                  # Next.js Route Handlers (auth, sets, buddies, chat, Stripe)
│   ├── auth/                 # OAuth callback & email confirmation handlers
│   ├── buddy/[buddyId]/      # Study Buddy chat interface
│   ├── components/           # Cards, controllers, lessons, modals, nav, and chat UI
│   ├── dashboard/            # Main authenticated workspace (Learning Sets & Study Buddies)
│   ├── login/ & signup/      # Authentication pages
│   ├── profile/              # User statistics, plan status, and completed sets
│   ├── schema/               # Zod schema for structured OpenAI lesson/quiz output
│   ├── sets/[setId]/         # Interactive lesson viewer and quiz modal
│   ├── subscriptions/        # Free vs. Pro plan selection page
│   └── page.tsx              # Public marketing landing page
├── lib/                      # Supabase clients (browser, server, admin), Stripe, SWR helpers
├── rag/                      # Python FastAPI RAG microservice
│   ├── main.py               # Document ingestion (/api/create-study-buddy) & RAG chat (/api/chat)
│   ├── scache.py             # Redis LangCache semantic cache wrapper
│   ├── envkeys.py            # Environment loader for cache credentials
│   └── requirements.txt      # Python dependencies
├── types/                    # Shared TypeScript definitions
├── middleware.ts             # Supabase session refresh & protected route enforcement
└── .github/workflows/        # CI build pipeline
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.10+ (required for the Study Buddy RAG service)
- Accounts / API keys for:
  - [Supabase](https://supabase.com/) (PostgreSQL database + Auth with Email & Google OAuth)
  - [OpenAI](https://platform.openai.com/)
  - [Stripe](https://stripe.com/) (subscription product price ID + webhook secret)
  - [Redis LangCache](https://redis.io/) (for semantic caching in the RAG service)

### 1. Clone the Repository

```bash
git clone https://github.com/rchowdam1/Learnium.git
cd Learnium
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root (both Next.js and `rag/` load variables from `.env.local`):

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_API_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PRICE_ID=your_stripe_pro_price_id
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App URL
NEXT_PUBLIC_URL=http://localhost:3000

# Redis LangCache (used by the Python RAG service)
CACHE_ID=your_redis_langcache_id
REDIS_SEMANTIC_CACHE_KEY=your_redis_langcache_api_key
```

### 3. Supabase Database Overview

Ensure your Supabase project includes the following tables and RPC function expected by the application:

- **Users & Billing**: `profile`, `customer`, `flagged`
- **Microlearning Sets**: `sets`, `lessons`, `paragraphs`, `quizzes`, `questions`, `options`
- **Study Buddies**: `study_bots`, `study_bot_documents`, `study_bot_chats`
- **RPC Function**: `decrement_chat_quota(user_id)`

### 4. Run the Next.js Web Application

```bash
npm install
npm run dev
```

The web app will be available at [http://localhost:3000](http://localhost:3000).

### 5. Run the Python RAG Microservice (for Study Buddies)

In a separate terminal:

```bash
cd rag
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install redis langcache
uvicorn main:app --reload --port 8000
```

The RAG API runs on [http://localhost:8000](http://localhost:8000) and persists ChromaDB embeddings in `rag/chroma_db`.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the production Next.js bundle |
| `npm run start` | Start the production Next.js server |
| `npm run lint` | Run ESLint across the codebase |

---

## Key API Endpoints

### Next.js App Routes (`/api/*`)
- **Auth**: `POST /api/signup`, `POST /api/login`, `GET /api/login/google`, `POST /api/logout`, `DELETE /api/delete-user`
- **Learning Sets**: `POST /api/input-check`, `GET /api/get-sets`, `GET /api/get-set-data/[setId]`, `POST /api/mark-lesson-complete`, `POST /api/mark-set-complete`
- **Study Buddies**: `POST /api/create-buddy`, `GET /api/get-buddies`, `GET /api/get-buddy-data/[buddyId]`, `POST /api/send-chat`, `POST /api/save-chat-message`
- **Profile & Billing**: `GET /api/get-profile-data`, `GET /api/get-username`, `GET /api/get-subscription-status`, `POST /api/checkout`, `POST /api/customer-portal`, `POST /api/webhook`

### Python FastAPI RAG Service (`http://localhost:8000`)
- `POST /api/create-study-buddy` — Extracts text from uploaded `.pdf`/`.pptx` files, chunks, embeds, and indexes into ChromaDB.
- `POST /api/chat` — Checks Redis LangCache for a semantic hit; on a miss, retrieves top-3 chunks from ChromaDB, queries `gpt-4`, and caches the response.
