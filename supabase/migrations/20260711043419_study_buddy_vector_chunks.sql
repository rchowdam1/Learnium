-- Study buddy document chunks with pgvector embeddings (user-scoped RAG)

create extension if not exists vector with schema extensions;

create table public.document_chunks (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profile (id) on delete cascade,
  study_bot_id bigint not null references public.study_bots (id) on delete cascade,
  document_id bigint references public.study_bot_documents (id) on delete set null,
  document_name text not null,
  content text not null,
  chunk_index integer not null default 0,
  mime_type text,
  source_type text not null default 'text',
  embedding extensions.vector(384),
  fts tsvector generated always as (to_tsvector('english', coalesce(content, ''))) stored,
  created_at timestamptz not null default now()
);

create index document_chunks_study_bot_idx
  on public.document_chunks (study_bot_id);

create index document_chunks_profile_idx
  on public.document_chunks (profile_id);

create index document_chunks_fts_idx
  on public.document_chunks using gin (fts);

create index document_chunks_embedding_idx
  on public.document_chunks
  using hnsw (embedding extensions.vector_cosine_ops);

alter table public.document_chunks enable row level security;

create policy "Users manage own document chunks"
  on public.document_chunks for all
  to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

-- Semantic similarity search scoped to a study buddy + owning profile
create or replace function public.match_document_chunks (
  query_embedding extensions.vector(384),
  filter_study_bot_id bigint,
  filter_profile_id uuid,
  match_count integer default 8,
  match_threshold float default 0.15
)
returns table (
  id bigint,
  document_name text,
  content text,
  chunk_index integer,
  similarity float
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select
    dc.id,
    dc.document_name,
    dc.content,
    dc.chunk_index,
    (1 - (dc.embedding <=> query_embedding))::float as similarity
  from public.document_chunks dc
  where dc.study_bot_id = filter_study_bot_id
    and dc.profile_id = filter_profile_id
    and dc.embedding is not null
    and 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding asc
  limit least(match_count, 50);
$$;

-- Keyword (full-text) search fallback / hybrid companion
create or replace function public.keyword_document_chunks (
  query_text text,
  filter_study_bot_id bigint,
  filter_profile_id uuid,
  match_count integer default 8
)
returns table (
  id bigint,
  document_name text,
  content text,
  chunk_index integer,
  rank float
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    dc.id,
    dc.document_name,
    dc.content,
    dc.chunk_index,
    ts_rank_cd(dc.fts, websearch_to_tsquery('english', query_text))::float as rank
  from public.document_chunks dc
  where dc.study_bot_id = filter_study_bot_id
    and dc.profile_id = filter_profile_id
    and dc.fts @@ websearch_to_tsquery('english', query_text)
  order by rank desc
  limit least(match_count, 50);
$$;

grant execute on function public.match_document_chunks(extensions.vector, bigint, uuid, integer, float)
  to authenticated, service_role;

grant execute on function public.keyword_document_chunks(text, bigint, uuid, integer)
  to authenticated, service_role;
