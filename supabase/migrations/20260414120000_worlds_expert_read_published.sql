-- Experts can read any published world (catalog / cross-review), not only graders.
-- Drafts remain visible only to creator + admin (unchanged).

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
    or (
      w.is_published = true
      and (
        public.is_grader()
        or public.is_expert_or_admin()
      )
    );
$$;
