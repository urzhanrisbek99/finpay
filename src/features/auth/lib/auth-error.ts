import type { Messages } from "#shared/i18n";

// Код, которым подменяем отсутствующий: у сетевого сбоя code нет, но потерять
// сам факт ошибки нельзя.
export const AUTH_ERROR_UNKNOWN = "unknown";

// Структурный тип вместо импорта AuthError: в этой версии supabase-js он
// не экспортируется.
type ErrorWithCode = { code?: string };

export function toAuthErrorCode(error: ErrorWithCode | null): string | null {
  if (!error) return null;
  return error.code ?? AUTH_ERROR_UNKNOWN;
}

// Сообщения Supabase приходят только на английском, поэтому в UI показываем
// свой текст по коду. Незнакомый код падает в общий фолбэк — так англоязычная
// строка от сервера не утечёт в русский интерфейс.
export function getAuthErrorMessage(t: Messages, code: string): string {
  switch (code) {
    case "invalid_credentials":
      return t.auth.errors.invalidCredentials;
    case "email_exists":
    case "user_already_exists":
      return t.auth.errors.emailExists;
    case "weak_password":
      return t.auth.errors.weakPassword;
    case "same_password":
      return t.auth.errors.samePassword;
    case "email_not_confirmed":
      return t.auth.errors.emailNotConfirmed;
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return t.auth.errors.rateLimit;
    case "validation_failed":
      return t.auth.errors.validationFailed;
    default:
      return t.auth.errors.unknown;
  }
}
