-- Шифрование CVV в состоянии покоя: ключ в Supabase Vault, крипта — pgcrypto.
--
-- Заменяет открытое хранение из 0001: в таблице остаётся только шифртекст
-- (cards.cvv_secret), а колонка cards.cvv служит лишь транзитным каналом
-- записи и всегда обнуляется триггером.
--
-- Выполнить в SQL Editor целиком.

create extension if not exists pgcrypto with schema extensions;

-- 1. Симметричный ключ шифрования — в Vault, создаётся один раз.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'cvv_key') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'cvv_key',
      'Symmetric key for card CVV encryption'
    );
  end if;
end
$$;

-- 2. Колонка под шифртекст.
alter table public.cards add column if not exists cvv_secret bytea;

-- 3. Шифрование при записи: плейнтекст из cards.cvv -> cvv_secret, cvv := null.
create or replace function public.encrypt_card_cvv()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, vault
as $$
declare
  v_key text;
begin
  if new.cvv is not null and length(new.cvv) > 0 then
    select decrypted_secret into v_key
    from vault.decrypted_secrets
    where name = 'cvv_key';

    new.cvv_secret := extensions.pgp_sym_encrypt(new.cvv, v_key);
  end if;

  new.cvv := null; -- открытый CVV никогда не остаётся в строке
  return new;
end;
$$;

drop trigger if exists trg_encrypt_card_cvv on public.cards;
create trigger trg_encrypt_card_cvv
  before insert or update of cvv on public.cards
  for each row execute function public.encrypt_card_cvv();

-- 4. Чтение: дешифруем только CVV своей карты. Заменяет версию из 0001.
create or replace function public.get_card_cvv(p_card_id uuid)
returns text
language plpgsql
security definer
set search_path = public, extensions, vault
as $$
declare
  v_key text;
  v_secret bytea;
  v_owner uuid;
begin
  select cvv_secret, user_id into v_secret, v_owner
  from public.cards
  where id = p_card_id;

  if v_owner is distinct from auth.uid() or v_secret is null then
    return null;
  end if;

  select decrypted_secret into v_key
  from vault.decrypted_secrets
  where name = 'cvv_key';

  return extensions.pgp_sym_decrypt(v_secret, v_key);
end;
$$;

revoke execute on function public.get_card_cvv(uuid) from anon, public;
grant execute on function public.get_card_cvv(uuid) to authenticated;

-- 5. Разовая миграция ранее сохранённого открытого CVV (если 0001 успел записать).
--    `set cvv = cvv` заставляет триггер зашифровать существующие значения.
update public.cards set cvv = cvv where cvv is not null;
