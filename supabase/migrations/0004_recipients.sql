-- Сохранённые получатели переводов («частые переводы»): имя + номер.
--
-- Схема проекта управляется в Supabase Dashboard; этот файл — источник
-- истины для изменений. Выполнить в SQL Editor (или через supabase db push).

-- 1. Таблица. Один номер на пользователя не повторяется (unique).
create table if not exists public.recipients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  unique (user_id, phone)
);

-- 2. RLS: пользователь видит и меняет только своих получателей.
alter table public.recipients enable row level security;

create policy "recipients_select_own" on public.recipients
  for select using (auth.uid() = user_id);

create policy "recipients_insert_own" on public.recipients
  for insert with check (auth.uid() = user_id);

create policy "recipients_update_own" on public.recipients
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "recipients_delete_own" on public.recipients
  for delete using (auth.uid() = user_id);

-- 3. Гранты. RLS дополнительно фильтрует по строкам.
grant select, insert, update, delete on public.recipients to authenticated;
