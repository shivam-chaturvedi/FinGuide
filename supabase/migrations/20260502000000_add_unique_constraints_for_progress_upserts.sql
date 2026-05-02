-- Ensure unique constraints exist for upsert conflict targets.
-- `CREATE TABLE IF NOT EXISTS` does not add constraints when tables already exist,
-- which can cause Postgres error 42P10 for `ON CONFLICT (user_id,module_id)` etc.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_module_progress_user_id_module_id_key'
      AND conrelid = 'public.user_module_progress'::regclass
  ) THEN
    ALTER TABLE public.user_module_progress
      ADD CONSTRAINT user_module_progress_user_id_module_id_key UNIQUE (user_id, module_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_lesson_progress_user_id_lesson_id_key'
      AND conrelid = 'public.user_lesson_progress'::regclass
  ) THEN
    ALTER TABLE public.user_lesson_progress
      ADD CONSTRAINT user_lesson_progress_user_id_lesson_id_key UNIQUE (user_id, lesson_id);
  END IF;
END $$;

