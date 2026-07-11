create table if not exists public.set_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profile(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  phase text not null default 'Queued',
  completed_lessons integer not null default 0,
  total_lessons integer,
  workflow_run_id text,
  set_id bigint references public.sets(id) on delete set null,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.set_generation_jobs enable row level security;
create policy "Users can view their own generation jobs" on public.set_generation_jobs
  for select using (auth.uid() = profile_id);

create index if not exists set_generation_jobs_profile_created_idx
  on public.set_generation_jobs (profile_id, created_at desc);
