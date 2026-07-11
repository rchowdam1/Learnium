-- Persist structured source citations on Study Buddy assistant messages
-- so the sources chip + preview panel survive page reloads.

alter table public.study_bot_chats
  add column if not exists citations jsonb;
