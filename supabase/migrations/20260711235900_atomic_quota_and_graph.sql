-- Phase 1: Atomic quota, graph persistence, and FTS language support

-- 1. Atomic set quota consumption (uses auth.uid(), no caller-controlled user_id)
create or replace function public.consume_set_quota()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  rows_affected integer;
begin
  update public.profile
  set sets_remaining = sets_remaining - 1
  where id = auth.uid() and sets_remaining > 0;

  get diagnostics rows_affected = row_count;
  return rows_affected > 0;
end;
$$;

-- 2. Atomic chat quota consumption (replaces decrement_chat_quota which had no guard)
create or replace function public.consume_chat_quota()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  rows_affected integer;
begin
  update public.profile
  set chats_remaining = chats_remaining - 1
  where id = auth.uid() and chats_remaining > 0;

  get diagnostics rows_affected = row_count;
  return rows_affected > 0;
end;
$$;

-- 3. Atomic set-graph persistence (single transaction, auth.uid() for profile_id)
-- Accepts JSONB: { title, description, category, lessons: [{title, paragraphs:[]}], quizzes: [{title, questions: [{question, answer, options:[]}]}] }
create or replace function public.create_set_graph(graph_data jsonb)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  set_id bigint;
  lesson_data jsonb;
  lesson_id bigint;
  lesson_idx int;
  quiz_data jsonb;
  quiz_id bigint;
  question_data jsonb;
  question_id bigint;
  question_idx int;
  lessons_len int;
  quizzes_len int;
  paragraphs_len int;
  questions_len int;
  options_len int;
  p_idx int;
  o_idx int;
begin
  -- Validate caller is authenticated
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Validate lessons and quizzes arrays are present and same length
  lessons_len := jsonb_array_length(graph_data->'lessons');
  quizzes_len := jsonb_array_length(graph_data->'quizzes');
  if lessons_len = 0 then
    raise exception 'Set must have at least 1 lesson';
  end if;
  if lessons_len <> quizzes_len then
    raise exception 'Lessons and quizzes count mismatch: % vs %', lessons_len, quizzes_len;
  end if;

  -- Insert the set
  insert into public.sets (profile_id, title, description, category)
  values (
    auth.uid(),
    graph_data->>'title',
    graph_data->>'description',
    graph_data->>'category'
  )
  returning id into set_id;

  -- Insert lessons, paragraphs, quizzes, questions, options
  for lesson_idx in 0..lessons_len - 1 loop
    lesson_data := graph_data->'lessons'->lesson_idx;

    insert into public.lessons (set_id, title, position)
    values (set_id, lesson_data->>'title', lesson_idx)
    returning id into lesson_id;

    -- Paragraphs
    paragraphs_len := jsonb_array_length(lesson_data->'paragraphs');
    for p_idx in 0..paragraphs_len - 1 loop
      insert into public.paragraphs (lesson_id, content, position)
      values (lesson_id, lesson_data->'paragraphs'->>p_idx, p_idx);
    end loop;

    -- Quiz (index-aligned with lessons)
    quiz_data := graph_data->'quizzes'->lesson_idx;
    insert into public.quizzes (lesson_id, title)
    values (lesson_id, quiz_data->>'title')
    returning id into quiz_id;

    -- Questions and options
    questions_len := jsonb_array_length(quiz_data->'questions');
    for question_idx in 0..questions_len - 1 loop
      question_data := quiz_data->'questions'->question_idx;

      insert into public.questions (quiz_id, question, answer, position)
      values (
        quiz_id,
        question_data->>'question',
        question_data->>'answer',
        question_idx
      )
      returning id into question_id;

      options_len := jsonb_array_length(question_data->'options');
      for o_idx in 0..options_len - 1 loop
        insert into public.options (question_id, option, position)
        values (question_id, question_data->'options'->>o_idx, o_idx);
      end loop;
    end loop;
  end loop;

  return set_id;
end;
$$;

-- 4. FTS language support: drop generated expression, add language column, rebuild
-- Add language column first (default 'eng' for existing English-only data)
alter table public.document_chunks
  add column if not exists language text not null default 'eng';

-- Drop the generated expression on fts column so we can populate it manually
-- PostgreSQL doesn't support ALTER COLUMN DROP EXPRESSION for generated columns,
-- so we drop and re-add the column.
-- Preserve existing data by copying to a temp column, dropping, recreating, restoring.
do $$
begin
  -- Check if fts is a generated column (information_schema check)
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'document_chunks'
      and column_name = 'fts'
      and is_generated = 'ALWAYS'
  ) then
    -- Drop the gin index first
    drop index if exists public.document_chunks_fts_idx;

    -- Drop the generated column
    alter table public.document_chunks drop column fts;

    -- Re-add as regular tsvector column
    alter table public.document_chunks add column fts tsvector;

    -- Backfill with English (existing content was all English-stemmed)
    update public.document_chunks
    set fts = to_tsvector('english', coalesce(content, ''));

    -- Rebuild the GIN index
    create index document_chunks_fts_idx
      on public.document_chunks using gin (fts);
  end if;
end;
$$;

-- Update keyword search to use language-aware tsquery config
drop function if exists public.keyword_document_chunks(text, bigint, uuid, integer);

create or replace function public.keyword_document_chunks(
  query_text text,
  filter_study_bot_id bigint,
  filter_profile_id uuid,
  match_count integer default 8,
  query_language text default 'english'
)
returns table (
  id bigint,
  document_name text,
  content text,
  chunk_index integer,
  rank float
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  lang_config regconfig;
  ts_query tsquery;
begin
  -- Resolve language config, fall back to english
  begin
    lang_config := query_language::regconfig;
  exception when others then
    lang_config := 'english'::regconfig;
  end;

  ts_query := websearch_to_tsquery(lang_config, query_text);

  return query
  select
    dc.id,
    dc.document_name,
    dc.content,
    dc.chunk_index,
    ts_rank_cd(dc.fts, ts_query)::float as rank
  from public.document_chunks dc
  where dc.study_bot_id = filter_study_bot_id
    and dc.profile_id = filter_profile_id
    and dc.fts @@ ts_query
  order by rank desc
  limit least(match_count, 50);
end;
$$;

-- 5. Trigger to compute language-aware FTS on document_chunks insert/update
create or replace function public.compute_document_chunk_fts()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Use the language column to pick the right tsvector config
  begin
    new.fts := to_tsvector(new.language::regconfig, coalesce(new.content, ''));
  exception when others then
    -- If language config is invalid, fall back to english
    new.fts := to_tsvector('english', coalesce(new.content, ''));
  end;
  return new;
end;
$$;

drop trigger if exists document_chunks_fts_trigger on public.document_chunks;

create trigger document_chunks_fts_trigger
  before insert or update of content, language on public.document_chunks
  for each row
  execute function public.compute_document_chunk_fts();

-- Grant execute on new functions
grant execute on function public.consume_set_quota() to authenticated;
grant execute on function public.consume_chat_quota() to authenticated;
grant execute on function public.create_set_graph(jsonb) to authenticated;
grant execute on function public.keyword_document_chunks(text, bigint, uuid, integer, text) to authenticated, service_role;
