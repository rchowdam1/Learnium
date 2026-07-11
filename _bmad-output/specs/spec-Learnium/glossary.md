# Learnium Glossary

- **Set:** A generated course on one topic; contains ordered Lessons and is the unit counted by generation quota.
- **Lesson:** One ordered learning unit within a Set; completable, persisted per user, and XP-awarding.
- **Learning Path:** An ordered sequence of Sets toward a broader learning goal; Sets are generated lazily as the user reaches them.
- **Study Buddy / Nova:** AI tutor chat attached to learning context; document-backed buddies ingest uploaded files via Next.js `lib/ingest/` into Supabase `document_chunks` (pgvector); chat retrieves hybrid context then answers via OpenRouter. Lesson-opened chats must ground answers in that Lesson.
- **XP:** Server-awarded points from Lesson, Set, Review, and Daily Goal events; cumulative and monotonic.
- **Level:** User-visible rank derived from cumulative XP thresholds.
- **Streak:** Consecutive-day count for days where the user meets the Daily Goal.
- **Daily Goal:** User-selected daily XP target; meeting it advances the Streak.
- **League:** Weekly leaderboard cohort of active users ranked by weekly XP.
- **Badge:** Named, dated, one-time award for achievements such as first Lesson, first Set, 7-day Streak, 30-day Streak, first Path, and League top-3.
- **Review Session:** Short spaced-repetition quiz assembled from completed Lesson material; zero generation/chat quota cost.
- **Quota:** Per-user, per-period allowance for Set generation or Study Buddy chat.
- **Free / Plus:** Default and paid subscription tiers enforced by quota policy and Stripe-confirmed entitlement.
