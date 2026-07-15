-- Машиночитаемые коды ошибок денежных функций.
--
-- Раньше единственным признаком причины отказа был текст исключения, и клиент
-- показывал его как есть — англоязычную строку прямо в русском интерфейсе.
-- Тот же приём, что уже применён для ошибок Supabase Auth (features/auth/lib/
-- auth-error.ts): наружу уходит код, текст подставляет словарь.
--
-- Коды берём из свободного класса SQLSTATE 'PT' (PostgreSQL его не занимает;
-- заняты 00-09, 0A-0B, 0F, 0L, 0P, 0Z, 20-2F, 34, 38-3F, 40-42, 44, 53-58,
-- F0, HV, P0, XX). Класс 28000 (invalid_authorization_specification) —
-- стандартный, оставляем его.
--
--   PT100  сумма меньше минимума        PT105  профиль не найден
--   PT101  сумма больше максимума       PT106  недопустимый метод перевода
--   PT102  недостаточно средств         PT107  недопустимая категория
--   PT103  карта заморожена             PT108  некорректная сумма
--   PT104  превышен месячный лимит      PT109  платёж не найден
--
-- Сообщения остаются английскими намеренно: они уходят в логи Postgres, а до
-- пользователя доходит текст из словаря по коду.
--
-- Заменяет функции из 0008. Выполнить в SQL Editor целиком.

create or replace function public.transfer_money(
  p_amount numeric,
  p_merchant text,
  p_method text,
  p_comment text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_balance numeric;
  v_limit numeric;
  v_frozen boolean;
  v_spent numeric;
  v_tx public.transactions;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;
  if p_amount is null or p_amount < 100 then
    raise exception 'Minimum transfer amount is 100' using errcode = 'PT100';
  end if;
  if p_amount > 5000000 then
    raise exception 'Maximum transfer amount is 5000000' using errcode = 'PT101';
  end if;
  if p_method not in ('phone', 'card') then
    raise exception 'Invalid transfer method' using errcode = 'PT106';
  end if;

  -- FOR UPDATE: атомарный read-modify-write, защита от гонки двух переводов.
  select balance into v_balance
  from public.profiles
  where id = v_uid
  for update;

  if v_balance is null then
    raise exception 'Profile not found' using errcode = 'PT105';
  end if;
  if p_amount > v_balance then
    raise exception 'Insufficient balance' using errcode = 'PT102';
  end if;

  select is_frozen, spending_limit into v_frozen, v_limit
  from public.cards
  where user_id = v_uid
  limit 1;

  -- coalesce: карты может не быть вовсе (v_frozen = null) — это не «заморожена».
  if coalesce(v_frozen, false) then
    raise exception 'Card is frozen' using errcode = 'PT103';
  end if;

  if v_limit is not null then
    v_spent := public.current_month_spent(v_uid);
    if v_spent + p_amount > v_limit then
      raise exception 'Monthly card limit exceeded' using errcode = 'PT104';
    end if;
  end if;

  insert into public.transactions
    (user_id, type, amount, merchant, category, status, comment, method)
  values
    (v_uid, 'transfer', p_amount, p_merchant, 'transfer', 'completed',
     nullif(btrim(coalesce(p_comment, '')), ''), p_method)
  returning * into v_tx;

  update public.profiles
  set balance = balance - p_amount
  where id = v_uid
  returning balance into v_balance;

  return jsonb_build_object('transaction', to_jsonb(v_tx), 'balance', v_balance);
end;
$$;

create or replace function public.add_income(
  p_amount numeric,
  p_source text,
  p_category text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_balance numeric;
  v_tx public.transactions;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;
  if p_amount is null or p_amount < 100 then
    raise exception 'Minimum income amount is 100' using errcode = 'PT100';
  end if;
  if p_amount > 5000000 then
    raise exception 'Maximum income amount is 5000000' using errcode = 'PT101';
  end if;
  if p_category not in
     ('food', 'transport', 'shopping', 'subscription', 'transfer', 'salary', 'other') then
    raise exception 'Invalid category' using errcode = 'PT107';
  end if;

  select balance into v_balance
  from public.profiles
  where id = v_uid
  for update;

  if v_balance is null then
    raise exception 'Profile not found' using errcode = 'PT105';
  end if;

  insert into public.transactions
    (user_id, type, amount, merchant, category, status)
  values
    (v_uid, 'income', p_amount, coalesce(nullif(btrim(p_source), ''), 'Income'),
     p_category, 'completed')
  returning * into v_tx;

  update public.profiles
  set balance = balance + p_amount
  where id = v_uid
  returning balance into v_balance;

  return jsonb_build_object('transaction', to_jsonb(v_tx), 'balance', v_balance);
end;
$$;

create or replace function public.create_qr_payment(
  p_amount numeric,
  p_merchant text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_balance numeric;
  v_limit numeric;
  v_frozen boolean;
  v_spent numeric;
  v_tx public.transactions;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Invalid amount' using errcode = 'PT108';
  end if;

  select balance into v_balance from public.profiles where id = v_uid;
  if v_balance is null then
    raise exception 'Profile not found' using errcode = 'PT105';
  end if;
  if p_amount > v_balance then
    raise exception 'Insufficient balance' using errcode = 'PT102';
  end if;

  select is_frozen, spending_limit into v_frozen, v_limit
  from public.cards
  where user_id = v_uid
  limit 1;

  if coalesce(v_frozen, false) then
    raise exception 'Card is frozen' using errcode = 'PT103';
  end if;

  if v_limit is not null then
    v_spent := public.current_month_spent(v_uid);
    if v_spent + p_amount > v_limit then
      raise exception 'Monthly card limit exceeded' using errcode = 'PT104';
    end if;
  end if;

  insert into public.transactions
    (user_id, type, amount, merchant, category, status, method)
  values
    (v_uid, 'expense', p_amount, p_merchant, 'other', 'pending', 'qr')
  returning * into v_tx;

  return jsonb_build_object('transaction', to_jsonb(v_tx));
end;
$$;

create or replace function public.confirm_qr_payment(p_transaction_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_balance numeric;
  v_frozen boolean;
  v_tx public.transactions;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  -- Порядок блокировок всегда profile → transaction (без дедлоков).
  select balance into v_balance
  from public.profiles
  where id = v_uid
  for update;

  select * into v_tx
  from public.transactions
  where id = p_transaction_id and user_id = v_uid
  for update;

  if not found then
    raise exception 'Payment not found' using errcode = 'PT109';
  end if;

  -- Уже обработан (completed/failed) — идемпотентно возвращаем как есть.
  if v_tx.status <> 'pending' then
    return jsonb_build_object('transaction', to_jsonb(v_tx), 'balance', v_balance);
  end if;

  select is_frozen into v_frozen
  from public.cards
  where user_id = v_uid
  limit 1;

  -- Недостаточно средств или карта заморожена на момент оплаты — отклоняем,
  -- баланс не трогаем.
  if v_tx.amount > v_balance or coalesce(v_frozen, false) then
    update public.transactions
    set status = 'failed'
    where id = v_tx.id
    returning * into v_tx;
    return jsonb_build_object('transaction', to_jsonb(v_tx), 'balance', v_balance);
  end if;

  update public.transactions
  set status = 'completed'
  where id = v_tx.id
  returning * into v_tx;

  update public.profiles
  set balance = balance - v_tx.amount
  where id = v_uid
  returning balance into v_balance;

  return jsonb_build_object('transaction', to_jsonb(v_tx), 'balance', v_balance);
end;
$$;
