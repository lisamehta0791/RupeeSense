-- ============================================================
-- RupeeSense — COMPLETE DATABASE SCHEMA (run this whole file once)
-- Safe to re-run: uses "if not exists" / "drop ... if exists".
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- 1. TRANSACTIONS
-- ------------------------------------------------------------
create table if not exists public.transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  date        timestamptz not null default now(),
  merchant    text not null,
  amount      numeric(12,2) not null,
  category    text not null check (category in (
    'Food','Shopping','Bills','Transport',
    'Entertainment','Subscriptions','Rent','Other'
  )),
  note        text,
  suspicious  boolean default false,
  suspicious_reason text,
  created_at  timestamptz default now()
);
create index if not exists idx_tx_user_date
  on public.transactions (user_id, date desc);

-- ------------------------------------------------------------
-- 2. ACHIEVEMENTS
-- ------------------------------------------------------------
create table if not exists public.achievements (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  badge_id    text not null,
  unlocked_at timestamptz default now(),
  unique(user_id, badge_id)
);

-- ------------------------------------------------------------
-- 3. PROFILES (name, currency, income, budget) + auto-create
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  currency        text default 'INR',
  monthly_income  numeric(12,2),
  monthly_budget  numeric(12,2),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 4. CHAT_MESSAGES (advisor + floating chat persistence)
-- ------------------------------------------------------------
create table if not exists public.chat_messages (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  role        text not null check (role in ('user','assistant')),
  content     text not null,
  image_url   text,
  source      text default 'advisor',
  created_at  timestamptz default now()
);
create index if not exists idx_chat_user_time
  on public.chat_messages (user_id, created_at);

-- ------------------------------------------------------------
-- 5. BUDGETS (per-category monthly limits)
-- ------------------------------------------------------------
create table if not exists public.budgets (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  category      text not null check (category in (
    'Food','Shopping','Bills','Transport',
    'Entertainment','Subscriptions','Rent','Other'
  )),
  monthly_limit numeric(12,2) not null,
  created_at    timestamptz default now(),
  unique(user_id, category)
);

-- ------------------------------------------------------------
-- 6. GOALS (savings goals)
-- ------------------------------------------------------------
create table if not exists public.goals (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  title         text not null,
  target_amount numeric(12,2) not null,
  saved_amount  numeric(12,2) default 0,
  deadline      date,
  created_at    timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY — every table, users see only their rows
-- ============================================================
alter table public.transactions   enable row level security;
alter table public.achievements    enable row level security;
alter table public.profiles        enable row level security;
alter table public.chat_messages   enable row level security;
alter table public.budgets         enable row level security;
alter table public.goals           enable row level security;

-- Drop old policies if re-running, then recreate
drop policy if exists "Users see own transactions" on public.transactions;
drop policy if exists "Users see own achievements" on public.achievements;
drop policy if exists "own profile" on public.profiles;
drop policy if exists "own chat" on public.chat_messages;
drop policy if exists "own budgets" on public.budgets;
drop policy if exists "own goals" on public.goals;

create policy "Users see own transactions" on public.transactions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users see own achievements" on public.achievements for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own profile" on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "own chat" on public.chat_messages for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own budgets" on public.budgets for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own goals" on public.goals for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
