---
name: Learnium
description: Grown-up Duolingo. Gamified, science-based learning for adult professionals — premium neutrals, celebratory mechanics, credible polish. Web-only, mobile-first, light + dark co-equal.
status: final
updated: 2026-07-05
colors:
  # --- Light mode ---
  background: '#FFFFFF'
  surface: '#F7F8FA'
  surface-raised: '#FFFFFF'
  border: '#E6E9EE'
  border-strong: '#D3D9E0'
  text-primary: '#0B0F14'
  text-muted: '#5A6672'
  text-disabled: '#9AA6B2'
  border-interactive: '#6B7480'  # visible boundary of interactive controls (3:1)
  brand: '#142937'            # navy — logo/headers/emphasis
  brand-hover: '#0E1F2B'
  on-brand: '#FFFFFF'
  cta-fill: '#142937'         # primary CTA fill (inverted) — navy in light
  cta-text: '#FFFFFF'
  cta-fill-hover: '#0E1F2B'
  cta-disabled: '#E6E9EE'
  accent: '#84CC16'          # lime — REWARD/moment-of-gain ONLY (bursts, level-up, correct flash)
  accent-glow: '#B8F135'
  accent-progress: '#4D7C0F'  # muted lime — ALWAYS-ON progress indicators (AA)
  accent-progress-track: '#D3D9E0'
  on-accent: '#0B1400'
  streak: '#F59E0B'          # amber — streak flames ONLY
  success: '#84CC16'
  warning: '#F59E0B'
  error: '#DC2626'
  info: '#3B82F6'
  # --- Dark mode ---
  background-dark: '#000000'  # pure black
  surface-dark: '#0C1116'
  surface-raised-dark: '#18222C'
  border-dark: '#1C2530'
  border-strong-dark: '#2A3644'
  border-interactive-dark: '#4D5B6A'
  text-primary-dark: '#F5F7FA'
  text-muted-dark: '#8B98A5'
  text-disabled-dark: '#5A6672'
  brand-dark: '#5B7E9A'       # lightened navy so it reads on black
  brand-hover-dark: '#6B8EAA'
  on-brand-dark: '#000000'    # inverted CTA: white button + black text
  cta-fill-dark: '#FFFFFF'
  cta-text-dark: '#000000'
  cta-fill-hover-dark: '#E6E9EE'
  cta-disabled-dark: '#2A3644'
  accent-dark: '#84CC16'
  accent-glow-dark: '#B8F135'
  accent-progress-dark: '#84CC16'
  accent-progress-track-dark: '#2A3644'
  on-accent-dark: '#0B1400'
  streak-dark: '#F59E0B'
  success-dark: '#84CC16'
  warning-dark: '#F59E0B'
  error-dark: '#F87171'
  info-dark: '#60A5FA'
typography:
  display:
    fontFamily: 'Bricolage Grotesque'
    fontSize: 'clamp(2rem, 6vw, 3.5rem)'   # 32 → 56
    fontWeight: '800'
    lineHeight: '1.05'
    letterSpacing: '-0.02em'
  display-sm:
    fontFamily: 'Bricolage Grotesque'
    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' # 28 → 40
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: '-0.02em'
  h1:
    fontFamily: 'Space Grotesk'
    fontSize: 'clamp(1.5rem, 3vw, 2rem)'    # 24 → 32
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: '-0.01em'
  h2:
    fontFamily: 'Space Grotesk'
    fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)' # 20 → 24
    fontWeight: '700'
    lineHeight: '1.25'
  h3:
    fontFamily: 'Space Grotesk'
    fontSize: '1.125rem'                    # 18
    fontWeight: '500'
    lineHeight: '1.3'
  label:
    fontFamily: 'Space Grotesk'
    fontSize: '0.875rem'                    # 14
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: '0.01em'
  numeral:
    fontFamily: 'Space Grotesk'
    fontWeight: '700'
    fontVariantNumeric: 'tabular-nums lining-nums'  # ALL gamified numbers (XP, streak, level, %)
  body:
    fontFamily: 'Inter'
    fontSize: '1rem'                        # 16
    fontWeight: '400'
    lineHeight: '1.6'
  body-strong:
    fontFamily: 'Inter'
    fontSize: '1rem'
    fontWeight: '500'
    lineHeight: '1.6'
  caption:
    fontFamily: 'Inter'
    fontSize: '0.8125rem'                   # 13
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  xl: 12px       # cards, buttons, inputs — the default
  2xl: 16px      # modals, hero surfaces, celebration overlays
  full: 9999px   # pills, XP chips, avatars, Nova, progress rings
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '6': 24px
  '8': 32px
  '12': 48px
  '16': 64px
  content-max: 72rem   # max-w-6xl
