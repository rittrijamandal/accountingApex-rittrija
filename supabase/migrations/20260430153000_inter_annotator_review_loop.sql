-- Inter-Annotator Review Loop
-- Adds 3-review quality gate for expert worlds using existing roles.

create table if not exists public.world_review_scores (
  world_id uuid not null references public.worlds(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  score numeric(3,2) not null check (score >= 1 and score <= 5),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (world_id, reviewer_id)
);

create index if not exists world_review_scores_world_idx on public.world_review_scores(world_id);
create index if not exists world_review_scores_reviewer_idx on public.world_review_scores(reviewer_id);

drop trigger if exists world_review_scores_touch on public.world_review_scores;
create trigger world_review_scores_touch
  before update on public.world_review_scores
  for each row execute function public.touch_updated_at();

alter table public.world_review_scores enable row level security;

drop policy if exists "review_scores_select" on public.world_review_scores;
create policy "review_scores_select"
  on public.world_review_scores for select
  using (
    public.is_admin()
    or reviewer_id = auth.uid()
    or exists (
      select 1
      from public.worlds w
      where w.id = world_review_scores.world_id
        and coalesce(lower(w.payload->'review'->>'status'), 'draft') in ('approved', 'needs_rework')
        and (
          w.creator_id = auth.uid()
          or (w.creator_id <> auth.uid() and public.is_expert_or_admin())
        )
    )
  );

drop policy if exists "review_scores_insert" on public.world_review_scores;
create policy "review_scores_insert"
  on public.world_review_scores for insert
  with check (
    reviewer_id = auth.uid()
    and exists (
      select 1 from public.worlds w
      where w.id = world_review_scores.world_id
        and w.creator_id <> auth.uid()
        and coalesce(lower(w.payload->'review'->>'status'), 'draft') = 'in_review'
        and public.is_expert_or_admin()
    )
  );

drop policy if exists "review_scores_update" on public.world_review_scores;
create policy "review_scores_update"
  on public.world_review_scores for update
  using (
    reviewer_id = auth.uid()
    and exists (
      select 1 from public.worlds w
      where w.id = world_review_scores.world_id
        and coalesce(lower(w.payload->'review'->>'status'), 'draft') = 'in_review'
    )
  )
  with check (
    reviewer_id = auth.uid()
  );

drop policy if exists "review_scores_delete" on public.world_review_scores;
create policy "review_scores_delete"
  on public.world_review_scores for delete
  using (public.is_admin());

create or replace function public.aggregate_world_review_scores(target_world_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  score_count integer;
  med numeric(6,3);
  threshold numeric(6,3) := 3.5;
  combined text;
begin
  select count(*)::int into score_count
  from public.world_review_scores
  where world_id = target_world_id;

  select percentile_disc(0.5) within group (order by score) into med
  from public.world_review_scores
  where world_id = target_world_id;

  select coalesce(string_agg(trim(notes), E'\n\n---\n\n' order by updated_at), '')
    into combined
  from public.world_review_scores
  where world_id = target_world_id
    and nullif(trim(notes), '') is not null;

  update public.worlds w
  set payload = jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(coalesce(w.payload, '{}'::jsonb), '{review,status}', to_jsonb(
              case
                when score_count >= 3 and med >= threshold then 'approved'
                when score_count >= 3 and med < threshold then 'needs_rework'
                else 'in_review'
              end
            ), true),
            '{review,threshold}', to_jsonb(threshold), true
          ),
          '{review,reviewer_count}', to_jsonb(score_count), true
        ),
        '{review,median_score}', to_jsonb(case when score_count >= 3 then med else null end), true
      ),
      '{review,combined_notes}', to_jsonb(case when score_count >= 3 then combined else '' end), true
    )
  where w.id = target_world_id;
end;
$$;

create or replace function public.world_review_score_after_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.aggregate_world_review_scores(coalesce(new.world_id, old.world_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_world_review_score_after_write on public.world_review_scores;
create trigger trg_world_review_score_after_write
  after insert or update or delete on public.world_review_scores
  for each row
  execute function public.world_review_score_after_write();

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
      coalesce(lower(w.payload->'review'->>'status'), 'draft') = 'in_review'
      and w.creator_id <> auth.uid()
      and public.is_expert_or_admin()
    )
    or (
      w.is_published = true
      and (
        public.is_grader()
        or public.is_expert_or_admin()
      )
    );
$$;
