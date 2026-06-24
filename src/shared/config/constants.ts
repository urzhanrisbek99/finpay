export const APP_NAME = "FinPay";

export const DEFAULT_BALANCE = 1_240_500;

export const POLLING_INTERVAL = 2000;

export const CURRENCY = "KZT";

export const TRANSACTION_LIMITS = {
  MIN_TRANSFER: 100,
  MAX_TRANSFER: 5_000_000,
} as const;
