---
baseline_commit: 98aff9e5038375f924ea102dec690f74cea0a63a
---

# Story 1.1: Design Token System and Typography

Status: in-progress

<!-- Note: Ultimate context engine analysis completed - comprehensive developer guide created. -->

## Story

As a learner,
I want the app to look and feel consistent in both light and dark mode,
so that every screen feels like one polished product rather than disconnected pages.

## Acceptance Criteria

1. Given the token definitions in `DESIGN.md`, when the design system is applied globally via Tailwind v4 and `globals.css`, then all semantic color tokens (background, surface, border, text, brand, CTA, accent, streak, semantic states) resolve correctly in light and dark mode, and both themes are co-equal with AA contrast on primary text and interactive states.
2. Given the typography roles in `DESIGN.md`, when any page renders headings, body copy, labels, or gamified numerals, then Bricolage Grotesque is used for display/celebration, Space Grotesk for functional headings and labels, Inter for body copy, and standalone gamified numbers use tabular lining numerals to prevent layout jitter.
3. Given the spacing and radius system in `DESIGN.md`, when components use spacing and border-radius, then values follow the 4px spacing scale and the three-radius system (`xl`, `2xl`, `full`).
4. Given the existing codebase uses hardcoded hex values such as `#142937` and `#166ea8`, when this story is complete, then landing, auth, and dashboard surfaces consume tokens instead of inline hex colors, and no new hardcoded palette values are introduced in changed files.

## Tasks / Subtasks

- [x] Establish the global Tailwind v4 token layer in `app/globals.css` (AC: 1, 3)
  - [x] Replace the current minimal `--background` / `--foreground` setup with Learnium semantic CSS variables from `DESIGN.md`.
  - [x] Define Tailwind v4 `@theme inline` aliases for token utilities such as `bg-background`, `bg-surface`, `bg-surface-raised`, `text-primary`, `text-muted`, `border-border`, `bg-brand`, `bg-cta`, `bg-accent`, `bg-accent-progress`, `text-error`, `ring-info`, and matching radius/font tokens.
  - [x] Keep `@theme` top-level. Per Tailwind v4 docs, use `@theme` when a design token should generate utilities and `:root`/selectors for regular runtime CSS variables.
  - [x] Implement dark-mode values through runtime CSS variables. Current app has no theme toggle, so `@media (prefers-color-scheme: dark)` is acceptable for this story; do not add a settings/theme feature here.
  - [x] Add base styles for `html`, `body`, focus rings, selection, reduced motion, and `font-variant-numeric` helper classes without overriding component behavior.

- [x] Replace Geist/Arial typography with the three-font role system in `app/layout.tsx` and globals (AC: 2)
  - [x] Replace `Geist` / `Geist_Mono` imports with `Bricolage_Grotesque`, `Space_Grotesk`, and `Inter` from `next/font/google`.
  - [x] Use font variables, for example `--font-display`, `--font-heading`, and `--font-body`; apply them at the root so Tailwind utilities can reference them.
  - [x] Use `display: "swap"` and `subsets: ["latin"]`.
  - [x] Remove the current `font-family: Arial, Helvetica, sans-serif` body override.
  - [x] Keep app providers and route structure unchanged.

- [x] Tokenize the public landing page in `app/page.tsx` (AC: 1, 2, 3, 4)
  - [x] Replace hardcoded hex classes and ad hoc Tailwind palette classes with semantic token utilities.
  - [x] Remove broad blue/purple/green gradients and heavy `shadow-xl` / `shadow-2xl` card styling in favor of flat token surfaces, hairline borders, and reserved shadows only where allowed.
  - [x] Use the inverted primary CTA token pattern: navy fill with white text in light mode, white fill with black text in dark mode.
  - [x] Use display typography only for hero/major expressive lines; use heading/body/label/numeral utilities elsewhere.
  - [x] Convert standalone metric values such as `~50%`, `5 Min`, and `3x` to tabular lining numerals.
  - [x] Keep links and calls to `/login` and `/signup` behaviorally unchanged.

