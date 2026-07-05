# Accessibility Review — Learnium Design Spines

**Lens:** Accessibility (WCAG 2.2 AA) · **Scope:** `DESIGN.md` (visual) + `EXPERIENCE.md` (behavioral) · **Reviewed:** 2026-07-05 · **Reviewer role:** read-only

---

## Verdict

**Conditional pass with fixable defects.** The behavioral a11y floor is unusually strong and the core reading/text pairs comfortably meet AA — but several *locked-palette* pairs fail: **error text on white (3.76:1), dark-mode brand `#3E5C74` on black (2.99:1), and every lime/amber non-text indicator and hairline component boundary fall below the required threshold.** These are token-level fixes, not architectural ones, but they touch reward visuals (lime progress) that are central to the product, so they must be resolved before build.

---

## Contrast checks (computed, sRGB, WCAG formula)

AA thresholds: body/small text **4.5:1**, large text (≥18.66px bold / ≥24px) **3:1**, non-text/UI-component & graphical-object **3:1**.

| Pair | Ratio | Text (4.5) | Large/Non-text (3.0) | Verdict |
|---|---|---|---|---|
| text-primary `#0B0F14` / white | 19.22:1 | ✓ | ✓ | PASS |
| text-muted `#5A6672` / white | 5.87:1 | ✓ | ✓ | PASS |
| brand navy `#142937` / white (text + CTA fill w/ white) | 14.98:1 | ✓ | ✓ | PASS |
| on-accent `#0B1400` on lime `#84CC16` (progress btn / XP pill) | 9.54:1 | ✓ | ✓ | PASS |
| info focus ring `#3B82F6` / white | 3.68:1 | n/a | ✓ | PASS (focus) |
| **error `#EF4444` / white (error text, light)** | **3.76:1** | **✗** | ✓ | **FAIL as body/caption text** |
| **lime `#84CC16` / white (progress fill, ring, chip edge)** | **1.98:1** | n/a | **✗** | **FAIL non-text** |
| **lime `#84CC16` / track border `#E6E9EE`** | **1.62:1** | n/a | **✗** | **FAIL non-text (fill vs track)** |
| **amber `#F59E0B` / white (if used as numeral/text)** | **2.15:1** | **✗** | **✗** | **FAIL as text** |
| **border `#E6E9EE` / white (input & separator)** | **1.22:1** | n/a | **✗** | **FAIL as component boundary** |
| **border-strong `#D3D9E0` / white (secondary-btn edge)** | **1.42:1** | n/a | **✗** | **FAIL as component boundary** |
| text-primary-dark `#F5F7FA` / black | 19.57:1 | ✓ | ✓ | PASS |
| text-muted-dark `#8B98A5` / black | 7.13:1 | ✓ | ✓ | PASS |
| **brand-dark `#3E5C74` / black (logo/headers/emphasis)** | **2.99:1** | **✗** | **✗ (borderline)** | **FAIL** |
| error-dark `#F87171` / black | 7.59:1 | ✓ | ✓ | PASS |
| info-dark focus ring `#60A5FA` / black | 8.26:1 | n/a | ✓ | PASS (focus) |
| lime `#84CC16` / black (non-text) | 10.63:1 | n/a | ✓ | PASS (dark only) |
| border-dark `#1C2530` / black (input & separator) | 1.36:1 | n/a | ✗ | FAIL as component boundary |
| dark inverted CTA: white fill / black text | 21.00:1 | ✓ | ✓ | PASS |

**Net:** all four "reading" pairs the brief asked about (text-muted both modes, on-accent-on-lime, brand navy text) **pass**. The failures cluster in (a) semantic *error* text, (b) *dark brand* color, and (c) *non-text* indicators (lime progress, amber, hairline borders).

---

## Findings

