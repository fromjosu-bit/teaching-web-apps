-- Account-owned practice records. Scores are practice feedback, not exam grades.
create table public.learning_records (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  game_id text not null check (game_id in ('spelling','spacing','vocabulary','proverbs','daily')),
  correct_count smallint not null check (correct_count between 0 and 5),
  total_count smallint not null default 5 check (total_count = 5),
  score smallint generated always as (correct_count * 20) stored,
  played_at timestamptz not null default now()
);
create index learning_records_owner_date on public.learning_records(user_id,played_at desc,id desc);
alter table public.learning_records enable row level security;
revoke all on public.learning_records from anon, authenticated;
grant select on public.learning_records to authenticated;
grant insert (id,game_id,correct_count) on public.learning_records to authenticated;
create policy own_records_read on public.learning_records for select to authenticated
  using ((select auth.uid()) = user_id);
create policy own_records_insert on public.learning_records for insert to authenticated
  with check ((select auth.uid()) = user_id);

create function public.my_learning_stats()
returns table(rounds bigint,correct_answers bigint,best_score integer)
language sql stable security invoker set search_path = ''
as $$
  select count(*),coalesce(sum(correct_count),0),coalesce(max(score),0)::integer
  from public.learning_records where user_id = (select auth.uid());
$$;
revoke execute on function public.my_learning_stats() from public, anon;
grant execute on function public.my_learning_stats() to authenticated;
