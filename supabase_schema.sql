-- Supabase schema
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  phone text,
  project text,
  budget text,
  deadline text,
  notes text not null,
  source text,
  created_at timestamptz default now()
);

create table if not exists public.hand_offs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  time_pref text,
  notes text not null,
  source text,
  created_at timestamptz default now()
);

create table if not exists public.faq (
  id serial primary key,
  q text,
  a text,
  tags text[]
);
