import type { Messages } from "#shared/i18n";
import { TRANSACTION_LIMITS } from "#shared/config";
import { formatCurrency } from "./formatters";

// Коды денежных ошибок из класса SQLSTATE 'PT' — их поднимают RPC
// transfer_money / add_income / create_qr_payment / confirm_qr_payment
// (supabase/migrations/0011_money_error_codes.sql). Держим в синхроне с ними.
export const MONEY_ERROR = {
  AMOUNT_TOO_SMALL: "PT100",
  AMOUNT_TOO_LARGE: "PT101",
  INSUFFICIENT_BALANCE: "PT102",
  CARD_FROZEN: "PT103",
  LIMIT_EXCEEDED: "PT104",
  PROFILE_NOT_FOUND: "PT105",
  INVALID_METHOD: "PT106",
  INVALID_CATEGORY: "PT107",
  INVALID_AMOUNT: "PT108",
  PAYMENT_NOT_FOUND: "PT109",
  NOT_AUTHENTICATED: "28000",
} as const;

// Код-заглушка: у сетевого сбоя SQLSTATE нет, но потерять факт ошибки нельзя.
export const MONEY_ERROR_UNKNOWN = "unknown";

// Структурный тип вместо PostgrestError: тащить его из supabase-js ради
// одного поля незачем.
type ErrorWithCode = { code?: string };

export function toMoneyErrorCode(error: ErrorWithCode | null): string | null {
  if (!error) return null;
  return error.code ?? MONEY_ERROR_UNKNOWN;
}

// Границы суммы клиент проверяет сам (мгновенный фидбэк) и их же присылает
// сервер кодом. Обе дороги ведут сюда, чтобы текст был один.
export function minAmountMessage(t: Messages): string {
  return t.money.errors.amountTooSmall(
    formatCurrency(TRANSACTION_LIMITS.MIN_TRANSFER),
  );
}

export function maxAmountMessage(t: Messages): string {
  return t.money.errors.amountTooLarge(
    formatCurrency(TRANSACTION_LIMITS.MAX_TRANSFER),
  );
}

// Незнакомый код падает в общий фолбэк — так внутренняя ошибка Postgres
// (нарушение constraint, дедлок) не утечёт сырым текстом в интерфейс.
export function getMoneyErrorMessage(t: Messages, code: string): string {
  switch (code) {
    case MONEY_ERROR.AMOUNT_TOO_SMALL:
      return minAmountMessage(t);
    case MONEY_ERROR.AMOUNT_TOO_LARGE:
      return maxAmountMessage(t);
    case MONEY_ERROR.INSUFFICIENT_BALANCE:
      return t.money.errors.insufficientBalance;
    case MONEY_ERROR.CARD_FROZEN:
      return t.money.errors.cardFrozen;
    case MONEY_ERROR.LIMIT_EXCEEDED:
      return t.money.errors.limitExceeded;
    case MONEY_ERROR.INVALID_AMOUNT:
      return t.money.errors.invalidAmount;
    case MONEY_ERROR.NOT_AUTHENTICATED:
      return t.money.errors.notAuthenticated;
    // PROFILE_NOT_FOUND / INVALID_METHOD / INVALID_CATEGORY / PAYMENT_NOT_FOUND
    // пользователь спровоцировать из интерфейса не может — это баг клиента,
    // и говорить о нём стоит общим текстом, а не деталями внутренней кухни.
    default:
      return t.money.errors.unknown;
  }
}