components:
  button-primary:
    background: '{colors.cta-fill}'
    background-dark: '{colors.cta-fill-dark}'
    foreground: '{colors.on-brand}'
    foreground-dark: '{colors.cta-text-dark}'
    hover-background: '{colors.cta-fill-hover}'
    hover-background-dark: '{colors.cta-fill-hover-dark}'
    disabled-background: '{colors.cta-disabled}'
    disabled-background-dark: '{colors.cta-disabled-dark}'
    disabled-foreground: '{colors.text-disabled}'
    disabled-foreground-dark: '{colors.text-disabled-dark}'
    radius: '{rounded.xl}'
    note: 'Inverted CTA. Light = navy fill + white text; dark = white fill + black text.'
  button-secondary:
    background: 'transparent'
    foreground: '{colors.text-primary}'
    border: '{colors.border-interactive}'
    border-dark: '{colors.border-interactive-dark}'
    hover-background: '{colors.surface}'
    hover-background-dark: '{colors.surface-dark}'
    disabled-foreground: '{colors.text-disabled}'
    disabled-border: '{colors.border}'
    disabled-border-dark: '{colors.border-dark}'
    radius: '{rounded.xl}'
  button-tertiary:
    background: 'transparent'
    foreground: '{colors.text-muted}'
    hover-background: '{colors.surface}'
    hover-background-dark: '{colors.surface-dark}'
    radius: '{rounded.xl}'
  button-progress:
    background: '{colors.accent}'
    foreground: '{colors.on-accent}'
    disabled-background: '{colors.cta-disabled}'
    disabled-background-dark: '{colors.cta-disabled-dark}'
    disabled-foreground: '{colors.text-disabled}'
    disabled-foreground-dark: '{colors.text-disabled-dark}'
    radius: '{rounded.xl}'
    note: 'Bright lime - completion/reward actions ONLY (Continue Lesson, Complete, Correct).'
  set-card:
    background: '{colors.surface-raised}'
    border: '{colors.border}'
    radius: '{rounded.xl}'
  set-preview-media:
    radius: '{rounded.xl}'
    border: '{colors.border}'
    note: 'Optional top media strip for Set/Path cards. Must be subject-relevant generated/product imagery or omitted; never fake screenshots or generic stock filler.'
  xp-pill:
    background: '{colors.accent}'
    foreground: '{colors.on-accent}'
    radius: '{rounded.full}'
    numeral: '{typography.numeral}'
  progress-bar:
    track: '{colors.accent-progress-track}'
    track-dark: '{colors.accent-progress-track-dark}'
    fill: '{colors.accent-progress}'
    fill-dark: '{colors.accent-progress-dark}'
    radius: '{rounded.full}'
  progress-ring:
    track: '{colors.accent-progress-track}'
    track-dark: '{colors.accent-progress-track-dark}'
    stroke: '{colors.accent-progress}'
    stroke-dark: '{colors.accent-progress-dark}'
    radius: '{rounded.full}'
  streak-flame:
    color: '{colors.streak}'
    numeral-color: '{colors.text-primary}'
    numeral-color-dark: '{colors.text-primary-dark}'
    numeral: '{typography.numeral}'
  level-badge:
    background: '{colors.brand}'
    background-dark: '{colors.brand-dark}'
    foreground: '{colors.on-brand}'
    foreground-dark: '{colors.background-dark}'
    ring: '{components.progress-ring}'
    numeral: '{typography.numeral}'
  lesson-node:
    locked-background: '{colors.surface}'
    locked-icon: 'padlock'
    locked-icon-color: '{colors.text-disabled}'
    active-background: '{colors.brand}'
    active-background-dark: '{colors.brand-dark}'
    active-icon: 'play'
    active-ring: '{components.progress-ring}'
    complete-background: '{colors.accent}'
    complete-icon: 'check'
    complete-foreground: '{colors.on-accent}'
    radius: '{rounded.full}'
    note: 'Locked/active/complete must remain distinguishable in grayscale: padlock, play/dot, check.'
  input:
    background: '{colors.surface-raised}'
    background-dark: '{colors.surface-raised-dark}'
    border: '{colors.border-interactive}'
    border-dark: '{colors.border-interactive-dark}'
    focus-border: '{colors.brand}'
    focus-ring: '{colors.info}'
    error: '{colors.error}'
    radius: '{rounded.xl}'
  modal:
    background: '{colors.surface-raised}'
    background-dark: '{colors.surface-raised-dark}'
    radius: '{rounded.2xl}'
    shadow: 'soft'
  nav-top-bar:
    background: '{colors.background}'
    background-dark: '{colors.background-dark}'
    border: '{colors.border}'
    border-dark: '{colors.border-dark}'
  nav-mobile-bottom-bar:
    background: '{colors.surface-raised}'
    background-dark: '{colors.surface-raised-dark}'
    border: '{colors.border}'
    border-dark: '{colors.border-dark}'
    active: '{colors.brand}'
    active-dark: '{colors.text-primary-dark}'
  leaderboard-row:
    divider: '{colors.border}'
    current-user-background: '{colors.surface}'
    promotion-accent: '{colors.accent-progress}'
    numeral: '{typography.numeral}'
  review-session-card:
    background: '{colors.surface-raised}'
    background-dark: '{colors.surface-raised-dark}'
    border: '{colors.border}'
    radius: '{rounded.xl}'
  celebration-overlay:
    background: '{colors.surface-raised}'
    background-dark: '{colors.surface-raised-dark}'
    radius: '{rounded.2xl}'
    accent: '{colors.accent}'
    glow: '{colors.accent-glow}'
    numeral: '{typography.numeral}'
  nova-avatar:
    radius: '{rounded.full}'
    note: 'North Star geometric character. States: encouraging / skeptical / celebratory starburst.'
  toast:
    background: '{colors.surface-raised}'
    background-dark: '{colors.surface-raised-dark}'
    border: '{colors.border}'
    border-dark: '{colors.border-dark}'
    radius: '{rounded.xl}'
    shadow: 'soft'
