-- Базовая схема: таблицы, RLS и гранты.
--
-- Исторически схема заводилась в Supabase Dashboard, а в migrations/ лежали
-- только изменения поверх неё — из-за чего репозиторий нельзя было развернуть
-- с нуля (0001 сразу делает alter table public.cards). Эта миграция создаёт
-- исходное состояние, от которого отталкиваются 0001–0008.
--
-- Как и любая миграция, применяется один раз и только на пустой базе, до
-- остальных файлов папки.
--
-- НЕ ЗАПУСКАЙТЕ ЕЁ НА БАЗЕ, ГДЕ СХЕМА УЖЕ ЕСТЬ. Таблицы и данные она не
-- тронет (create table if not exists), но гранты выдаст заново — базовые, те
-- самые, что последующие миграции намеренно сужают: 0001 закрывает прямое
-- чтение cards.cvv, 0006 отзывает update на profiles, 0010 — запись в
-- transactions. Прогон 0000 поверх живой базы вернёт снятые привилегии и
-- откатит защиту, пока не будут повторно применены 0001/0006/0010.
-- На существующей базе применяйте только те файлы, которых там ещё нет.
--
-- Выполнить в SQL Editor целиком (или supabase db push).

create extension if not exists pgcrypto with schema extensions;

-- 1. Профиль. id совпадает с auth.users.id — отдельного ключа не заводим.
--    balance трогают только денежные функции из 0006.
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

-- update-политика есть, но право на UPDATE у клиента отзывается в 0006:
-- баланс двигают только security definer функции. Политика остаётся, потому
-- что те функции работают от владельца и RLS для них не помеха.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

grant select, insert, update on public.profiles to authenticated;

-- 2. Карта. number — только последние 4 цифры, полный номер не храним.
--    expires_at — строка вида "12/28", как показывает UI.
--    spent — исторический счётчик расхода; фактически не использовался
--    (месяц считает current_month_spent из 0006) и удаляется в 0008.
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

-- Табличный select здесь — базовое состояние; 0001 его отзывает и выдаёт
-- select поколоночно, чтобы закрыть cvv.
grant select, insert, update, delete on public.cards to authenticated;

-- 3. Транзакции. Пишутся только денежными функциями из 0006, клиенту оставлен
--    select. comment и method добавляются в 0003 и 0005.
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

-- Ни insert, ни update, ни delete: транзакции создают и меняют только
-- security definer функции (transfer_money / add_income / *_qr_payment).
grant select on public.transactions to authenticated;

-- 4. Заявки на перевыпуск/удаление карты. Обрабатываются «оператором»
--    вручную — в демо просто копятся.
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
