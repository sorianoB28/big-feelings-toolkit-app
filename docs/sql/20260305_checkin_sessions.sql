alter table if exists checkins
  add column if not exists started_at timestamptz,
  add column if not exists ended_at timestamptz,
  add column if not exists return_step_type text,
  add column if not exists return_step_text text,
  add column if not exists closed_by_user_id uuid;

alter table if exists checkins
  alter column started_at set default now();

alter table if exists checkins
  alter column ended_at drop not null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'checkins'
      and column_name = 'closed_by_user_id'
  ) and not exists (
    select 1
    from pg_constraint
    where conname = 'checkins_closed_by_user_id_fkey'
  ) then
    alter table checkins
      add constraint checkins_closed_by_user_id_fkey
      foreign key (closed_by_user_id) references users(id);
  end if;
end
$$;

create index if not exists checkins_student_started_at_desc_idx
  on checkins (student_id, started_at desc);