- [x] Tokenize auth pages and shared auth controls (AC: 1, 2, 3, 4)
  - [x] Update `app/login/page.tsx`, `app/signup/page.tsx`, and `app/components/misc/SignInWithGoogle.tsx`.
  - [x] Replace all `#142937`, `#166ea8`, `#1d4159`, `#9ccef0`, gray palette form styling, and small-radius classes with token utilities.
  - [x] Preserve existing API calls to `/api/login`, `/api/signup`, and `/api/login/google`.
  - [x] While touching `app/login/page.tsx`, replace the catch-path `alert(error)` with `toast.error(...)` to avoid preserving an explicitly banned feedback pattern.
  - [x] Do not implement the full 16+ age gate in this story; that belongs to Story 1.6 unless the developer sees an easy no-risk placeholder that does not call auth before confirmation.

- [x] Tokenize dashboard shell and card/control surfaces that render on the dashboard (AC: 1, 2, 3, 4)
  - [x] Update `app/dashboard/page.tsx`, `app/components/nav/AuthNav.tsx`, `app/components/cards/StatCards.tsx`, `app/components/cards/SetCards.tsx`, `app/components/cards/StudyBuddyCards.tsx`, `app/components/misc/Progress.tsx`, `app/components/misc/Profile.tsx`, `app/components/controllers/CreateSetController.tsx`, and `app/components/controllers/CreateStudyBuddyController.tsx`.
  - [x] Update dashboard modal/dropdown surfaces that can be opened from this page: `CreateSetModal.tsx`, `CreateStudyBuddyModal.tsx`, `SetDropdown.tsx`, `DeleteSetModal.tsx`, and `DocumentModal.tsx`.
  - [x] Replace ad hoc gray/blue/green/red palette use with semantic tokens. Use `error` only for destructive/error states, `accent` only for completion/reward moments, and `accent-progress` for always-on progress.
  - [x] Replace `rounded-sm` / `rounded-md` on changed UI with `rounded-xl`, `rounded-2xl`, or `rounded-full` according to `DESIGN.md`.
  - [x] Replace static card shadows with token surfaces and borders. Keep soft shadows only for modals, dropdowns/popovers, and celebration-style overlays.
  - [x] Convert dashboard tab switches from clickable headings to real `<button>` controls if the file is being edited; maintain the current two-view behavior.
  - [x] Keep data fetching, local state, toast behavior, and card creation/deletion behavior unchanged except for removing `alert()` in touched paths.

- [ ] Verification and regression checks (AC: 1, 2, 3, 4)
  - [x] Run a lint/type/build check appropriate to the existing repo. Suggested order: `npm run lint`; if `next lint` is unavailable in this Next version, run `npx eslint .`; then run `npm run build` if required environment variables are available.
  - [ ] Manually smoke test `/`, `/login`, `/signup`, and `/dashboard` in light and dark OS preferences.
  - [x] Confirm no changed file contains new inline hex palette values. Existing external assets and source docs are not part of this check.
  - [ ] Confirm no changed interactive element loses keyboard operability or visible focus.

## Dev Notes

### Scope Boundaries

This story is the foundation pass for tokens and typography. It should not implement the full component library, 5-tab app shell, onboarding flow, route-protection expansion, accessibility test/CI scaffold, or full landing/auth redesign beyond token compliance. Those are Stories 1.2 through 1.10.

Do not upgrade Next.js, React, Tailwind, or other dependencies as part of this story. Local lockfile baselines are Next.js 15.3.3, React/React DOM 19.1.0, Tailwind CSS 4.1.8, `@tailwindcss/postcss` 4.1.8, and TypeScript 5.8.3. Dependency upgrades require a separate migration story.

### Source Requirements

- Epic/story source: `_bmad-output/planning-artifacts/epics.md`, Story 1.1.
- UX token source: `_bmad-output/planning-artifacts/ux-designs/ux-Learnium-2026-07-05/DESIGN.md`.
- UX behavior/accessibility source: `_bmad-output/planning-artifacts/ux-designs/ux-Learnium-2026-07-05/EXPERIENCE.md`.
- Architecture source: `_bmad-output/planning-artifacts/architecture/architecture-Learnium-2026-07-05/ARCHITECTURE-SPINE.md`.
- Project rules source: `_bmad-output/project-context.md`.

