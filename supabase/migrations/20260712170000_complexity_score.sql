-- Store 1–10 complexity judgment on learning sets
alter table public.sets
  add column if not exists complexity_score smallint
  check (complexity_score is null or (complexity_score >= 1 and complexity_score <= 10));
