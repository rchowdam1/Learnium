---
baseline_commit: TODO-set-by-dev
---

# Story 1.5: Landing Page Refresh

Status: completed

## Story

As a prospective learner,
I want a credible landing page that explains Learnium's value,
so that I understand why I should sign up before creating an account.

## Acceptance Criteria

1. Given an unauthenticated visitor opens `/`, when the landing page loads on mobile and desktop, then the page uses the Midnight Ink / Pure token system with co-equal light/dark support (UX-DR1, UX-DR10) and primary CTA routes to signup and secondary CTA routes to login.

2. Given Nova voice guidelines in `EXPERIENCE.md`, when landing copy renders, then headline and supporting copy are sharp, warm, and never condescending (UX-DR22, NFR9) and copy communicates generated structured courses with gamified progression (PRD vision).

3. Given mobile-first requirements (NFR8), when the landing page renders on a phone-width viewport, then layout stacks in a single column, all touch targets are ≥44px, and text remains readable without horizontal scroll. Stitch mockups are used as layout reference only; tokens follow `DESIGN.md`/`EXPERIENCE.md` (UX-DR21).

4. Given accessibility requirements, when the landing page is keyboard-navigated, then skip-to-content link is available, one `<main>` landmark exists, and focus order is logical (UX-DR20).

## Tasks / Subtasks

- [x] Refresh landing hero section (AC: 1, 2)
  - [x] Replace any remaining hardcoded hex values in `app/page.tsx` with token classes from Story 1.1.
  - [x] Primary CTA button (Sign Up) uses `Button` variant="primary" from Story 1.2, links to `/signup`.
  - [x] Secondary CTA (Login) uses `Button` variant="secondary", links to `/login`.
  - [x] Headline copy: sharp, warm, communicates AI-generated structured courses + gamification.
  - [x] Use display typography (`text-display` / Bricolage Grotesque) for hero heading.

- [x] Feature/value section (AC: 2)
  - [x] List 3-4 key value props: AI-generated courses, gamified progression, daily streaks, spaced repetition.
  - [x] Use `Card` component from Story 1.2 for feature cards.
  - [x] Copy must follow Nova voice — direct, warm, not condescending.

- [x] Mobile responsiveness (AC: 3)
  - [x] Single-column layout on mobile.
  - [x] All buttons/Cards with ≥44px touch targets (`min-h-11`).
  - [x] No horizontal scroll at any viewport.
  - [x] Verify on 375px width (iPhone SE).

- [x] Accessibility (AC: 4)
  - [x] Skip-to-content link: visible on focus, targets `#main-content`.
  - [x] Single `<main id="main-content">` landmark wrapping all landing content.
  - [x] Logical focus order: skip link → nav/logo → hero → features → CTA → footer.
  - [x] All images have `alt` text; decorative images use `alt=""`.

- [x] Footer or trust section (AC: 2)
  - [x] Minimal footer with links to Login / Sign Up.
  - [x] If existing footer exists, tokenize it. If not, add a simple one.

- [x] Verification
  - [x] `npx eslint app/page.tsx --fix`
  - [x] `npm run build` compilation check
  - [x] Verify no hardcoded hex colors remain in `app/page.tsx`

## Dev Notes

### Scope Boundaries

Refresh the existing `app/page.tsx` landing page. Do NOT:
- Change routing, middleware, or auth flow
- Touch login/signup pages (Story 1.6)
- Add new dependencies
- Change the overall page structure beyond token compliance and copy refresh

### Design Tokens

- Background: `bg-background`
- Hero: `text-display` typography (Bricolage Grotesque)
- Body: `text-body` (Inter)
- Buttons: use `Button` component from `@/app/components/ui/Button`
- Cards: use `Card` component from `@/app/components/ui/Card`

### Previous Story Intelligence

- Story 1.4 added `StatusChrome` to AppNav — landing page is outside the (app) route group, so it won't render.
- Story 1.3 moved dashboard/profile into `(app)` group — `app/page.tsx` remains at root for unauthenticated landing.
- The `Button` component was built in Story 1.2 — use it instead of raw `<button>` elements.
