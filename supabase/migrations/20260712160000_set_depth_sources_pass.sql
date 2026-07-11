-- Depth / sources / pass-threshold support for generated learning sets.
-- Meta fields (complexity, sources, lesson difficulty/objectives, quiz pass_threshold)
-- are patched after create_set_graph_with_quota via lib/sets/persist-set-meta.ts
-- rather than rewriting the RPC (keeps quota logic untouched).

alter table public.sets
  add column if not exists complexity text,
  add column if not exists pass_threshold numeric not null default 0.75,
  add column if not exists sources jsonb;

alter table public.lessons
  add column if not exists difficulty smallint,
  add column if not exists objectives jsonb;

alter table public.quizzes
  add column if not exists pass_threshold numeric,
  add column if not exists attempt_count integer not null default 0,
  add column if not exists last_percent numeric;
