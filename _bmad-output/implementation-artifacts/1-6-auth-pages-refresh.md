---
baseline_commit: a3a84055adb9a09e9eea3d7c9a9a8991612796cd
---

# Story 1.6: Auth Pages Refresh

Status: done

## Story

As a new or returning learner,
I want signup and login pages that match the product's visual quality,
so that auth feels trustworthy and consistent with the rest of Learnium.

## Acceptance Criteria

1. Given unauthenticated users navigate to `/signup` or `/login`, when those pages render, then they use shared tokenized inputs, buttons, and typography from Stories 1.1–1.2 (UX-DR10) and Google OAuth and email/password flows remain functional.

2. Given OAuth and email confirmation redirects currently hardcode `localhost:3000`, when auth flows run in staging or production, then redirect URLs derive from environment configuration (e.g. `NEXT_PUBLIC_SITE_URL`) and signup confirmation and OAuth callback land on the correct origin.

3. Given auth error states (invalid credentials, duplicate email, network failure), when errors occur, then inline or toast feedback uses Nova voice without shaming the user (NFR9, UX-DR22) and feedback is announced via accessible toast/inline patterns, not `alert()` (UX-DR20).

4. Given successful login or signup, when auth completes, then new users route into onboarding (Story 1.7) and returning users route to `/dashboard` and protected routes remain gated by `middleware.ts`.

5. Given signup or first-time Google OAuth before any account exists, when the user attempts to create an account, then they must confirm age 16+ via checkbox before Supabase auth proceeds (NFR5, AD-17, UX-DR20) and users indicating under 16 cannot create an account or profile row.

## Tasks / Subtasks

- [x] Tokenize login page `app/login/page.tsx` (AC: 1, 3)
  - [x] Replace hardcoded hex values with token classes.
  - [x] Use `Input` component from `@/app/components/ui/Input` for email/password fields.
  - [x] Use `Button` component for submit and Google OAuth.
  - [x] Replace `alert()` calls with `toast.error()`.
  - [x] Error messages use Nova voice — direct, not shaming.

- [x] Tokenize signup page `app/signup/page.tsx` (AC: 1, 3)
  - [x] Replace hardcoded hex values with token classes.
  - [x] Use `Input` component from Story 1.2 for email/password/confirm fields.
  - [x] Use `Button` component for submit.
  - [x] Replace `alert()` calls with `toast.error()`.
  - [x] Error messages use Nova voice.

- [x] Tokenize Google sign-in component `app/components/misc/SignInWithGoogle.tsx` (AC: 1)
  - [x] Replace hardcoded hex values with token classes.
  - [x] Use `Button` component if appropriate.

- [x] Fix redirect URLs (AC: 2)
  - [x] Find all hardcoded `localhost:3000` references in auth flows.
  - [x] Replace with `NEXT_PUBLIC_SITE_URL` env var (or equivalent).
  - [x] Verify OAuth callback and email confirmation redirects use the correct origin.

- [x] Implement 16+ age gate (AC: 5)
  - [x] Add age confirmation checkbox to signup form (before Supabase auth call).
  - [x] If unchecked, prevent form submission with appropriate inline error.
  - [x] If checked and confirmed 16+, proceed with normal auth flow.
  - [x] Google OAuth: add similar age gate before redirecting to Google.

- [x] Post-auth routing (AC: 4)
  - [x] New users (no profile/onboarding-complete flag): route to onboarding `/onboarding`.
  - [x] Returning users: route to `/dashboard`.
  - [x] Ensure middleware.ts `protectedPaths` already covers these routes.

- [x] Verification
  - [x] `npx eslint app/login/ app/signup/ app/components/misc/SignInWithGoogle.tsx --fix`
  - [x] `npm run build` compilation check
  - [x] Verify no `alert()` calls remain in auth pages

## Dev Notes

### Scope Boundaries

Refresh existing auth pages. Do NOT:
- Change the auth API routes (`/api/login`, `/api/signup`, `/api/login/google`)
- Change middleware.ts (already has correct protected paths from Story 1.3)
- Implement onboarding page (Story 1.7) — route to `/onboarding` which doesn't exist yet
- Change Supabase auth configuration

### Design Tokens

- Input: use `Input` component from `@/app/components/ui/Input`
- Button: use `Button` component from `@/app/components/ui/Button`  
- Form layout: `bg-background`, `bg-surface-raised` for card containers
- Typography: `text-heading` for titles, `text-body` for form labels

### Environment Variables

- `NEXT_PUBLIC_SITE_URL`: new env var for redirect URLs (set default to `http://localhost:3000` for dev)
- Update `.env.example` or document in README

### Previous Story Intelligence

- Story 1.1 already tokenized auth pages partially — this story completes the job with proper component usage
- `alert()` was partially replaced in 1.1 — ensure none remain
- Forms currently use inline hex colors on `#142937`, `#166ea8`, etc. — replace all
