---
baseline_commit: a3a84055adb9a09e9eea3d7c9a9a8991612796cd
---

# Story 1.3: App Layout Shell and 5-Tab Navigation

Status: done

<!-- Note: Ultimate context engine analysis completed - comprehensive developer guide created. -->

## Story

As a learner,
I want persistent navigation to Home, Learn, Review, Leagues, and Profile,
so that I can reach any major area of the app in one tap.

## Acceptance Criteria

1. Given an authenticated user on any protected app route, when the page renders on mobile (<768px), then a fixed bottom navigation bar shows five tabs: Home, Learn, Review, Leagues, Profile, and each tab target is at least 44px with an accessible label.
2. Given an authenticated user on desktop (≥768px), when the page renders, then a top navigation bar shows the same five tabs with logo left and status chrome right-aligned, and the active tab is indicated by more than color alone (icon + label + `aria-current`).
3. Given route structure for primary tabs, when navigation links are clicked, then Home resolves to `/dashboard`, Learn to a Learn hub route, Review to `/review`, Leagues to `/leagues`, and Profile to `/profile`, and each route renders inside the shared app layout shell without full-page remount of chrome.
4. Given unauthenticated users on public routes (landing, login, signup), when those pages render, then the 5-tab bar is not shown, and marketing/auth layout remains distinct but token-consistent.

## Tasks / Subtasks

- [x] Create the `(app)` route group and shared layout shell (AC: 3, 4)
  - [x] Create `app/(app)/layout.tsx` — a route group folder (parentheses are routing-invisible in Next.js App Router; URLs are unaffected). This layout renders the new `AppNav` once and a single `<main id="main-content">{children}</main>`, so navigating between tabs re-renders only `children`, not the nav — satisfying "without full-page remount of chrome".
  - [x] Move `app/dashboard/page.tsx` → `app/(app)/dashboard/page.tsx` and `app/profile/page.tsx` → `app/(app)/profile/page.tsx`. URLs stay `/dashboard` and `/profile` — only the file location changes.
  - [x] In both moved files: remove the `<AuthNav />` call and the page's own outer `<main>` wrapper (the route group layout now owns the single `<main>` landmark — two nested `<main>` elements would violate the "one `<main>`" accessibility floor rule). Keep the inner content wrapper `<div>`/padding as needed, adjusted for the new nav's height (see Current File State below).
  - [x] Create three new minimal stub pages inside the group: `app/(app)/learn/page.tsx`, `app/(app)/review/page.tsx`, `app/(app)/leagues/page.tsx`. Each is a simple server component rendering a heading + short "coming soon" placeholder (e.g. `<h1 className="text-heading text-2xl text-primary">Review</h1>`) — full content is out of scope (see Scope Boundaries). Do not add a nested `<main>`; the route group layout supplies it.
  - [x] Do not move `app/sets/[setId]`, `app/buddy/[buddyId]`, or `app/subscriptions` into `app/(app)/` in this story. Per `EXPERIENCE.md`, lesson/quiz/review-session and paywall surfaces are intentionally full-screen and reached from inside a tab, not primary tabs themselves — they keep their current top-level location and are out of scope here.
  - [x] Confirm `app/page.tsx` (landing), `app/login/page.tsx`, `app/signup/page.tsx` stay outside `app/(app)/` and render no tab nav (AC 4).

- [x] Register new routes with the auth gate (AC: 1, 2, 3)
  - [x] In `middleware.ts`, add `"/learn"`, `"/review"`, `"/leagues"` to the existing `protectedPaths` array (AD-2: `protectedPaths` is the single route gate; matching is `startsWith` prefix-based — only add these three exact new segments, do not restructure the existing array or its matching logic).

