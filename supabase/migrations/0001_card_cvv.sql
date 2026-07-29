-- Card CVV: хранение эмитентом + защита от прямого чтения клиентом.

-- 1. Колонка для CVV.
alter table public.cards
  add column if not exists cvv text;

revoke select on public.cards from anon, authenticated;

grant select
  (id, user_id, number, holder_name, expires_at, type, is_frozen, spending_limit, spent)
  on public.cards
  to anon, authenticated;

grant insert
  (user_id, number, cvv, holder_name, expires_at, type, is_frozen, spending_limit, spent)
  on public.cards
  to authenticated;

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
