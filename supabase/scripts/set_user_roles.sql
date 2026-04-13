-- One-time role setup (run in Supabase SQL Editor).
-- Accounts must exist (sign up first). Re-run safe after signup.

update public.profiles
set role = 'admin'::public.app_role
where lower(email) = lower('rittrija.mandal@gmail.com');

update public.profiles
set role = 'grader'::public.app_role
where lower(email) = lower('rittrija7@gmail.com');

-- Verify:
-- select email, role from public.profiles where email ilike '%rittrija%';
