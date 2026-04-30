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
            jsonb_set(
              coalesce(w.payload, '{}'::jsonb),
              '{review,status}',
              to_jsonb(
                case
                  when score_count >= 3 and med >= threshold then 'approved'
                  when score_count >= 3 and med < threshold then 'needs_rework'
                  else 'in_review'
                end
              ),
              true
            ),
            '{review,threshold}',
            to_jsonb(threshold),
            true
          ),
          '{review,reviewer_count}',
          to_jsonb(score_count),
          true
        ),
        '{review,median_score}',
        coalesce(to_jsonb(case when score_count >= 3 then med else null end), 'null'::jsonb),
        true
      ),
      '{review,combined_notes}',
      to_jsonb(case when score_count >= 3 then combined else '' end),
      true
    )
  where w.id = target_world_id;
end;
$$;
