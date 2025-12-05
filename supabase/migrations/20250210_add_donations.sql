-- Donations tracking table
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  beneficiary_name text,
  post_reference text,
  cause_id text,
  cause_title text,
  cause_image text,
  amount numeric(12,2) not null,
  currency text not null default 'SGD',
  frequency text not null default 'one-time',
  payment_method text,
  message text,
  dedication text,
  country text,
  cover_fees boolean default false,
  allow_updates boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists donations_user_id_idx on public.donations (user_id);
create index if not exists donations_created_at_idx on public.donations (created_at desc);

-- Enable row level security
alter table public.donations enable row level security;

-- Policies: users can insert/select their own donations
drop policy if exists "Users can insert own donations" on public.donations;
create policy "Users can insert own donations"
  on public.donations for insert
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "Users can read own donations" on public.donations;
create policy "Users can read own donations"
  on public.donations for select
  using (auth.uid() = user_id);
