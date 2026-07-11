-- Reassert metadata columns whose earlier migration versions were recorded in
-- remote history without the corresponding schema changes.
alter table public.sets
  add column if not exists complexity text,
  add column if not exists pass_threshold numeric not null default 0.75,
  add column if not exists sources jsonb,
  add column if not exists complexity_score smallint
    check (complexity_score is null or complexity_score between 1 and 10);

alter table public.lessons
  add column if not exists difficulty smallint,
  add column if not exists objectives jsonb;

alter table public.quizzes
  add column if not exists pass_threshold numeric,
  add column if not exists attempt_count integer not null default 0,
  add column if not exists last_percent numeric;