### Token Values To Implement

Use the final `DESIGN.md` values, including review-adjusted accessible tokens already reflected in the current planning artifact:

| Token | Light | Dark |
| --- | --- | --- |
| `background` | `#FFFFFF` | `#000000` |
| `surface` | `#F7F8FA` | `#0C1116` |
| `surface-raised` | `#FFFFFF` | `#18222C` |
| `border` | `#E6E9EE` | `#1C2530` |
| `border-strong` | `#D3D9E0` | `#2A3644` |
| `border-interactive` | `#6B7480` | `#4D5B6A` |
| `text-primary` | `#0B0F14` | `#F5F7FA` |
| `text-muted` | `#5A6672` | `#8B98A5` |
| `text-disabled` | `#9AA6B2` | `#5A6672` |
| `brand` | `#142937` | `#5B7E9A` |
| `brand-hover` | `#0E1F2B` | `#6B8EAA` |
| `cta-fill` | `#142937` | `#FFFFFF` |
| `cta-text` | `#FFFFFF` | `#000000` |
| `cta-fill-hover` | `#0E1F2B` | `#E6E9EE` |
| `cta-disabled` | `#E6E9EE` | `#2A3644` |
| `accent` | `#84CC16` | `#84CC16` |
| `accent-glow` | `#B8F135` | `#B8F135` |
| `accent-progress` | `#4D7C0F` | `#84CC16` |
| `accent-progress-track` | `#D3D9E0` | `#2A3644` |
| `on-accent` | `#0B1400` | `#0B1400` |
| `streak` | `#F59E0B` | `#F59E0B` |
| `success` | `#84CC16` | `#84CC16` |
| `warning` | `#F59E0B` | `#F59E0B` |
| `error` | `#DC2626` | `#F87171` |
| `info` | `#3B82F6` | `#60A5FA` |

Spacing scale: `1=4px`, `2=8px`, `3=12px`, `4=16px`, `6=24px`, `8=32px`, `12=48px`, `16=64px`, `content-max=72rem`.

Radius scale: `xl=12px`, `2xl=16px`, `full=9999px`. Do not add new radii in changed files.

Typography:

- Display/celebration: Bricolage Grotesque, weights 800/700, tight leading. Use only for hero-scale expressive lines, empty-state personality, and celebration headers.
- Functional headings, labels, and standalone gamified numerals: Space Grotesk, weights 700/500.
- Body/descriptions/forms/lesson/chat copy: Inter, weights 400/500, line-height around 1.6.
- Standalone XP, streak, level, league rank, and progress percentages must use `font-variant-numeric: tabular-nums lining-nums`.
- If a gamified number appears inside a display/celebration headline, it may stay in the display font; standalone counters use the numeral utility.

### Architecture Compliance

- Next.js App Router is the app framework. Preserve `app/` route conventions and existing route paths.
- Tailwind CSS v4 is already configured through `postcss.config.mjs` with `@tailwindcss/postcss`; keep token work in CSS, not a new Tailwind config file unless the repo later establishes one.
- Use path alias `@/*` for new imports outside same-folder local imports.
- TypeScript strictness is enabled. Do not add `any`, loosen `tsconfig`, or suppress type errors.
- Named-export rule applies to `lib/`, `actions/`, and API routes. This story mostly touches pages/components where default component exports already exist; keep local convention.
- No test framework exists. Do not add Jest/Vitest/Playwright files in this story.

### Current File State and Required Changes

`app/globals.css`

- Current state: imports Tailwind, defines only `--background` and `--foreground`, maps them in `@theme inline`, switches dark mode to `#0a0a0a`/`#ededed`, and forces `body` to Arial.
- Change: make this the authoritative design-token bridge for Tailwind v4 and runtime CSS variables. Add semantic colors, font variables, spacing/radius aliases, base typography classes/utilities, focus ring defaults, reduced-motion guardrails, and no-scrollbar utility preservation.
- Preserve: existing `.no-scrollbar` utility unless replaced with an equivalent.

