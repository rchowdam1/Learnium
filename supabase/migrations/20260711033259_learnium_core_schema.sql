-- Learnium core schema for local development

create table public.profile (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  is_subscribed boolean not null default false,
  sets_remaining integer not null default 1,
  chats_remaining integer not null default 20,
  sets_refresh_at timestamptz,
  onboarding_topic text,
  daily_goal_tier text,
  daily_goal_xp integer default 0,
  today_xp integer default 0,
  created_at timestamptz not null default now()
);

create table public.customer (
  id text primary key,
  user_id uuid not null references public.profile (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.sets (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profile (id) on delete cascade,
  title text not null,
  description text,
  category text,
  is_flagged boolean not null default false,
  completed boolean not null default false,
  completed_at date,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id bigint generated always as identity primary key,
  set_id bigint not null references public.sets (id) on delete cascade,
  title text not null,
  position integer not null default 0,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.paragraphs (
  id bigint generated always as identity primary key,
  lesson_id bigint not null references public.lessons (id) on delete cascade,
  content text not null,
  position integer not null default 0
);

create table public.quizzes (
  id bigint generated always as identity primary key,
  lesson_id bigint not null references public.lessons (id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  questions_correct integer
);

create table public.questions (
  id bigint generated always as identity primary key,
  quiz_id bigint not null references public.quizzes (id) on delete cascade,
  question text not null,
  answer text not null,
  position integer not null default 0,
  user_answer boolean
);

create table public.options (
  id bigint generated always as identity primary key,
  question_id bigint not null references public.questions (id) on delete cascade,
  option text not null,
  position integer not null default 0
);

create table public.study_bots (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profile (id) on delete cascade,
  bot_name text not null,
  description text,
  category text,
  created_at timestamptz not null default now()
);

create table public.study_bot_documents (
  id bigint generated always as identity primary key,
  study_bot_id bigint not null references public.study_bots (id) on delete cascade,
  document_name text not null,
  document_size bigint,
  created_at timestamptz not null default now()
);

create table public.study_bot_chats (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profile (id) on delete cascade,
  bot_id bigint not null references public.study_bots (id) on delete cascade,
  is_user_message boolean not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table public.flagged (
  id bigint generated always as identity primary key,
  profile_id uuid references public.profile (id) on delete set null,
  profile_email text,
  query text,
  created_at timestamptz not null default now()
);

create or replace function public.decrement_chat_quota(user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.profile
  set chats_remaining = greatest(chats_remaining - 1, 0)
  where id = user_id;
end;
$$;

alter table public.profile enable row level security;
alter table public.customer enable row level security;
alter table public.sets enable row level security;
alter table public.lessons enable row level security;
alter table public.paragraphs enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.options enable row level security;
alter table public.study_bots enable row level security;
alter table public.study_bot_documents enable row level security;
alter table public.study_bot_chats enable row level security;
alter table public.flagged enable row level security;

create policy "Users manage own profile"
  on public.profile for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users manage own customer"
  on public.customer for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own sets"
  on public.sets for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "Users manage lessons via sets"
  on public.lessons for all
  using (exists (
    select 1 from public.sets s where s.id = set_id and s.profile_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.sets s where s.id = set_id and s.profile_id = auth.uid()
  ));

create policy "Users manage paragraphs via lessons"
  on public.paragraphs for all
  using (exists (
    select 1 from public.lessons l
    join public.sets s on s.id = l.set_id
    where l.id = lesson_id and s.profile_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.lessons l
    join public.sets s on s.id = l.set_id
    where l.id = lesson_id and s.profile_id = auth.uid()
  ));

create policy "Users manage quizzes via lessons"
  on public.quizzes for all
  using (exists (
    select 1 from public.lessons l
    join public.sets s on s.id = l.set_id
    where l.id = lesson_id and s.profile_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.lessons l
    join public.sets s on s.id = l.set_id
    where l.id = lesson_id and s.profile_id = auth.uid()
  ));

create policy "Users manage questions via quizzes"
  on public.questions for all
  using (exists (
    select 1 from public.quizzes q
    join public.lessons l on l.id = q.lesson_id
    join public.sets s on s.id = l.set_id
    where q.id = quiz_id and s.profile_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.quizzes q
    join public.lessons l on l.id = q.lesson_id
    join public.sets s on s.id = l.set_id
    where q.id = quiz_id and s.profile_id = auth.uid()
  ));

create policy "Users manage options via questions"
  on public.options for all
  using (exists (
    select 1 from public.questions qq
    join public.quizzes q on q.id = qq.quiz_id
    join public.lessons l on l.id = q.lesson_id
    join public.sets s on s.id = l.set_id
    where qq.id = question_id and s.profile_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.questions qq
    join public.quizzes q on q.id = qq.quiz_id
    join public.lessons l on l.id = q.lesson_id
    join public.sets s on s.id = l.set_id
    where qq.id = question_id and s.profile_id = auth.uid()
  ));

create policy "Users manage own study bots"
  on public.study_bots for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "Users manage study bot documents"
  on public.study_bot_documents for all
  using (exists (
    select 1 from public.study_bots b
    where b.id = study_bot_id and b.profile_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.study_bots b
    where b.id = study_bot_id and b.profile_id = auth.uid()
  ));

create policy "Users manage own study bot chats"
  on public.study_bot_chats for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "Users insert own flagged rows"
  on public.flagged for insert
  with check (auth.uid() = profile_id);

create policy "Users read own flagged rows"
  on public.flagged for select
  using (auth.uid() = profile_id);

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
