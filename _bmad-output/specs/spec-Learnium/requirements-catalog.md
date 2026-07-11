# Learnium Requirements Catalog

This catalog preserves the PRD's line-item requirements while `SPEC.md` carries the kernel. Capability IDs are stable; PRD FR numbers remain traceability labels.

| Capability | PRD requirements preserved |
| --- | --- |
| CAP-1 Topic-to-Set generation | FR-1 Generate a Set from a topic; FR-2 reject invalid/unsafe topics without cost; FR-3 generated Lesson quality floor and report control. |
| CAP-2 Lesson progression | FR-4 complete Lessons in order with persistent state; FR-5 exact-once Set completion, celebration, Badge check, and next action. |
| CAP-3 Study Buddy tutoring | FR-6 context-aware Study Buddy chat, quota ordering, out-of-quota continuation, persisted history; document ingest via `lib/ingest/` + Supabase pgvector hybrid retrieval (Python RAG/Chroma/LangCache superseded 2026-07-11). |
| CAP-4 Daily Goal and Streak loop | FR-7 Daily Goal selection/tracking; FR-8 Streak accrual/loss; FR-9 daily reminder at user-chosen time with deep link. |
| CAP-5 Rewards | FR-10 server-side XP awards; FR-11 threshold-derived Levels; FR-12 one-time Badges with profile display. |
| CAP-6 Review Sessions | FR-15 per-user review queue from completed Lessons; FR-16 5-10 question Review Session under about 3 minutes, zero quota, XP, schedule update. |
| CAP-7 Learning Paths | FR-17 generate a 3-8 Set Path outline with first Set; FR-18 Path completion Badge, shareable summary, and next Path suggestion. |
| CAP-8 Leagues and social proof | FR-13 weekly League assignment/cycle; FR-14 leaderboard display/privacy/opt-out; FR-19 public profiles/share cards; FR-20 mutual-consent friends leaderboard. |
| CAP-9 Billing and quotas | FR-21 Free/Plus tier enforcement by Set and Study Buddy quotas; FR-22 Stripe upgrade/manage/cancel and return to interrupted action. |
| CAP-10 Account privacy | FR-23 account deletion; age gate and data handling constraints from PRD section 6 and UX spine. |

## Quality And Guardrail Requirements

- Valid topics produce 4-12 Lessons with non-empty content; generation completes or visibly fails within 60 seconds.
- Lesson interiors may include text, quizzes, diagrams, and images.
- Quota is checked before provider work and decremented only after validated durable success.
- Rejected inputs state the rejection category and never consume quota.
- Malformed generated Sets are regenerated or fail cleanly and are never persisted for the user.
- Every Lesson exposes a report-content control and stores reports with Lesson identity.
- Progress, rewards, Streaks, Review schedules, and League XP are server-authoritative and idempotent.
- Public/social surfaces expose only display name, Level, Badges, current Streak, completed Sets count, and weekly XP as allowed by privacy state.
- League cycles reset on one global UTC weekly boundary; tier names and promotion/demotion counts remain open.
- Streak freezes are earnable; a missed day without a freeze hard-resets the Streak with soft restart copy.
- Users receive 5 Set generations on signup; ongoing Free includes 3 Set generations and 20 Buddy chats per month; Plus is $9.99/month.
- Phase A includes email plus web push/PWA reminders.
- Cancellation downgrades at period end and never deletes content, progress, XP, Streaks, or learning history.

## Launch Phasing

- **Phase A - Harden and retain:** production hardening for existing Set generation, Lessons, Study Buddy, tier enforcement; add Streaks, Daily Goals, XP, Levels, Badges, and Review Sessions.
- **Phase B - Compete and deepen:** Leagues and Learning Paths, launch or fast-follow within about 4 weeks.
- **Phase C - Show and invite:** public profiles, share cards, and friends leaderboard.

## Counter-Metrics

- Streak anxiety churn: more than 20% of users quitting within 3 days of losing a Streak of 7+ days requires streak-loss softening.
- Content report rate: more than 5 reports per 1,000 Lesson views triggers content quality escalation.
- LLM cost per weekly active user must stay under the unit-economics ceiling.
- XP integrity anomalies above the selected threshold require anti-abuse investigation.
