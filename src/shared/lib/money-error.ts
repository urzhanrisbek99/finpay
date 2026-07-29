import type { Messages } from "#shared/i18n";
import { TRANSACTION_LIMITS } from "#shared/config";
import { formatCurrency } from "./formatters";

export const MONEY_ERROR = {
  AMOUNT_TOO_SMALL: "FP100",
  AMOUNT_TOO_LARGE: "FP101",
  INSUFFICIENT_BALANCE: "FP102",
  CARD_FROZEN: "FP103",
  LIMIT_EXCEEDED: "FP104",
  PROFILE_NOT_FOUND: "FP105",
  INVALID_METHOD: "FP106",
  INVALID_CATEGORY: "FP107",
  INVALID_AMOUNT: "FP108",
  PAYMENT_NOT_FOUND: "FP109",
  NOT_AUTHENTICATED: "28000",
} as const;

export const MONEY_ERROR_UNKNOWN = "unknown";

type ErrorWithCode = { code?: string };

export function toMoneyErrorCode(error: ErrorWithCode | null): string | null {
  if (!error) return null;
  return error.code ?? MONEY_ERROR_UNKNOWN;
}

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

    default:
      return t.money.errors.unknown;
  }
}
