-- Card CVV: хранение эмитентом + защита от прямого чтения клиентом.
--
-- Схема проекта управляется в Supabase Dashboard; этот файл — источник
-- истины для изменений. Выполнить в SQL Editor (или через supabase db push).

-- 1. Колонка для CVV.
alter table public.cards
  add column if not exists cvv text;

-- 2. Скрываем cvv от прямого чтения.
--    Column-level SELECT работает только при отсутствии table-level SELECT,
--    поэтому сначала отзываем табличный SELECT, затем выдаём по колонкам.
revoke select on public.cards from anon, authenticated;

grant select
  (id, user_id, number, holder_name, expires_at, type, is_frozen, spending_limit, spent)
  on public.cards
  to anon, authenticated;

-- INSERT: перечисляем колонки явно, чтобы вставка карты не зависела от
-- дефолтного табличного GRANT. RLS всё равно проверит user_id по строке.
grant insert
  (user_id, number, cvv, holder_name, expires_at, type, is_frozen, spending_limit, spent)
  on public.cards
  to authenticated;

-- 3. Единственный способ прочитать свой CVV — эта функция.
--    security definer обходит column-level ограничения, а фильтр по auth.uid()
--    гарантирует, что чужой CVV получить нельзя.
create or replace function public.get_card_cvv(p_card_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select cvv
  from public.cards
  where id = p_card_id
    and user_id = auth.uid();
$$;

revoke execute on function public.get_card_cvv(uuid) from anon, public;
grant execute on function public.get_card_cvv(uuid) to authenticated;
