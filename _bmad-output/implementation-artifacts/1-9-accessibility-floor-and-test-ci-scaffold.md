---
baseline_commit: TODO-set-by-dev
---

# Story 1.9: Accessibility Floor and Test/CI Scaffold

Status: ready-for-dev

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

- [ ] Clickable div audit (AC: 1)
  - [ ] Search `app/` for `onClick` on `<div>` elements that should be `<button>`.
  - [ ] Replace any found clickable divs with `<button>` elements.
  - [ ] Ensure all interactive elements use semantic HTML.

- [ ] Landmark audit (AC: 1)
  - [ ] Verify each page has exactly one `<main>` landmark.
  - [ ] Verify navigation has `aria-label` (already done in Story 1.3).
  - [ ] Verify skip-to-content links exist on landing and app pages.

- [ ] Focus ring verification (AC: 2)
  - [ ] Check `focus-ring` class is applied to all interactive elements.
  - [ ] Verify fixed bottom bar (mobile) doesn't obscure focused elements.
  - [ ] Verify sticky top bar (desktop) doesn't obscure focused elements.
  - [ ] Check `scroll-padding` is set to account for fixed chrome height.

- [ ] Reduced motion (AC: 3)
  - [ ] Add `prefers-reduced-motion` media query to `globals.css`.
  - [ ] Disable transitions/animations when reduced motion is preferred.
  - [ ] Ensure state changes remain perceivable without animation.

- [ ] Configure Vitest (AC: 4, 5)
  - [ ] Install vitest, @testing-library/react, @testing-library/jest-dom, jsdom.
  - [ ] Create `vitest.config.ts` with jsdom environment.
  - [ ] Create smoke test: `tests/smoke/landing.test.tsx` — renders landing page.
  - [ ] Create smoke test: `tests/smoke/auth.test.tsx` — renders login/signup pages.
  - [ ] Create smoke test: `tests/smoke/routing.test.tsx` — protected route redirect.
  - [ ] Add `"test": "vitest run"` to `package.json` scripts.

- [ ] Configure Playwright (AC: 4, 5)
  - [ ] Install @playwright/test.
  - [ ] Create `playwright.config.ts`.
  - [ ] Create E2E smoke: `tests/e2e/landing.spec.ts` — loads landing page.
  - [ ] Create E2E smoke: `tests/e2e/auth.spec.ts` — loads login/signup.
  - [ ] Add `"test:e2e": "playwright test"` to `package.json` scripts.

- [ ] GitHub Actions CI (AC: 4, 5)
  - [ ] Create `.github/workflows/ci.yml`.
  - [ ] Steps: checkout → setup node → install deps → lint → build → unit tests → e2e tests.
  - [ ] Document required env vars in workflow.
  - [ ] Use `NEXT_PUBLIC_SITE_URL` and Supabase env vars as repo secrets.

- [ ] Documentation (AC: 5)
  - [ ] Update README with test commands and setup instructions.
  - [ ] Document required environment variables.

- [ ] Verification
  - [ ] `npm run lint` passes
  - [ ] `npm run build` passes
  - [ ] `npx vitest run` passes
  - [ ] `npx playwright test` passes (or skip if browser not available)

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
