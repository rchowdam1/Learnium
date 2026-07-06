# Learnium

Personalized microlearning powered by AI.

## Getting Started

First, copy `.env.example` to `.env` or `.env.local` and set the required variables. Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables
The application uses the following environment variables:
- `NEXT_PUBLIC_SITE_URL`: The base URL of the site (default: `http://localhost:3000`).
- `SUPABASE_URL`: The URL of your Supabase database instance.
- `SUPABASE_API_KEY`: The Supabase public/anonymous API key.
- `STRIPE_SECRET_KEY`: Stripe API key for payments.
- `OPENROUTER_API_KEY`: OpenRouter API key for AI course/lesson generation (required).
- `OPENROUTER_MODEL`: OpenRouter model ID (default: `meta-llama/llama-3.2-3b-instruct:free`).
- `RAG_SERVICE_URL`: URL of the Python RAG microservice (default: `http://localhost:8000`).

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
