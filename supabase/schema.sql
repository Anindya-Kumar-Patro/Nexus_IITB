-- =============================================================
-- Nexus IITB — database schema
-- Run this in the Supabase dashboard: SQL Editor -> New query -> Run
-- =============================================================

-- ---------- enums ----------
create type department as enum (
  'CSE','Electrical','Mechanical','Civil','Chemical','Aerospace',
  'Metallurgy','EnergyScience','EngineeringPhysics','IDC','SJMSOM',
  'Mathematics','Physics','Chemistry','Other'
);

create type user_role as enum ('Founder','Builder','Both');

create type venture_stage as enum ('Brainstorming','MVP','Early traction','Funded');

-- ---------- profiles ----------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  roll_number text,
  department  department,
  role        user_role,
  skills      text[] not null default '{}',
  linkedin_url text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- ventures ----------
create table public.ventures (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  one_liner    text not null,
  description  text not null,
  stage        venture_stage not null default 'Brainstorming',
  roles_needed text[] not null default '{}',
  domain       text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index ventures_owner_idx on public.ventures(owner_id);
create index ventures_created_idx on public.ventures(created_at desc);

-- ---------- keep updated_at fresh ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger ventures_touch before update on public.ventures
  for each row execute function public.touch_updated_at();

-- ---------- auto-create a blank profile on signup ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- restrict signups to IITB email ----------
create or replace function public.enforce_iitb_email()
returns trigger language plpgsql as $$
begin
  if new.email !~* '@iitb\.ac\.in$' then
    raise exception 'Only @iitb.ac.in email addresses are allowed.';
  end if;
  return new;
end; $$;

create trigger enforce_iitb_email_trigger
  before insert on auth.users
  for each row execute function public.enforce_iitb_email();

-- =============================================================
-- Row Level Security
-- =============================================================
alter table public.profiles enable row level security;
alter table public.ventures enable row level security;

-- profiles: any signed-in user can read; you can only write your own row
create policy "profiles are viewable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ventures: any signed-in user can read; only the owner can write/update/delete
create policy "ventures are viewable by authenticated users"
  on public.ventures for select
  using (auth.role() = 'authenticated');

create policy "users can create ventures they own"
  on public.ventures for insert
  with check (auth.uid() = owner_id);

create policy "owners can update their ventures"
  on public.ventures for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "owners can delete their ventures"
  on public.ventures for delete
  using (auth.uid() = owner_id);
