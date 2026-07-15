export const APP_NAME = "FinPay";

export const POLLING_INTERVAL = 2000;

export const CURRENCY = "KZT";

// Границы суммы операции. Клиент проверяет их только ради мгновенного
// фидбэка — окончательное решение за сервером, поэтому те же числа продублированы
// в transfer_money (supabase/migrations/0008_enforce_card_freeze.sql).
// Меняя их здесь, меняйте и там.
export const TRANSACTION_LIMITS = {
  MIN_TRANSFER: 100,
  MAX_TRANSFER: 5_000_000,
} as const;

// Совпадает с дефолтом Supabase. Держим здесь, чтобы регистрация и сброс
// пароля не разъезжались: правило одно на всё приложение.
export const PASSWORD_MIN_LENGTH = 6;
