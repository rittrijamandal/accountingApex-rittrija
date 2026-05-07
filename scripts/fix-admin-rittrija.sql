-- Restore admin role for rittrija.mandal@gmail.com
-- Run in: Supabase Dashboard → SQL Editor → New query → Run

UPDATE public.profiles
SET role = 'admin'
WHERE lower(trim(email)) = lower(trim('rittrija.mandal@gmail.com'));

-- Verify:
SELECT id, email, role, updated_at
FROM public.profiles
WHERE lower(trim(email)) = lower(trim('rittrija.mandal@gmail.com'));
