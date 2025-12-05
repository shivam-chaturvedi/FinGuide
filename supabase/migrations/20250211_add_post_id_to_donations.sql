-- Add post_id to donations for associating a donation with a specific post/item
alter table if exists public.donations
  add column if not exists post_id text;

create index if not exists donations_post_id_idx on public.donations (post_id);
