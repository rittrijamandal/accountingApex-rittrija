-- Grader Lobby world renames
-- Run this in the Supabase Dashboard → SQL Editor
-- (or use scripts/manage-grader-worlds.js with SUPABASE_SERVICE_KEY)

-- 1. Rename Hrishi Invoice World → Invoice Approval
UPDATE worlds
SET    title      = 'Invoice Approval',
       updated_at = now()
WHERE  title = 'Hrishi Invoice World';

-- 2. Rename Hrishi Audit World → Audit
UPDATE worlds
SET    title      = 'Audit',
       updated_at = now()
WHERE  title = 'Hrishi Audit World';

-- 3. Rename the two remaining published worlds to Sample World 1 / 2
--    (ordered by creation date, skipping the two renamed above)
WITH ranked AS (
  SELECT id,
         title,
         ROW_NUMBER() OVER (ORDER BY created_at) AS rn
  FROM   worlds
  WHERE  is_published = true
    AND  title NOT IN ('Invoice Approval', 'Audit')
)
UPDATE worlds w
SET    title      = CASE r.rn WHEN 1 THEN 'Sample World 1' ELSE 'Sample World 2' END,
       updated_at = now()
FROM   ranked r
WHERE  w.id = r.id
  AND  r.rn <= 2;

-- Verify
SELECT id, title, is_published, created_at
FROM   worlds
WHERE  is_published = true
ORDER  BY title;
