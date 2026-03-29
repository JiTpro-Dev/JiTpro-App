-- Profiles table for JiTpro users
-- Run this in the Supabase SQL Editor

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text,
  company text,
  role text check (role in ('general_contractor', 'owner', 'architect', 'subcontractor', 'admin')),
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Auto-create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
