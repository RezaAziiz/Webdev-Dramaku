-- Migration: add is_featured flag to movies
-- Purpose: allow admin to mark movies to be shown in the homepage banner/slider,
-- instead of hardcoding banner images in the frontend.
--
-- How to run (DBeaver):
-- 1. Make sure your local Postgres database already has the schema + data
--    restored from dramaku_backup.sql (right-click the target database in
--    DBeaver > Tools > Execute SQL Script... and select dramaku_backup.sql,
--    or open it and run it from the SQL editor).
-- 2. Open this file in DBeaver (or paste its contents into a SQL editor)
--    connected to that same database, and execute it.

ALTER TABLE public.movies
    ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- Optional: mark a few existing movies as featured so the slider has data
-- to show right away. Adjust the IDs to match real rows in your dataset.
-- UPDATE public.movies SET is_featured = true WHERE id IN (1, 2, 3);
