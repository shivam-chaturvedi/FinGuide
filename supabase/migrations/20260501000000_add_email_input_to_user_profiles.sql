ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS email_input TEXT;

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS email TEXT;
