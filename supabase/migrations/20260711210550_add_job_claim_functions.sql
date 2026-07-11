-- Atomic job-claim and job-update mechanisms for the Edge Function worker.
-- The worker connects with the service_role key, which bypasses RLS.
-- These functions run as SECURITY DEFINER so they can modify any row.

-- This migration predates the later table-hardening migration in historical
-- ordering, so create the base table here as well for clean database rebuilds.
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

-- Claim exactly one queued job atomically.
-- Uses FOR UPDATE SKIP LOCKED to prevent concurrent claims.
create or replace function public.claim_generation_job()
returns setof public.set_generation_jobs
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed_job public.set_generation_jobs%rowtype;
begin
  select *
  into claimed_job
  from public.set_generation_jobs
  where status = 'queued'
  order by created_at asc
  limit 1
  for update skip locked;

  if not found then
    return;
  end if;

  update public.set_generation_jobs
  set
    status = 'running',
    phase = 'Claimed',
    updated_at = now()
  where id = claimed_job.id;

  -- Re-fetch to return the updated row
  select *
  into claimed_job
  from public.set_generation_jobs
  where id = claimed_job.id;

  return next claimed_job;
end;
$$;

-- Worker-safe job update: the worker writes progress, final status, and optional set_id.
-- Only updates jobs that are currently 'running' (defense-in-depth).
create or replace function public.update_generation_job(
  p_job_id uuid,
  p_status text default null,
  p_phase text default null,
  p_completed_lessons integer default null,
  p_total_lessons integer default null,
  p_set_id bigint default null,
  p_error_code text default null,
  p_error_message text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.set_generation_jobs
  set
    status = coalesce(p_status, status),
    phase = coalesce(p_phase, phase),
    completed_lessons = coalesce(p_completed_lessons, completed_lessons),
    total_lessons = coalesce(p_total_lessons, total_lessons),
    set_id = coalesce(p_set_id, set_id),
    error_code = coalesce(p_error_code, error_code),
    error_message = coalesce(p_error_message, error_message),
    updated_at = now()
  where id = p_job_id
    and status = 'running';

  if not found then
    -- Allow setting final status even if the job isn't running
    -- (e.g. cancelling a queued job)
    update public.set_generation_jobs
    set
      status = coalesce(p_status, status),
      phase = coalesce(p_phase, phase),
      error_code = coalesce(p_error_code, error_code),
      error_message = coalesce(p_error_message, error_message),
      updated_at = now()
    where id = p_job_id
      and status in ('queued', 'running');
  end if;
end;
$$;

-- Users can cancel their own queued/running jobs.
create policy "Users can cancel their own generation jobs"
  on public.set_generation_jobs
  for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id and status = 'cancelled');

grant execute on function public.claim_generation_job() to authenticated, service_role;
grant execute on function public.update_generation_job(
  uuid, text, text, integer, integer, bigint, text, text
) to authenticated, service_role;
