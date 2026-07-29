import { describe, expect, it } from "vitest";
import { getDictionary } from "#shared/i18n";
import {
  MONEY_ERROR,
  MONEY_ERROR_UNKNOWN,
  getMoneyErrorMessage,
  toMoneyErrorCode,
} from "./money-error";

const en = getDictionary("en");
const ru = getDictionary("ru");

describe("error codes can survive PostgREST", () => {
  it("uses no SQLSTATE class that PostgREST reserves for itself", () => {
    for (const code of Object.values(MONEY_ERROR)) {
      expect(code.startsWith("PT")).toBe(false);
    }
  });

  it("keeps every code inside the convention that was actually verified", () => {
    for (const code of Object.values(MONEY_ERROR)) {
      expect(code).toMatch(/^(FP\d{3}|28000)$/);
    }
  });
});

describe("toMoneyErrorCode", () => {
  it("returns null when there is no error", () => {
    expect(toMoneyErrorCode(null)).toBe(null);
  });

  it("passes the SQLSTATE through", () => {
    expect(toMoneyErrorCode({ code: MONEY_ERROR.CARD_FROZEN })).toBe(
      MONEY_ERROR.CARD_FROZEN,
    );
  });

  it("falls back to the unknown code when the error carries none", () => {
    expect(toMoneyErrorCode({})).toBe(MONEY_ERROR_UNKNOWN);
  });
});

describe("getMoneyErrorMessage", () => {
  it("turns the response the server really sends into the right sentence", () => {
    const wire = {
      code: "FP104",
      details: null,
      hint: null,
      message: "Monthly card limit exceeded",
    };
    const code = toMoneyErrorCode(wire);

    expect(code).toBe(MONEY_ERROR.LIMIT_EXCEEDED);
    expect(getMoneyErrorMessage(ru, code!)).toBe(ru.money.errors.limitExceeded);
    expect(getMoneyErrorMessage(en, code!)).toBe(en.money.errors.limitExceeded);
    expect(getMoneyErrorMessage(ru, code!)).not.toBe(ru.money.errors.unknown);
  });

  it("maps each known code to a distinct message", () => {
    const codes = [
      MONEY_ERROR.AMOUNT_TOO_SMALL,
      MONEY_ERROR.AMOUNT_TOO_LARGE,
      MONEY_ERROR.INSUFFICIENT_BALANCE,
      MONEY_ERROR.CARD_FROZEN,
      MONEY_ERROR.LIMIT_EXCEEDED,
      MONEY_ERROR.INVALID_AMOUNT,
      MONEY_ERROR.NOT_AUTHENTICATED,
    ];
    const messages = codes.map((code) => getMoneyErrorMessage(en, code));

    expect(new Set(messages).size).toBe(codes.length);
    expect(messages).not.toContain(en.money.errors.unknown);
  });

  it("interpolates the limits into the amount-bound messages", () => {
    expect(getMoneyErrorMessage(en, MONEY_ERROR.AMOUNT_TOO_SMALL)).toContain(
      "100",
    );
    expect(
      getMoneyErrorMessage(en, MONEY_ERROR.AMOUNT_TOO_LARGE).replace(/\D/g, ""),
    ).toBe("5000000");
  });

  it("hides internal codes behind the generic fallback", () => {
    for (const code of [
      MONEY_ERROR.PROFILE_NOT_FOUND,
      MONEY_ERROR.INVALID_METHOD,
      MONEY_ERROR.INVALID_CATEGORY,
      MONEY_ERROR.PAYMENT_NOT_FOUND,
    ]) {
      expect(getMoneyErrorMessage(en, code)).toBe(en.money.errors.unknown);
    }
  });

  it("falls back for unknown codes instead of leaking raw text", () => {
    expect(getMoneyErrorMessage(en, "42P01")).toBe(en.money.errors.unknown);
    expect(getMoneyErrorMessage(en, MONEY_ERROR_UNKNOWN)).toBe(
      en.money.errors.unknown,
    );
  });

  it("translates, not just formats — ru differs from en for every code", () => {
    for (const code of Object.values(MONEY_ERROR)) {
      expect(getMoneyErrorMessage(ru, code)).not.toBe(
        getMoneyErrorMessage(en, code),
      );
    }
  });
});
