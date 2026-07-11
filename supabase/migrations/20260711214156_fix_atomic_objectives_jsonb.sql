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
  lesson_meta jsonb;
  lesson_number bigint;
  threshold numeric := coalesce((p_graph_data->>'passThreshold')::numeric, 0.75);
begin
  select profile_id into job_profile_id
  from public.set_generation_jobs
  where id = p_job_id and status = 'running'
  for update;
  if not found then raise exception 'JOB_NOT_RUNNING'; end if;

  perform set_config('request.jwt.claim.sub', job_profile_id::text, true);
  new_set_id := public.create_set_graph_with_quota(p_graph_data);

  update public.sets
  set pass_threshold = threshold,
      complexity = nullif(p_graph_data->>'complexity', ''),
      complexity_score = nullif(p_graph_data->>'complexityScore', '')::integer,
      sources = case when jsonb_typeof(p_graph_data->'sources') = 'array'
                     then p_graph_data->'sources' else sources end
  where id = new_set_id;

  for lesson_meta, lesson_number in
    select value, ordinality
    from jsonb_array_elements(p_graph_data->'lessons') with ordinality
  loop
    update public.lessons
    set difficulty = coalesce((lesson_meta->>'difficulty')::integer, difficulty),
        objectives = case
          when jsonb_typeof(lesson_meta->'objectives') = 'array'
          then lesson_meta->'objectives'
          else objectives
        end
    where set_id = new_set_id and position = lesson_number - 1;
  end loop;

  update public.quizzes q
  set pass_threshold = threshold
  from public.lessons l
  where q.lesson_id = l.id and l.set_id = new_set_id;

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
