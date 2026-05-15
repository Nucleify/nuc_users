create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  phone_number text,
  avatar text,
  language text not null default 'en',
  country text not null default 'poland',
  role text not null default 'user',
  bio text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles add column if not exists name text not null default '';
alter table public.user_profiles add column if not exists email text not null default '';
alter table public.user_profiles add column if not exists phone_number text;
alter table public.user_profiles add column if not exists avatar text;
alter table public.user_profiles add column if not exists language text not null default 'en';
alter table public.user_profiles add column if not exists country text not null default 'poland';
alter table public.user_profiles add column if not exists role text not null default 'user';
alter table public.user_profiles add column if not exists bio text;
alter table public.user_profiles add column if not exists website text;
alter table public.user_profiles add column if not exists created_at timestamptz not null default now();
alter table public.user_profiles add column if not exists updated_at timestamptz not null default now();

create unique index if not exists user_profiles_email_unique_idx on public.user_profiles (email);
alter table public.user_profiles enable row level security;
drop policy if exists "user_profiles_authenticated_all" on public.user_profiles;
create policy "user_profiles_authenticated_all" on public.user_profiles for all to authenticated using (true) with check (true);