---

## Brand & Style

Learnium is **grown-up Duolingo** — a gamified, science-based learning platform where an adult professional types a topic and gets an AI-generated **Set** of ~5-minute **Lessons**, complete with **XP**, **Levels**, **Streaks**, **Leagues**, and **Review Sessions**. The audience is 29–41-year-old professionals (Dana, Marcus, Priya, Ravi). They want the dopamine of Duolingo without the childishness — mechanics that celebrate, wrapped in a surface that respects their intelligence.

The visual language is a deliberate blend: **Linear / Vercel** premium neutrals (pure black-and-white base, crisp geometry, dark-capable, generous whitespace) × **Duolingo** celebratory mechanics (XP bursts, streak flames, level-up moments) × **Brilliant** credible colorful learning polish (strong, legible progress visuals). The base is mature and restrained; energy is spent precisely, only where a reward moment earns it.

**Voice — Nova.** The AI Study Buddy is a character named **Nova**, a "North Star" guide rendered as a crisp geometric star (not a childish animal mascot). Nova is witty and brutally honest but **never degrading** — the smart friend who won't let you BS your own progress but is always in your corner. Example: *"You've reviewed this three times and skipped the quiz each time. Bold strategy. Let's actually do it."* Sharp, warm underneath. Nova's signature is the celebratory starburst; its expressions carry the personality that keeps adults emotionally attached. (This section governs how Nova *looks and sounds* as brand voice; interaction behavior lives in EXPERIENCE.md.)

## Colors

