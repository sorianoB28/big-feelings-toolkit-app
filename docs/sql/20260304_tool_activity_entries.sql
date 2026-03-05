create extension if not exists pgcrypto;

create table if not exists tool_activity_entries (
  id uuid primary key default gen_random_uuid(),
  tool_use_id uuid not null references tool_uses(id) on delete cascade,
  entry_type text not null,
  entry_text text not null,
  created_at timestamptz not null default now(),
  constraint tool_activity_entries_entry_type_check
    check (entry_type in ('see', 'feel', 'hear', 'smell', 'taste'))
);

create index if not exists tool_activity_entries_tool_use_id_idx
  on tool_activity_entries(tool_use_id);

create index if not exists tool_activity_entries_entry_type_idx
  on tool_activity_entries(entry_type);