- [x] Build the shared `AppNav` component (AC: 1, 2)
  - [x] Create `app/components/nav/AppNav.tsx` ("use client", needs `usePathname()`). Define one shared tab-config array (`{ label, href, icon }` for Home/Learn/Review/Leagues/Profile) consumed by both the desktop and mobile markup so the tab list is never duplicated.
  - [x] Desktop (`hidden md:flex`, ≥768px): sticky top bar — `bg-background`, hairline bottom border (`border-b border-border`), logo + "Learnium" left (reuse the `BookOpen` + wordmark pattern from `AuthNav.tsx`), the 5 tabs, and an empty right-aligned status-chrome slot container (e.g. `<div id="chrome-slot" className="flex items-center gap-3" />`) that Story 1.4 populates — do not build XP pill/streak/quota/avatar content here.
  - [x] Mobile (`flex md:hidden`, <768px): fixed bottom bar — `bg-surface-raised`, hairline top border (`border-t border-border`), 5 icon+label tabs, each a real `<Link>` with a ≥44px touch target (`min-h-11`, adequate horizontal padding).
  - [x] Use `usePathname()` to compute the active tab (`pathname.startsWith(tab.href)`) and mark it with `aria-current="page"` plus a visual treatment beyond color alone (e.g. filled/tinted icon + bold label + a background pill), per UX-DR8 and the "more than color alone" AC wording.
  - [x] Every tab is a real `<Link href={...}>` — never a styled `<div>`/`onClick` handler on a non-interactive element (`EXPERIENCE.md` Accessibility Floor explicitly calls out this exact anti-pattern from a prior audit).
  - [x] Wrap the tab list in `<nav aria-label="Primary">` (a labelled landmark, distinct from any other `<nav>` on the page).
  - [x] Add a visually-hidden-until-focused skip link (`sr-only focus:not-sr-only`) as the first element in the route group layout, pointing to `href="#main-content"`, ahead of `AppNav` in the DOM.
  - [x] Set `scroll-padding-top`/`scroll-margin-top` on the scroll container to match the desktop sticky-nav height, and equivalent bottom spacing/`scroll-margin-bottom` for the mobile fixed bar, so keyboard focus is never hidden behind persistent chrome (`EXPERIENCE.md` "Focus not obscured").
  - [x] Use `focus-ring` (established in Story 1.1's `globals.css`) on every tab link for the visible 2px focus ring.

- [x] Preserve sign-out capability (regression guardrail, no direct AC)
  - [x] `AuthNav.tsx`'s `Profile` dropdown (`app/components/misc/Profile.tsx`) is currently the *only* sign-out entry point in the app. Since `AppNav` replaces `AuthNav` on the migrated `dashboard`/`profile` pages, reuse the existing `Profile` dropdown (mount it in the desktop chrome-slot area, or link the Profile tab to an accessible sign-out affordance) so a signed-in user can still sign out after this story ships. Do not delete this capability before Story 1.8 (Settings & route protection) provides its replacement home.
  - [x] Do not delete `AuthNav.tsx` or `Profile.tsx` — `app/sets/[setId]`, `app/buddy/[buddyId]`, and `app/subscriptions` are not migrated in this story and may still reference them.

- [x] Verification and regression checks (AC: 1, 2, 3, 4)
  - [x] Run `npm run lint` (falls back to `npx eslint .`) on new/changed files.
  - [x] Run `npm run build` if local environment variables allow a build.
  - [x] Manually resize the viewport across the 768px breakpoint and confirm the nav swaps between fixed bottom bar (mobile) and sticky top bar (desktop).
  - [x] Click/tap all 5 tabs and confirm correct routes (`/dashboard`, the Learn route, `/review`, `/leagues`, `/profile`) and that the nav bar itself does not flash/reset between navigations (chrome persists via the shared layout).
  - [x] Confirm the active tab shows `aria-current="page"` and a non-color visual cue (inspect via devtools/screen reader).
  - [x] Keyboard-only pass: `Tab` reaches the skip link first, then all 5 nav links, each with a visible focus ring; confirm focus is never obscured behind the sticky/fixed chrome when a focused element is near the top/bottom of the viewport.
  - [x] Confirm landing (`/`), `/login`, `/signup` render no tab bar.
  - [x] Confirm `middleware.ts` redirects an unauthenticated request to `/learn`, `/review`, or `/leagues` to `/login` (same behavior as the existing protected paths).
  - [x] Confirm dashboard's existing data-fetching (`/api/get-sets`, `/api/get-buddies`, `/api/get-profile-data`) still runs correctly after the file move — only the file path changed, not the component logic.
  - [x] Confirm no new inline hex values or ad hoc `bg-blue-*`/`bg-green-*`/gradient classes were introduced.

## Dev Notes

### Scope Boundaries

This story builds the navigation shell only: the `app/(app)/` route group, the shared layout (`layout.tsx` + single `<main>`), the `AppNav` component (mobile bottom bar + desktop top bar sharing one tab config), route registration for `/learn`, `/review`, `/leagues` in `middleware.ts`, and migrating `dashboard`/`profile` into the shared layout. It does **not** build:

- The actual Learn hub, Review queue, or Leagues standings content — those are Story 1.10 (Learn Hub Surface), Story 4.8 (Dashboard Due Reviews and Review Tab), and Story 6.3 (League Standings API and Page) respectively. The three new pages in this story are intentionally minimal placeholders that just need to resolve, render inside the shared chrome, and not error.
- The status chrome contents (XP pill, streak flame, daily-goal progress, quota remaining) — Story 1.4 populates the reserved right-aligned slot this story creates. Do not fetch or render gamification data here.
- Auth pages refresh (Story 1.6), onboarding flow routing (Story 1.7), or the Settings page (Story 1.8) — those touch `login`/`signup`/`onboarding`/account-settings surfaces, not this story's tab shell.
- Migrating `app/sets/[setId]`, `app/buddy/[buddyId]`, or `app/subscriptions` into the new layout — those are full-screen, non-tabbed surfaces per `EXPERIENCE.md` and stay top-level.

### Source Requirements

- Epic/story source: `_bmad-output/planning-artifacts/epics.md`, Story 1.3 (Epic 1).
- UX IA and nav behavior: `_bmad-output/planning-artifacts/ux-designs/ux-Learnium-2026-07-05/EXPERIENCE.md` (`## Information Architecture`, `## Accessibility Floor`).
- UX visual spec: `_bmad-output/planning-artifacts/ux-designs/ux-Learnium-2026-07-05/DESIGN.md` (`components.nav-top-bar`, `components.nav-mobile-bottom-bar` frontmatter, and `## Components` "Nav — top bar" / "Nav — mobile bottom bar" prose).
- Architecture: `_bmad-output/planning-artifacts/architecture/architecture-Learnium-2026-07-05/ARCHITECTURE-SPINE.md` (AD-2 route protection, Consistency Conventions "Protected surfaces" row, Structural Seed).
- Project rules: `_bmad-output/project-context.md`.
- Previous stories: `_bmad-output/implementation-artifacts/1-1-design-token-system-and-typography.md` (token/typography foundation), `_bmad-output/implementation-artifacts/1-2-core-ui-component-library.md` (UI primitives; not directly consumed by nav links but establishes token/radius discipline).

### Information Architecture — Tab Specs (from `EXPERIENCE.md`)

| Tab | Route (this story) | Surface owned by | Suggested `lucide-react` icon |
| --- | --- | --- | --- |
| Home | `/dashboard` (existing) | Story 1.3 (migrate only) | `Home` |
| Learn | `/learn` (new stub) | Story 1.10 builds real content | `GraduationCap` (distinct from the logo's `BookOpen`) |
| Review | `/review` (new stub) | Story 4.8 builds real content | `Repeat` |
| Leagues | `/leagues` (new stub) | Story 6.3 builds real content | `Trophy` |
| Profile | `/profile` (existing) | Story 1.3 (migrate only) | `CircleUser` |

Persistent chrome regardless of tab — XP pill, streak flame, daily-goal progress, quota remaining — is reachable from the top/bottom bar per `EXPERIENCE.md`, but its *contents* are Story 1.4's scope; this story only reserves the slot.

### Architecture Compliance

- Next.js App Router route groups (`app/(app)/`) are the correct mechanism to share a persistent layout across `/dashboard`, `/profile`, `/learn`, `/review`, `/leagues` without changing their URLs and without duplicating chrome markup per page.
- AD-2 (Auth And Route Protection): `middleware.ts` `protectedPaths` remains the single route gate. Adding `/learn`, `/review`, `/leagues` is required — a new authenticated top-level route that is not added here stays publicly accessible. Matching is prefix-based (`url.pathname.startsWith(path)`); the three new entries are exact single-segment paths so they will not accidentally shadow unrelated routes, and vice versa nothing existing shadows them.
- Path alias `@/*` for new component imports; TypeScript `strict: true` — type the tab config array explicitly (no `any`).
- Named exports preferred for the new multi-purpose `AppNav.tsx` (consistent with Story 1.2's convention for shared component files).
- No test framework exists — do not add Jest/Vitest/Playwright files.
- Tailwind v4 tokens only (`bg-background`, `bg-surface-raised`, `border-border`, `text-primary`, `text-muted`, `focus-ring`, etc. from `app/globals.css`); no new hardcoded hex values.

### Current File State and Required Changes

`middleware.ts`
- Current state: `protectedPaths = ["/dashboard", "/sets", "/profile", "/subscriptions"]`.
- Change: append `"/learn"`, `"/review"`, `"/leagues"`.
- Preserve: existing prefix-match logic and the other three entries untouched.

`app/dashboard/page.tsx` (→ `app/(app)/dashboard/page.tsx`)
- Current state: `"use client"` component; renders `<AuthNav />`, then `<main className="mx-auto max-w-[72rem] px-4 pt-16 sm:px-6 lg:px-8">` wrapping stat cards, set/study-buddy toggle, and data fetching via `useEffect` (`/api/get-sets`, `/api/get-buddies`, `/api/get-profile-data`).
- Change: remove the `<AuthNav />` call and the outer `<main>` tag (replace with a `<div>` keeping the same className, or fold the className onto the existing wrapper) since the route group layout now supplies the sole `<main id="main-content">`. Adjust `pt-16` if the new nav's height differs so content doesn't sit under/behind the sticky bar.
- Preserve: all existing state, `useEffect` data fetching, and card rendering logic unchanged — this is a wrapper-only edit.

`app/profile/page.tsx` (→ `app/(app)/profile/page.tsx`)
- Current state: `"use client"` component; renders `<AuthNav />`, then its own `<main className="max-w-7xl mx-auto pt-20 text-center relative">` with profile/stat/completed-sets cards. Note this page still uses pre-Story-1.1 hardcoded classes (`bg-gray-50`, `shadow-md`, hex colors) — it was **not** included in Story 1.1's token migration scope (only landing/auth/dashboard were).
- Change: remove `<AuthNav />` and the outer `<main>` tag for the same reason as dashboard. Do **not** otherwise retokenize this page's inline styles in this story — that hardcoded-styling cleanup is out of scope here (not listed in this story's ACs) and shouldn't be bundled in as scope creep; only touch what's needed to fit the new shared layout.
- Preserve: all existing data fetching and card markup.

`app/components/nav/AuthNav.tsx`, `app/components/misc/Profile.tsx`
- Current state: `AuthNav` renders a fixed top bar with logo, username, and the `Profile` dropdown (avatar, view-profile, sign-out, delete-account).
- Change: none to the files themselves. Stop importing `AuthNav` from the migrated `dashboard`/`profile` pages; reuse `Profile`'s sign-out capability from within the new `AppNav` chrome slot (see task above) so it isn't lost.
- Preserve: keep both files intact and unimported-but-present for `app/sets/[setId]`, `app/buddy/[buddyId]`, `app/subscriptions`, which still use `AuthNav` and are not touched by this story.

`app/(app)/layout.tsx` (new)
- Current state: does not exist.
- Change: add a layout rendering the skip link, `<AppNav />`, and `<main id="main-content">{children}</main>`.

`app/components/nav/AppNav.tsx` (new)
- Current state: does not exist.
- Change: add the shared 5-tab nav component per the tasks above.

`app/(app)/learn/page.tsx`, `app/(app)/review/page.tsx`, `app/(app)/leagues/page.tsx` (new)
- Current state: do not exist (no `/review` or `/leagues` route exists anywhere in the repo today; `/sets` exists but has no index page).
- Change: add minimal placeholder pages as described above.

`app/page.tsx`, `app/login/page.tsx`, `app/signup/page.tsx`
- Current state: public marketing/auth pages, no nav bar today (or their own distinct auth-specific header).
- Change: none required by this story — confirm (do not modify) that they stay outside `app/(app)/` and unaffected by `AppNav`.

### Anti-Regression Guardrails

- Do not change dashboard's or profile's existing data-fetching effects, state, or card components — this story only touches the outer chrome wrapper (`AuthNav`/`main` removal) during the file move.
- Do not remove the only existing sign-out entry point without providing a replacement in the new chrome (see "Preserve sign-out capability" task).
- Do not modify the existing four `protectedPaths` entries in `middleware.ts` — only append the three new ones.
- Do not migrate `app/sets/[setId]`, `app/buddy/[buddyId]`, or `app/subscriptions` into `app/(app)/` in this story.
- Do not render two nested `<main>` landmarks on any migrated or new page — the route group layout owns the single `<main id="main-content">`.
- No `onClick` on a `<div>`/non-interactive element for any tab — use real `<Link>` elements (the exact anti-pattern `EXPERIENCE.md` calls out as a prior audit finding).
- No new inline hex values or ad hoc `bg-blue-*`/`bg-green-*`/gradient classes in new nav files; use existing tokens only.
- Do not build the XP pill/streak/quota/avatar status content in this story — only the reserved slot container.

### Previous Story Intelligence

Story 1.2 (Core UI Component Library, status `done`) added `app/components/ui/{Button,Card,Pill,ProgressBar,Input,Modal,Toast}.tsx` and wired the shared `Toast`/`Toaster` config into `app/providers.tsx`. Relevant carry-forward facts:

- Radius discipline was a repeated review finding across 1.1 and 1.2: `rounded-xl` for buttons/cards/inputs, `rounded-2xl` reserved for `Modal` only, `rounded-full` reserved for `Pill`/avatar-style circles. Neither `DESIGN.md`'s `nav-top-bar` nor `nav-mobile-bottom-bar` component spec lists a radius token (they're plain sticky/fixed bars with a hairline border) — do not invent a rounded treatment for the nav bars themselves.
- `.focus-ring` (2px `--info` ring, offset) was established in Story 1.1's `globals.css` and used throughout 1.2's primitives — reuse it directly for nav link focus states rather than redefining a focus style.
- The `--overlay` CSS variable and other semantic tokens (`bg-background`, `bg-surface-raised`, `border-border`, `text-primary`, `text-muted`) are already defined in `app/globals.css`; this story should not add new `@theme` entries — the nav bar's visual spec (background/border/active tokens) maps directly to existing tokens.
- No automated test framework was added or expected in 1.1/1.2; verification stayed manual lint/build/visual-smoke. This story follows the same pattern, plus a keyboard/screen-reader landmark pass since this is the first story to introduce app-wide `<nav>`/skip-link landmarks.
- `app/components/ui/` primitives are not required by this story's nav links (tabs are plain `<Link>` elements per the nav visual spec, not buttons), but the placeholder Learn/Review/Leagues pages may use `Card`/typography utilities if a small "coming soon" panel reads better than bare text — optional, not required.

### Git Intelligence

Recent commits are documentation/token-foundation heavy, with no prior touch to routing or `app/components/nav/`:

- `a3a8405 bmad` (BMad tooling sync, not app code)
- `fc6b4ac` / `28505c0 apply design tokens and typography across landing, auth, and dashboard` (Story 1.1 — note profile was *not* included in this pass, confirmed by profile page still using hardcoded gray/shadow classes)
- `98aff9e Created FRs & NFRs`
- `91ae5e9 Docs: Spec documentation`

Story 1.2's new `app/components/ui/*` files and the `app/providers.tsx` `Toaster` config are present in the working tree but not yet committed as of this story's creation — treat them as already-landed foundation, not pending work.

This story is the first to touch `middleware.ts`, create an App Router route group, or add anything under `app/components/nav/` beyond the existing `AuthNav.tsx`.

### Testing Requirements

- No automated test framework is configured. Do not create test files just for this story.
- Minimum verification:
  - `npm run lint` (or `npx eslint .` if the lint script is not viable).
  - `npm run build` if local environment variables allow a build.
  - Manual breakpoint check at 768px confirming the mobile/desktop nav swap.
  - Manual click-through of all 5 tabs confirming correct destination routes and that the shared chrome does not visibly remount/flicker between them.
  - Keyboard-only pass: skip link first in tab order, then all 5 nav links reachable with a visible focus ring; confirm no focused element is hidden behind sticky/fixed chrome.
  - Screen-reader spot check (or DOM inspection) confirming `aria-current="page"` on the active tab and a labelled `<nav aria-label="Primary">` landmark.
  - Confirm unauthenticated requests to `/learn`, `/review`, `/leagues` redirect to `/login` like the existing protected paths.
  - Confirm `/`, `/login`, `/signup` render without the tab bar.
  - Search changed files for hardcoded palette values, banned gradients/shadows, and `onClick` on non-interactive elements.

### Implementation Notes for the Dev Agent

Recommended tab config + `AppNav` shape (adjust to taste, keep the shared-array structure):

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, GraduationCap, Repeat, Trophy, CircleUser } from "lucide-react";

