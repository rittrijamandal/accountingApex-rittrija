-- Fix RLS policies on world_review_scores so authenticated users can
-- insert and update their own review rows.
--
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).

-- 1. Enable RLS (safe to run if already enabled)
alter table public.world_review_scores enable row level security;

-- 2. Drop existing policies that may be blocking inserts
drop policy if exists "Reviewers can insert own scores" on public.world_review_scores;
drop policy if exists "Reviewers can update own scores" on public.world_review_scores;
drop policy if exists "Authenticated users can read scores" on public.world_review_scores;
drop policy if exists "Admins can read all scores" on public.world_review_scores;

-- 3. Allow any authenticated user to read all scores
create policy "Authenticated users can read scores"
  on public.world_review_scores
  for select
  using (auth.role() = 'authenticated');

-- 4. Allow authenticated users to insert their own score rows
create policy "Reviewers can insert own scores"
  on public.world_review_scores
  for insert
  with check (auth.uid() = reviewer_id);

-- 5. Allow authenticated users to update their own score rows
create policy "Reviewers can update own scores"
  on public.world_review_scores
  for update
  using (auth.uid() = reviewer_id)
  with check (auth.uid() = reviewer_id);
