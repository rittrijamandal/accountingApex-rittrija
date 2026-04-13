-- Accounting APEX — Phase 1 schema (Auth profiles, worlds, world_files, storage)
-- Run in Supabase SQL Editor or via: supabase db push

-- ── Extensions ─────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Roles enum ───────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'expert', 'grader');
  end if;
end$$;

-- ── Profiles (1:1 with auth.users) ─────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  role public.app_role not null default 'grader',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

-- New auth users → profile row (default least-privileged role: grader)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'grader'::public.app_role)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep email in sync when it changes in auth
create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = new.email, updated_at = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.sync_profile_email();

-- RLS helpers — SECURITY DEFINER reads profiles without triggering profiles RLS (avoids infinite recursion)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'::public.app_role
  );
$$;

create or replace function public.is_expert_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('expert'::public.app_role, 'admin'::public.app_role)
  );
$$;

create or replace function public.is_grader()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'grader'::public.app_role
  );
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_expert_or_admin() to authenticated;
grant execute on function public.is_grader() to authenticated;

-- Only admins may change profile.role (client updates to other fields still allowed for own row)
create or replace function public.enforce_profile_role_change()
returns trigger
language plpgsql
as $$
begin
  -- SQL Editor / service paths have no JWT → auth.uid() is null; allow bootstrap & maintenance.
  if old.role is distinct from new.role then
    if auth.uid() is not null and not public.is_admin() then
      raise exception 'Only admins can change user roles';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_role_guard on public.profiles;
create trigger profiles_role_guard
  before update on public.profiles
  for each row
  execute function public.enforce_profile_role_change();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ── Worlds ─────────────────────────────────────────────────────────────────
create table if not exists public.worlds (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists worlds_creator_idx on public.worlds (creator_id);
create index if not exists worlds_published_idx on public.worlds (is_published) where is_published = true;

drop trigger if exists worlds_touch on public.worlds;
create trigger worlds_touch
  before update on public.worlds
  for each row execute function public.touch_updated_at();

-- ── World files (metadata; blobs live in Storage) ──────────────────────────
create table if not exists public.world_files (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.worlds (id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  byte_size bigint,
  created_at timestamptz not null default now(),
  unique (world_id, storage_path)
);

create index if not exists world_files_world_idx on public.world_files (world_id);

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.worlds enable row level security;
alter table public.world_files enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- No INSERT policy for authenticated users — rows are created by handle_new_user (security definer).
drop policy if exists "profiles_insert_own" on public.profiles;

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- Helper: can current user read this world?
create or replace function public.can_read_world(w public.worlds)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or w.creator_id = auth.uid()
    or (w.is_published = true and public.is_grader());
$$;

-- Experts need to see published worlds too when we add browsing; graders only published.
-- Adjust: experts see own + published; graders see published only; admins see all.
drop policy if exists "worlds_select" on public.worlds;
create policy "worlds_select"
  on public.worlds for select
  using (public.can_read_world(worlds));

drop policy if exists "worlds_insert" on public.worlds;
create policy "worlds_insert"
  on public.worlds for insert
  with check (
    creator_id = auth.uid()
    and public.is_expert_or_admin()
  );

drop policy if exists "worlds_update" on public.worlds;
create policy "worlds_update"
  on public.worlds for update
  using (
    public.is_admin()
    or (creator_id = auth.uid() and public.is_expert_or_admin())
  );

drop policy if exists "worlds_delete" on public.worlds;
create policy "worlds_delete"
  on public.worlds for delete
  using (
    public.is_admin()
    or (creator_id = auth.uid() and public.is_expert_or_admin())
  );

drop policy if exists "world_files_select" on public.world_files;
create policy "world_files_select"
  on public.world_files for select
  using (
    exists (
      select 1 from public.worlds w
      where w.id = world_files.world_id
        and public.can_read_world(w)
    )
  );

drop policy if exists "world_files_insert" on public.world_files;
create policy "world_files_insert"
  on public.world_files for insert
  with check (
    exists (
      select 1 from public.worlds w
      where w.id = world_files.world_id
        and w.creator_id = auth.uid()
        and public.is_expert_or_admin()
    )
  );

drop policy if exists "world_files_update" on public.world_files;
create policy "world_files_update"
  on public.world_files for update
  using (
    exists (
      select 1 from public.worlds w
      where w.id = world_files.world_id
        and (
          public.is_admin()
          or (w.creator_id = auth.uid() and public.is_expert_or_admin())
        )
    )
  );

drop policy if exists "world_files_delete" on public.world_files;
create policy "world_files_delete"
  on public.world_files for delete
  using (
    exists (
      select 1 from public.worlds w
      where w.id = world_files.world_id
        and (
          public.is_admin()
          or (w.creator_id = auth.uid() and public.is_expert_or_admin())
        )
    )
  );

-- ── Storage bucket (private) ─────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('world-files', 'world-files', false)
on conflict (id) do nothing;

-- Path convention: {user_id}/{world_id}/{filename}
drop policy if exists "world_files_storage_select" on storage.objects;
create policy "world_files_storage_select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'world-files'
    and (
      split_part(name, '/', 1) = auth.uid()::text
      or public.is_admin()
      or (
        exists (
          select 1 from public.worlds w
          where w.id = split_part(name, '/', 2)::uuid
            and public.can_read_world(w)
        )
      )
    )
  );

drop policy if exists "world_files_storage_insert" on storage.objects;
create policy "world_files_storage_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'world-files'
    and split_part(name, '/', 1) = auth.uid()::text
    and exists (
      select 1 from public.worlds w
      where w.id = split_part(name, '/', 2)::uuid
        and w.creator_id = auth.uid()
        and public.is_expert_or_admin()
    )
  );

drop policy if exists "world_files_storage_update" on storage.objects;
create policy "world_files_storage_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'world-files'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "world_files_storage_delete" on storage.objects;
create policy "world_files_storage_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'world-files'
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- Backfill profiles for users created before this migration (safe to re-run)
insert into public.profiles (id, email, role)
select u.id, u.email, 'grader'::public.app_role
from auth.users u
on conflict (id) do nothing;

-- ── Bootstrap first admin (run manually after first signup) ────────────────
-- update public.profiles set role = 'admin' where email = 'you@company.com';