const TABS = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Learn", href: "/learn", icon: GraduationCap },
  { label: "Review", href: "/review", icon: Repeat },
  { label: "Leagues", href: "/leagues", icon: Trophy },
  { label: "Profile", href: "/profile", icon: CircleUser },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top bar */}
      <nav aria-label="Primary" className="hidden md:flex sticky top-0 z-40 h-16 items-center justify-between border-b border-border bg-background px-6">
        {/* logo left, TABS center/left, chrome-slot right */}
      </nav>

      {/* Mobile bottom bar */}
      <nav aria-label="Primary" className="flex md:hidden fixed bottom-0 left-0 z-40 w-full items-center justify-around border-t border-border bg-surface-raised">
        {TABS.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`focus-ring flex min-h-11 flex-col items-center justify-center gap-1 px-3 py-2 ${active ? "text-brand font-semibold" : "text-muted"}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-label text-xs">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
```

Recommended `app/(app)/layout.tsx` shape:

```tsx
import { AppNav } from "@/app/components/nav/AppNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>
      <AppNav />
      <main id="main-content" className="pb-16 md:pb-0 md:pt-16">
        {children}
      </main>
    </>
  );
}
```

Verify the `md:pt-16`/`pb-16` offsets actually match `AppNav`'s real rendered height once built (adjust both files together so content never sits under the sticky/fixed bar).

## Project Structure Notes

- The project is a Next.js App Router app with `app/`, `actions/`, `lib/` (including `lib/ingest/` for Study Buddy). Legacy `rag/` Python sidecar is unused for create-buddy/chat (amended 2026-07-11).
- This story introduces the first App Router **route group** (`app/(app)/`) — a routing-invisible folder used purely to share a layout across `/dashboard`, `/profile`, and the three new stub routes without altering their URLs.
- `app/components/nav/` gains a second file (`AppNav.tsx`) alongside the existing `AuthNav.tsx`; both coexist until later stories (1.6, 1.8, or beyond) migrate the remaining unmigrated authenticated pages.
- `/learn`, `/review`, `/leagues` are genuinely new routes with no prior implementation anywhere in the repo (confirmed: no `app/review`, `app/leagues` folders exist; `app/sets` has no index page).

## References

- `_bmad-output/planning-artifacts/epics.md` - Story 1.3 acceptance criteria and Epic 1 context.
- `_bmad-output/planning-artifacts/ux-designs/ux-Learnium-2026-07-05/EXPERIENCE.md` - Information Architecture (tab list, IA table), Accessibility Floor.
- `_bmad-output/planning-artifacts/ux-designs/ux-Learnium-2026-07-05/DESIGN.md` - nav-top-bar/nav-mobile-bottom-bar token specs, component prose.
- `_bmad-output/planning-artifacts/architecture/architecture-Learnium-2026-07-05/ARCHITECTURE-SPINE.md` - AD-2 route protection, Consistency Conventions, Structural Seed.
- `_bmad-output/project-context.md` - agent implementation rules and local stack facts.
- `_bmad-output/implementation-artifacts/1-1-design-token-system-and-typography.md` - token/typography foundation.
- `_bmad-output/implementation-artifacts/1-2-core-ui-component-library.md` - prior story; shared UI primitives and radius/token discipline this story continues.
- `middleware.ts` - current auth gate and `protectedPaths` array.

## Dev Agent Record

### Agent Model Used

Gemini 3.5 Flash (Medium)

### Debug Log References

None.

### Completion Notes List

- Created `(app)` Next.js route group and relocated `dashboard` and `profile` pages inside it to share the layout without changing URLs.
- Created `app/(app)/layout.tsx` to handle the skip-link, rendering `AppNav`, and the shared `<main id="main-content">` wrapper to prevent full page remount of persistent chrome.
- Created `app/components/nav/AppNav.tsx` client component rendering a sticky top header on desktop and a fixed bottom tab bar on mobile. Implemented visual-pill active tab state and `aria-current="page"` markup.
- Created placeholder stubs for `/learn`, `/review`, and `/leagues` pages.
- Registered `/learn`, `/review`, and `/leagues` routes in `middleware.ts`'s `protectedPaths`.
- Integrated `Profile` dropdown into the desktop top bar slot to preserve sign-out capability.
- Validated new pages compile and verify via `npm run build` and linter checks.

### File List

- `app/(app)/layout.tsx`
- `app/(app)/dashboard/page.tsx`
- `app/(app)/profile/page.tsx`
- `app/(app)/learn/page.tsx`
- `app/(app)/review/page.tsx`
- `app/(app)/leagues/page.tsx`
- `app/components/nav/AppNav.tsx`
- `middleware.ts`
- `next.config.ts`

## Change Log

- 2026-07-06: Story created via `bmad-create-story` workflow (ultimate context engine analysis).
- 2026-07-06: Completed implementation of Story 1.3: App Layout Shell and 5-Tab Navigation. Checked off all tasks, ran linting & build verification, and marked as ready for review.
