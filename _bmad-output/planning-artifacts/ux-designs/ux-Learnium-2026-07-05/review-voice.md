---
name: review-voice
description: Voice & microcopy lens review of the Learnium EXPERIENCE.md spine — Nova's voice consistency, the never-shame rule, honesty calibration, money tone, and tone accessibility.
reviewer-lens: voice-and-microcopy
target: ./EXPERIENCE.md
refs:
  - ./DESIGN.md (Brand & Style — Nova voice)
  - ../../prds/prd-Learnium-2026-07-05/prd.md (SM-C1 streak-anxiety churn)
status: draft
updated: 2026-07-05
---

# Voice & Microcopy Review — Learnium (Nova)

## Verdict

**Ship-with-fixes.** Where copy exists, Nova is on-model and the never-shame rule is genuinely honored — the streak-loss line is soft and anxiety-reducing, the paywall is non-manipulative, and failures land on behavior or on the system rather than on the person. The gaps are *omissions*, not violations: the highest-risk states for implicit blame (generation failure, network/payment failure, the 60s generation wait) are promised Nova but given no example line, and the signature "brutally honest" beat has no frequency/opt-in guard, which is exactly where it can tip into nagging or condescension.

## Findings

| Severity | State / Location | Issue | Suggested copy fix (Nova) |
|---|---|---|---|
| **High** | Skeptical "honest beat" — EXPERIENCE.md L82; DESIGN.md L162 | The beat lands on behavior (good), but the spine sets **no frequency cap, no opt-in feel, and no exclusion after a missed day**. Repeated on every visit it becomes nagging; "Bold." delivered to a professional adult on the wrong day reads as sarcasm/condescension. This is the single line most likely to breach "never degrading." | Keep the line, add a guardrail: *"Skeptical beats fire at most once per item per session, never after a missed day, and never stacked with streak-loss copy. If the user then engages, Nova drops the skepticism immediately."* No copy change to the example itself. |
| **High** | Error — generation failure (State table L108); Error — network (L109); UJ-4 payment-failure edge (L183) | Three failure states carry **no example line** — only "clear retry." These are the states most at risk of *implicit* blame (a user reads a bare error as "I did something wrong"), and money failure is doubly sensitive. Spine promises Nova everywhere but shows nothing here. | Gen fail: *"That one's on me — the generator hiccuped, not you. Your topic's still here, and your quota's untouched. Try again?"* · Network: *"Lost the connection for a second. Nothing's lost — tap to retry."* · Payment fail: *"Payment didn't go through — and nothing was charged. Your progress is exactly where you left it. Want to try again?"* |
| **Medium** | Loading / generating (State table L105; Interaction L117) | "Nova present with an encouraging line" is promised but **no example given**. A ≤60s wait is a high-anxiety, high-abandon moment (first-Set magic in UJ-1) — leaving the actual words unspecified risks a generic filler line that undercuts the climax. | *"Building your course on '[topic]' — the good ones take a few seconds. Hang tight."* Rotate 2–3 variants so repeat generations don't feel canned. |
| **Medium** | Review reminder (L80) | "3 minutes keeps your streak alive" is soft and far better than the banned "lose everything" — but it still leans on loss-aversion. Per SM-C1 it must never *escalate* if ignored. The spine doesn't say the reminder tone stays constant regardless of streak length or missed days. | Keep the line; add: *"Reminder tone never escalates, guilt-trips, or references what's 'at stake' — one calm nudge, same voice whether the streak is 2 days or 200."* |
| **Medium** | Account deletion / destructive confirm (Accessibility L138; FR-23) | Deletion is flagged "no dark patterns" (good) but there's **no tone guidance**. Wit in a destructive-confirm dialog reads as flippant about a serious action. The spine should explicitly bench Nova's wit here. | *"This permanently deletes your account and all progress within 30 days. This can't be undone."* Add rule: *"On destructive/legal confirms (delete, age-gate, GDPR export) Nova's wit is off — plain, factual, respectful. Wit garnishes wins, never irreversible actions."* |
| **Low** | Offline (L112) | "You're offline. We'll sync when you're back." is correct and clear but **voiceless** — Nova vanishes at a moment users feel stranded. Consistency gap vs. every other state carrying character. | *"You're offline — I'll sync everything the moment you're back. Keep going where you can."* (Keeps the plain fact first, adds one beat of in-your-corner.) |
| **Low** | Set-complete celebration (Surface L54; UJ-1 climax L152) | A named climax moment has **no copy example**, while lesser states (empty, reminder) do. Risk of an off-model over-celebration ("Amazing!!!") filling the vacuum. | *"Set done. You actually finished it — most people don't. Here's what's next."* Honest-warm, matches the level-up register. |
| **Low** | Voice guidance is split — Voice table (L71–82) vs. State-Patterns copy (L106–112) vs. Content-Integrity ack (L212) | Some stateful copy ("Nothing due… come back when items ripen," report-ack "Thanks — we'll look at this one") lives outside the Voice table, so no single source lists every copy-bearing state. Both examples are on-model; the risk is future states getting authored without a voice pass. | Add a one-line pointer in the Voice section: *"Every copy-bearing state — including those specified under State Patterns and Content Integrity — is governed by this voice table."* No copy change. |

## What's working (keep)

- **Streak loss (L74)** — *"Your 11-day streak took a day off. It happens. Pick it back up today — I'll be here."* Genuinely soft, behavior-neutral, restart-forward. Directly serves the SM-C1 counter-metric. Best line in the spine.
- **Paywall/quota (L75)** — states what's *kept* ("Your progress is safe"), no urgency, "when you're ready." Zero dark-pattern. Matches Nova-in-your-corner.
- **Wrong answer (L76)** — gives the answer and the *why* plainly ("the answer's B… so it sticks"). Actionable info leads; wit doesn't obscure it — passes the accessibility-of-tone test.
- **Content rejection (L79)** — Nova takes it on herself ("I couldn't make a real course out of that") rather than "your input is invalid," and offers a concrete better topic. Blame-free.
- **Reduced-motion outcome (L136)** — "Streak saved" shows statically for SR/reduced-motion users; the load-bearing fact never hides behind animation. Good tone-accessibility discipline.