`app/layout.tsx`

- Current state: imports `Geist` and `Geist_Mono`, applies their variables on `<body>`, default metadata is "Create Next App".
- Change: load Bricolage Grotesque, Space Grotesk, and Inter through `next/font/google`; apply variables to `<html>` or `<body>`; update metadata to Learnium-appropriate values.
- Preserve: `Providers` wrapper and `<html lang="en">`.

`app/page.tsx`

- Current state: public landing page uses many hardcoded hex classes (`#142937`, `#1a3a4a`), blue/purple/green gradients, default Tailwind grays, heavy shadows, and broad rounded-full buttons.
- Change: tokenized landing surface using Midnight Ink / Pure tokens, token typography, three radii, and reserved accent behavior.
- Preserve: current content structure and existing links unless Story 1.5 later redesigns content.

`app/login/page.tsx`

- Current state: client page posts to `/api/login`, uses hardcoded navy/blue auth card styles, forced gray background, small radii, and `alert(error)` in catch. Successful auth redirects to `/dashboard`.
- Change: tokenized auth layout and inputs. Replace `alert(error)` with `toast.error("Login failed. Please try again.")` or similarly factual copy.
- Preserve: API payload shape, loading behavior, toast success, and redirect behavior.

`app/signup/page.tsx`

- Current state: client page validates username/password locally, posts to `api/signup`, has hardcoded colors and no age gate yet.
- Change: tokenized signup layout and inputs. Keep validation behavior intact.
- Preserve: current API payload shape and email-confirmation toast. Do not implement age gate here unless explicitly pulled into Story 1.6.

`app/components/misc/SignInWithGoogle.tsx`

- Current state: Google auth button uses hardcoded navy/blue classes and imports unused `toast` and `createSupabaseClient`.
- Change: tokenized button. Remove unused imports if lint complains.
- Preserve: form action `/api/login/google` and GET method.

`app/dashboard/page.tsx`

- Current state: dashboard page fetches sets, buddies, and profile data; uses gray backgrounds, shadowed skeletons, clickable `<h2>` tabs, and tokenless layout.
- Change: tokenized dashboard container, skeletons, segmented control, text, and spacing/radius. Convert tab headings to buttons with `type="button"` and pressed/selected state if editing this block.
- Preserve: fetch order, state shape, set/buddy/profile data mapping, toast messages unless replacing alerts.

`app/components/nav/AuthNav.tsx`

- Current state: fixed top nav, fetches username, uses `alert()` in sign-out errors, and hardcoded blue/gray styling.
- Change: tokenized top nav. Replace `alert()` failure paths with `toast.error(...)`.
- Preserve: fixed top behavior for now; Story 1.3 owns full 5-tab nav.

Dashboard children:

- `StatCards.tsx`: tokenized raised card, heading/body/numeral typography, no static card shadow.
- `SetCards.tsx`: tokenized set card, category pill, progress text, progress bar, and action button. Existing `router.replace` helper is unused because the rendered button is wrapped in `Link`; do not introduce new replace-based navigation.
- `StudyBuddyCards.tsx`: same token treatment; primary chat action and secondary document action should use token button styles.
- `Progress.tsx`: current dynamic class `bg-${color ?? "blue"}-600` will not be statically discoverable by Tailwind and falls back to inline `#2563eb`. Replace with token classes/CSS variables; keep width and percentage behavior.
- `Profile.tsx`: tokenized button/dropdown. If touching delete-account styling, keep destructive copy factual and use error tokens only for destructive affordance.
- `CreateSetController.tsx` and `CreateStudyBuddyController.tsx`: tokenized trigger buttons using primary/secondary patterns as appropriate.

Dashboard modals/dropdowns:

