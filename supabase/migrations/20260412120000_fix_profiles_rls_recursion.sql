-- Fix: "infinite recursion detected in policy for relation profiles"
-- Cause: RLS on profiles referenced profiles again (admin check).
-- Fix: read roles only inside SECURITY DEFINER helpers (bypass RLS on profiles).

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

-- Role guard: block client role changes unless caller is admin. SQL Editor has auth.uid() null → allow.
create or replace function public.enforce_profile_role_change()
returns trigger
language plpgsql
as $$
begin
  if old.role is distinct from new.role then
    if auth.uid() is not null and not public.is_admin() then
      raise exception 'Only admins can change user roles';
    end if;
  end if;
  return new;
end;
$$;

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

-- ── profiles policies (no subquery on profiles) ──────────────────────────────
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- ── worlds ─────────────────────────────────────────────────────────────────
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

-- ── world_files ────────────────────────────────────────────────────────────
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

-- ── storage.objects ─────────────────────────────────────────────────────────
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
