export const APP_NAME = "FinPay";

export const POLLING_INTERVAL = 2000;

export const CURRENCY = "KZT";

export const TRANSACTION_LIMITS = {
  MIN_TRANSFER: 100,
  MAX_TRANSFER: 5_000_000,
} as const;

// Совпадает с дефолтом Supabase. Держим здесь, чтобы регистрация и сброс
// пароля не разъезжались: правило одно на всё приложение.
export const PASSWORD_MIN_LENGTH = 6;