- `CreateSetModal.tsx`: tokenized modal, fields, validation text, overlay, and buttons. Replace `alert()` paths with toasts.
- `CreateStudyBuddyModal.tsx`: tokenized modal and file-upload UI. Do not change the current RAG localhost behavior in this story; that belongs to Epic 2/deploy hardening.
- `SetDropdown.tsx`, `DeleteSetModal.tsx`, `DocumentModal.tsx`: tokenized dropdown/modal shells. Keep destructive/delete affordance understandable without color alone.

### Anti-Regression Guardrails

- No new inline hex palette values in changed application files. Token values belong in `globals.css`; component usage should reference token utilities or CSS variables.
- No new ad hoc `bg-blue-*`, `text-purple-*`, `bg-green-*`, or broad gradient surfaces in changed files. Semantic tokens should carry meaning.
- Bright lime (`accent`) is for reward/completion moments such as XP, correct answers, Complete/Continue actions, or success bursts. Muted `accent-progress` is for progress bars/rings. Amber is for streak only.
- Primary CTA is inverted by mode. Do not make lime the generic primary button.
- Cards are flat: surface + border. Shadows are reserved for modals, popovers/dropdowns, toasts, and celebrations.
- Keep touch targets at least 44px for changed buttons/links where practical.
- Preserve existing user-visible flows: landing links, auth submit, dashboard data load, set card link to `/sets/[id]`, buddy card link to `/buddy/[id]`, create modal submit behavior, and profile dropdown actions.

### Latest Technical Context

- Next.js docs currently show latest docs version 16.2.10, but this repo is on Next.js 15.3.3. Do not upgrade in this story. The `next/font` module is still the right path for Google fonts; it self-hosts font files and avoids browser requests to Google. Source: https://nextjs.org/docs/app/api-reference/components/font
- Tailwind v4 theme variables should use `@theme` when tokens need utility classes. `@theme` variables must be top-level, while regular runtime variables can live in `:root` and dark selectors/media queries. Source: https://tailwindcss.com/docs/theme
- Tailwind supports manual dark-mode selectors through `@custom-variant dark (...)`; however, this repo has no theme setting yet. Prefer `prefers-color-scheme` runtime variables for this story unless a minimal `data-theme` hook already exists. Source: https://tailwindcss.com/docs/dark-mode
- React 19.2 is available, but this story does not need React 19.2-only APIs. Keep code compatible with the lockfile's React 19.1.0. Source: https://react.dev/blog/2025/10/01/react-19-2

### Previous Story Intelligence

No previous story exists in Epic 1. There is no prior story implementation file to mine for local conventions.

### Git Intelligence

Recent commits are documentation and UI/UX planning heavy:

- `98aff9e Created FRs & NFRs`
- `91ae5e9 Docs: Spec documentation`
- `368989b feat: Drastic UI/UX Overhaul, lets go`
- `21457cd UI/UX overhaul plan`
- `66ca476 Arnav Onboarding`

Use the planning artifacts as the stronger source of truth for this story; the code still reflects older styling patterns.

### Testing Requirements

- No automated test framework is configured. Do not create test files just for this story.
- Minimum verification:
  - `npm run lint` or `npx eslint .` if the configured lint script is not viable.
  - `npm run build` if local environment variables allow a build.
  - Manual visual smoke for `/`, `/login`, `/signup`, and `/dashboard` in light and dark modes.
  - Search changed app files for hardcoded palette values and banned broad gradients/shadows.

### Implementation Notes for the Dev Agent

Recommended token utility pattern:

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --surface: #f7f8fa;
  --surface-raised: #ffffff;
  --border: #e6e9ee;
  --text-primary: #0b0f14;
  --font-body: var(--font-inter);
}

