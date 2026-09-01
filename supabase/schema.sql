-- IAN (Institutional Academic Network) — Supabase schema
-- Run this once in your Supabase project's SQL Editor (Dashboard → SQL Editor → New query).

-- ─────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────

create table if not exists public.requests (
  id text primary key,
  title text not null,
  student text not null,
  student_roll_no text not null,
  student_branch text not null,
  student_photo text not null,
  category text not null,
  description text not null,
  ai_summary text not null default '',
  generated_letter text,
  status text not null,
  current_stage_index int not null default 0,
  request_type text not null,
  workflow jsonb not null default '[]',
  documents jsonb not null default '[]',
  attachments jsonb not null default '[]',
  comments jsonb not null default '[]',
  timeline jsonb not null default '[]',
  student_email text,
  assigned_coordinator_id text,
  assigned_coordinator_name text,
  assigned_deputy_hod_id text,
  assigned_deputy_hod_name text,
  assigned_hod_name text,
  urgency text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id text primary key,
  title text not null,
  message text not null,
  type text not null default 'info',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.users (
  id text primary key,
  roll_no text not null,
  name text not null,
  role text not null,
  branch text,
  password text,
  phone text,
  photo text,
  department text,
  year int,
  email text,
  class_coordinator text,
  deputy_hod text,
  first_login boolean not null default false
);

-- ─────────────────────────────────────────────
-- Realtime: allow the client to subscribe to row changes
-- ─────────────────────────────────────────────
alter publication supabase_realtime add table public.requests;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.users;

-- ─────────────────────────────────────────────
-- Row Level Security
--
-- NOTE: this app does its own lightweight login check against a static
-- account list in the frontend (see src/data/studentAccounts.ts /
-- officialAccounts.ts) rather than using real Supabase Auth. That means
-- there is no server-side identity to scope RLS policies to. The policies
-- below simply allow the anon (public) key full read/write access, which
-- matches the app's current trust model (anyone with the deployed URL can
-- act as any role). If you need real access control, the proper fix is to
-- introduce Supabase Auth and rewrite these policies to check auth.uid().
-- ─────────────────────────────────────────────

alter table public.requests enable row level security;
alter table public.notifications enable row level security;
alter table public.users enable row level security;

drop policy if exists "public read requests" on public.requests;
drop policy if exists "public write requests" on public.requests;
create policy "public read requests" on public.requests for select using (true);
create policy "public write requests" on public.requests for all using (true) with check (true);

drop policy if exists "public read notifications" on public.notifications;
drop policy if exists "public write notifications" on public.notifications;
create policy "public read notifications" on public.notifications for select using (true);
create policy "public write notifications" on public.notifications for all using (true) with check (true);

drop policy if exists "public read users" on public.users;
drop policy if exists "public write users" on public.users;
create policy "public read users" on public.users for select using (true);
create policy "public write users" on public.users for all using (true) with check (true);

-- ─────────────────────────────────────────────
-- Storage bucket for request attachments
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', true)
on conflict (id) do nothing;

drop policy if exists "public read attachments" on storage.objects;
drop policy if exists "public write attachments" on storage.objects;
drop policy if exists "public delete attachments" on storage.objects;
create policy "public read attachments" on storage.objects for select using (bucket_id = 'attachments');
create policy "public write attachments" on storage.objects for insert with check (bucket_id = 'attachments');
create policy "public delete attachments" on storage.objects for delete using (bucket_id = 'attachments');
