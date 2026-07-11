-- Permit an explicitly retried stale run to be reclaimed, and close the
-- cancellation race by marking success in the same transaction as graph save.
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
  where (status = 'queued' or (status = 'running' and updated_at < now() - interval '10 minutes'))
    and (p_job_id is null or id = p_job_id)
  order by created_at asc
  limit 1
  for update skip locked;

  if not found then return; end if;

  update public.set_generation_jobs
  set status = 'running', phase = 'Claimed', completed_lessons = 0,
      error_code = null, error_message = null, updated_at = now()
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

  perform set_config('request.jwt.claim.sub', job_profile_id::text, true);
  new_set_id := public.create_set_graph_with_quota(p_graph_data);

  update public.set_generation_jobs
  set status = 'succeeded', phase = 'Complete', set_id = new_set_id,
      completed_lessons = coalesce(total_lessons, completed_lessons),
      updated_at = now()
  where id = p_job_id;

  return new_set_id;
end;
$$;

revoke all on function public.persist_generation_job_graph(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.persist_generation_job_graph(uuid, jsonb) to service_role;