@theme inline {
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-border: var(--border);
  --color-text-primary: var(--text-primary);
  --font-body: var(--font-inter);
  --font-heading: var(--font-space-grotesk);
  --font-display: var(--font-bricolage);
  --radius-xl: 12px;
  --radius-2xl: 16px;
}
```

Recommended font loading pattern:

```tsx
import {
  Bricolage_Grotesque,
  Inter,
  Space_Grotesk,
} from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});
```

## Project Structure Notes

- The project is a Next.js App Router app with `app/`, `actions/`, `lib/`, and `rag/`.
- Styling is currently Tailwind utility classes plus `app/globals.css`; there is no shadcn or component-system dependency to align with.
- This story should centralize design tokens in `app/globals.css` and consume them from existing pages/components rather than introducing a third-party UI library.
- New shared helper classes in `globals.css` are acceptable when they directly represent the design roles, for example `.text-display`, `.text-heading-1`, `.text-label`, `.text-numeral`, `.focus-ring`, `.btn-primary-token`, but avoid building the full component library here.

## References

- `_bmad-output/planning-artifacts/epics.md` - Story 1.1 acceptance criteria and Epic 1 context.
- `_bmad-output/planning-artifacts/ux-designs/ux-Learnium-2026-07-05/DESIGN.md` - final color, type, radius, spacing, and component visual tokens.
- `_bmad-output/planning-artifacts/ux-designs/ux-Learnium-2026-07-05/EXPERIENCE.md` - accessibility floor, mobile-first behavior, state patterns, and Nova voice.
- `_bmad-output/planning-artifacts/ux-designs/ux-Learnium-2026-07-05/review-accessibility.md` - contrast and accessibility findings that shaped current token values.
- `_bmad-output/planning-artifacts/ux-designs/ux-Learnium-2026-07-05/reconcile-stitch-mockups.md` - Stitch mockups are layout references only; `DESIGN.md` and `EXPERIENCE.md` win on conflicts.
- `_bmad-output/planning-artifacts/architecture/architecture-Learnium-2026-07-05/ARCHITECTURE-SPINE.md` - stack, source tree, route/auth, testing, and architectural invariants.
- `_bmad-output/project-context.md` - agent implementation rules and local stack facts.
- `package.json` and `package-lock.json` - local dependency baselines.

## Dev Agent Record

### Agent Model Used

gpt-5.3-codex (model ID: gpt-5.3-codex)

### Debug Log References

- `npm run lint` (fails due pre-existing repository-wide ESLint issues in untouched files)
- `npx eslint` on touched story files (passes)
- `npm run build` (fails at repository-wide lint/type stage in untouched files)
- `rg "#[0-9A-Fa-f]{3,8}" app` and targeted changed-file palette scan

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Implemented full token bridge in `app/globals.css` with light/dark semantic runtime variables, Tailwind v4 `@theme inline` aliases, typography helpers, reduced-motion, selection, and focus defaults.
- Replaced Geist/Arial with `Bricolage_Grotesque`, `Space_Grotesk`, and `Inter` in `app/layout.tsx`, including swap loading and root font variables.
- Tokenized landing, auth, dashboard shell, cards, controllers, nav, and modals; replaced hardcoded palette styling and removed banned `alert(...)` usage in touched auth/dashboard flows.
- Updated dashboard segment tabs to button controls and replaced progress-bar dynamic palette logic with token-based colors.
- Story remains **in-progress** pending manual cross-theme smoke testing and keyboard-focus interaction verification.

### File List

- app/globals.css
- app/layout.tsx
- app/page.tsx
- app/login/page.tsx
- app/signup/page.tsx
- app/dashboard/page.tsx
- app/components/nav/AuthNav.tsx
- app/components/cards/StatCards.tsx
- app/components/cards/SetCards.tsx
- app/components/cards/StudyBuddyCards.tsx
- app/components/misc/Progress.tsx
- app/components/misc/Profile.tsx
- app/components/misc/SignInWithGoogle.tsx
- app/components/controllers/CreateSetController.tsx
- app/components/controllers/CreateStudyBuddyController.tsx
- app/components/modals/CreateSetModal.tsx
- app/components/modals/CreateStudyBuddyModal.tsx
- app/components/modals/SetDropdown.tsx
- app/components/modals/DeleteSetModal.tsx
- app/components/modals/DocumentModal.tsx

### Review Findings

- [x] [Review][Decision] Footer should use brand token shell vs surface-raised — resolved: reverted footer to `bg-brand` with `text-cta-text` / `text-surface` link hierarchy.

- [x] [Review][Patch] Progress `color` prop removed but profile still passes it [app/profile/page.tsx:261]
- [x] [Review][Patch] Primary buttons use `rounded-full` instead of DESIGN.md `rounded-xl` [app/page.tsx, app/login/page.tsx, app/signup/page.tsx, app/components/cards/*, app/components/controllers/*, app/components/modals/*]
- [x] [Review][Patch] Set and Study Buddy cards use `rounded-2xl` instead of `rounded-xl` [app/components/cards/SetCards.tsx:47, app/components/cards/StudyBuddyCards.tsx:31]
- [x] [Review][Patch] Landing feature/social-proof cards use `rounded-2xl` instead of default `rounded-xl` [app/page.tsx]
- [x] [Review][Patch] Dark mode missing `--accent-progress-track` override [app/globals.css:88]
- [x] [Review][Patch] Modal overlays still hardcode `bg-black/20` [app/components/modals/DeleteSetModal.tsx:21, app/components/modals/DocumentModal.tsx:45]
- [x] [Review][Patch] CreateStudyBuddy success path calls `onCreateStudyBuddy` without `buddyId`, causing `/buddy/0` links [app/components/modals/CreateStudyBuddyModal.tsx:156]
- [x] [Review][Patch] CreateStudyBuddy success fires duplicate toasts [app/components/modals/CreateStudyBuddyModal.tsx:158, app/dashboard/page.tsx:113]
- [x] [Review][Patch] CreateStudyBuddy non-success RAG status has no error handling [app/components/modals/CreateStudyBuddyModal.tsx:155]
- [x] [Review][Patch] AuthNav uses `bg-surface-raised` instead of DESIGN.md `nav-top-bar` `background` token [app/components/nav/AuthNav.tsx:58]
- [x] [Review][Patch] Dashboard segment tabs lack `aria-pressed` selected semantics [app/dashboard/page.tsx:282]
- [x] [Review][Patch] StatCards trophy icon misuses `text-accent` for decorative chrome [app/components/cards/StatCards.tsx:17]
- [x] [Review][Patch] Landing marketing numerals misuse `text-accent-progress` [app/page.tsx]
- [x] [Review][Patch] DocumentModal file-size badges misuse `warning`/`accent` tokens [app/components/modals/DocumentModal.tsx:5]
- [x] [Review][Patch] Primary CTAs on `bg-brand` sections lack contrast in light mode (CTA fill equals brand) [app/page.tsx]
- [x] [Review][Patch] Form inputs use `bg-background` instead of DESIGN.md `surface-raised` [app/login/page.tsx, app/signup/page.tsx, app/components/modals/CreateSetModal.tsx]
- [x] [Review][Patch] Delete Account button lacks `text-error` destructive styling [app/components/misc/Profile.tsx:311]
- [x] [Review][Patch] SetDropdown ellipsis trigger missing `aria-label` [app/components/modals/SetDropdown.tsx:32]
- [x] [Review][Patch] Remove debug `console.log` in CreateStudyBuddyController [app/components/controllers/CreateStudyBuddyController.tsx:19]
- [x] [Review][Patch] `.text-numeral` missing required `font-weight: 700` [app/globals.css:116]

- [x] [Review][Defer] Manual light/dark smoke test and keyboard-focus verification not completed — deferred, verification task still open in story
- [x] [Review][Defer] Routes outside story scope still use hardcoded palette (profile, sets, buddy, lessons) — deferred, pre-existing out-of-scope surfaces
- [x] [Review][Defer] `#demo` hero link has no matching anchor — deferred, pre-existing
- [x] [Review][Defer] `clamp()` responsive type ramp from DESIGN.md not implemented — deferred, foundation pass uses fixed sizes
- [x] [Review][Defer] Button-inside-`Link` nesting persists on cards and landing — deferred, pre-existing pattern

## Change Log

- 2026-07-05: Added semantic design tokens and typography system, then applied tokenized styling across landing, auth, and dashboard surfaces listed in Story 1.1.
- 2026-07-05: Code review patches applied — footer brand shell restored, 19 code fixes applied across tokens, radii, semantics, modals, and study-buddy create flow.
