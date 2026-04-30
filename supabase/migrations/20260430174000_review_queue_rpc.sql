-- Robust review queue fetch for experts/admins.
-- Uses SECURITY DEFINER so queue visibility does not depend on client-side join/path quirks.

create or replace function public.get_review_queue_worlds()
returns table (
  id uuid,
  title text,
  creator_id uuid,
  creator_email text,
  payload jsonb,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
begin
  -- If no JWT (e.g. SQL editor), return nothing.
  if me is null then
    return;
  end if;

  -- Only expert/admin can access review queue.
  if not public.is_expert_or_admin() then
    return;
  end if;

  return query
  select
    w.id,
    w.title,
    w.creator_id,
    coalesce(p.email, w.creator_id::text) as creator_email,
    w.payload,
    w.updated_at
  from public.worlds w
  left join public.profiles p on p.id = w.creator_id
  where (
      -- Primary shape
      replace(lower(coalesce(w.payload->'review'->>'status', '')), ' ', '_') = 'in_review'
      -- Legacy / alternative shapes
      or replace(lower(coalesce(w.payload->>'reviewStatus', '')), ' ', '_') = 'in_review'
      or replace(lower(coalesce(w.payload->>'status', '')), ' ', '_') = 'in_review'
    )
    and w.creator_id <> me
  order by w.updated_at desc;
end;
$$;

grant execute on function public.get_review_queue_worlds() to authenticated;
