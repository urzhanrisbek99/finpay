-- Метод перевода/платежа: 'phone' | 'qr' | 'card'.

alter table public.transactions
  add column if not exists method text
    check (method in ('phone', 'qr', 'card'));