Palette: **Midnight Ink / Pure**. Light and dark are **co-equal** — every surface is designed to equal quality in both. The neutrals are pure (`#FFFFFF` / `#000000`) so the two energetic accents feel earned.

- **Background (`#FFFFFF` / `#000000`)** — Pure white and pure black. The black is a real Vercel-style black, not a near-black gray. Sets the premium, high-contrast tone.
- **Surface (`#F7F8FA` / `#0C1116`)** — Cards, panels, raised regions. `surface-raised` (`#FFFFFF` / `#18222C`) lifts a card off a tinted surface without a shadow.
- **Border (`#E6E9EE` / `#1C2530`)** — Hairline separators. Structure comes from these borders, not from elevation.
- **Text (`#0B0F14` / `#F5F7FA` primary; `#5A6672` / `#8B98A5` muted)** — All copy holds AA contrast on its surface. Muted is for captions, metadata, and secondary labels only.
- **Brand Navy (`#142937` light / `#5B7E9A` dark)** — The brand color: logo, headers, emphasis. In dark mode it is lightened enough to read on pure black. Navy was promoted from a background color to *the* brand color.
- **Primary CTA — inverted.** The primary button is not navy-everywhere; it is **inverted** per mode. Light = navy fill + white text; dark = white fill + black text. This is the Vercel-restrained, premium primary action.
- **Accent Lime (`#84CC16`, glow `#B8F135`)** — The energetic reward color. **RESERVED** for moment-of-gain feedback: XP bursts, level-up, correct answers, and completion CTAs (Continue Lesson, Complete). Always-on progress uses muted `accent-progress` (`#4D7C0F` light / `#84CC16` dark) so the reward burst still feels earned.
- **Streak Amber (`#F59E0B`)** — Streak flames 🔥 only. Not a general warning fill, not decoration.
- **Semantic** — `error` (`#DC2626` / `#F87171`), `success` maps to the lime family, `warning` is reserved for explicit caution states, `info` a blue (`#3B82F6` / `#60A5FA`).

Avoid: a third ad-hoc blue set, gradients on the base surface, and using lime or amber outside their reserved reward/streak roles.

## Typography

A **3-role system**, each role with a job. All gamified numbers use tabular lining figures so counters don't jitter as they tick.

- **Display / expressive — Bricolage Grotesque (800 / 700).** Hero lines, celebration and level-up headers, empty-state personality. This is where Nova's voice gets loud. Tight leading, negative tracking.
- **Functional — Space Grotesk (700 / 500).** All functional headings (h1–h3), UI labels, and standalone gamified numerals (XP totals, streak count, level, League rank, percent complete). Numerals set with `font-variant-numeric: tabular-nums lining-nums`. If a gamified number appears inside a `display`/`display-sm` celebration headline (for example, "Level 6"), it stays in the display font; standalone counters use `{typography.numeral}`.
- **Body — Inter (400 / 500).** Lesson content, chat, descriptions, forms. Comfortable 1.6 line-height for reading.

