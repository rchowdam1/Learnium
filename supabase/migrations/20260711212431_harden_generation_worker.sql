-- Lock privileged worker operations to service_role and provide a job-owned
-- persistence bridge for RPCs whose ownership normally comes from auth.uid().

revoke all on function public.claim_generation_job() from public, anon, authenticated;
revoke all on function public.update_generation_job(uuid, text, text, integer, integer, bigint, text, text) from public, anon, authenticated;
grant execute on function public.claim_generation_job() to service_role;
grant execute on function public.update_generation_job(uuid, text, text, integer, integer, bigint, text, text) to service_role;

grant select, insert on public.set_generation_jobs to authenticated;
grant update (status, phase, updated_at) on public.set_generation_jobs to authenticated;

create unique index if not exists set_generation_jobs_one_active_title_idx
  on public.set_generation_jobs (profile_id, lower(title))
  where status in ('queued', 'running');

drop function public.claim_generation_job();

create or replace function public.claim_generation_job(p_job_id uuid default null)
returns setof public.set_generation_jobs
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed_job public.set_generation_jobs%rowtype;
begin
  select * into claimed_job
  from public.set_generation_jobs
  where status = 'queued'
    and (p_job_id is null or id = p_job_id)
  order by created_at asc
  limit 1
  for update skip locked;

  if not found then return; end if;

  update public.set_generation_jobs
  set status = 'running', phase = 'Claimed', updated_at = now()
  where id = claimed_job.id
  returning * into claimed_job;

  return next claimed_job;
end;
$$;

revoke all on function public.claim_generation_job(uuid) from public, anon, authenticated;
grant execute on function public.claim_generation_job(uuid) to service_role;

create or replace function public.persist_generation_job_graph(
  p_job_id uuid,
  p_graph_data jsonb
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  job_profile_id uuid;
  new_set_id bigint;
begin
  select profile_id into job_profile_id
  from public.set_generation_jobs
  where id = p_job_id and status = 'running'
  for update;

  if not found then raise exception 'JOB_NOT_RUNNING'; end if;

  -- create_set_graph_with_quota derives ownership from auth.uid(). This local
  -- claim is sourced from the locked job row, never from worker input.
  perform set_config('request.jwt.claim.sub', job_profile_id::text, true);
  new_set_id := public.create_set_graph_with_quota(p_graph_data);
  return new_set_id;
end;
$$;

revoke all on function public.persist_generation_job_graph(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.persist_generation_job_graph(uuid, jsonb) to service_role;
