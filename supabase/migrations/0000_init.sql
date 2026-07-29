
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null,
  phone text,
  balance numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

grant select, insert, update on public.profiles to authenticated;

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  number text not null,
  holder_name text not null,
  expires_at text not null,
  type text not null check (type in ('visa', 'mastercard')),
  is_frozen boolean not null default false,
  spending_limit numeric not null default 0,
  spent numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.cards enable row level security;

drop policy if exists "cards_select_own" on public.cards;
create policy "cards_select_own" on public.cards
  for select using (auth.uid() = user_id);

drop policy if exists "cards_insert_own" on public.cards;
create policy "cards_insert_own" on public.cards
  for insert with check (auth.uid() = user_id);

drop policy if exists "cards_update_own" on public.cards;
create policy "cards_update_own" on public.cards
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "cards_delete_own" on public.cards;
create policy "cards_delete_own" on public.cards
  for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.cards to authenticated;

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense', 'transfer')),
  amount numeric not null check (amount > 0),
  merchant text not null,
  category text not null check (
    category in ('food', 'transport', 'shopping', 'subscription',
                 'transfer', 'salary', 'other')
  ),
  status text not null default 'completed'
    check (status in ('completed', 'pending', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_created_idx
  on public.transactions (user_id, created_at desc);

alter table public.transactions enable row level security;

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);

grant select on public.transactions to authenticated;

create table if not exists public.card_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  card_id uuid not null references public.cards (id) on delete cascade,
  type text not null check (type in ('reissue', 'remove')),
  status text not null default 'pending'
    check (status in ('pending', 'done', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.card_requests enable row level security;

drop policy if exists "card_requests_select_own" on public.card_requests;
create policy "card_requests_select_own" on public.card_requests
  for select using (auth.uid() = user_id);

drop policy if exists "card_requests_insert_own" on public.card_requests;
create policy "card_requests_insert_own" on public.card_requests
  for insert with check (auth.uid() = user_id);

grant select, insert on public.card_requests to authenticated;