| Sev | Location | Issue | Fix |
|---|---|---|---|
| **HIGH** | DESIGN.md `colors.brand-dark #3E5C74`; Colors §, used for "logo, headers, emphasis" on black | **2.99:1** on `#000000` — fails AA for text (4.5) and sits *below* the 3:1 non-text/large-text floor too. Any header or emphasis copy in this color on black is non-compliant. | Lighten brand-dark to ≥ ~`#5B7E9A` for 4.5:1 (or ≥ `#4E6E88` for a 3:1 large-heading-only use). Verify against `surface-dark #0C1116` too, not just pure black. |
| **HIGH** | DESIGN.md `progress-bar.fill`, `progress-ring`, lesson-node **active** lime ring, `xp-pill`/success on light surfaces | Lime `#84CC16` is **1.98:1 vs white** and **1.62:1 vs its `#E6E9EE` track** — the *fill cannot be distinguished from the track* in light mode, failing 1.4.11 for progress bars/rings (graphical objects that convey state). Dark mode is fine (10.6:1). | For light mode, darken the progress/ring fill to a lime that clears 3:1 on white (≈ `#5C8A0F` or deeper), OR add a ≥3:1 outline/darker track. Keep bright lime for text-on-lime fills (that pair is fine) and for dark mode. |
| **HIGH** | DESIGN.md Input/field spec (`border #E6E9EE`), secondary button (`border-strong #D3D9E0`), dark equivalents `#1C2530`/`#2A3644` | Resting-state input fields and secondary buttons are delimited **only** by a border of **1.22–1.42:1** (light) / **1.36:1** (dark), and the field fill equals the page color (white-on-white / near-black-on-black), so 1.4.11 (3:1 to identify a component) fails at rest. Focus state is fine (brand border + info ring). | Raise the *interactive-component* boundary to ≥3:1 (e.g. input/secondary-button borders use a dedicated `border-strong`-plus token ≈ `#9AA6B2` light / `#3A4656` dark), or give fields a fill that contrasts the page ≥3:1. Hairline *decorative* separators between static content may stay as-is. |
| **MED** | DESIGN.md `error #EF4444` (light); EXPERIENCE.md forms error text; Input spec "error text `{colors.error}`" | Error text at 13–16px on white is **3.76:1 — fails AA (4.5) for small text.** Dark `#F87171` passes (7.59:1). Error state also risks 1.4.1 (color-only) if red is the sole signal. | Darken light error text to ≥4.5:1 (≈ `#D32F2F`) *or* mandate error text render at large size; and pair every error with a text label + icon, never color alone. |
| **MED** | DESIGN.md lesson-node states (locked/active/complete); color-blind users | Complete = lime + check (icon ✓), Active = navy + lime ring (shape ✓), **Locked = surface fill + generic "text-disabled icon"** — spec does not guarantee a distinct *padlock* glyph, so locked-vs-active could reduce to color/fill only for some users, and active-vs-complete lean on the lime hue. | Explicitly specify a **padlock** glyph for locked, a **check** for complete, and a distinct active affordance (e.g. filled dot / "play"); confirm the three are distinguishable in grayscale. |
| **MED** | EXPERIENCE.md Accessibility Floor + WCAG 2.2 §2.4.11 Focus Not Obscured | Sticky top nav + fixed bottom bar (persistent chrome) can hide a keyboard-focused control behind the bars when tabbing — new AA criterion in 2.2 not addressed. | Add `scroll-margin`/`scroll-padding` equal to chrome height so focused elements are never fully obscured; state this in the a11y floor. |
| **MED** | EXPERIENCE.md State Patterns "Success/celebration"; DESIGN.md lesson-node **active** "`accent-glow` pulse" | Reduced-motion is scoped to "celebration/level-up/XP-burst," but the active-node **continuous glow pulse** is a looping animation not covered — `prefers-reduced-motion` users should not see perpetual pulsing. | Extend reduced-motion to disable the active-node pulse and any looping/streak-flame animation, showing the static state. |
| **MED** | EXPERIENCE.md Review Session "<3 min" (FR-16); WCAG 2.2 §2.2.1 Timing Adjustable | "Completable in <3 min" reads as a description, but if the UI shows any countdown/per-question timer it becomes a time limit requiring an adjustable/extend/disable accommodation. Timed pressure also disadvantages cognitive/motor-impaired users. | Add an explicit note: Review has **no enforced countdown**; "<3 min" is descriptive only. If any timer is introduced, provide 2.2.1 controls (extend/turn off) and ensure the streak is never lost due to a timeout. |
| **LOW** | DESIGN.md `streak-flame` — "day count in `{typography.numeral}`" | If the streak numeral inherits amber `#F59E0B` it is **2.15:1 on white — fails.** Amber flame glyph alone is 2.15:1 non-text, but it is paired with a number so meaning isn't color-only. | Set the streak *number* in `text-primary` (amber reserved to the 🔥 glyph); the glyph+number pairing satisfies 1.4.1. |
| **LOW** | EXPERIENCE.md Signup age-gate 16+ (form mechanism) | Flow is asserted "keyboard/SR-operable, no dark patterns," but the age-gate input mechanism is unspecified — no guarantee of programmatic label, inline error identification (3.3.1) and suggestion (3.3.3). | Specify: the age/DOB control has a visible programmatic `<label>`, inline SR-announced error, and no pre-checked/defaulted-to-pass pattern. |
| **LOW** | EXPERIENCE.md IA persistent nav chrome; WCAG §2.4.1 Bypass Blocks | Persistent 5-tab chrome + top bar repeats before main content each view; no skip-link / landmark bypass mentioned. | Add a "skip to content" link and proper `<nav>`/`<main>` landmarks so keyboard/SR users bypass repeated chrome. |
| **LOW** | EXPERIENCE.md Interaction "Pull-to-refresh"; WCAG 2.2 §2.5.7 Dragging Movements | Pull-to-refresh is a dragging gesture; needs a non-drag equivalent. | Confirm refresh also occurs on navigation/load (a single-pointer alternative exists) — likely already true; state it. |

---

## What is strong (credit where due)

- **Behavioral a11y floor is genuinely good:** real `<button>`/`<a>` controls (explicitly fixing the `onClick`-on-`<div>` audit item), no `alert()` (toasts + `aria-live`), never-suppressed focus rings, keyboard nav through lesson path + leaderboard + quiz + Nova chat, `Esc` closes topmost modal, one-level-deep modal stacking, and **44px targets** — meeting/exceeding WCAG 2.2 §2.5.8 (24px).
- **Gamification numerals are handled for screen readers** with meaningful labels ("420 XP, up 40" / "12-day streak" / "Lesson 3 of 6, 50 percent") — resolves the "decorative-looking numerals" risk directly.
- **Reduced-motion** removes celebration/level-up/XP-burst animation while showing the *static outcome immediately* — correct pattern (just widen its scope, see findings).
- **Anti-anxiety streak design** (soft-loss, "encourage on failure, never shame") is both a brand and an accessibility/cognitive win.
- **No dark patterns** committed in paywall (states what is *kept*), delete-account, and quota flows; auth via Google/email avoids cognitive-test authentication (§3.3.8).
- **Text pairs the brief flagged all pass:** both muted grays, on-accent-on-lime, and navy — the core reading experience is AA-clean in both modes.

---

*Reviewer note: this is a review artifact only; no spine files were modified. Contrast values computed with the standard WCAG relative-luminance formula on the locked hex tokens.*