Type ramp is mobile-first with `clamp()`: `display` 32→56, `display-sm` 28→40, `h1` 24→32, `h2` 20→24, `h3` 18, `body` 16, `caption` 13. (Historical note — see Don'ts: the old build loaded Geist then forced Arial in body. Fonts are declared and actually used here.)

## Layout & Spacing

**4pt scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. Generous whitespace (Linear influence) — the base should breathe so reward moments pop.

Content max width `max-w-6xl` (72rem). **Mobile-first and web-only**: the product must be excellent on phones, so layouts stack to a single column on small viewports and every touch target meets 44px minimum. The largest gaps sit between major surfaces (Sets, sections); the smallest between tightly related elements (a lesson node and its label).

## Elevation & Depth

**Mostly flat, structured by hairline borders.** Depth is tonal (`surface` vs `surface-raised`) plus `{colors.border}`, not shadow. In light mode, raised cards should sit on `{colors.surface}` when tonal lift matters; on pure white backgrounds they rely on borders. In dark mode, `surface-raised-dark` is intentionally brighter than `surface-dark` so border-led structure still has a tonal step.

Soft shadows are **reserved** — modals, popovers, and celebration/level-up moments only. A modal or level-up card floats; a Set card does not. (The old build used heavy `shadow-2xl` everywhere; that flattening-by-over-shadowing is banned — see Don'ts.)

## Shapes

Three radii, no more:

- **`rounded-xl` (12px)** — the default. Cards, buttons, inputs, Set cards, Review-session cards.
- **`rounded-2xl` (16px)** — modals, hero surfaces, celebration overlays.
- **`rounded-full`** — pills, XP chips, category pills, avatars, Nova, progress rings, streak flame badge.

This replaces the old inconsistent full/sm/md/lg mix. If it isn't a pill or a hero/modal surface, it's `rounded-xl`.

## Components

Visual specs only (states/token refs). Behavior lives in EXPERIENCE.md.

- **Button — primary (inverted)** — `{components.button-primary}`. Light: navy fill + white text. Dark: white fill + black text. `{rounded.xl}`, label in `{typography.label}`. Hover and disabled states are tokenized in frontmatter. Focus: 2px `{colors.info}` ring, offset 2px.
- **Button — secondary** — Transparent fill, `{colors.border-interactive}` 1px border, `{colors.text-primary}` label. Hover: `{colors.surface}` fill.
- **Button — tertiary** — Quiet text/ghost action for "Skip," "Maybe later," and low-risk dismissals. Never use it for destructive confirmation.
- **Button — lime progress** — `{components.button-progress}`. Bright lime fill, `{colors.on-accent}` text. Used for Continue Lesson / Complete / Correct only. Optional `{colors.accent-glow}` on the active/press state for a reward flash.
- **Card — lesson Set** — `{colors.surface-raised}` on `{colors.border}`, `{rounded.xl}`, padding `{spacing.6}`. Title in `h3`, meta (lesson count, XP) in `caption`. Flat; no shadow.
- **Set preview media** - `{components.set-preview-media}`. Optional image/media area at the top of Set and Path cards, accepted from the Stitch dashboard direction only when it reveals the actual topic, generated course artifact, or subject domain. If the system cannot produce a trustworthy relevant image, use a text-first card; do not use fake screenshots or generic decorative stock.
- **Pill / Chip** — `{rounded.full}`. **XP pill**: lime fill, numeral in `{typography.numeral}` (e.g. "+40 XP"). **Category pill**: `{colors.surface}` fill, `{colors.text-muted}` label, hairline border.
- **Progress bar** — `{rounded.full}` track `{colors.accent-progress-track}`, fill `{colors.accent-progress}`. Percent label (if shown) in `{typography.numeral}`.
- **Progress ring** — Circular `{rounded.full}` stroke, muted progress fill on `{colors.accent-progress-track}` track. Wraps Nova and level badges to show Lesson/Level completion.
- **Streak flame** — flame glyph in `{colors.streak}` with day count in `{colors.text-primary}` / `{colors.text-primary-dark}` using `{typography.numeral}`. Amber is exclusive to the glyph.
- **Level badge / ring** — Circular badge, `{colors.brand}` face, level number in `{typography.numeral}`, wrapped by a muted progress ring toward next level.
- **Lesson node** — Circular node on the Learning Path. **Locked**: `{colors.surface}` fill + padlock glyph + `{colors.text-disabled}`. **Active**: `{colors.brand}` face + play/dot glyph + progress ring + subtle `{colors.accent-glow}` pulse. **Complete**: lime fill + `{colors.on-accent}` check. Locked/active/complete must remain distinct in grayscale.
- **Modal** — `{colors.surface-raised}`, `{rounded.2xl}`, soft shadow, hairline border. Title in `h2`, body in `body`. One level deep.
- **Input / field** — `{components.input}`. Uses a 3:1 interactive boundary at rest, not a decorative hairline. Focus: `{colors.brand}` border + `{colors.info}` ring. Label above in `{typography.label}`; error text `{colors.error}` plus an icon/text cue, never color alone.
- **Nav — top bar** — Sticky, `{colors.background}`, hairline bottom border. Logo/brand in `{colors.brand}`; XP pill + streak flame + avatar right-aligned, all using `{typography.numeral}`.
- **Nav — mobile bottom bar** — Fixed bottom, `{colors.surface-raised}`, hairline top border. 4–5 icon tabs, active tab tinted `{colors.brand}` (light) / `{colors.text-primary-dark}` (dark). 44px+ targets.
- **Leaderboard (League) row** — Full-width row, hairline divider. Rank + XP in `{typography.numeral}`, avatar `{rounded.full}`, name in `body-strong`. Current user row tinted `{colors.surface}`; promotion zone marked with `{colors.accent-progress}`.
- **Review-session card** — `{colors.surface-raised}`, `{rounded.xl}`. Prompt in `h3`/`body`; reveal/answer actions use the lime progress button for "Correct," secondary for "Again."
- **Nova avatar** — Geometric North Star, `{rounded.full}` frame. Expression states: **encouraging** (steady, warm), **skeptical** (raised-brow, for honesty beats), **celebratory** (full starburst, for wins/level-ups). Appears in Study Buddy chat, empty states, and celebration moments.
- **Celebration / level-up overlay** — `{rounded.2xl}` card, soft shadow, Nova in starburst state. Headline in `display`/`display-sm` (Bricolage), XP/level gains in `{typography.numeral}`, lime accents and `{colors.accent-glow}`. The one place energy is fully spent.
- **Toast** — `{colors.surface-raised}`, `{rounded.xl}`, hairline border, soft shadow. Icon tinted by semantic role (`success` lime, `error`, `info`). Text in `body-strong`.

### Mockup Reconciliation

The `mockups/` folder contains Stitch-produced visual references. These are layout references, not token authority; this `DESIGN.md` wins on conflicts.

Accepted from mockups:

- Desktop dashboard: a two-zone composition with goal/review metrics on the left and active learning cards on the right.
- Mobile Learning Path: a vertical timeline with large touch targets, explicit check/play/padlock glyphs, and the active module visually enlarged.
- Lesson quiz: focused full-screen mode with top progress, large prompt, answer cards, and a bottom action zone.
- Nova chat: lesson-context header, alternating message bubbles, fixed bottom composer, quota row, and visible thinking state.
- Paywall: reassurance panel first, then Free/Plus comparison, then upgrade action; progress/streak safety is visually prominent.

Rejected as Stitch drift:

- Material-style generated palette (`#f8f9ff`, `#001421`, `#ba1a1a`, etc.) when it conflicts with Midnight Ink / Pure tokens.
- 24px card radii, gradient progress bars, broad surface gradients, and heavy card shadows.
- Mockup-only fake screenshots or abstract technical images as required content. Preview media is optional and must be real/relevant.
- Missing accessibility mechanics in exported HTML (skip links, full ARIA labeling, focus-not-obscured). EXPERIENCE.md remains binding.
## Do's and Don'ts

| Do | Don't |
|---|---|
| Drive every value from tokens (`{colors.*}`, `{rounded.*}`, `{spacing.*}`) | Hardcode hex inline (the old build hardcoded navy `#142937` on landing) |
| Use the three radii only: `xl` / `2xl` / `full` | Mix four radii (old full/sm/md/lg chaos) |
| Reserve soft shadows for modals, popovers, celebration moments | Apply `shadow-2xl` everywhere as the old build did |
| Declare a font and actually render it (Bricolage / Space Grotesk / Inter) | Load a font then override the body with Arial (the old Geist→Arial bug) |
| Design light AND dark to equal quality; both are real | Ship dark tokens that aren't truly supported |
| Reserve bright lime for rewards/completion and muted lime for always-on progress; reserve amber for the streak glyph only | Use lime as the generic primary button or spend accents on chrome |
| Use the inverted primary CTA (navy/white per mode) | Fill primary buttons with lime or navy-everywhere |
| Set all gamified numbers in tabular lining numerals | Let XP/streak counters jitter with proportional figures |
| Use real, keyboard-accessible controls (`<button>`, focus rings) | Put `onClick` on `<div>`s or fire `alert()` for feedback |
