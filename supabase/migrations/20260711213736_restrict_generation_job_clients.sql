drop policy if exists "Users can create their own generation jobs" on public.set_generation_jobs;
create policy "Users can enqueue their own generation jobs"
  on public.set_generation_jobs for insert to authenticated
  with check (
    (select auth.uid()) = profile_id and status = 'queued' and phase = 'Queued'
    and completed_lessons = 0 and total_lessons is null
    and workflow_run_id is null and set_id is null
    and error_code is null and error_message is null
  );

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
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.set_generation_jobs
  set status = coalesce(p_status, status),
      phase = coalesce(p_phase, phase),
      completed_lessons = greatest(completed_lessons, coalesce(p_completed_lessons, completed_lessons)),
      total_lessons = coalesce(p_total_lessons, total_lessons),
      set_id = coalesce(p_set_id, set_id),
      error_code = coalesce(p_error_code, error_code),
      error_message = coalesce(p_error_message, error_message),
      updated_at = now()
  where id = p_job_id and status = 'running';
end;
$$;

revoke all on function public.update_generation_job(uuid, text, text, integer, integer, bigint, text, text) from public, anon, authenticated;
grant execute on function public.update_generation_job(uuid, text, text, integer, integer, bigint, text, text) to service_role;
