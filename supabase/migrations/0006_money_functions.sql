-- Денежные операции — только на сервере, атомарно.
--
-- До этой миграции баланс менял браузер: клиент сам считал new_balance и
-- слал его в profiles.balance. Любой мог из devtools выставить себе любой
-- баланс, а вставка транзакции и списание не были атомарны.
--
-- Здесь всё это закрывается тем же приёмом, что уже применён для CVV
-- (security definer + фильтр по auth.uid()): деньги двигают только эти
-- функции, а прямой UPDATE баланса у клиента отзывается.
--
-- Выполнить в SQL Editor целиком.

-- Минимальная сумма перевода/дохода. Держим в синхроне с
-- TRANSACTION_LIMITS.MIN_TRANSFER (shared/config/constants.ts).

-- 0. Забираем у клиента право менять баланс напрямую.
--    Единственный путь изменить profiles.balance — функции ниже.
--    INSERT профиля оставляем, но без колонки balance: стартовый баланс
--    задаёт DEFAULT, а не клиент (иначе можно вписать себе миллиард на регистрации).
alter table public.profiles alter column balance set default 1240500;

revoke update on public.profiles from anon, authenticated;
revoke insert on public.profiles from anon, authenticated;
grant insert (id, email, full_name) on public.profiles to authenticated;

-- 1. Помощник: сколько потрачено в текущем месяце (расходы + переводы, кроме failed).
--    Совпадает с клиентской логикой isSpending и SQL getMonthlySpent.
create or replace function public.current_month_spent(p_user_id uuid)
returns numeric
language sql
security definer
set search_path = public
as $$
  select coalesce(sum(amount), 0)
  from public.transactions
  where user_id = p_user_id
    and type in ('expense', 'transfer')
    and status <> 'failed'
    and created_at >= date_trunc('month', now());
$$;

-- 2. Перевод (по телефону или по карте). Сервер сам берёт user_id из auth.uid(),
--    проверяет баланс и месячный лимит карты, вставляет транзакцию и списывает
--    баланс — всё в одной транзакции под блокировкой строки профиля.
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
  v_spent numeric;
  v_tx public.transactions;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;
  if p_amount is null or p_amount < 100 then
    raise exception 'Minimum transfer amount is 100 ₸';
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

  -- Лимит по карте (если карта заведена).
  select spending_limit into v_limit
  from public.cards
  where user_id = v_uid
  limit 1;

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

-- 3. Пополнение баланса.
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
    raise exception 'Minimum income amount is 100 ₸';
  end if;
  if p_category not in
     ('food', 'transport', 'shopping', 'subscription', 'transfer', 'salary', 'other') then
    raise exception 'Invalid category';
  end if;

  select balance into v_balance
  from public.profiles
  where id = v_uid
  for update;

  if v_balance is null then
    raise exception 'Profile not found';
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

-- 4. QR-платёж: создаём pending-транзакцию (баланс ещё НЕ трогаем), но уже
--    проверяем баланс и лимит, чтобы нельзя было создать заведомо неоплатимый QR.
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

  select spending_limit into v_limit
  from public.cards
  where user_id = v_uid
  limit 1;

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

-- 5. Подтверждение QR-платежа (симуляция вебхука эквайера) по модели
--    authorize → capture: pending → completed + списание баланса.
--    Лочим профиль и транзакцию (FOR UPDATE), поэтому:
--      * параллельные confirm сериализуются — двойного списания нет;
--      * идемпотентность: не-pending платёж возвращаем как есть;
--      * при capture ПЕРЕПРОВЕРЯЕМ средства — если нескольких pending-QR не
--        хватает на суммарный баланс, лишний падает в failed, а не в минус.
create or replace function public.confirm_qr_payment(p_transaction_id uuid)
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

  -- Недостаточно средств на момент оплаты — платёж отклоняется, баланс не трогаем.
  if v_tx.amount > v_balance then
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

-- 6. Гранты: денежные функции доступны только аутентифицированным.
--    current_month_spent — внутренний помощник, наружу не выдаём.
revoke execute on function public.current_month_spent(uuid) from anon, public, authenticated;

revoke execute on function public.transfer_money(numeric, text, text, text) from anon, public;
grant execute on function public.transfer_money(numeric, text, text, text) to authenticated;

revoke execute on function public.add_income(numeric, text, text) from anon, public;
grant execute on function public.add_income(numeric, text, text) to authenticated;

revoke execute on function public.create_qr_payment(numeric, text) from anon, public;
grant execute on function public.create_qr_payment(numeric, text) to authenticated;

revoke execute on function public.confirm_qr_payment(uuid) from anon, public;
grant execute on function public.confirm_qr_payment(uuid) to authenticated;
