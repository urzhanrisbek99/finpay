-- Комментарий к транзакции 
-- Схема проекта управляется в Supabase Dashboard; этот файл — источник

alter table public.transactions
  add column if not exists comment text;
