---
baseline_commit: TODO-set-by-dev
---

# Story 1.9: Accessibility Floor and Test/CI Scaffold

Status: done

## Story

As a learner using assistive technology,
I want the app to meet a documented accessibility floor from launch,
so that I can navigate and learn without barriers.

## Acceptance Criteria

1. Given any page updated in Epic 1, when audited for accessibility, then interactive elements are real controls (`button`, `a`, `input`) — not clickable `div`s (UX-DR20) and each page has skip-to-content, one `<main>` landmark, and labeled navigation landmarks.

2. Given keyboard navigation, when a user tabs through landing, auth, onboarding, and tabbed app shell, then focus rings are visible on all interactive elements and focus is not fully obscured by fixed bottom or top chrome (UX-DR20).

3. Given `prefers-reduced-motion: reduce`, when celebration or transition animations would run, then motion is reduced or replaced with static states per `EXPERIENCE.md` and essential state changes remain perceivable without animation.

4. Given no automated test framework exists today (NFR16), when this story ships, then Vitest (or agreed unit runner) and Playwright are configured with at least one smoke test per critical path: landing load, auth page render, protected route redirect, and a GitHub Actions workflow runs lint, build, and tests on pull requests.

5. Given CI runs on a clean checkout, when tests execute, then they pass without manual local setup beyond documented env vars and test commands are documented in README or project-context.

## Tasks / Subtasks

- [x] Clickable div audit (AC: 1)
  - [x] Search `app/` for `onClick` on `<div>` elements that should be `<button>`.
  - [x] Replace any found clickable divs with `<button>` elements.
  - [x] Ensure all interactive elements use semantic HTML.

- [x] Landmark audit (AC: 1)
  - [x] Verify each page has exactly one `<main>` landmark.
  - [x] Verify navigation has `aria-label` (already done in Story 1.3).
  - [x] Verify skip-to-content links exist on landing and app pages.

- [x] Focus ring verification (AC: 2)
  - [x] Check `focus-ring` class is applied to all interactive elements.
  - [x] Verify fixed bottom bar (mobile) doesn't obscure focused elements.
  - [x] Verify sticky top bar (desktop) doesn't obscure focused elements.
  - [x] Check `scroll-padding` is set to account for fixed chrome height.

- [x] Reduced motion (AC: 3)
  - [x] Add `prefers-reduced-motion` media query to `globals.css`.
  - [x] Disable transitions/animations when reduced motion is preferred.
  - [x] Ensure state changes remain perceivable without animation.

- [x] Configure Vitest (AC: 4, 5)
  - [x] Install vitest, @testing-library/react, @testing-library/jest-dom, jsdom.
  - [x] Create `vitest.config.ts` with jsdom environment.
  - [x] Create smoke test: `tests/smoke/landing.test.tsx` — renders landing page.
  - [x] Create smoke test: `tests/smoke/auth.test.tsx` — renders login/signup pages.
  - [x] Create smoke test: `tests/smoke/routing.test.tsx` — protected route redirect.
  - [x] Add `"test": "vitest run"` to `package.json` scripts.

- [x] Configure Playwright (AC: 4, 5)
  - [x] Install @playwright/test.
  - [x] Create `playwright.config.ts`.
  - [x] Create E2E smoke: `tests/e2e/landing.spec.ts` — loads landing page.
  - [x] Create E2E smoke: `tests/e2e/auth.spec.ts` — loads login/signup.
  - [x] Add `"test:e2e": "playwright test"` to `package.json` scripts.

- [x] GitHub Actions CI (AC: 4, 5)
  - [x] Create `.github/workflows/ci.yml`.
  - [x] Steps: checkout -> setup node -> install deps -> lint -> build -> unit tests -> e2e tests.
  - [x] Document required env vars in workflow.
  - [x] Use `NEXT_PUBLIC_SITE_URL` and Supabase env vars as repo secrets.

- [x] Documentation (AC: 5)
  - [x] Update README with test commands and setup instructions.
  - [x] Document required environment variables.

- [x] Verification
  - [x] `npm run lint` passes
  - [x] `npm run build` passes
  - [x] `npx vitest run` passes
  - [x] `npx playwright test` passes (or skip if browser not available)

## Dev Notes

### Scope Boundaries

Add test infrastructure and accessibility fixes. Do NOT:
- Fix accessibility issues in pages not touched by Epic 1
- Add comprehensive test coverage beyond smoke tests
- Change production code behavior
- Set up deployment CI (only PR CI)

### Dependencies to Add
- vitest, @testing-library/react, @testing-library/jest-dom, jsdom, @vitejs/plugin-react
- @playwright/test

### Previous Story Intelligence

- Story 1.3 already added skip-to-content and `aria-label` on nav
- Story 1.4 added ARIA labels to status chrome
- The landing page (1.5) and auth pages (1.6) are the main targets for the clickable-div audit
