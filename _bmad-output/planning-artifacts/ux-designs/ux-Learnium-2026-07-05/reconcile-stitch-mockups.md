---
name: reconcile-stitch-mockups
status: complete
updated: 2026-07-05
inputs:
  - ./mockups/
  - ./mockups/midnight_ink_pure/DESIGN.md
outputs:
  - ./DESIGN.md
  - ./EXPERIENCE.md
---

# Stitch Mockup Reconciliation

The Stitch mockups cover the full app and are useful as screen-level layout references. They are not token authority. `DESIGN.md` and `EXPERIENCE.md` remain the binding contracts.

## Promoted

- Desktop dashboard layout: left-side daily goal/review metrics plus right-side active learning cards.
- Mobile Learning Path layout: vertical timeline, large touch targets, enlarged active node, explicit check/play/padlock states.
- Focused lesson/review mode: top progress, large prompt, answer-card grid/stack, bottom action zone.
- Nova chat layout: lesson-context header, alternating message bubbles, fixed composer, quota row, visible thinking state.
- Paywall structure: reassurance panel first, then Free/Plus comparison, then upgrade CTA.
- Optional Set/Path preview media: allowed only when subject-relevant and trustworthy; otherwise use text-first cards.
- Mockup coverage table in `EXPERIENCE.md` so builders know which visual references map to each surface group.

## Rejected

- Stitch-generated Material-style palette values (`#f8f9ff`, `#001421`, `#ba1a1a`, etc.) where they conflict with Midnight Ink / Pure.
- 24px card radii, broad gradients, gradient progress bars, and heavy static-card shadows.
- Mockup-only fake screenshots or generic abstract images as required content.
- Exported HTML accessibility omissions such as missing skip links and incomplete ARIA. The behavioral accessibility floor in `EXPERIENCE.md` remains binding.

## Result

The spines now reference the mockups as implementation aids while preserving the validated token system, interaction rules, accessibility floor, and Nova voice constraints.
