-- Study Buddy storage quota (750MB free / 5GB plus) + document metadata for client-side RAG.

alter table public.profile
  add column if not exists storage_bytes_used bigint not null default 0;

alter table public.study_bot_documents
  add column if not exists mime_type text,
  add column if not exists storage_path text,
  add column if not exists status text not null default 'ready',
  add column if not exists embedding_model text;

alter table public.document_chunks
  add column if not exists embedding_model text;

-- Free: 750 MiB; Plus (is_subscribed): 5 GiB
create or replace function public.study_storage_cap_bytes(p_user_id uuid)
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when exists (
      select 1 from public.profile pr
      where pr.id = p_user_id and pr.is_subscribed
    ) then (5::bigint * 1024 * 1024 * 1024)
    else (750::bigint * 1024 * 1024)
  end;
$$;

create or replace function public.claim_study_storage(bytes bigint)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  used bigint;
  cap bigint;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  if bytes is null or bytes <= 0 then
    raise exception 'bytes must be positive';
  end if;

  select storage_bytes_used into used
  from public.profile
  where id = uid
  for update;

  if not found then
    raise exception 'Profile not found';
  end if;

  cap := public.study_storage_cap_bytes(uid);

  if used + bytes > cap then
    return false;
  end if;

  update public.profile
  set storage_bytes_used = used + bytes
  where id = uid;

  return true;
end;
$$;

create or replace function public.release_study_storage(bytes bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  if bytes is null or bytes <= 0 then
    return;
  end if;

  update public.profile
  set storage_bytes_used = greatest(0, storage_bytes_used - bytes)
  where id = uid;
end;
$$;

-- When a study bot is deleted, release storage for its documents
create or replace function public.release_storage_on_document_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.document_size is not null and old.document_size > 0 then
    update public.profile p
    set storage_bytes_used = greatest(0, p.storage_bytes_used - old.document_size)
    from public.study_bots b
    where b.id = old.study_bot_id
      and p.id = b.profile_id;
  end if;
  return old;
end;
$$;

drop trigger if exists study_bot_documents_release_storage on public.study_bot_documents;
create trigger study_bot_documents_release_storage
  after delete on public.study_bot_documents
  for each row
  execute function public.release_storage_on_document_delete();

revoke all on function public.claim_study_storage(bigint) from public, anon;
grant execute on function public.claim_study_storage(bigint) to authenticated;

revoke all on function public.release_study_storage(bigint) from public, anon;
grant execute on function public.release_study_storage(bigint) to authenticated;

revoke all on function public.study_storage_cap_bytes(uuid) from public, anon;
grant execute on function public.study_storage_cap_bytes(uuid) to authenticated;

-- Expand storage bucket limits + mime allowlist for study materials
update storage.buckets
set
  file_size_limit = 104857600, -- 100 MiB per object; global free cap is 750 MiB
  allowed_mime_types = array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json',
    'application/xml',
    'application/rtf',
    'application/epub+zip',
    'text/plain',
    'text/markdown',
    'text/csv',
    'text/html',
    'text/tab-separated-values',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/heic',
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/mp4',
    'audio/ogg',
    'audio/webm',
    'audio/aac',
    'audio/flac',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
where id = 'study-documents';
