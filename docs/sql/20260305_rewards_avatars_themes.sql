create extension if not exists pgcrypto;

alter table if exists students
  add column if not exists avatar_key text,
  add column if not exists theme_key text,
  add column if not exists points integer not null default 0;

create table if not exists badges (
  key text primary key,
  title text not null,
  description text not null,
  icon_key text not null,
  tier text,
  active boolean not null default true
);

create table if not exists student_badges (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  badge_key text not null references badges(key),
  awarded_at timestamptz not null default now(),
  awarded_by_user_id uuid references users(id)
);

create unique index if not exists student_badges_student_badge_unique_idx
  on student_badges(student_id, badge_key);

create index if not exists student_badges_student_id_idx
  on student_badges(student_id);

create index if not exists student_badges_badge_key_idx
  on student_badges(badge_key);
