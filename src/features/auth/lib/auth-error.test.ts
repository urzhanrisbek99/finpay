import { describe, expect, it } from "vitest";
import { getDictionary } from "#shared/i18n";
import {
  AUTH_ERROR_UNKNOWN,
  getAuthErrorMessage,
  toAuthErrorCode,
} from "./auth-error";

const en = getDictionary("en");
const ru = getDictionary("ru");

describe("toAuthErrorCode", () => {
  it("returns null when there is no error", () => {
    expect(toAuthErrorCode(null)).toBe(null);
  });

  it("passes the Supabase code through", () => {
    expect(toAuthErrorCode({ code: "invalid_credentials" })).toBe(
      "invalid_credentials",
    );
  });

  // У сетевого сбоя code нет — но потерять сам факт ошибки нельзя, иначе
  // форма решит, что вход удался.
  it("falls back to the unknown code when the error carries none", () => {
    expect(toAuthErrorCode({})).toBe(AUTH_ERROR_UNKNOWN);
  });
});

describe("getAuthErrorMessage", () => {
  it("maps both aliases of an existing account to one message", () => {
    expect(getAuthErrorMessage(en, "email_exists")).toBe(
      getAuthErrorMessage(en, "user_already_exists"),
    );
  });

  it("maps both rate-limit codes to one message", () => {
    expect(getAuthErrorMessage(en, "over_email_send_rate_limit")).toBe(
      getAuthErrorMessage(en, "over_request_rate_limit"),
    );
  });

  it("maps known codes to their own message", () => {
    const codes = [
      "invalid_credentials",
      "email_exists",
      "weak_password",
      "same_password",
      "email_not_confirmed",
      "over_request_rate_limit",
      "validation_failed",
    ];
    const messages = codes.map((code) => getAuthErrorMessage(en, code));

    expect(new Set(messages).size).toBe(codes.length);
    expect(messages).not.toContain(en.auth.errors.unknown);
  });

  // Ради этого маппинг и существует: сообщения Supabase есть только на
  // английском, и незнакомый код не должен протащить их в интерфейс.
  it("falls back for unknown codes instead of leaking English", () => {
    expect(getAuthErrorMessage(en, "some_new_supabase_code")).toBe(
      en.auth.errors.unknown,
    );
    expect(getAuthErrorMessage(en, AUTH_ERROR_UNKNOWN)).toBe(
      en.auth.errors.unknown,
    );
  });

  it("translates, not just formats — ru differs from en for every code", () => {
    const codes = [
      "invalid_credentials",
      "email_exists",
      "user_already_exists",
      "weak_password",
      "same_password",
      "email_not_confirmed",
      "over_email_send_rate_limit",
      "over_request_rate_limit",
      "validation_failed",
      AUTH_ERROR_UNKNOWN,
    ];

    for (const code of codes) {
      expect(getAuthErrorMessage(ru, code)).not.toBe(
        getAuthErrorMessage(en, code),
      );
    }
  });
});
