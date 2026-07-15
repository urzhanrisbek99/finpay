-- Заморозка карты и верхний потолок перевода — на сервере.
--
-- До этой миграции cards.is_frozen был чисто декоративным: кнопка «Freeze»
-- меняла цвет карточки, но ни одна денежная функция флаг не читала — с
-- «замороженной» карты спокойно уходили переводы и QR-платежи.
--
-- Заморозка гейтит любой расход, а не только операции с картой: месячный
-- лимит карты в 0006 уже работает именно так (ограничивает и переводы по
-- телефону), карта в этой модели — единственный расходный инструмент счёта.
--
-- Заодно вводится MAX_TRANSFER: до сих пор верхней границы перевода не
-- существовало. Держим в синхроне с TRANSACTION_LIMITS.MAX_TRANSFER
-- (shared/config/constants.ts).
--
-- Выполнить в SQL Editor целиком.

-- 1. Перевод: + проверка заморозки и максимума. Заменяет версию из 0006.
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
    raise exception 'Minimum transfer amount is 100 ₸';
  end if;
  if p_amount > 5000000 then
    raise exception 'Maximum transfer amount is 5 000 000 ₸';
  end if;
  if p_method not in ('phone', 'card') then
    raise exception 'Invalid transfer method';
  end if;

  -- FOR UPDATE: атомарный read-modify-write, защита от гонки двух переводов.
  select balance into v_balance
  from public.profiles
  where id = v_uid
  for update;

  if v_balance is null then
    raise exception 'Profile not found';
  end if;
  if p_amount > v_balance then
    raise exception 'Insufficient balance';
  end if;

  -- Состояние карты (если карта заведена): заморозка и месячный лимит.
  select is_frozen, spending_limit into v_frozen, v_limit
  from public.cards
  where user_id = v_uid
  limit 1;

  -- coalesce: карты может не быть вовсе (v_frozen = null) — это не «заморожена».
  if coalesce(v_frozen, false) then
    raise exception 'Your card is frozen';
  end if;

  if v_limit is not null then
    v_spent := public.current_month_spent(v_uid);
    if v_spent + p_amount > v_limit then
      raise exception 'This transfer exceeds your monthly card limit';
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

-- 2. Создание QR: + проверка заморозки. Заменяет версию из 0006.
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
    raise exception 'Invalid amount';
  end if;

  select balance into v_balance from public.profiles where id = v_uid;
  if v_balance is null then
    raise exception 'Profile not found';
  end if;
  if p_amount > v_balance then
    raise exception 'Insufficient balance';
  end if;

  select is_frozen, spending_limit into v_frozen, v_limit
  from public.cards
  where user_id = v_uid
  limit 1;

  -- coalesce: карты может не быть вовсе (v_frozen = null) — это не «заморожена».
  if coalesce(v_frozen, false) then
    raise exception 'Your card is frozen';
  end if;

  if v_limit is not null then
    v_spent := public.current_month_spent(v_uid);
    if v_spent + p_amount > v_limit then
      raise exception 'This payment exceeds your monthly card limit';
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

-- 3. Подтверждение QR: заморозка перепроверяется на capture — карту могли
--    заморозить между созданием и оплатой. Платёж уходит в failed, а не
--    списывается. Заменяет версию из 0006.
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
    raise exception 'Payment not found';
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
